"use strict";

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
