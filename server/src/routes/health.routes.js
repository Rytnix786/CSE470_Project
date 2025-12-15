const router = require("express").Router();

router.get("/", (req, res) => {
  res.json({ ok: true, message: "API is healthy" });
});

module.exports = router;
