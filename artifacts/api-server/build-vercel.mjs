import { build } from "esbuild";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import esbuildPluginPino from "esbuild-plugin-pino";

globalThis.require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const outDir = path.resolve(root, "api", "_bundle");

console.log("Building API handler for Vercel...");

await build({
  entryPoints: [path.resolve(__dirname, "src/app.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outdir: outDir,
  outExtension: { ".js": ".cjs" },
  external: [
    "*.node",
    "pg-native",
  ],
  logLevel: "info",
  plugins: [
    esbuildPluginPino({ transports: ["pino-pretty"] }),
  ],
  banner: {
    js: `"use strict";
const { createRequire: __mkReq } = require("node:module");
globalThis.require = __mkReq(__filename);
globalThis.__dirname = require("node:path").dirname(__filename);
globalThis.__filename = __filename;
`,
  },
  footer: {
    js: `
if (module.exports && module.exports.default) {
  module.exports = module.exports.default;
}
`,
  },
});

console.log("✓ API handler pre-built → api/_bundle/");
