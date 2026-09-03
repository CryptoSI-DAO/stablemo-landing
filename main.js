/**
 * StableMo landing — entry point.
 * Modules: config, header/nav, motion, tickers, waitlist.
 */
import { CONFIG, prefersReducedMotion } from "./js/config.js";
import { initHeader, initNav } from "./js/nav.js";
import { initMotion } from "./js/motion.js";
import { initTickers, makeFeeCounter } from "./js/tickers.js";
import { initWaitlist } from "./js/waitlist.js";

const reduced = prefersReducedMotion();

initHeader();
initNav();

const countFee = makeFeeCounter(CONFIG, reduced);
initMotion(countFee); // falls back to immediate-run when IO unavailable

initTickers(CONFIG, reduced);
initWaitlist(CONFIG.subscribeEndpoint, reduced);

// Payment-window countdown (illustrative)
const count = document.querySelector(".count");
if (count) {
  let secs = CONFIG.countdownStart;
  const pad = (n) => (n < 10 ? "0" + n : "" + n);
  const tick = () => {
    if (secs <= 0) secs = 3600;
    count.textContent = pad(Math.floor(secs / 60)) + ":" + pad(secs % 60);
    secs--;
  };
  tick();
  setInterval(tick, 1000);
}

// Footer year
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();
