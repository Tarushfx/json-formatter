#!/usr/bin/env node
// Local JSON formatter. No dependencies.
// Usage: json-formatter [--port 3000] [--dir ~/some/folder] [--open]
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { exec } = require("child_process");

function arg(name) {
  const i = process.argv.indexOf("--" + name);
  return i > -1 ? process.argv[i + 1] : undefined;
}
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`json-formatter [--port 3000] [--dir <folder>] [--open]

  --port   port to listen on (default 3000, or $PORT)
  --dir    folder where files are saved (default ~/json-formatter-data, or $JSON_FORMATTER_DIR)
  --open   open the page in your browser`);
  process.exit(0);
}

const PORT = Number(arg("port") || process.env.PORT || 3000);
const rawDir = arg("dir") || process.env.JSON_FORMATTER_DIR || path.join(os.homedir(), "json-formatter-data");
const SAVE_DIR = path.resolve(rawDir.replace(/^~(?=$|\/|\\)/, os.homedir()));
fs.mkdirSync(SAVE_DIR, { recursive: true });

function send(res, code, body, type = "application/json") {
  res.writeHead(code, { "Content-Type": type });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 50 * 1024 * 1024) reject(new Error("Too large"));
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

// Keep only safe characters, force .json extension
function safeName(name) {
  const base = path.basename(String(name || "").trim()).replace(/[^\w.\- ]/g, "_");
  if (!base || base === "." || base === "..") return null;
  return base.endsWith(".json") ? base : base + ".json";
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/") {
      return send(res, 200, fs.readFileSync(path.join(__dirname, "index.html")), "text/html");
    }
    if (req.method === "GET" && req.url === "/api/info") return send(res, 200, { dir: SAVE_DIR });
    if (req.method === "GET" && req.url === "/api/files") {
      const files = fs.readdirSync(SAVE_DIR).filter((f) => f.endsWith(".json")).sort();
      return send(res, 200, files);
    }
    if (req.method === "GET" && req.url.startsWith("/api/files/")) {
      const name = safeName(decodeURIComponent(req.url.slice("/api/files/".length)));
      const file = name && path.join(SAVE_DIR, name);
      if (!file || !fs.existsSync(file)) return send(res, 404, { error: "Not found" });
      return send(res, 200, fs.readFileSync(file), "text/plain; charset=utf-8");
    }
    if (req.method === "POST" && req.url === "/api/save") {
      const { name, content } = JSON.parse(await readBody(req));
      const fileName = safeName(name);
      if (!fileName) return send(res, 400, { error: "Invalid file name" });
      JSON.parse(content); // refuse to save invalid JSON
      fs.writeFileSync(path.join(SAVE_DIR, fileName), content);
      return send(res, 200, { saved: fileName });
    }
    send(res, 404, { error: "Not found" });
  } catch (e) {
    send(res, 400, { error: e.message });
  }
});

server.on("error", (e) => {
  console.error(e.code === "EADDRINUSE" ? `Port ${PORT} is in use. Try --port ${PORT + 1}` : e.message);
  process.exit(1);
});

server.listen(PORT, "127.0.0.1", () => {
  const url = `http://localhost:${PORT}`;
  console.log(`JSON formatter: ${url}\nSaving to: ${SAVE_DIR}`);
  if (process.argv.includes("--open")) {
    const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    exec(`${cmd} ${url}`);
  }
});
