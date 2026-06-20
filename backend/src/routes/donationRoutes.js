const express = require("express");
const router  = express.Router();
const { createDonation, getDonations, getDonationById, updateDonationStatus } = require("../controllers/donationController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/",            protect, authorizeRoles("donor"), createDonation);
router.get("/",             protect, getDonations);
router.get("/:id",          protect, getDonationById);
router.patch("/:id/status", protect, authorizeRoles("ngo", "admin"), updateDonationStatus);

module.exports = router;