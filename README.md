# StableMo — Landing Page

Consumer-facing landing page for **StableMo**, a peer-to-peer marketplace that
connects USDT liquidity with Ghana Mobile Money.

> Trade stablecoins with Mobile Money. On-chain escrow. Direct peer-to-peer
> payment. One flat 0.5% fee, shown upfront.

Built for **CryptoSI DAO** from the StableMo Brand Guide v1.0 and the
MoMo–USDT P2P Marketplace SRS v1.0. Hosted on Vercel (`stablemo` project).

## Architecture

No framework, no build step — plain HTML + CSS + ES modules. The whole site
is ~26KB of source + images.

```
index.html              single page: hero → photo band → strip → steps →
                        trust cards → timeline → fees → real people → FAQ →
                        waitlist → footer
styles.css              design tokens in :root (brand palette, neutrals,
                        motion easings) — single source of truth for color
main.js                 entry point (countdown, year, module wiring)
js/
  config.js             endpoints + behavior constants (ticker, fees, timers)
  nav.js                header elevation + hamburger menu
  motion.js             IntersectionObserver reveal/stagger/timeline engine
  tickers.js            hero number animations + fee counter
  waitlist.js           form → /api/subscribe
api/subscribe/index.js  Vercel function — same-origin proxy to mail relay
assets/                 logo set, photography (gpt-image), OG image
tools/                  deploy.py, asset generators, (add mobile-audit.py)
robots.txt / sitemap.xml
```

### Design tokens

Defined once in `styles.css :root`, referenced everywhere via `var(--…)`:

| Token | Value | Brand meaning |
|---|---|---|
| `--c-blue` | `#146BFF` | Stable Blue — digital / trust |
| `--c-link` | `#0B93F6` | Link Blue — energy / motion |
| `--c-gold` | `#FFB20A` | MoMo Gold — access / value |
| `--c-sun` | `#FFC928` | Sun Gold — highlight / warmth |
| `--c-navy` | `#071B3A` | Deep Navy — security / text |
| `--c-cloud` | `#F4F7FB` | Cloud — UI surface |
| `--gold-ink` | `#C9880A` | AA-safe gold for text on white |
| `--ease-out/spring/inout` | … | shared motion curves |

**Rule:** never hardcode a hex in a rule — add or extend a token. Keep the
undefined/unused check green:

```bash
python3 -c "
import re; css=open('styles.css').read()
u=set(re.findall(r'var\((--[\w-]+)\)',css)); d=set(re.findall(r'(--[\w-]+):',css))
print('undefined:',u-d); print('unused:',d-u)"
```

### Motion

CSS owns all transitions/animations; JS only adds `.in` classes. Everything
respects `prefers-reduced-motion` (CSS disables, JS skips animating and jumps
to final values). Fee counter and tickers are text-only (no layout thrash).

## Waitlist flow

Browser POSTs same-origin to `/api/subscribe` (Vercel function) →
`https://db.cryptosidao.org/mail-api/api/lists/9/subscribers` → Listmonk
list **9 — CryptoSI DAO** (single opt-in). Same-origin matters: cross-site
POSTs from `vercel.app` get eaten by browser shields.

## Working on it

```bash
cd repo && python3 -m http.server 8877   # local preview
node --check main.js js/*.js             # syntax gate
python3 tools/deploy.py                  # Vercel deploy + verify (token from ~/.vercel/auth.json)
git push                                 # commits authored cryptosixxx@gmail.com or deploys block
```

QA harnesses live in `/tmp` on the server (mobile-audit.py, anim-verify.py) —
copy into `tools/` if you want them versioned.

## Conventions

- Commits authored `cryptosixxx@gmail.com` (Vercel team gate)
- Assets: optimize before commit (JPEG q80 ~progressive; PNG only when
  transparency needed)
- One page, section-per-comment-block; keep section order in CSS matching HTML
- No JS libraries; no tracking; no crypto clichés in imagery (brand guide)

## License

© CryptoSI DAO. All rights reserved.
