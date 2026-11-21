import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";

const app = express();
const port = process.env.PORT || 8000;

// Initialize Database and Cloudinary
connectDB();
connectCloudinary();

// Middleware
app.use(express.json());
app.use(cors());

// API Routes
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

// Root Endpoint
app.get("/", (req, res) => {
  res.json({
    message: "MEDPRO API 🚀",
    status: "Running",
    version: "1.0.0",
  });
});

// Health Check Endpoint (for deployment probes / monitoring)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "MEDPRO Healthcare API",
    status: "Healthy",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.listen(port, () => console.log(`MEDPRO Server running on PORT ${port}`));
