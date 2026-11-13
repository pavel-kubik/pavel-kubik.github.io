#!/usr/bin/env node
// Encrypt / decrypt the private links shown at /private/.
//
//   PRIVATE_PASS='...' node tools/private.mjs decrypt   # private/links.enc.json -> private/links.json
//   PRIVATE_PASS='...' node tools/private.mjs encrypt   # private/links.json     -> private/links.enc.json
//
// private/links.json is git-ignored; only the encrypted file is committed.
// Format matches private/index.html: PBKDF2-SHA256 -> AES-256-GCM.

import { readFile, writeFile } from 'node:fs/promises';
import { webcrypto as crypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ITER = 600000;
const dir = fileURLToPath(new URL('../private/', import.meta.url));
const PLAIN = dir + 'links.json';
const BOX = dir + 'links.enc.json';

const pass = process.env.PRIVATE_PASS;
const mode = process.argv[2];
if (!pass || !['encrypt', 'decrypt'].includes(mode)) {
  console.error("Usage: PRIVATE_PASS='...' node tools/private.mjs <encrypt|decrypt>");
  process.exit(1);
}

const b64 = (buf) => Buffer.from(buf).toString('base64');
const unb64 = (s) => new Uint8Array(Buffer.from(s, 'base64'));

async function deriveKey(salt, iterations) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

if (mode === 'encrypt') {
  const data = JSON.parse(await readFile(PLAIN, 'utf8'));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(salt, ITER);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(data)));
  const box = { v: 1, kdf: 'PBKDF2-SHA256', iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
  await writeFile(BOX, JSON.stringify(box) + '\n');
  console.log('Wrote private/links.enc.json');
} else {
  const box = JSON.parse(await readFile(BOX, 'utf8'));
  const key = await deriveKey(unb64(box.salt), box.iter);
  let plain;
  try {
    plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(box.iv) }, key, unb64(box.ct));
  } catch {
    console.error('Wrong passphrase.');
    process.exit(1);
  }
  await writeFile(PLAIN, JSON.stringify(JSON.parse(new TextDecoder().decode(plain)), null, 2) + '\n');
  console.log('Wrote private/links.json');
}
