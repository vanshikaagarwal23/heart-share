// app.js ngo 
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());

// Database connection
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "yourpassword",
  database: "ngo_donations"
};

// Utility: connect to DB
  mongoose.connect("mongodb+srv://100950_db_user:e3N5bUP1VBafTGDt@cluster0.db8s3wk.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// 1. Create Donation
 app.post("/donations", async (req, res) => {
  const { donor, amount, currency, payment_method, message } = req.body;
  try {

    // Insert donor if not exists
    let donorDoc = await Donor.findOne({ email: donor.email });

if (!donorDoc) {
  donorDoc = new Donor({
    name: donor.name,
    email: donor.email,
    phone: donor.phone
  });
  await donorDoc.save();
}

// donorId is now the MongoDB ObjectId
const donorId = donorDoc._id;

    // Insert donation
const donation = new Donation({
    donor_id: donorId,   // this is donorDoc._id from the donor check
    amount,
    currency,
    payment_method,
    status: "pending",
    message
  });

  await donation.save();

  res.json({
    donation_id: donation._id,   // MongoDB ObjectId
    status: donation.status,
    payment_url: `https://payments.ngoexample.org/pay/${donation._id}`
  });
} catch (err) {
  res.status(500).json({ error: err.message });
}  
});
// accept donation or reject it
// Haversine formula to calculate distance in km
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Route: Accept or reject donation
app.post("/donations/validate", async (req, res) => {
  const { donor_location, donation_type, items } = req.body;

  try {
    // Rule 1: Distance check (5–10 km)
    const validNgos = ngos
      .map(ngo => {
        const distance = haversine(
          donor_location.latitude,
          donor_location.longitude,
          ngo.latitude,
          ngo.longitude
        );
        return { ...ngo, distance };
      })
      .filter(ngo => ngo.distance >= 5 && ngo.distance <= 10);

    if (validNgos.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No NGO within 5–10 km"
      });
    }

    // Rule 2: Food expiry check
    if (donation_type === "food") {
      const invalidItem = items.find(item => item.expiry_hours > 24);
      if (invalidItem) {
        return res.status(400).json({
          status: "error",
          message: `Food item '${invalidItem.name}' expiry exceeds 24 hrs`
        });
      }
    }

    // Rule 3: First NGO acceptance
    const chosenNgo = validNgos[0];

    return res.json({
      status: "success",
      message: "Donation accepted",
      ngo_id: chosenNgo.id,
      distance_km: chosenNgo.distance
    });
  

// 2. Confirm Donation
app.post("/donations/:id/confirm", async (req, res) => {
  const donationId = req.params.id;
  try {
    await Donation.updateOne(
    { donation_id: donationId }, // filter
    { 
      $set: { 
        status: "confirmed", 
        confirmed_at: new Date() 
      } 
    }
  );
    res.json({
      donation_id: donationId,
      status: "confirmed",
      receipt_url: receiptUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Donation Details
app.get("/donations/:id", async (req, res) => {
  const donationId = req.params.id;

  try {
    const donation = await Donation.findOne({ donation_id: donationId })
                                   .populate("donor_id", "name email"); 
    // populate donor_id, only return name and email

    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.json({
      donation_id: donation.donation_id,
      amount: donation.amount,
      currency: donation.currency,
      status: donation.status,
      created_at: donation.created_at,
      confirmed_at: donation.confirmed_at,
      donor_name: donation.donor_id?.name,
      donor_email: donation.donor_id?.email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. List Donations
// Route: Get donations with optional status filter and limit
app.get("/donations", async (req, res) => {
  const { status, limit = 10 } = req.query;

  try {
    // Build filter object
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Query donations, populate donor info, sort by created_at
    const donations = await Donation.find(filter)
      .populate("donor_id", "name email") // only bring back donor name + email
      .sort({ created_at: -1 })
      .limit(parseInt(limit));

    // Format response similar to SQL version
    const result = donations.map(d => ({
      donation_id: d.donation_id,
      amount: d.amount,
      currency: d.currency,
      status: d.status,
      donor_name: d.donor_id?.name,
      donor_email: d.donor_id?.email
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(3000, () => {
  console.log("NGO Donation API running on http://localhost:3000");
});




    