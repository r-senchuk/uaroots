import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "out");

const requiredFiles = [
  "index.html",
  "index.txt",
  "404.html",
  "routes/index.html",
  "routes/lviv-hannover/index.html",
  "routes/lviv-hannover/index.txt",
  "sitemap.xml",
  "robots.txt",
];

const errors = [];

for (const relative of requiredFiles) {
  const path = join(root, relative);
  if (!existsSync(path)) errors.push(`Missing ${relative}`);
}

const hannoverPath = join(root, "routes/lviv-hannover/index.html");
if (existsSync(hannoverPath)) {
  const html = readFileSync(hannoverPath, "utf8");
  if (!html.includes("<h1") || !html.includes("Львів") || !html.includes("Ганновер")) {
    errors.push("Hannover route HTML is missing the Ukrainian H1");
  }
  if (!html.includes('rel="canonical"') || !html.includes("https://uaroute.com/routes/lviv-hannover/")) {
    errors.push("Hannover route HTML is missing the absolute canonical");
  }
}

const homePath = join(root, "index.html");
if (existsSync(homePath)) {
  const html = readFileSync(homePath, "utf8");
  if (!html.includes("https://uaroute.com/")) {
    errors.push("Home HTML is missing the absolute site URL");
  }
}

const sitemapPath = join(root, "sitemap.xml");
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, "utf8");
  if (!sitemap.includes("https://uaroute.com/routes/lviv-hannover/")) {
    errors.push("sitemap.xml is missing the commercial Hannover URL");
  }
  if (sitemap.includes("lviv-hamburg") || sitemap.includes("lviv-berlin")) {
    errors.push("sitemap.xml includes editorial routes");
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `inspect-out: ${error}`).join("\n"));
  process.exit(1);
}

console.log("inspect-out: ./out looks complete");
