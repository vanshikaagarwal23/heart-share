// app.js ngo 
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");

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
async function getConnection() {
  return await mysql.createConnection(dbConfig);
}
// 1. Create Donation
 app.post("/donations", async (req, res) => {
  const { donor, amount, currency, payment_method, message } = req.body;
  try {
    const conn = await getConnection();

    // Insert donor if not exists
    const [existing] = await conn.execute(
      "SELECT donor_id FROM donors WHERE email = ?",
      [donor.email]
    );
    let donorId;
    if (existing.length > 0) {
      donorId = existing[0].donor_id;
    } else {
      const [result] = await conn.execute(
        "INSERT INTO donors (name, email, phone) VALUES (?, ?, ?)",
        [donor.name, donor.email, donor.phone]
      );
      donorId = result.insertId;
    }

    // Insert donation
    const [donation] = await conn.execute(
      "INSERT INTO donations (donor_id, amount, currency, payment_method, status, message) VALUES (?, ?, ?, ?, 'pending', ?)",
      [donorId, amount, currency, payment_method, message]
    );

    res.json({
      donation_id: donation.insertId,
      status: "pending",
      payment_url: `https://payments.ngoexample.org/pay/${donation.insertId}`
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

// rule 1: distance check 
const validNgos = ngo list
 .map(ngo =>)
 if (ngo.distance > 10) {
    return res.status(400).json({
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

  // Rule 3: First NGO acceptance (take the first valid NGO)
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
    const conn = await getConnection();
    await conn.execute(
      "UPDATE donations SET status = 'confirmed', confirmed_at = NOW() WHERE donation_id = ?",
      [donationId]
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
    const conn = await getConnection();
    const [rows] = await conn.execute(
      `SELECT d.donation_id, d.amount, d.currency, d.status, d.created_at, d.confirmed_at,
              donors.name AS donor_name, donors.email AS donor_email
       FROM donations d
       JOIN donors ON d.donor_id = donors.donor_id
       WHERE d.donation_id = ?`,
      [donationId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. List Donations
app.get("/donations", async (req, res) => {
  const { status, limit = 10 } = req.query;
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(
      `SELECT donation_id, amount, currency, status, donors.name AS donor_name
       FROM donations
       JOIN donors ON donations.donor_id = donors.donor_id
       WHERE (? IS NULL OR status = ?)
       ORDER BY donations.created_at DESC
       LIMIT ?`,
      [status || null, status || null, parseInt(limit)]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(3000, () => {
  console.log("NGO Donation API running on http://localhost:3000");
});


    