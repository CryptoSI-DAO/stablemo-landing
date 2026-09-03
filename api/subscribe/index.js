// StableMo waitlist — same-origin proxy to the CryptoSI mail relay.
// Browser only ever calls /api/subscribe on this origin; the relay call
// happens server-side (no CORS, no cross-site POST for shields to eat).
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
  if (req.method !== "POST") { res.statusCode = 405; return res.end(JSON.stringify({ error: "POST only" })); }

  const email = String((req.body && req.body.email) || "").trim();
  const name = String((req.body && req.body.name) || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Valid email required" }));
  }

  try {
    const r = await fetch("https://db.cryptosidao.org/mail-api/api/lists/9/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
    const text = await r.text();
    let data = {};
    try { data = JSON.parse(text); } catch (e) { /* relay always sends JSON; guard anyway */ }
    if (!r.ok) {
      res.statusCode = 502;
      return res.end(JSON.stringify({ error: "relay error", detail: String(text).slice(0, 200) }));
    }
    res.statusCode = 200;
    return res.end(JSON.stringify({ success: true, subscriber_id: data.subscriber_id }));
  } catch (err) {
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: "relay unreachable" }));
  }
}
