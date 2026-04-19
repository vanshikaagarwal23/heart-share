const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");


// REGISTER
router.post("/register", register);


// LOGIN
router.post("/login", login);


// GET PROFILE
router.get("/profile", protect, getMe);



module.exports = router;