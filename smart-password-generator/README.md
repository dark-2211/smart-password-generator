# Smart Password Generator

Unzip the archive and open `index.html` in a modern browser. Nothing to install. The password changes when you move the slider, switch a character set, or press **Generate password**.

- Slide from 8 to 64 characters (20 by default).
- Pick uppercase, lowercase, numbers, and/or symbols. Each selected set appears at least once.
- Press **Copy** to copy the password. If the browser blocks clipboard access, select and copy it manually. If hosting the app, use HTTPS for the Clipboard API.

## What to explore

- `index.html`: controls, accessible labels, and live feedback.
- `styles.css`: responsive layout, keyboard focus, and the animated toast.
- `app.js`: event listeners, DOM updates, clipboard handling, and password generation.

The generator uses Web Crypto's `getRandomValues()`. It discards values that would bias the selection of an alphabet index. It retries a whole candidate when a selected set is missing, so all valid passwords of a given length and configuration have equal probability. It makes no network requests and doesn't save passwords.
