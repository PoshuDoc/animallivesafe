import { build } from "esbuild";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

globalThis.require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const outFile = path.resolve(root, "api", "_bundle.cjs");

console.log("Building API handler for Vercel (production mode)...");

await build({
  entryPoints: [path.resolve(__dirname, "src/app.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outfile: outFile,
  external: [
    "*.node",
    "pg-native",
  ],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  logLevel: "info",
  banner: {
    js: `"use strict";
const { createRequire: __mkReq } = require("node:module");
globalThis.require = __mkReq(__filename);
globalThis.__dirname = require("node:path").dirname(__filename);
globalThis.__filename = __filename;
`,
  },
});

console.log("✓ API handler pre-built → api/_bundle.cjs");
