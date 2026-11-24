// Edit these two values before you submit.
const PROJECT_NAME = "IT Support Desk";
const STUDENT_NUMBER = "202409464";

function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderGuide(baseUrl) {
  const base = esc(baseUrl);
  const routes = [
    ["GET", "/", "Show this API guide."],
    ["GET", "/health", "Check that the server and database respond."],
    ["GET", "/api/records", "Read all records."],
    ["GET", "/api/records/:id", "Read one record."],
    ["POST", "/api/records", "Create a record."],
    ["PUT", "/api/records/:id", "Update a record."],
    ["DELETE", "/api/records/:id", "Delete a record."]
  ].map(([m, p, d]) => `<tr><td><code>${m}</code></td><td><code>${p}</code></td><td>${d}</td></tr>`).join("");

  const sample = JSON.stringify({
    title: "Broken classroom projector",
    category: "Hardware",
    description: "The projector in Room B12 does not show an image.",
    status: "Pending"
  }, null, 2);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(PROJECT_NAME)} API guide</title>
<style>
  body { font-family: "Segoe UI", system-ui, sans-serif; line-height: 1.55; color: #16222e; background: #f2f5f8; margin: 0; }
  main { max-width: 860px; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
  h1 { margin-bottom: .25rem; }
  h2 { margin-top: 2rem; }
  section, .box { background: #fff; border: 1px solid #cfd8e1; border-radius: 8px; padding: 1rem 1.25rem; }
  table { width: 100%; border-collapse: collapse; background: #fff; }
  th, td { text-align: left; padding: .5rem .6rem; border-bottom: 1px solid #cfd8e1; vertical-align: top; }
  th { background: #e4ecf4; }
  .scroll { overflow-x: auto; }
  pre { background: #16222e; color: #f2f5f8; padding: 1rem; border-radius: 8px; overflow-x: auto; }
  code { font-family: Consolas, "Courier New", monospace; }
  a { color: #1456a0; }
</style>
</head>
<body>
<main>
  <h1>${esc(PROJECT_NAME)} API</h1>
  <p>Project: <strong>${esc(PROJECT_NAME)}</strong> &middot; Student number: <strong>${esc(STUDENT_NUMBER)}</strong></p>
  <p>This backend stores IT support requests (network, software, hardware, printing and account problems) and lets any client read, create, update and delete them using JSON. All records are made up.</p>

  <div class="box">
    <p><strong>Live API base URL:</strong> <code>${base}</code></p>
    <p>Quick links: <a href="/health">/health</a> &middot; <a href="/api/records">/api/records</a></p>
    <p><em>Note: this service may be idle. If the first request is slow, wait up to a minute for it to start, then try again.</em></p>
  </div>

  <h2>Routes</h2>
  <div class="scroll"><table>
    <thead><tr><th>Method</th><th>Route</th><th>Purpose</th></tr></thead>
    <tbody>${routes}</tbody>
  </table></div>

  <h2>Record fields</h2>
  <div class="scroll"><table>
    <thead><tr><th>Field</th><th>Rule</th></tr></thead>
    <tbody>
      <tr><td><code>id</code></td><td>Positive whole number. Created by the database. Never sent in POST or PUT.</td></tr>
      <tr><td><code>title</code></td><td>Text, 3 to 80 characters after trimming spaces.</td></tr>
      <tr><td><code>category</code></td><td>Text, 2 to 40 characters after trimming spaces.</td></tr>
      <tr><td><code>description</code></td><td>Text, 5 to 300 characters after trimming spaces.</td></tr>
      <tr><td><code>status</code></td><td>Exactly one of: <code>Pending</code>, <code>In progress</code>, <code>Completed</code>.</td></tr>
    </tbody>
  </table></div>

  <h2>Example body for POST and PUT</h2>
  <p>Send it as raw JSON with the header <code>Content-Type: application/json</code>. PUT replaces all four fields and does not create a missing record.</p>
  <pre>${esc(sample)}</pre>

  <h2>Response status codes</h2>
  <div class="scroll"><table>
    <thead><tr><th>Request</th><th>Success</th><th>Success response</th></tr></thead>
    <tbody>
      <tr><td>GET all</td><td>200</td><td>Array of records, or <code>[]</code></td></tr>
      <tr><td>GET one</td><td>200</td><td>One record object with its id</td></tr>
      <tr><td>POST</td><td>201</td><td>The saved record with its new id</td></tr>
      <tr><td>PUT</td><td>200</td><td>The updated record with its original id</td></tr>
      <tr><td>DELETE</td><td>200</td><td><code>{"message":"Record deleted."}</code></td></tr>
    </tbody>
  </table></div>
  <p>Errors return a JSON object with a <code>message</code> field:</p>
  <ul>
    <li><strong>400</strong> invalid input, invalid id or malformed JSON</li>
    <li><strong>404</strong> a record or route that does not exist</li>
    <li><strong>500</strong> unexpected server failure</li>
    <li><strong>503</strong> <code>/health</code> when the database does not respond</li>
  </ul>
  <pre>{"message":"Title must have 3 to 80 characters."}</pre>
</main>
</body>
</html>`;
}

module.exports = { renderGuide };
