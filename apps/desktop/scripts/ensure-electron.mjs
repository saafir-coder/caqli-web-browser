import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const electronPackageJsonPath = require.resolve("electron/package.json");
const electronDir = electronPackageJsonPath.replace(/package\.json$/, "");
const electronIndexPath = join(electronDir, "index.js");
const electronInstallPath = join(electronDir, "install.js");
const electronPathFile = join(electronDir, "path.txt");
const electronDistDir = join(electronDir, "dist");

function isElectronInstalled() {
  if (!existsSync(electronPathFile)) {
    return false;
  }

  try {
    require(electronIndexPath);
    return true;
  } catch {
    return false;
  }
}

if (!isElectronInstalled()) {
  console.log("[desktop] Electron binary missing. Bootstrapping Electron...");

  const result = spawnSync(process.execPath, [electronInstallPath], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0 || !isElectronInstalled()) {
    const locationHint = existsSync(electronDistDir) ? electronDistDir : electronDir;
    console.error("");
    console.error("[desktop] Electron bootstrap failed.");
    console.error(
      `[desktop] Expected a downloaded Electron runtime under: ${locationHint}`,
    );
    console.error(
      "[desktop] Make sure this machine has internet access, then rerun `bun run dev:desktop`.",
    );
    process.exit(result.status ?? 1);
  }
}
