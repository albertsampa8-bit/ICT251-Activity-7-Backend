const fs = require("fs");
const path = require("path");
const pool = require("./db");

// Creates the table if needed. Inserts the made-up starting records only
// when the table is created for the first time, so deleted records stay deleted.
async function initDatabase() {
  const before = await pool.query("SELECT to_regclass('public.records') AS name");
  const existed = before.rows[0].name !== null;

  await pool.query(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));

  if (!existed) {
    await pool.query(fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8"));
    console.log("Created the records table and added the starting records.");
  } else {
    console.log("Records table already exists. Starting records not added again.");
  }
}

module.exports = { initDatabase };
