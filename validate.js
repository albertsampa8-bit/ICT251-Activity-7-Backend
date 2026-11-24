const STATUSES = ["Pending", "In progress", "Completed"];
const MAX_ID = 2147483647; // largest value of a Postgres integer

// Returns a positive whole number, or null when the id is not one.
function parseId(raw) {
  if (typeof raw !== "string" || !/^[1-9][0-9]{0,14}$/.test(raw)) return null;
  return Number(raw);
}

const RULES = [
  { field: "title", label: "Title", min: 3, max: 80 },
  { field: "category", label: "Category", min: 2, max: 40 },
  { field: "description", label: "Description", min: 5, max: 300 }
];

// Returns { error } with a clear message, or { value } holding the cleaned four fields.
// Any client-supplied id is ignored.
function validateRecord(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object with title, category, description and status." };
  }

  const value = {};
  for (const { field, label, min, max } of RULES) {
    const raw = body[field];
    if (raw === undefined || raw === null) return { error: `${label} is required.` };
    if (typeof raw !== "string") return { error: `${label} must be text.` };
    const text = raw.trim();
    if (text.length < min || text.length > max) {
      return { error: `${label} must have ${min} to ${max} characters.` };
    }
    value[field] = text;
  }

  const rawStatus = body.status;
  if (rawStatus === undefined || rawStatus === null) return { error: "Status is required." };
  if (typeof rawStatus !== "string") return { error: "Status must be text." };
  const status = rawStatus.trim();
  if (!STATUSES.includes(status)) {
    return { error: "Status must be exactly one of: Pending, In progress, Completed." };
  }
  value.status = status;

  return { value };
}

module.exports = { parseId, validateRecord, STATUSES, MAX_ID };
