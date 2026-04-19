const express = require("express");
const router = express.Router();

const {createDonation,getDonations,getDonationById,
updateDonationStatus} = require("../controllers/donationController");

const {protect,authorizeRoles} = require("../middleware/authMiddleware");


// 📝 Create donation (Donor only)
router.post("/createdonation",protect,authorizeRoles("donor"),createDonation);


// 📥 Get all donations
router.get("/getdonation",protect,getDonations);


// 📄 Get single donation
router.get("/getdonation/:id",protect,getDonationById);


// 🔄 Update donation status (NGO only)
router.patch( "/updatestatus/:id", protect, authorizeRoles("ngo"),updateDonationStatus);


module.exports = router;