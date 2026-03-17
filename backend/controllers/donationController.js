// donationj-api 
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

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
/ Start server
app.listen(PORT, () => console.log(`DonationJ API running on port ${PORT}`));

