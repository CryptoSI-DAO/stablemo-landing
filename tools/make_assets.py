#!/usr/bin/env python3
"""Cut the StableMo logo (white 512x512 PNG) into transparent assets + OG image."""
import numpy as np
from PIL import Image, ImageDraw

SRC = "/root/.hermes/cache/images/img_311636c68d10.png"
OUT = "/tmp/stablemo-build/assets"

import os
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert("RGB")
a = np.array(im).astype(int)

# 1) alpha = 0 where pixel is near-white
r, g, b = a[..., 0], a[..., 1], a[..., 2]
near_white = (r > 242) & (g > 242) & (b > 242)
alpha = np.where(near_white, 0, 255).astype(np.uint8)

rgba = np.dstack([a.astype(np.uint8), alpha])
cut = Image.fromarray(rgba, "RGBA")

# 2) bbox of non-white content
ys, xs = np.where(~near_white)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
print(f"content bbox: x {x0}-{x1} ({x1-x0+1}px), y {y0}-{y1} ({y1-y0+1}px)")

pad = 6
box = (max(0, x0 - pad), max(0, y0 - pad), min(512, x1 + pad + 1), min(512, y1 + pad + 1))
cropped = cut.crop(box)
cw, ch = cropped.size
print(f"cropped: {cw}x{ch}")

# full lockup: trim internal gaps? keep as-is (icon+wordmark with natural spacing)
cropped.save(f"{OUT}/logo-lockup.png")

# 3) icon only: split at the biggest vertical whitespace gap in the middle third
mid0, mid1 = int(cw * 0.28), int(cw * 0.55)
col_has_ink = (alpha[y0:y1 + 1, x0:x1 + 1] > 0).any(axis=0)
gap_start = None
best = {}
run = 0
for i in range(mid0, mid1):
    if not col_has_ink[i]:
        run += 1
        if run > 3:
            best[run] = i  # end of run
    else:
        run = 0
split = best[max(best)] - max(best) + 1 if best else int(cw * 0.42)
print(f"icon split at x={split} (gap run {max(best) if best else 0}px)")

icon = cropped.crop((0, 0, split, ch))
iw, ih = icon.size
# square-ish icon canvas
side = max(iw, ih)
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
sq.paste(icon, ((side - iw) // 2, (side - ih) // 2), icon)
sq.resize((512, 512), Image.LANCZOS).save(f"{OUT}/logo-icon-512.png")
sq.resize((192, 192), Image.LANCZOS).save(f"{OUT}/logo-icon-192.png")
sq.resize((48, 48), Image.LANCZOS).save(f"{OUT}/logo-icon-48.png")

# 4) hero lockup @2.5x for retina
H = 2
hero = cropped.resize((cw * H, ch * H), Image.LANCZOS)
hero.save(f"{OUT}/logo-hero.png")
print("assets written:", sorted(os.listdir(OUT)))

# 5) OG image 1200x630 — navy bg, lockup + tagline (DejaVu as Inter stand-in)
W, Hh = 1200, 630
og = Image.new("RGB", (W, Hh), (7, 27, 58))  # deep navy #071B3A
# subtle gold/blue glow band: two soft ellipses
glow = Image.new("L", (W, Hh), 0)
gd = ImageDraw.Draw(glow)
gd.ellipse([-260, 180, 420, 700], fill=26)   # blue glow left
gd.ellipse([880, -180, 1460, 480], fill=22)  # gold glow right
blue_glow = Image.new("RGB", (W, Hh), (20, 107, 255))
gold_glow = Image.new("RGB", (W, Hh), (255, 178, 10))
og = Image.composite(Image.blend(og, blue_glow, 0.5), og, glow)
og = Image.composite(Image.blend(og, gold_glow, 0.55), og, glow)
d = ImageDraw.Draw(og)

# lockup centered upper
lh = 150
lock = cropped.resize((int(cw * lh / ch), lh), Image.LANCZOS)
og.paste(lock, ((W - lock.size[0]) // 2, 150), lock)

from PIL import ImageFont
def font(sz, bold=False):
    p = f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf"
    return ImageFont.truetype(p, sz)

tag = "Trade stablecoins with Mobile Money."
f1 = font(58, bold=True)
w1 = d.textlength(tag, font=f1)
d.text(((W - w1) / 2, 360), tag, font=f1, fill=(255, 255, 255))

sub = "Escrowed on-chain. Paid peer-to-peer. Ghana first."
f2 = font(36)
w2 = d.textlength(sub, font=f2)
d.text(((W - w2) / 2, 450), sub, font=f2, fill=(174, 192, 219))

og.save(f"{OUT}/og-image.png", quality=92)
print("og-image.png written")

# 6) favicon 32x32
sq.resize((32, 32), Image.LANCZOS).save(f"{OUT}/favicon-32.png")
print("done")
