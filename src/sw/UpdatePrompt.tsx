import { useEffect } from 'react';
import { toast } from '@/components/ui';
import { useRegisterSW } from 'virtual:pwa-register/react';

// Shows a small bar when a new version is ready. Needs `registerType: 'prompt'` in the PWA config.
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();

  // "Ready to work offline" is only FYI: never leave it sitting over the buttons.
  useEffect(() => {
    if (!offlineReady || needRefresh) return;
    toast('Ready to work offline.', 'success');
    setOfflineReady(false);
  }, [offlineReady, needRefresh, setOfflineReady]);

  if (!needRefresh) return null;
  const close = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  return (
    <div
      role="status"
      className="fixed inset-x-3 z-50 flex items-center justify-between gap-3 rounded-2xl bg-slate-900 p-3 text-sm text-white shadow-lg"
      style={{ top: 'calc(env(safe-area-inset-top) + 12px)' }}
    >
      <span>A new version is available.</span>
      <span className="flex gap-2">
        <button
          className="min-h-[44px] rounded-xl bg-white px-4 font-medium text-slate-900"
          onClick={() => updateServiceWorker(true)}
        >
          Update
        </button>
        <button className="min-h-[44px] px-3" onClick={close}>
          Dismiss
        </button>
      </span>
    </div>
  );
}
