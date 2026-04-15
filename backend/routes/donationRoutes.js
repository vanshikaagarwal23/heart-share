const express = require("express");
const router = express.Router();

const { createDonation, getAllDonations, getDonationById, updateDonation, deleteDonation } = require("../controllers/donationController");

// Routes
// Create a donation
app.post('/api/donationj', async (req, res) => {
  try {
    const { donorName, amount, message } = req.body;
    const donation = new Donation({ donorName, amount, message });
    await donation.save();
    res.status(201).json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all donations
app.get('/api/donationj', async (req, res) => {
  try {
    const donations = await Donation.find();
    res.json(donations);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single donation by ID
app.get('/api/donationj/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
    res.json(donation);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a donation
app.delete('/api/donationj/:id', async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
    res.json({ success: true, message: 'Donation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`DonationJ API running on port ${PORT}`));