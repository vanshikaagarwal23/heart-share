const express = require("express");
const router  = express.Router();
const { getCampaigns, getCampaignById, createCampaign, toggleCampaign, updateCampaign } = require("../controllers/campaignController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/",                protect, getCampaigns);
router.get("/:id",             protect, getCampaignById);
router.post("/create",         protect, authorizeRoles("ngo", "admin"), createCampaign);
router.patch("/toggle/:id",    protect, authorizeRoles("ngo", "admin"), toggleCampaign);
router.patch("/:id",           protect, authorizeRoles("ngo", "admin"), updateCampaign);

module.exports = router;