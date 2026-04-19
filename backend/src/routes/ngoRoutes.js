const express = require("express");
const router = express.Router();

const { createNGO, getAllNGOs, verifyNGO } = require("../controllers/ngoController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// 📝 Create NGO Profile
router.post("/create", protect, authorizeRoles("ngo"), createNGO);

// 📥 Get all NGOs (ADMIN ONLY)
router.get("/all", protect, authorizeRoles("admin"), getAllNGOs);

// ✅ Verify NGO (ADMIN ONLY)
router.patch("/verify/:id", protect, authorizeRoles("admin"), verifyNGO);

module.exports = router;