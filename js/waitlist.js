/**
 * Waitlist form — same-origin POST to /api/subscribe,
 * inline validation, animated status feedback.
 */
export function initWaitlist(endpoint, reduced) {
  const form = document.getElementById("waitlistForm");
  const input = document.getElementById("wl-email");
  const btn = document.getElementById("wl-btn");
  const status = document.getElementById("wl-status");
  if (!form || !input || !btn || !status) return;

  const say = (msg, ok) => {
    status.textContent = msg;
    status.className = "form-status " + (ok ? "ok" : "err");
    if (ok && !reduced) status.classList.add("pop");
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      say("Please enter a valid email address.", false);
      input.focus();
      return;
    }
    btn.disabled = true;
    btn.textContent = "Joining…";
    say("", true);

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: "" }),
    })
      .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(() => { form.reset(); say("You're on the list — see you at launch. ✓", true); })
      .catch(() => say("Couldn't reach the waitlist. Please try again in a moment.", false))
      .finally(() => { btn.disabled = false; btn.textContent = "Join the waitlist"; });
  });
}
