const express = require("express");
const router = express.Router();

const {
  getCampaigns,
  getCampaignById,
  createCampaign,
} = require("../controllers/campaignController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getCampaigns);

router.get("/:id", protect, getCampaignById);

router.post("/create", protect, createCampaign);

module.exports = router;