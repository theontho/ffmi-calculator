import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const host = "127.0.0.1";
const port = Number(process.env.PORT ?? 3000);
const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] ??
  "ffmi-calculator";
const basePath = `/${repository}`;
const outputDirectory = resolve("out");
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(
    new URL(request.url ?? "/", `http://${host}:${port}`).pathname,
  );
  if (pathname === basePath) {
    response.writeHead(308, { location: `${basePath}/` });
    response.end();
    return;
  }
  if (!pathname.startsWith(`${basePath}/`)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  const relativePath = pathname.slice(basePath.length + 1) || "index.html";
  const filePath = resolve(outputDirectory, relativePath);
  if (!filePath.startsWith(`${outputDirectory}${sep}`)) {
    response.writeHead(400);
    response.end("Invalid path");
    return;
  }

  try {
    const content = await readFile(filePath);
    response.writeHead(200, {
      "content-type": contentTypes[extname(filePath)] ??
        "application/octet-stream",
    });
    response.end(content);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error &&
        error.code === "ENOENT") {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    console.error(error);
    response.writeHead(500);
    response.end("Server error");
  }
});

server.listen(port, host, () => {
  console.log(`Serving ${outputDirectory} at http://${host}:${port}${basePath}/`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
