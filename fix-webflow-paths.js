// fix-webflow-paths.js
// Rewrites Webflow-exported relative asset/page links to root-relative so pretty URLs like /portfolio/ don't break.
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const TARGET_EXT = ".html";

// folders that should always resolve from site root
const ASSET_FOLDERS = ["css", "js", "images", "videos", "fonts"];

// html pages that should be root-relative in nav links
const PAGE_FILES = [
  "index.html",
  "portfolio.html",
  "our-process.html",
  "services.html",
  "palazzo-expreinece.html",
  "about.html",
  "contact.html",
];

// walk repo and return all html files
function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      // skip node_modules just in case
      if (ent.name === "node_modules") continue;
      walk(p, out);
    } else if (ent.isFile() && p.toLowerCase().endsWith(TARGET_EXT)) {
      out.push(p);
    }
  }
  return out;
}

function rewrite(html) {
  // assets: href="css/.." -> href="/css/..", src="images/.." -> src="/images/.."
  for (const folder of ASSET_FOLDERS) {
    html = html.replaceAll(`href="${folder}/`, `href="/${folder}/`);
    html = html.replaceAll(`src="${folder}/`, `src="/${folder}/`);
    html = html.replaceAll(`data-poster-url="${folder}/`, `data-poster-url="/${folder}/`);
    html = html.replaceAll(`data-video-urls="${folder}/`, `data-video-urls="/${folder}/`);
  }

  // nav/page links: href="about.html" -> href="/about.html"
  for (const pf of PAGE_FILES) {
    html = html.replaceAll(`href="${pf}"`, `href="/${pf}"`);
  }

  return html;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const before = fs.readFileSync(file, "utf8");
  const after = rewrite(before);
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed++;
  }
}

console.log(`[fix-webflow-paths] Updated ${changed} HTML file(s).`);
