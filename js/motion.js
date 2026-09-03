/**
 * Motion engine — entrance + scroll reveals, stagger groups, timeline draw.
 * CSS owns the transitions; this module only flips `.in` classes once.
 */
export function initMotion(countFee) {
  const targets = document.querySelectorAll(".reveal, .stagger, .timeline");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          en.target.classList.add("in");
          io.unobserve(en.target);
          // fee counter rides along on the fee card's reveal
          if (en.target.querySelector?.("#feeNum")) countFee();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add("in"));
    countFee(); // no observer → run immediately (incl. reduced-motion)
  }
}
