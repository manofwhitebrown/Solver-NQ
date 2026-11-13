# Device test checklist

Only things a person with a real phone or laptop can check. Tick them, then tell the manager what looked wrong (a screenshot is enough).
Source: "Manual tests for the user" in `docs/status/AI-1..7.md`, merged by AI-8 on 13 Nov 2026. Items the manager already tested with a fake Gemini and real OCR on a fresh build are not repeated here.

## Phone (Android APK)

**Install**
- [ ] Actions, latest green `Android APK`, download the artifact, install it.
- [ ] Install over the previous APK (no uninstall): the app opens and your old questions are still there.
- [ ] Launcher icon is the teal tile with a white tick, and the splash screen matches (light and dark system theme).

**Scan and read**
- [ ] Scan, Take a photo, photograph printed text, crop, Read text: text appears in a few seconds.
- [ ] Airplane mode, repeat: ML Kit still reads (first run may need one online download).
- [ ] Photo taken sideways shows upright; if text is poor, tap Rotate and read again.
- [ ] Multi-page PDF: pick a page, crop, read. A .txt file says "We can only read photos and PDFs".
- [ ] Deny Camera permission, tap Take a photo: a message explains how to allow it.
- [ ] Your biggest photo (48 MP): the app does not freeze or crash.
- [ ] Handwriting with a Gemini key set: tap "Read with AI"; the box fills (formulas as `$...$`). Offline it shows the offline message.
- [ ] Scan, Scan languages, download Hindi online, go offline, set Scan language to Hindi and scan: it still reads.
- [ ] Share a photo from Gallery or Chrome to Solver-NQ: the app opens on Scan with that photo. Share a second one while the app is open: it jumps to the new photo. Over 25 MB shows "That image is over 25 MB".

**Study and files**
- [ ] Learn: set the daily reminder a few minutes ahead; it arrives. Restart the phone; the reminder still arrives next day.
- [ ] Read-aloud works on an answer; speed setting survives a reload.
- [ ] Export a PDF, Save/Share to Drive or WhatsApp: the file arrives and opens. Closing the share sheet shows no error.
- [ ] Export DOCX and open it from the share sheet in Word or Docs.
- [ ] Airplane mode, reopen the app: library, Learn and Settings open; a new question says it is saved and is answered when you reconnect.

**Layout on the real device**
- [ ] No sideways scrolling on any screen on your smallest phone, especially Scan (known issue R1, check after the fix).
- [ ] Bottom tab bar is clear of the gesture bar; with the keyboard open on Ask, Send stays reachable.
- [ ] Landscape: nothing is cut off. Android font size and display size at maximum: nothing is clipped.
- [ ] Open an answer and Learn review: no tab bar, nothing under the bottom bar. A long equation does not break the page.

## Laptop (Chrome)

- [ ] Open https://manofwhitebrown.github.io/Solver-NQ/ , install it as an app, and check the tab icon is the teal tick on a light tab and a dark tab.
- [ ] Settings: paste a real free Gemini key, Test key says "Key works", Save. The model chain fills with models you can use. Ask a question: it answers. A wrong key shows "Your AI key was rejected".
- [ ] Export 1, 5, then 20 answers as PDF with "Pretty" (A4, then Letter): math is sharp, no formula cut across pages, page numbers bottom right, white paper in dark theme. Cancel the 20-answer export halfway: it stops within seconds with "Export cancelled".
- [ ] `/plan` at phone and laptop width, light and dark: add an exam 8 days away, tick a task, tap a week day, open settings. Nothing scrolls sideways.
- [ ] Notes: paste a page, summarise offline, improve with AI, make cards, take the quiz. Import a PDF (also a scanned one and a photo). Print or save a note as PDF: tab bar and buttons are hidden.
- [ ] `/graph`: both zoom buttons work and two functions can be told apart by dash style.
- [ ] Backup: download it (opens as valid JSON), clear site data, restore: questions, notes and cards all come back. Cloud sync (private Gist) if you use it: upload on one device, download on the other.
- [ ] Clear site data and reload: onboarding appears; Skip and Finish both land on Ask. `/#/design` in light and dark: cards, inputs and disabled buttons are clearly separated.
- [ ] Run `npm run shots` once on your laptop to confirm it works outside the AI sandboxes.
