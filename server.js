require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { initDatabase } = require("./setup");
const { renderGuide } = require("./guide");

const app = express();
app.set("trust proxy", 1); // so req.protocol is https behind Render's proxy

const origins = (process.env.CLIENT_ORIGINS || "")
  .split(",").map((value) => value.trim()).filter(Boolean);

app.use(cors({ origin: origins }));
app.use(express.json({ limit: "10kb" }));

// API guide for the marker
app.get("/", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  res.status(200).type("html").send(renderGuide(baseUrl));
});

// Health check: server and database
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", database: "ok" });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(503).json({ status: "error", message: "The database is not responding." });
  }
});

app.use("/api/records", require("./routes/records"));

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Error handler (four parameters)
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === "entity.parse.failed" || (error instanceof SyntaxError && error.status === 400)) {
    return res.status(400).json({ message: "Malformed JSON in the request body." });
  }
  if (error.type === "entity.too.large") {
    return res.status(400).json({ message: "The request body is too large." });
  }
  console.error("Unexpected error:", error);
  res.status(500).json({ message: "Something went wrong on the server. Please try again." });
});

const port = process.env.PORT || 3000;

initDatabase()
  .catch((error) => console.error("Database setup failed:", error.message))
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server listening on port ${port}`);
    });
  });
