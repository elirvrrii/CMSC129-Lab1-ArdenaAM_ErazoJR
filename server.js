require("dotenv").config();

const express = require("express");
const cors = require("cors");
const logger = require("./middleware/logger");

// Initialize DB connections
require("./db/connection");

const journalRoutes = require("./routes/journalRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use("/api/journal", journalRoutes);

// Health check
app.get("/", (req, res) => {
res.json({ status: "Journal API is running" });
});

// Use PORT from .env or fallback
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`🚀 Server running on port ${PORT}`);
});
