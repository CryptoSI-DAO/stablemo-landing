/**
 * StableMo — configuration
 * Single source of truth for endpoints and behavior constants.
 */
export const CONFIG = {
  /** Same-origin proxy → CryptoSI mail relay → Listmonk list 9 */
  subscribeEndpoint: "/api/subscribe",
  /** Payment-window countdown start (seconds) — purely illustrative */
  countdownStart: 58 * 60 + 12,
  /** Hero rate-ticker behavior (illustrative market shimmer) */
  ticker: {
    usdt: 100,
    rate: 16.2,
    rateJitter: 0.03, // ± half-range in GHS
    settleDelayMs: 650,
    flutterIntervalMs: 3800,
  },
  /** Fee-counter animation */
  fee: { target: 0.5, durationMs: 900 },
};

/** Live matches (prefers-reduced-motion) */
export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
