/**
 * Header + mobile nav — hamburger toggle, link-tap close, scroll elevation.
 */
export function initHeader() {
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
}

export function initNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("navMenu");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle("open", open);
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") setOpen(false);
  });
}
