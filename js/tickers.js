/**
 * Animated numbers — hero trade tickers + fee counter.
 * All animate transform-free (text only) with an ease-out curve;
 * reduced-motion callers get the final value immediately.
 */
const easeOut = (t) => 1 - (1 - t) ** 3;

function animate(el, from, to, dur, fmt, reduced) {
  if (!el) return;
  if (reduced) { el.textContent = fmt(to); return; }
  let t0 = null;
  const frame = (ts) => {
    if (t0 === null) t0 = ts;
    const p = Math.min((ts - t0) / dur, 1);
    el.textContent = fmt(from + (to - from) * easeOut(p));
    if (p < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

const bump = (el, reduced) => {
  if (!el || reduced) return;
  el.classList.remove("tick-up");
  void el.offsetWidth; // restart CSS animation
  el.classList.add("tick-up");
};

/** Hero: amounts settle in, then the rate flutters like a live market. */
export function initTickers(cfg, reduced) {
  const usdt = document.getElementById("tkUsdt");
  const momo = document.getElementById("tkMomo");
  const rate = document.getElementById("tkRate");
  const t = cfg.ticker;

  if (usdt && momo) {
    setTimeout(() => {
      animate(usdt, 0, t.usdt, 1100, (v) => v.toFixed(2), reduced);
      animate(momo, 0, Math.round(t.usdt * t.rate), 1200,
        (v) => "₵" + Math.round(v).toLocaleString("en-GH"), reduced);
    }, t.settleDelayMs);
  }

  if (rate && !reduced) {
    setInterval(() => {
      rate.textContent = (t.rate + (Math.random() - 0.5) * 2 * t.rateJitter).toFixed(2);
      bump(rate.parentElement, reduced);
    }, t.flutterIntervalMs);
  }
}

/** Fee counter — runs once, on first view of the fee card. */
export function makeFeeCounter(cfg, reduced) {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    animate(document.getElementById("feeNum"), 0, cfg.fee.target, cfg.fee.durationMs,
      (v) => v.toFixed(1), reduced);
  };
}
