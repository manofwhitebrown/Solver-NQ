# Device test checklist

Tick these on a real phone / laptop. Other AIs add steps to their status file under "Manual tests for the user"; AI-8 merges them here at the end (re-run the merge before release).

## Install
- [ ] Actions -> latest green `Android APK` -> download artifact -> install on the phone.
- [ ] Laptop: open https://manofwhitebrown.github.io/Solver-NQ/ and install as an app (address-bar install icon).

## Scan / OCR (from AI-4)
- [ ] Camera: Scan > Take a photo > photograph printed text > crop > Read text; text appears in a few seconds.
- [ ] Airplane mode: repeat; ML Kit should still read (first run may need one online model download).
- [ ] Photo taken sideways shows upright; if text is poor, use Rotate and read again.
- [ ] Multi-page PDF: pick a page, crop, read.
- [ ] Deny Camera permission, tap Take a photo: message explains how to allow it.
- [ ] Biggest photo you have (48 MP): app must not freeze or crash.
- [ ] Choose a .txt file: "We can only read photos and PDFs".

## Features
- [ ] Read-aloud (text-to-speech) works on an answer.
- [ ] Share / save an exported PDF, DOCX or Markdown from the Android share sheet.
- [ ] Daily study notification arrives at the set time.
- [ ] "Pretty" PDF export with 20+ answers opens correctly.
- [ ] Offline: airplane mode, reopen the app; library, Learn and Settings still open.

## Real-device layout checks
- [ ] Notch / gesture bar: bottom tab bar is not under the gesture bar.
- [ ] Keyboard open on Ask: tab bar and Send button stay reachable.
- [ ] Rotate to landscape: nothing breaks or is cut off.
- [ ] Android Settings -> Display -> Font size / Display size at maximum (200%): nothing is clipped.
- [ ] Smallest phone you have: no horizontal scrolling, buttons still tappable.
