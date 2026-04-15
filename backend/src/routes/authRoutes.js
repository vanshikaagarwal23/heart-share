const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");


// REGISTER
router.post("/auth/register", registerUser);


// LOGIN
router.post("/auth/login", loginUser);


// GET PROFILE
router.get("/user/profile", protect, getUserProfile);


// UPDATE PROFILE
router.put("/user/update", protect, updateUserProfile);


module.exports = router;