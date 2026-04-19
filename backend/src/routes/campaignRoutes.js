const express = require("express");
const router = express.Router();

const {
  getCampaigns,
  getCampaignById,
} = require("../controllers/campaignController");

const { protect } = require("../middleware/authMiddleware");

// 📥 Get all campaigns
router.get("/", protect, getCampaigns);

// 📄 Get single campaign
router.get("/:id", protect, getCampaignById);

module.exports = router;