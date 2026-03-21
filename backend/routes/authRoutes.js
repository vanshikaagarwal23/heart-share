const express = require("express");
const router = express.Router();

const { registerUser, loginUser } = require("../controllers/authController");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");


// REGISTER
router.post("/auth/register", registerUser);


// LOGIN
router.post("/auth/login", loginUser);


// GET PROFILE
router.get("/user/profile", protect, async (req, res) => {

  const user = await User.findById(req.user.id).select("-password");

  res.json(user);

});


// UPDATE PROFILE
router.put("/user/update", protect, async (req, res) => {

  const user = await User.findByIdAndUpdate(
    req.user.id,
    req.body,
    { new: true }
  );

  res.json(user);

});


module.exports = router;