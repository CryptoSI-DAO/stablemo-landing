/* StableMo landing — nav, motion engine, tickers, waitlist */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- mobile nav ---- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("navMenu");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- motion engine: reveals + stagger groups + timeline draw ---- */
  var motionTargets = document.querySelectorAll(".reveal, .stagger, .timeline");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
            if (en.target.querySelector && en.target.querySelector("#feeNum")) {
              countFee();
            }
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    motionTargets.forEach(function (el) { io.observe(el); });
  } else {
    motionTargets.forEach(function (el) { el.classList.add("in"); });
    if (!reduced) countFee();
  }

  /* ---- header elevation on scroll ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- year ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---- payment-window countdown (illustrative) ---- */
  var count = document.querySelector(".count");
  if (count) {
    var secs = 58 * 60 + 12;
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    var tick = function () {
      if (secs <= 0) secs = 60 * 60;
      count.textContent = pad(Math.floor(secs / 60)) + ":" + pad(secs % 60);
      secs--;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---- hero trade tickers: rate flutters, amounts settle in ---- */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateNumber(el, from, to, dur, fmt) {
    if (!el) return;
    if (reduced) { el.textContent = fmt(to); return; }
    var t0 = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      el.textContent = fmt(from + (to - from) * easeOut(p));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var tkUsdt = document.getElementById("tkUsdt");
  var tkMomo = document.getElementById("tkMomo");
  var tkRate = document.getElementById("tkRate");
  var bump = function (el) {
    if (!el || reduced) return;
    el.classList.remove("tick-up");
    void el.offsetWidth; /* restart animation */
    el.classList.add("tick-up");
  };

  if (tkUsdt && tkMomo) {
    setTimeout(function () {
      animateNumber(tkUsdt, 0, 100, 1100, function (v) { return v.toFixed(2); });
      animateNumber(tkMomo, 0, 1620, 1200, function (v) { return "₵" + Math.round(v).toLocaleString("en-GH"); });
    }, 650);
  }
  if (tkRate && !reduced) {
    /* live-rate shimmer: tiny drift around 16.20 */
    var base = 16.20;
    setInterval(function () {
      var next = base + (Math.random() - 0.5) * 0.06;
      tkRate.textContent = next.toFixed(2);
      bump(tkRate.parentElement);
    }, 3800);
  }

  /* ---- fee counter ---- */
  var feeDone = false;
  function countFee() {
    var el = document.getElementById("feeNum");
    if (!el || feeDone) return;
    feeDone = true;
    animateNumber(el, 0, 0.5, 900, function (v) { return v.toFixed(1); });
  }

  /* ---- waitlist ---- */
  var form = document.getElementById("waitlistForm");
  var input = document.getElementById("wl-email");
  var btn = document.getElementById("wl-btn");
  var status = document.getElementById("wl-status");
  var ENDPOINT = "/api/subscribe";

  function say(msg, ok) {
    status.textContent = msg;
    status.className = "form-status " + (ok ? "ok" : "err");
    if (ok && !reduced) {
      status.classList.add("pop");
    }
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
