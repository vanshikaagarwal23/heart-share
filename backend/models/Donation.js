// donationj-api/index.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Donation Schema
const donationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  amount: { type: Number, required: true },
  message: { type: String },
  date: { type: Date, default: Date.now }
});
const Donation = mongoose.model('Donation', donationSchema);

