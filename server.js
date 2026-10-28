/* Local server for the study guide: serves the static files and stores saved AI explanations
   in explanations.json. Edit/delete require EXPLAIN_PASSWORD from .env. No dependencies: `node server.js`. */
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, "explanations.json");

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
const PASSWORD = process.env.EXPLAIN_PASSWORD || "";
const PORT = Number(process.env.PORT) || 8080;
if (!PASSWORD) console.warn("EXPLAIN_PASSWORD is not set in .env — editing and deleting explanations is disabled.");

function readData(){ try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); } catch(e){ return []; } }
function writeData(list){
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2) + "\n");
  fs.renameSync(tmp, DATA_FILE);
}
function checkPassword(given){
  if (!PASSWORD || typeof given !== "string") return false;
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

function send(res, status, body){
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}
function readBody(req){
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", c => { raw += c; if (raw.length > 1e6) { reject(new Error("too large")); req.destroy(); } });
    req.on("end", () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch(e){ reject(e); } });
  });
}

async function handleApi(req, res, id){
  if (req.method === "GET" && !id) return send(res, 200, readData());
  let body;
  try { body = await readBody(req); } catch(e){ return send(res, 400, { error: "Invalid JSON" }); }
  const list = readData();

  if (req.method === "POST" && !id){
    const text = String(body.text || "").trim(), explanation = String(body.explanation || "").trim();
    if (!text || !explanation) return send(res, 400, { error: "text and explanation are required" });
    const item = { id: crypto.randomUUID(), text, explanation, section: String(body.section || ""), created: new Date().toISOString() };
    list.push(item); writeData(list);
    return send(res, 201, item);
  }

  const idx = list.findIndex(x => x.id === id);
  if (!id || idx < 0) return send(res, 404, { error: "Not found" });
  if (!checkPassword(body.password)) return send(res, 401, { error: PASSWORD ? "Wrong password" : "EXPLAIN_PASSWORD is not set in .env" });

  if (req.method === "PUT"){
    const explanation = String(body.explanation || "").trim();
    if (!explanation) return send(res, 400, { error: "explanation is required" });
    list[idx] = { ...list[idx], explanation, updated: new Date().toISOString() };
    writeData(list);
    return send(res, 200, list[idx]);
  }
  if (req.method === "DELETE"){
    list.splice(idx, 1); writeData(list);
    return send(res, 200, { ok: true });
  }
  send(res, 405, { error: "Method not allowed" });
}

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };

http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const api = url.pathname.match(/^\/api\/explanations(?:\/([\w-]+))?\/?$/);
  if (api) return handleApi(req, res, api[1]).catch(e => send(res, 500, { error: e.message }));

  const rel = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const file = path.join(ROOT, rel);
  const base = path.basename(file);
  if (!file.startsWith(ROOT + path.sep) || base.startsWith(".") || base === "server.js"){
    res.writeHead(404); return res.end("Not found");
  }
  fs.readFile(file, (err, data) => {
    if (err){ res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Study guide running at http://localhost:${PORT}`));
