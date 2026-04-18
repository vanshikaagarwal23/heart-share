const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");


// REGISTER
router.post("/auth/register", register);


// LOGIN
router.post("/auth/login", login);


// GET PROFILE
router.get("/user/profile", protect, getMe);



module.exports = router;