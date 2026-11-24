const { Pool } = require("pg");

const url = process.env.DATABASE_URL;
const isLocal = /localhost|127\.0\.0\.1/.test(url || "");
// Hosted databases (such as Render) need SSL. Set DATABASE_SSL=false to turn it off.
const useSsl = process.env.DATABASE_SSL ? process.env.DATABASE_SSL !== "false" : !isLocal;

const pool = new Pool({
  connectionString: url,
  ssl: useSsl ? { rejectUnauthorized: false } : false
});

// Stops an idle connection error from crashing the whole server.
pool.on("error", (error) => {
  console.error("Database pool error:", error.message);
});

module.exports = pool;
