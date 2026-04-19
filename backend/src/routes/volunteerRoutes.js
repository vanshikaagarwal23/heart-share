const express = require("express");
const router = express.Router();

const {
  getVolunteers,
  createVolunteer,
  assignCampaign,
} = require("../controllers/volunteerController");

const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, createVolunteer);
router.get("/", protect, getVolunteers);
router.post("/assign", protect, assignCampaign);

module.exports = router;