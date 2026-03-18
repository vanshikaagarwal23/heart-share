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

    