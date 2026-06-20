require("dotenv").config();
const express   = require("express");
const mongoose  = require("mongoose");
const cors      = require("cors");
const helmet    = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan    = require("morgan");

const authRoutes      = require("./src/routes/authRoutes");
const donationRoutes  = require("./src/routes/donationRoutes");
const ngoRoutes       = require("./src/routes/ngoRoutes");
const campaignRoutes  = require("./src/routes/campaignRoutes");
const volunteerRoutes = require("./src/routes/volunteerRoutes");

const app = express();

if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 500,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use("/api", limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { success: false, message: "Too many auth attempts, please try again later" },
});
app.use("/api/auth", authLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true, status: "OK",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth",       authRoutes);
app.use("/api/donations",  donationRoutes);
app.use("/api/ngo",        ngoRoutes);
app.use("/api/campaigns",  campaignRoutes);
app.use("/api/volunteers", volunteerRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  if (err.message?.startsWith("CORS blocked"))
    return res.status(403).json({ success: false, message: err.message });
  console.error("Unhandled error:", err.stack || err.message);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}).then(() => {
  console.log("✅ MongoDB connected");
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
  });
  const shutdown = (signal) => {
    console.log(`\n${signal} received — shutting down gracefully`);
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log("MongoDB connection closed");
        process.exit(0);
      });
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
}).catch((err) => {
  console.error(" MongoDB connection failed:", err.message);
  process.exit(1);
});