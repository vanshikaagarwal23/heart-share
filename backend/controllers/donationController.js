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
// Update donation status
app.put("/donations/:id/status", (req, res) => {
  const donation = donations.find(d => d.id === parseInt(req.params.id));
  if (!donation) return res.status(404).send("Donation not found");

  donation.status = req.body.status;
  res.json(donation);
});

// Delete donation
app.delete("/donations/:id", (req, res) => {
  donations = donations.filter(d => d.id !== parseInt(req.params.id));
  res.send("Donation deleted");
});

// Start server
app.listen(PORT, () => console.log(`DonationJ API running on port ${PORT}));

