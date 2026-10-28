/* Publishes the password-protected site from src/ (which is gitignored and never pushed).
     node build.js            -> index.html (encrypted site for GitHub Pages) + source.enc (encrypted backup of src/)
     node build.js --restore  -> recreates src/ from source.enc, e.g. on a fresh clone
   Saved explanations live in notes.enc, which the published site reads and commits itself through the GitHub API.
   Its key is derived from SITE_PASSWORD and its own salt, so it stays the same across builds. After changing
   SITE_PASSWORD, set OLD_SITE_PASSWORD once so build.js can re-encrypt notes.enc.
   Both files use AES-256-GCM with a key derived from SITE_PASSWORD (.env) via PBKDF2. Only ciphertext is committed;
   the browser decrypts the site after the right password is entered. */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const ITERATIONS = 600000;

function loadEnv(){
  try {
    for (const line of fs.readFileSync(path.join(ROOT, ".env"), "utf8").split(/\r?\n/)){
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m || line.trim().startsWith("#")) continue;
      let v = m[2];
      if (/^(["']).*\1$/.test(v)) v = v.slice(1, -1);
      if (!(m[1] in process.env)) process.env[m[1]] = v;
    }
  } catch(e){}
}
loadEnv();
const PASSWORD = process.env.SITE_PASSWORD || "";
if (!PASSWORD){ console.error("SITE_PASSWORD is not set in .env"); process.exit(1); }
const EDIT_PASSWORD = process.env.EXPLAIN_PASSWORD || "";

function encrypt(buf, password = PASSWORD){
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256");
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(buf), cipher.final(), cipher.getAuthTag()]);
  return { s: salt.toString("base64"), i: iv.toString("base64"), n: ITERATIONS, c: ct.toString("base64") };
}
function decrypt(p, password = PASSWORD){
  const key = crypto.pbkdf2Sync(password, Buffer.from(p.s, "base64"), p.n, 32, "sha256");
  const ct = Buffer.from(p.c, "base64");
  const d = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(p.i, "base64"));
  d.setAuthTag(ct.subarray(-16));
  return Buffer.concat([d.update(ct.subarray(0, -16)), d.final()]);
}
function listFiles(dir){
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const full = path.join(dir, e.name);
    if (e.name.endsWith(".tmp") || e.name === "explanations.json") return [];
    return e.isDirectory() ? listFiles(full) : [full];
  });
}

if (process.argv.includes("--restore")){
  let files;
  try { files = JSON.parse(decrypt(JSON.parse(fs.readFileSync(path.join(ROOT, "source.enc"), "utf8")))); }
  catch(e){ console.error("Could not decrypt source.enc — is SITE_PASSWORD the one it was built with?"); process.exit(1); }
  for (const [rel, b64] of Object.entries(files)){
    const out = path.join(SRC, rel);
    if (!out.startsWith(SRC + path.sep)) continue;
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, Buffer.from(b64, "base64"));
  }
  console.log(`Restored ${Object.keys(files).length} files into src/`);
  process.exit(0);
}

if (!EDIT_PASSWORD){ console.error("EXPLAIN_PASSWORD is not set in .env"); process.exit(1); }
if (PASSWORD.length < 12) console.warn("Warning: SITE_PASSWORD is short. Anyone can download the encrypted page and guess offline, so use 12+ characters.");

/* "</script" inside inlined code would end the tag early */
const inline = code => code.replace(/<\/script/gi, "<\\/script");

let html = fs.readFileSync(path.join(SRC, "index.html"), "utf8");
html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, src) =>
  `<script>\n${inline(fs.readFileSync(path.join(SRC, src), "utf8"))}\n</script>`);
