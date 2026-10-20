// Serves the install page for the fomo all-time PnL bookmarklet.
// Run: node server.js  →  http://localhost:3333
// (fomo's API rejects requests from outside fomo.family, so the lookup itself
// runs as a bookmarklet inside the fomo page — see bookmarklet.js.)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const PORT = process.env.PORT || 3333;
const files = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/bookmarklet.js": ["bookmarklet.js", "text/javascript; charset=utf-8"],
};

createServer(async (req, res) => {
  const file = files[new URL(req.url, "http://localhost").pathname];
  if (!file) return res.writeHead(404).end();
  res.setHeader("Content-Type", file[1]);
  res.end(await readFile(new URL(`./${file[0]}`, import.meta.url)));
}).listen(PORT, () => console.log(`fomo PnL → http://localhost:${PORT}`));
