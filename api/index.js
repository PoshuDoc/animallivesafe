"use strict";

// Supabase pooler uses a certificate chain that Node.js rejects by default.
// This must be set before any TLS connections are made.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let app;
try {
  const mod = require("./_bundle.cjs");
  app = mod.default || mod;
} catch (e) {
  console.error("[api/index.js] failed to load bundle:", e.message);
  app = function (req, res) {
    res.status(503).json({
      error: "bundle_load_failed",
      message: e.message,
    });
  };
}

module.exports = app;
