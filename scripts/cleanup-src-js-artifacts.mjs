import { readdirSync, statSync, existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "src");
const deleted = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);

    if (stats.isDirectory()) {
      walk(full);
      continue;
    }

    if (!entry.endsWith(".js")) {
      continue;
    }

    const tsTwin = full.replace(/\.js$/, ".ts");
    if (existsSync(tsTwin)) {
      unlinkSync(full);
      deleted.push(full);
    }
  }
}

walk(root);

if (deleted.length === 0) {
  console.log("No JS artifacts found under src with matching TS files.");
} else {
  console.log(`Deleted ${deleted.length} JS artifact(s):`);
  for (const file of deleted) {
    console.log(`- ${file}`);
  }
}
