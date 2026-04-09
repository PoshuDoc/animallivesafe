"use strict";

// Supabase pooler uses a certificate chain that Node.js rejects by default.
// This must be set before any TLS connections are made.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let app;
try {
  const mod = require("./_bundle.cjs");
  app = mod.default || mod;

  // Pre-warm DB connection so the first real request is faster
  if (mod.pool && typeof mod.pool.connect === "function") {
    mod.pool.connect().then((client) => {
      client.release();
      console.log("[api] DB pre-warmed");
    }).catch((e) => {
      console.warn("[api] DB pre-warm failed:", e.message);
    });
  }
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
