const express = require("express");
const mongoose = require("mongoose");

const routes = require("./routes/authRoutes");

const app = express();

app.use(express.json());


// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/heartshare")
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
  res.send("HeartShare API Running");
});


// API routes
app.use("/api", routes);


// 404 route
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});