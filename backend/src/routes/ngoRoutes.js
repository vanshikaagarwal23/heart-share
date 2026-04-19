const express = require("express");
const router = express.Router();

const { createNGO } = require("../controllers/ngoController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// 📝 Create NGO Profile
router.post("/create", protect, authorizeRoles("ngo"), createNGO);

module.exports = router;