/* notes.enc: { s: salt, n: iterations, i, c }. The browser re-encrypts i/c with the same key and keeps s/n. */
const NOTES_FILE = path.join(ROOT, "notes.enc");
let notesFile = null;
try { notesFile = JSON.parse(fs.readFileSync(NOTES_FILE, "utf8")); } catch(e){}
if (notesFile){
  try { decrypt(notesFile); }
  catch(e){
    if (!process.env.OLD_SITE_PASSWORD){ console.error("notes.enc was encrypted with a different SITE_PASSWORD. Run `git pull`, then rerun with OLD_SITE_PASSWORD=<previous password> to re-encrypt it."); process.exit(1); }
    notesFile = encrypt(decrypt(notesFile, process.env.OLD_SITE_PASSWORD));
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notesFile) + "\n");
    console.log("notes.enc re-encrypted with the new SITE_PASSWORD");
  }
} else {
  let list = "[]";
  try { list = JSON.stringify(JSON.parse(fs.readFileSync(path.join(SRC, "explanations.json"), "utf8"))); } catch(e){}
  notesFile = encrypt(Buffer.from(list));
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notesFile) + "\n");
  console.log(`notes.enc created from src/explanations.json (${JSON.parse(list).length} explanations)`);
}
const notesKey = crypto.pbkdf2Sync(PASSWORD, Buffer.from(notesFile.s, "base64"), notesFile.n, 32, "sha256");

/* The edit password unlocks the GitHub token each browser stores; editCheck lets the page reject a wrong one.
   The salt comes from notes.enc so stored tokens survive rebuilds. */
const editSalt = crypto.createHash("sha256").update("edit:" + notesFile.s).digest().subarray(0, 16);
const editCheck = crypto.createHash("sha256").update(crypto.pbkdf2Sync(EDIT_PASSWORD, editSalt, ITERATIONS, 32, "sha256")).digest("base64");

const remote = require("child_process").execSync("git remote get-url origin", { cwd: ROOT, encoding: "utf8" }).trim();
const repo = remote.replace(/\.git$/, "").match(/github\.com[:/](.+\/.+)$/)[1];
const branch = require("child_process").execSync("git rev-parse --abbrev-ref HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
const SITE = { repo, branch, iterations: ITERATIONS, notesKey: notesKey.toString("base64"), editSalt: editSalt.toString("base64"), editCheck };
html = html.replace("<script>", `<script>window.SITE = ${JSON.stringify(SITE)};</script>\n<script>`);
html = html.replace(/<a class="btn" href="\/logout"/, `<a class="btn" href="#" onclick="try{localStorage.removeItem('saa-site-key')}catch(e){}location.reload();return false"`);

const unlock = `<script>
const P = ${JSON.stringify(encrypt(Buffer.from(html, "utf8")))};
const KEY = "saa-site-key";
const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function open(raw){
  const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(P.i) }, key, b64(P.c));
  document.open(); document.write(new TextDecoder().decode(pt)); document.close();
}
async function derive(pw){
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: b64(P.s), iterations: P.n }, base, 256));
}
(async () => {
  let saved = null; try { saved = localStorage.getItem(KEY); } catch(e){}
  if (saved) { try { await open(b64(saved)); return; } catch(e){ try { localStorage.removeItem(KEY); } catch(e2){} } }
})();
const form = document.getElementById("loginForm"), input = form.querySelector("input"), err = document.getElementById("err");
form.addEventListener("submit", async e => {
  e.preventDefault();
  err.textContent = "DECRYPTING…"; input.disabled = true;
  try {
    const raw = await derive(input.value);
    await open(raw);
    try { localStorage.setItem(KEY, btoa(String.fromCharCode(...raw))); } catch(e){}
  } catch(e2){
    err.textContent = "ACCESS DENIED"; input.disabled = false; input.value = ""; input.focus();
  }
});
</script>`;

let page = fs.readFileSync(path.join(SRC, "login.html"), "utf8");
page = page.replace('<form method="post" action="/login">', '<form id="loginForm">');
page = page.replace("</body>", unlock + "\n</body>");
fs.writeFileSync(path.join(ROOT, "index.html"), page);

const files = Object.fromEntries(listFiles(SRC).map(f => [path.relative(SRC, f).split(path.sep).join("/"), fs.readFileSync(f).toString("base64")]));
fs.writeFileSync(path.join(ROOT, "source.enc"), JSON.stringify(encrypt(Buffer.from(JSON.stringify(files)))) + "\n");

console.log(`index.html (${(page.length / 1024).toFixed(0)} KB) and source.enc (${Object.keys(files).length} files) written. Commit and push them (and notes.enc).`);
