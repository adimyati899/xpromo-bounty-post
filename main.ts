// xpromo-bounty-post — entry for make.fun's "Promote make.fun's
// make-your-own-bounty post on X" bounty ($250 in USDC).
//
// The entry itself is a single X post: our quote of make.fun's
// make-your-own-bounty announcement, published from @Michaelluzvert
// on 25 Nov 2026, carrying the play code makefun-omelet-rowan-isthmus
// and its own photo. This program does the smallest honest job the
// bounty allows: it hands the gate the address of that post, copied
// byte-for-byte from POST.json, and refuses to hand over anything
// that is not a real x.com status link.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function fail(message: string): never {
  console.error(`xpromo-bounty-post: ${message}`);
  process.exit(1);
}

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const sourcePath = join(botDir, "POST.json");

if (!existsSync(sourcePath)) {
  fail(`POST.json not found at ${sourcePath}`);
}

let raw: string;
try {
  raw = readFileSync(sourcePath, "utf8");
} catch {
  fail(`could not read ${sourcePath}`);
}

let parsed: unknown;
try {
  parsed = JSON.parse(raw!);
} catch {
  fail("POST.json is not valid JSON");
}

const url =
  parsed !== null && typeof parsed === "object"
    ? (parsed as Record<string, unknown>).url
    : undefined;

if (typeof url !== "string" || url.length === 0) {
  fail("POST.json must contain a non-empty string field 'url'");
}

let checked: URL;
try {
  checked = new URL(url);
} catch {
  fail(`'url' is not a valid URL: ${url}`);
}

const hostOk = checked!.protocol === "https:" &&
  (checked!.hostname === "x.com" ||
    checked!.hostname === "twitter.com" ||
    checked!.hostname.endsWith(".x.com") ||
    checked!.hostname.endsWith(".twitter.com"));
const pathOk = /^\/[^/]+\/status\/\d+\/?$/.test(checked!.pathname);

if (!hostOk || !pathOk) {
  fail(`'url' must be an https x.com/twitter.com status URL, got: ${url}`);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "POST.json"), raw!, "utf8");
