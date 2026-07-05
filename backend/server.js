const express      = require("express");
const cors         = require("cors");
const dotenv       = require("dotenv");
const connectDB    = require("./config/db");
const taskRoutes   = require("./routes/taskRoutes");
const aiRoutes     = require("./routes/aiRoutes");
const errorHandler = require("./middleware/errorHandler");  // ← was missing

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/tasks", taskRoutes);
app.use("/api/ai",    aiRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "⚡ LifeSaver AI Backend is running" });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`⚡ Server running on http://localhost:${PORT}`);
});