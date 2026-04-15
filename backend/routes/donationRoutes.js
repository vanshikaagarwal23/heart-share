const express = require("express");
const router = express.Router();

const { createDonation,getDonations,acceptDonation, rejectDonation,getDonationHistory} = require("../controllers/donationController");

// Routes
// Create a donation
router.post("/donation/createdonation", createDonation);   
// Get all donations
router.get("/donation/getdonations", getDonations);
// Accept a donation
router.post("/donation/acceptdonation/:id", acceptDonation);        
// Reject a donation
router.post("/donation/rejectdonation/:id", rejectDonation);
// Get donation history for a user
router.get("/donation/donationhistory/:userId", getDonationHistory);

module.exports = router;