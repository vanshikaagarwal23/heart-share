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
  itemType: { type: String, enum: ["food", "clothes", "study material"], required: true },
  status: { type: String, default: "pending" },
  preparedAt: { type: Date }, // only relevant for food
}, { timestamps: true });

