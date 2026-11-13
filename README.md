# pavel-kubik.github.io

Personal project page, served by GitHub Pages. Plain HTML and CSS, no build step.

- `index.html` – public list of live projects
- `private/` – test links behind a passcode
- `fonts/` – Bricolage Grotesque (SIL Open Font License, see `fonts/OFL.txt`)

## Private links

The links are stored encrypted in `private/links.enc.json` (PBKDF2-SHA256, 600k iterations, AES-256-GCM) and
decrypted in the browser. The passcode is short on purpose: it keeps the links out of public view, it is not meant
to guard secrets. Use a long passphrase if that ever changes.

To change the links, either:

- open `/private/`, unlock, **Edit links**, download the new `links.enc.json` and commit it to `private/`, or
- use the script:

  ```bash
  PRIVATE_PASS='your passcode' node tools/private.mjs decrypt
  ```

  edit `private/links.json` (git-ignored), then

  ```bash
  PRIVATE_PASS='your passcode' node tools/private.mjs encrypt
  ```

To change the passcode, decrypt with the old one and encrypt with the new one.
