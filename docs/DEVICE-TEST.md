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

## Design and screens (from AI-1)
- [ ] Open `/#/design` on a phone and a laptop, switch light/dark: cards, inputs and disabled buttons are clearly separated.
- [ ] Clear site data and reload: onboarding appears; Skip and Finish both land on Ask.
- [ ] Open an answer and Learn review: no tab bar, no content hidden under the bottom bar.

## Answer (from AI-5)
- [ ] Open a saved answer in Learn mode: reveal steps, read aloud, ask a follow-up, make flashcards, export. A long equation must not break the layout.

## Plan and export (from AI-6)
- [ ] Open `/plan` at phone and laptop width, light and dark: add an exam 8 days away, tick a task, tap a week day, open plan settings. Nothing scrolls sideways.
- [ ] Laptop: export 1, 5, then 20 answers as PDF with "Pretty"; math is sharp, no formula cut across pages, page numbers bottom right, white paper in dark theme. Repeat with Letter size.
- [ ] Tap **Cancel** halfway through the 20-answer export: it stops within a second or two and shows "Export cancelled".
- [ ] Android: export a PDF, Save/Share to Drive or WhatsApp; the file arrives and opens. Closing the share sheet shows no error.
- [ ] Android: export DOCX and open it from the share sheet in Word/Docs.

## Notes (from AI-7)
- [ ] Paste a page of notes and get a summary offline (airplane mode), then improve it with AI; make cards; take the quiz.
- [ ] Import a PDF (also a scanned one and a photo).
- [ ] Print or save a note as PDF: the tab bar and buttons are hidden in the preview.

## Real-device layout checks
- [ ] Notch / gesture bar: bottom tab bar is not under the gesture bar.
- [ ] Keyboard open on Ask: tab bar and Send button stay reachable.
- [ ] Rotate to landscape: nothing breaks or is cut off.
- [ ] Android Settings -> Display -> Font size / Display size at maximum (200%): nothing is clipped.
- [ ] Smallest phone you have: no horizontal scrolling, buttons still tappable.

## Share to Solver-NQ (Phase 4, Android)
1. In Gallery or Chrome, share a photo and pick Solver-NQ. The app should open on Scan with the crop step showing that photo.
2. With the app already open on another screen, share another photo: it should jump to Scan with the new one.
3. Share a photo over 25 MB: you should see "That image is over 25 MB".
(Native code is not compiled by CI tests; if the APK build fails on `ShareTargetPlugin.java`, send me the error.)
