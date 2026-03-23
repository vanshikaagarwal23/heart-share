require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const routes = require("./routes/authRoutes");

const app = express();

app.use(express.json());


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {

  console.log("MongoDB Connected");

  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });

})
.catch((error) => {
  console.log("Database connection error:", error);
});


// Test route
app.get("/", (req, res) => {
  res.send("HeartShare API Running");
});


// API Routes
app.use("/api", routes);


// 404 route
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});