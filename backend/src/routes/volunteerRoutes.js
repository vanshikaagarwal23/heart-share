const express = require("express");
const router  = express.Router();
const { applyVolunteer, getMyVolunteering, getCampaignVolunteers, updateVolunteerStatus, updateVolunteerHours } = require("../controllers/volunteerController");
const { protect } = require("../middleware/authMiddleware");

router.post("/apply",           protect, applyVolunteer);
router.get("/my",               protect, getMyVolunteering);
router.get("/campaign/:id",     protect, getCampaignVolunteers);
router.patch("/status/:id",     protect, updateVolunteerStatus);
router.patch("/hours/:id",      protect, updateVolunteerHours);

module.exports = router;