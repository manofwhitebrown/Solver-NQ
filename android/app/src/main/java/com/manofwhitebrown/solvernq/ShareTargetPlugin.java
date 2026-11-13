package com.manofwhitebrown.solvernq;

import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

/** Receives an image shared from another app (ACTION_SEND, image/*) and hands it to the web layer once. */
@CapacitorPlugin(name = "ShareTarget")
public class ShareTargetPlugin extends Plugin {
  private static final int MAX_BYTES = 25 * 1024 * 1024;

  /** Returns { dataUrl } for a pending shared image, or {} when there is none. Clears the intent so it is read once. */
  @PluginMethod
  public void getShared(PluginCall call) {
    JSObject out = new JSObject();
    Intent intent = getActivity().getIntent();
    if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) { call.resolve(out); return; }
    String type = intent.getType();
    Uri uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
    if (uri == null || type == null || !type.startsWith("image/")) { call.resolve(out); return; }
    intent.setAction(Intent.ACTION_MAIN); // consumed
    try (InputStream in = getContext().getContentResolver().openInputStream(uri)) {
      if (in == null) { call.resolve(out); return; }
      ByteArrayOutputStream buf = new ByteArrayOutputStream();
      byte[] chunk = new byte[16 * 1024];
      int n, total = 0;
      while ((n = in.read(chunk)) > 0) {
        total += n;
        if (total > MAX_BYTES) { out.put("error", "too-large"); call.resolve(out); return; }
        buf.write(chunk, 0, n);
      }
      out.put("dataUrl", "data:" + type + ";base64," + Base64.encodeToString(buf.toByteArray(), Base64.NO_WRAP));
      call.resolve(out);
    } catch (Exception e) {
      out.put("error", "unreadable");
      call.resolve(out);
    }
  }

  /** App already running and another share arrives: tell the web layer to ask again. */
  @Override
  protected void handleOnNewIntent(Intent intent) {
    super.handleOnNewIntent(intent);
    getActivity().setIntent(intent);
    notifyListeners("shared", new JSObject());
  }
}
