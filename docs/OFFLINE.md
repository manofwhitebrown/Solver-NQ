# Offline test

Goal: after one online visit, the app shell and the saved library work with no internet.

## Web (laptop)
1. `npm run build && npm run preview`, open the printed URL in Chrome.
2. Open `/#/settings`, then `/#/library` once so everything is cached. Save at least one question.
3. DevTools -> Application -> Service Workers: confirm it is "activated".
4. DevTools -> Network -> tick **Offline** (or turn off Wi-Fi). Reload.
5. Expected: the app loads, the library lists saved items, search works, flashcards open.
6. Ask a new question while offline. Expected: it is queued. Go back online: it is answered.

## Android APK
1. Install the debug APK from the Actions artifact, open it once online.
2. Turn on airplane mode, close and reopen the app.
3. Repeat steps 5-6 above.

## Update prompt
Deploy a new build, reopen the online app: an "update available" prompt appears; accept it to reload.
