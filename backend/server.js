const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");

const routes = require("./routes/donationRoutes");

const app = express();

app.use(express.json());


// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
.then(() => {

  console.log("MongoDB Connected");

  // Start server ONLY after DB connects
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });

})
.catch((error) => {
  console.log("Database connection error:", error);
});


// Test route
app.get("/", (req, res) => {
  res.send(" donation in progress");
});


// API routes
app.use("/api", routes);


// 404 route
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});