// Runs the PDF's Step 7 checks against any base URL.
// Usage: node scripts/smoke-test.js http://localhost:3000
//        node scripts/smoke-test.js https://your-backend.onrender.com
const base = (process.argv[2] || "http://localhost:3000").replace(/\/+$/, "");
let failed = 0;

async function call(method, path, body, raw) {
  const options = { method, headers: {} };
  if (raw !== undefined) { options.headers["Content-Type"] = "application/json"; options.body = raw; }
  else if (body !== undefined) { options.headers["Content-Type"] = "application/json"; options.body = JSON.stringify(body); }
  const res = await fetch(base + path, options);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not JSON */ }
  return { status: res.status, json, text };
}

function check(name, condition, detail = "") {
  if (!condition) failed++;
  console.log(`${condition ? "PASS" : "FAIL"}  ${name}${condition ? "" : "  -> " + detail}`);
}

const good = { title: "Smoke test request", category: "Network", description: "Created by the smoke test script.", status: "Pending" };

(async () => {
  console.log(`Testing ${base}\n(first request may take up to a minute if the service was idle)\n`);

  let r = await call("GET", "/");
  check("GET / returns the HTML guide", r.status === 200 && r.text.includes("<table"), r.status);

  r = await call("GET", "/health");
  check("GET /health 200", r.status === 200, r.status + " " + r.text);

  r = await call("GET", "/api/records");
  check("GET /api/records 200 and an array", r.status === 200 && Array.isArray(r.json), r.status);
  const startCount = Array.isArray(r.json) ? r.json.length : -1;
  check("At least 8 records exist", startCount >= 8, `found ${startCount}`);

  r = await call("POST", "/api/records", { ...good, id: 99999 });
  check("POST valid body 201 with new id (client id ignored)", r.status === 201 && Number.isInteger(r.json?.id) && r.json.id !== 99999, r.text);
  const id = r.json?.id;

  r = await call("GET", `/api/records/${id}`);
  check("GET the new record 200 and matches", r.status === 200 && r.json?.title === good.title && r.json?.id === id, r.text);

  r = await call("PUT", `/api/records/${id}`, { ...good, title: "Smoke test updated", status: "Completed" });
  check("PUT 200, changed values, same id", r.status === 200 && r.json?.title === "Smoke test updated" && r.json?.status === "Completed" && r.json?.id === id, r.text);

  r = await call("DELETE", `/api/records/${id}`);
  check("DELETE 200 with message", r.status === 200 && r.json?.message === "Record deleted.", r.text);

  r = await call("GET", `/api/records/${id}`);
  check("GET deleted id now 404", r.status === 404 && !!r.json?.message, r.status);

  r = await call("POST", "/api/records", { ...good, title: undefined });
  check("POST missing title 400", r.status === 400 && !!r.json?.message, r.text);
  r = await call("POST", "/api/records", { ...good, title: "   " });
  check("POST spaces-only title 400", r.status === 400, r.status);
  r = await call("POST", "/api/records", { ...good, status: "Done" });
  check("POST invalid status 400", r.status === 400 && !!r.json?.message, r.text);
  r = await call("POST", "/api/records", { ...good, title: 123 });
  check("POST non-text title 400", r.status === 400, r.status);

  r = await call("GET", "/api/records");
  check("No rows were added by invalid requests", Array.isArray(r.json) && r.json.length === startCount, `now ${r.json?.length}, expected ${startCount}`);

  r = await call("GET", "/api/records/abc");
  check("GET invalid id 400", r.status === 400 && !!r.json?.message, r.status);
  r = await call("GET", "/api/records/0");
  check("GET id 0 is 400", r.status === 400, r.status);
  r = await call("POST", "/api/records", undefined, "{ this is not json");
  check("Malformed JSON 400 with message", r.status === 400 && !!r.json?.message, r.status + " " + r.text);

  r = await call("GET", "/api/records/99999999");
  check("GET missing id 404", r.status === 404, r.status);
  r = await call("PUT", "/api/records/99999999", good);
  check("PUT missing id 404 (does not create)", r.status === 404, r.status);
  r = await call("DELETE", "/api/records/99999999");
  check("DELETE missing id 404", r.status === 404, r.status);

  r = await call("GET", "/no-such-route");
  check("Unknown route 404 JSON", r.status === 404 && !!r.json?.message, r.status);

  console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) failed.`);
  console.log("Still to test by hand: create a record, restart the server, and confirm it is still there.");
  process.exit(failed === 0 ? 0 : 1);
})().catch((error) => { console.error("Could not reach the API:", error.message); process.exit(1); });
