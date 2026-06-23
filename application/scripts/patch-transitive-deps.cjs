const fs = require("node:fs");
const path = require("node:path");

function patchFile(filePath, replacements) {
  const source = fs.readFileSync(filePath, "utf8");
  let updated = source;

  for (const [from, to] of replacements) {
    updated = updated.replace(from, to);
  }

  if (updated === source) {
    return false;
  }

  fs.writeFileSync(filePath, updated);
  return true;
}

const grayMatterEnginesPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "gray-matter",
  "lib",
  "engines.js",
);

if (!fs.existsSync(grayMatterEnginesPath)) {
  process.exit(0);
}

patchFile(grayMatterEnginesPath, [
  ["parse: yaml.safeLoad.bind(yaml),", "parse: yaml.load.bind(yaml),"],
  ["stringify: yaml.safeDump.bind(yaml)", "stringify: yaml.dump.bind(yaml)"],
]);
