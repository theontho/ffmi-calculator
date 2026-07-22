import { existsSync, readFileSync } from "node:fs";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] ??
  "ffmi-calculator";
const basePath = `/${repository}/`;
const html = readFileSync("out/index.html", "utf8");
const references = [
  ...html.matchAll(/(?:src|href)="(\/[^"?#]+)[^"#]*"/g),
].map((match) => match[1]);
const misplacedReferences = [...new Set(references)]
  .filter((reference) => !reference.startsWith(basePath));
const localReferences = [...new Set(references)]
  .filter((reference) => reference.startsWith(basePath));
const missing = localReferences.filter((reference) =>
  !existsSync(`out/${reference.slice(basePath.length)}`)
);

if (localReferences.length === 0) {
  throw new Error(`No generated assets use the ${basePath} base path`);
}
if (misplacedReferences.length > 0) {
  throw new Error(
    `Generated assets escape ${basePath}:\n${misplacedReferences.join("\n")}`,
  );
}
if (missing.length > 0) {
  throw new Error(`Missing generated assets:\n${missing.join("\n")}`);
}
if (/patchwork/i.test(html)) {
  throw new Error("Generated page contains a removed Patchwork reference");
}

console.log(`Validated ${localReferences.length} GitHub Pages asset references.`);
