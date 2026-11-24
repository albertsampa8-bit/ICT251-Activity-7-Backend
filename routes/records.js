const router = require("express").Router();
const pool = require("../db");
const { parseId, validateRecord, MAX_ID } = require("../validate");

const COLUMNS = "id, title, category, description, status";

function notFound(res) {
  return res.status(404).json({ message: "Record not found." });
}

// Returns a valid id, or sends the error response and returns null.
function resolveId(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: "Id must be a positive whole number." });
    return null;
  }
  if (id > MAX_ID) {
    notFound(res);
    return null;
  }
  return id;
}

// Read all records
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT ${COLUMNS} FROM records ORDER BY id`);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Read one record
router.get("/:id", async (req, res, next) => {
  try {
    const id = resolveId(req, res);
    if (id === null) return;
    const result = await pool.query(`SELECT ${COLUMNS} FROM records WHERE id = $1`, [id]);
    if (result.rowCount === 0) return notFound(res);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Create a record
router.post("/", async (req, res, next) => {
  try {
    const { error, value } = validateRecord(req.body);
    if (error) return res.status(400).json({ message: error });
    const result = await pool.query(
      `INSERT INTO records (title, category, description, status) VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
      [value.title, value.category, value.description, value.status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update a record (replaces all four editable fields)
router.put("/:id", async (req, res, next) => {
  try {
    const id = resolveId(req, res);
    if (id === null) return;
    const { error, value } = validateRecord(req.body);
    if (error) return res.status(400).json({ message: error });
    const result = await pool.query(
      `UPDATE records SET title = $1, category = $2, description = $3, status = $4 WHERE id = $5 RETURNING ${COLUMNS}`,
      [value.title, value.category, value.description, value.status, id]
    );
    if (result.rowCount === 0) return notFound(res);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete a record
router.delete("/:id", async (req, res, next) => {
  try {
    const id = resolveId(req, res);
    if (id === null) return;
    const result = await pool.query("DELETE FROM records WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) return notFound(res);
    res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
