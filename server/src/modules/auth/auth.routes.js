const router = require("express").Router();
const { register, login, me } = require("./auth.controller");
const requireAuth = require("../../middlewares/requireAuth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);

module.exports = router;
