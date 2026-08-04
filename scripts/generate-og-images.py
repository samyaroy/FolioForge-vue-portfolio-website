#!/usr/bin/env python3
"""Generate the 1200x630 social cards used as og:image / twitter:image.

Run after changing the name, tagline, or profile photo:

    python3 scripts/generate-og-images.py

Writes public/og-image.jpg (portfolio) and blogs/public/og-image.jpg (blog).
Both are committed, so this only needs to run when the inputs change.

1200x630 is the size LinkedIn, X, Slack, and WhatsApp all render without
re-cropping; anything smaller than 600x315 gets downgraded to a thumbnail card.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent

WIDTH, HEIGHT = 1200, 630
INK = (14, 20, 27)
ACCENT = (25, 128, 230)
WHITE = (255, 255, 255)
MUTED = (148, 163, 184)
LABEL = (78, 115, 151)

FONTS = Path("/System/Library/Fonts/Supplemental")


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), size)


def tracked(draw, xy, text, fnt, fill, tracking):
    """PIL has no letter-spacing, so wide-tracked labels are drawn per glyph."""
    x, y = xy
    for char in text:
        draw.text((x, y), char, font=fnt, fill=fill)
        x += draw.textlength(char, font=fnt) + tracking


def circular(image: Image.Image, size: int) -> Image.Image:
    side = min(image.size)
    left = (image.width - side) // 2
    top = (image.height - side) // 2
    square = image.crop((left, top, left + side, top + side)).resize(
        (size, size), Image.LANCZOS
    )

    # 4x supersampled mask so the circle edge is not visibly stepped.
    mask = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size * 4, size * 4), fill=255)
    square.putalpha(mask.resize((size, size), Image.LANCZOS))
    return square


def card(label: str, heading: str, lines: list[str], photo: Path | None) -> Image.Image:
    canvas = Image.new("RGB", (WIDTH, HEIGHT), INK)
    draw = ImageDraw.Draw(canvas)

    # Accent rule down the left edge, echoing the site's link colour.
    draw.rectangle((0, 0, 12, HEIGHT), fill=ACCENT)

    text_right = 760 if photo else WIDTH - 90
    x = 90

    tracked(draw, (x, 96), label.upper(), font("Arial Bold.ttf", 22), LABEL, 4)

    heading_font = font("Arial Bold.ttf", 82)
    draw.text((x, 168), heading, font=heading_font, fill=WHITE)

    draw.rectangle((x, 292, x + 88, 298), fill=ACCENT)

    body_font = font("Arial.ttf", 30)
    y = 342
    for line in lines:
        # Wrap by hand: the card is fixed-width, so greedy wrapping is enough.
        words, current = line.split(), ""
        for word in words:
            candidate = f"{current} {word}".strip()
            if draw.textlength(candidate, font=body_font) > text_right - x and current:
                draw.text((x, y), current, font=body_font, fill=MUTED)
                y += 44
                current = word
            else:
                current = candidate
        if current:
            draw.text((x, y), current, font=body_font, fill=MUTED)
            y += 44

    if photo:
        avatar = circular(Image.open(photo).convert("RGB"), 360)
        ring = Image.new("RGBA", (376, 376), (0, 0, 0, 0))
        ImageDraw.Draw(ring).ellipse((0, 0, 375, 375), fill=ACCENT + (255,))
        canvas.paste(ring, (812, 119), ring)
        canvas.paste(avatar, (820, 127), avatar)

    return canvas


def save(image: Image.Image, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"{target.relative_to(ROOT)}  {target.stat().st_size // 1024} KB")


def main() -> None:
    save(
        card(
            "samyabrata.codeium.xyz",
            "Samyabrata Roy",
            [
                "Statistics, data science, and software.",
                "IDEAS-TIH, ISI Kolkata  ·  IIT Madras",
            ],
            ROOT / "public" / "SamyabrataRoy2.jpg",
        ),
        ROOT / "public" / "og-image.jpg",
    )

    save(
        card(
            "blogs.samyabrata.codeium.xyz",
            "Writing",
            [
                "Notes on what I'm building, learning,",
                "and thinking about.",
            ],
            ROOT / "public" / "SamyabrataRoy2.jpg",
        ),
        ROOT / "blogs" / "public" / "og-image.jpg",
    )


if __name__ == "__main__":
    main()
