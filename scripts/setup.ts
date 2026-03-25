import * as readline from "node:readline";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync, spawn } from "node:child_process";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

function ask(rl: readline.Interface, question: string, defaultValue?: string): Promise<string> {
  const suffix = defaultValue ? ` (${defaultValue})` : "";
  return new Promise((resolve, reject) => {
    rl.question(`${question}${suffix}: `, (answer) => {
      resolve(answer.trim() || defaultValue || "");
    });
    rl.once("close", () => resolve(defaultValue || ""));
  });
}

function toKebab(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toTitleCase(kebab: string): string {
  return kebab
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function replaceInFile(filePath: string, replacements: [string, string][]): boolean {
  const abs = path.resolve(ROOT, filePath);
  if (!fs.existsSync(abs)) {
    console.warn(`  ⚠ File not found, skipping: ${filePath}`);
    return false;
  }
  let content = fs.readFileSync(abs, "utf-8");
  let changed = false;
  for (const [search, replace] of replacements) {
    if (content.includes(search)) {
      content = content.replaceAll(search, replace);
      changed = true;
    } else {
      console.warn(`  ⚠ Pattern not found in ${filePath}: ${search}`);
    }
  }
  if (changed) {
    fs.writeFileSync(abs, content, "utf-8");
  }
  return changed;
}

function run(cmd: string, opts?: { cwd?: string; stdio?: "inherit" | "pipe" | "ignore" }): string {
  try {
    const result = execSync(cmd, {
      cwd: opts?.cwd ?? ROOT,
      stdio: opts?.stdio ?? "pipe",
      encoding: "utf-8",
    });
    return typeof result === "string" ? result.trim() : "";
  } catch (e: unknown) {
    const err = e as { stderr?: string; message?: string };
    throw new Error(err.stderr || err.message || String(e));
  }
}

function spawnBackground(cmd: string, args: string[]): ReturnType<typeof spawn> {
  return spawn(cmd, args, {
    cwd: ROOT,
    stdio: "ignore",
    detached: true,
  });
}

function killProcessGroup(child: ReturnType<typeof spawn>): void {
  if (child.pid) {
    try {
      // Kill the entire process group (negative PID)
      process.kill(-child.pid, "SIGTERM");
    } catch {
      // Fallback: kill just the process
      child.kill("SIGTERM");
    }
  }
}

// ─── Check if setup already ran ──────────────────────────────────────────────

function isAlreadySetup(): boolean {
  const siteConfig = fs.readFileSync(path.resolve(ROOT, "site.config.ts"), "utf-8");
  return !siteConfig.includes("Feather Starter");
}

// ─── Branding Replacement ────────────────────────────────────────────────────
//
// Branding is centralized into config files:
//   - site.config.ts      → frontend (siteTitle, siteDescription)
//   - convex/config.ts    → backend  (APP_NAME)
//   - package.json        → npm package name
//   - site.config.test.ts → test assertion
//
// All other files import from these configs, so no replacement needed.

function replaceBranding(appName: string, appDescription: string): number {
  const kebab = toKebab(appName);
  let count = 0;

  const files: { path: string; replacements: [string, string][] }[] = [
    {
      path: "package.json",
      replacements: [
        ['"feather-starter-convex"', `"${kebab}"`],
      ],
    },
    {
      path: "site.config.ts",
      replacements: [
        ['"Feather Starter"', `"${appName}"`],
        [
          '"A lightweight, production-ready starter template powered by Convex and React."',
          `"${appDescription}"`,
        ],
      ],
    },
    {
      path: "convex/config.ts",
      replacements: [
        ['"Feather Starter"', `"${appName}"`],
      ],
    },
    {
      path: "site.config.test.ts",
      replacements: [
        ['toBe("Feather Starter")', `toBe("${appName}")`],
      ],
    },
  ];

  for (const file of files) {
    if (replaceInFile(file.path, file.replacements)) {
      count++;
    }
  }

  return count;
}

// ─── Convex Setup ────────────────────────────────────────────────────────────

async function setupConvex(projectName: string): Promise<void> {
  const kebab = toKebab(projectName);
  const envLocalPath = path.resolve(ROOT, ".env.local");
  const hasEnvLocal = fs.existsSync(envLocalPath);

  // Step 1: Initialize Convex project (always local deployment)
  console.log("\n⚙️  Initializing Convex project...");
  if (hasEnvLocal) {
    console.log("  ℹ .env.local already exists — skipping project creation.");
    try {
      run("npx convex dev --once", { stdio: "inherit" });
    } catch {
      console.log("  ℹ Convex push completed (errors above may be expected on first run).");
    }
  } else {
    try {
      run(`npx convex dev --once --configure=new --project=${kebab} --dev-deployment=local`, { stdio: "inherit" });
    } catch {
      console.log("  ℹ Convex init completed (errors above may be expected on first run).");
    }
  }

  // Step 2: Restore convex/tsconfig.json (Convex CLI overwrites it — upstream bug)
  console.log("  🔧 Restoring convex/tsconfig.json (path aliases)...");
  try {
    run("git restore convex/tsconfig.json");
    console.log("  ✓ convex/tsconfig.json restored");
  } catch {
    console.warn("  ⚠ Could not restore convex/tsconfig.json — you may need to do this manually.");
  }

  // Step 3: Start convex dev in background for auth setup
  console.log("\n⚙️  Setting up authentication...");
  console.log("  Starting Convex backend in background...");

  const convexDev = spawnBackground("npx", ["convex", "dev"]);
  convexDev.unref();

  // Wait for backend to be ready (check if local backend is listening)
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      // Try to reach the local backend health endpoint
      const response = await fetch("http://127.0.0.1:3210/version");
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      // still starting up
    }
  }

  if (!ready) {
    console.warn("  ⚠ Convex backend did not start in time. You may need to run auth setup manually:");
    console.warn("    1. Run `npx convex dev` in one terminal");
    console.warn("    2. Run `npx @convex-dev/auth` in another terminal");
    killProcessGroup(convexDev);
    return;
  }

  // Step 4: Run auth setup
  console.log("  Running auth configuration...");
  try {
    run("npx @convex-dev/auth --skip-git-check --web-server-url http://localhost:5173", { stdio: "inherit" });
    console.log("  ✓ Auth configured");
  } catch {
    console.warn("  ⚠ Auth setup had issues. You can re-run it manually:");
    console.warn("    1. Run `npx convex dev` in one terminal");
    console.warn("    2. Run `npx @convex-dev/auth` in another terminal");
  }

  // Step 5: Stop background convex dev
  killProcessGroup(convexDev);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("");
  console.log("🪶 Feather Starter — Project Setup");
  console.log("───────────────────────────────────");
  console.log("");

  // Check idempotency
  if (isAlreadySetup()) {
    console.log("✓ Project already configured (branding has been updated).");
    console.log("  To reconfigure, restore the original files and re-run.");
    process.exit(0);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Derive default name from folder
    const folderName = path.basename(ROOT);
    const defaultName = toTitleCase(folderName);
    const defaultDescription =
      "A lightweight, production-ready starter template powered by Convex and React.";

    // Phase 1: Ask questions
    const appName = await ask(rl, "App display name", defaultName);
    const appDescription = await ask(rl, "App description", defaultDescription);

    rl.close();

    // Phase 2: Replace branding
    console.log("\n📝 Updating branding...");
    const filesUpdated = replaceBranding(appName, appDescription);
    console.log(`  ✓ Updated ${filesUpdated} files`);

    // Phase 3: Convex backend setup
    await setupConvex(appName);

    // Phase 4: Summary
    const kebab = toKebab(appName);
    console.log("");
    console.log("────────────────────────────────────────");
    console.log("");
    console.log("✅ Project setup complete!");
    console.log("");
    console.log("Configured:");
    console.log(`  ✓ App name: ${appName}`);
    console.log(`  ✓ Package name: ${kebab}`);
    console.log(`  ✓ Convex project: ${kebab} (local deployment)`);
    console.log(`  ✓ Branding: updated in ${filesUpdated} files`);
    console.log("");
    console.log("Optional environment variables (set when ready):");
    console.log("  npx convex env set AUTH_RESEND_KEY re_...            # Email OTP");
    console.log("  npx convex env set AUTH_GITHUB_ID ...                # GitHub OAuth");
    console.log("  npx convex env set AUTH_GITHUB_SECRET ...");
    console.log("  npx convex env set STRIPE_SECRET_KEY sk_test_...     # Billing");
    console.log("  npx convex env set STRIPE_WEBHOOK_SECRET whsec_...");
    console.log("");
  } catch (err) {
    rl.close();
    console.error("\n❌ Setup failed:", err);
    console.error("   You can re-run with: npm run setup");
    process.exit(1);
  }
}

main();
