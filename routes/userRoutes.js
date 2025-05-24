const express = require("express");
const authController = require("../controller/authController");
const auth = require("../middleware/auth");

const router = express.Router();

// register
router.post("/register", authController.register);
// login router
router.post("/login", authController.login);
// logout
router.post("/logout", auth, authController.logout);
// refresh
router.post("/refresh", authController.refresh)

module.exports = router;
