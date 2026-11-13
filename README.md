# pavel-kubik.github.io

Personal project page, served by GitHub Pages. Plain HTML and CSS, no build step.

- `index.html` – public list of live projects
- `private/` – passphrase-protected test links

## Private links

The links are stored encrypted in `private/links.enc.json` (PBKDF2-SHA256, 600k iterations, AES-256-GCM) and
decrypted in the browser. The encrypted file is public, so the passphrase is the only protection – keep it long.

To change the links, either:

- open `/private/`, unlock, **Edit links**, download the new `links.enc.json` and commit it to `private/`, or
- use the script:

  ```bash
  PRIVATE_PASS='your passphrase' node tools/private.mjs decrypt
  ```

  edit `private/links.json` (git-ignored), then

  ```bash
  PRIVATE_PASS='your passphrase' node tools/private.mjs encrypt
  ```

To change the passphrase, decrypt with the old one and encrypt with the new one.
