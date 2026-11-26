import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = new URL("../out/", import.meta.url).pathname;
const port = Number(process.env.PORT || 4173);
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);
    let pathname = decodeURIComponent(url.pathname);

    if (basePath) {
      if (!pathname.startsWith(basePath)) {
        response.writeHead(404).end("Not found");
        return;
      }
      pathname = pathname.slice(basePath.length) || "/";
    }

    let filePath = normalize(join(root, pathname));
    if (!filePath.startsWith(root)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    const info = await stat(filePath);
    if (info.isDirectory()) filePath = join(filePath, "index.html");

    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type": mime[extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, () => {
  console.log(
    `Preview: http://127.0.0.1:${port}${basePath || ""}/ (serving ${root})`,
  );
});