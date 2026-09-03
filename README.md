# StableMo — Landing Page

Consumer-facing landing page for **StableMo**, a peer-to-peer marketplace that
connects USDT liquidity with Ghana Mobile Money.

> Trade stablecoins with Mobile Money. On-chain escrow. Direct peer-to-peer
> payment. One flat 0.5% fee, shown upfront.

Built for **CryptoSI DAO** from the StableMo Brand Guide v1.0 and the
MoMo–USDT P2P Marketplace SRS v1.0.

## Stack

- Plain HTML + CSS + JS — no framework, no build step
- [Inter](https://rsms.me/inter/) via Google Fonts
- Hosted on Vercel (project: `stablemo`)

## Structure

```
index.html    single-page landing (hero, how-it-works, fees, FAQ, waitlist)
styles.css    brand tokens + responsive layout (mobile-first)
main.js       nav, scroll reveal, countdown, waitlist form
assets/       logo lockup, icons, favicon, OG image
robots.txt    crawl directives
sitemap.xml   sitemap
```

## Waitlist

The waitlist form POSTs to the CryptoSI mail relay:

```
POST https://db.cryptosidao.org/mail-api/api/lists/9/subscribers
{ "email": "...", "name": "" }
```

Subscribers land in Listmonk list **9 — StableMo Waitlist** (single opt-in).

## Brand tokens

| Token       | Value     | Use                    |
|-------------|-----------|------------------------|
| Stable Blue | `#146BFF` | primary actions        |
| Link Blue   | `#0B93F6` | accents, motion        |
| MoMo Gold   | `#FFB20A` | value highlights, CTA  |
| Sun Gold    | `#FFC928` | warmth highlights      |
| Deep Navy   | `#071B3A` | headings, dark sections|
| Cloud       | `#F4F7FB` | light section surfaces |

## License

© CryptoSI DAO. All rights reserved.
