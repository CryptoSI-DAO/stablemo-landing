/* StableMo landing — nav, reveal, countdown, waitlist */
(function () {
  "use strict";

  /* ---- mobile nav ---- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("navMenu");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- year ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---- payment-window countdown (purely illustrative) ---- */
  var count = document.querySelector(".count");
  if (count) {
    var secs = 58 * 60 + 12;
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    var tick = function () {
      if (secs <= 0) secs = 60 * 60;
      var m = Math.floor(secs / 60), s = secs % 60;
      count.textContent = pad(m) + ":" + pad(s);
      secs--;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---- waitlist ---- */
  var form = document.getElementById("waitlistForm");
  var input = document.getElementById("wl-email");
  var btn = document.getElementById("wl-btn");
  var status = document.getElementById("wl-status");
  var ENDPOINT =
    "https://db.cryptosidao.org/mail-api/api/lists/9/subscribers";

  function say(msg, ok) {
    status.textContent = msg;
    status.className = "form-status " + (ok ? "ok" : "err");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (input.value || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        say("Please enter a valid email address.", false);
        input.focus();
        return;
      }
      btn.disabled = true;
      btn.textContent = "Joining…";
      say("", true);
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, name: "" })
      })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(function () {
          form.reset();
          say("You're on the list — see you at launch. ✓", true);
        })
        .catch(function () {
          say("Couldn't reach the waitlist. Please try again in a moment.", false);
        })
        .then(function () {
          btn.disabled = false;
          btn.textContent = "Join the waitlist";
        });
    });
  }
})();
