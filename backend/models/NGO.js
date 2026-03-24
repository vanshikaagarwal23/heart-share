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


    