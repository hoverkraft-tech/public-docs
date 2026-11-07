import fs from "node:fs";
import path from "node:path";

export function writeFixtureTree(root, entries) {
  fs.mkdirSync(root, { recursive: true });
  for (const [name, value] of Object.entries(entries)) {
    const target = path.join(root, name);
    if (typeof value === "string") {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, value);
    } else {
      writeFixtureTree(target, value);
    }
  }
}
