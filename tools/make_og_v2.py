#!/usr/bin/env python3
"""OG image v2: guaranteed-contrast dark lockup (icon + white/blue wordmark)."""
from PIL import Image, ImageDraw, ImageFont

A = "/tmp/stablemo-build/assets"
W, H = 1200, 630
og = Image.new("RGB", (W, H), (7, 27, 58))  # #071B3A

# soft glows
glow = Image.new("L", (W, H), 0)
gd = ImageDraw.Draw(glow)
gd.ellipse([-260, 180, 420, 700], fill=26)
gd.ellipse([880, -180, 1460, 480], fill=22)
blue_glow = Image.new("RGB", (W, H), (20, 107, 255))
gold_glow = Image.new("RGB", (W, H), (255, 178, 10))
og = Image.composite(Image.blend(og, blue_glow, 0.5), og, glow)
og = Image.composite(Image.blend(og, gold_glow, 0.55), og, glow)
d = ImageDraw.Draw(og)

def font(sz, bold=False):
    return ImageFont.truetype(
        f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf", sz)

# dark-mode lockup: icon + "Stable"(white) "Mo"(#0B93F6)
icon = Image.open(f"{A}/logo-icon-512.png").resize((120, 120), Image.LANCZOS)
f_word = font(86, bold=True)
t_stable = "Stable"
t_mo = "Mo"
w_stable = d.textlength(t_stable, font=f_word)
w_mo = d.textlength(t_mo, font=f_word)
gap = 22
total = icon.size[0] + 18 + w_stable + w_mo
x = (W - total) / 2
og.paste(icon, (int(x), 130), icon)
x += icon.size[0] + 18
d.text((x, 148), t_stable, font=f_word, fill=(255, 255, 255))
d.text((x + w_stable + gap, 148), t_mo, font=f_word, fill=(11, 147, 246))

tag = "Trade stablecoins with Mobile Money."
f1 = font(56, bold=True)
d.text(((W - d.textlength(tag, font=f1)) / 2, 330), tag, font=f1, fill=(255, 255, 255))

sub = "Escrowed on-chain. Paid peer-to-peer. Ghana first."
f2 = font(34)
d.text(((W - d.textlength(sub, font=f2)) / 2, 424), sub, font=f2, fill=(174, 192, 219))

og.save(f"{A}/og-image.png", quality=92)
print("og-image v2 written")
