#!/usr/bin/env python3
"""Generate the 1200x630 social cards used as og:image / twitter:image.

Run after changing the name, tagline, or profile photo:

    python3 scripts/generate-og-images.py

Writes public/og-image.jpg (portfolio) and blogs/public/og-image.jpg (blog).
Both are committed, so this only needs to run when the inputs change.

1200x630 is the size LinkedIn, X, Slack, and WhatsApp all render without
re-cropping; anything smaller than 600x315 gets downgraded to a thumbnail card.
"""

import re
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PROFILE_YML = ROOT / "src" / "content" / "profile_info" / "profile.yml"

WIDTH, HEIGHT = 1200, 630
INK = (14, 20, 27)
ACCENT = (25, 128, 230)
WHITE = (255, 255, 255)
MUTED = (148, 163, 184)
LABEL = (78, 115, 151)

FONTS = Path("/System/Library/Fonts/Supplemental")

BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)


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


def hero_image_source() -> str:
    """The hero portrait, read straight out of profile.yml.

    The site takes the same value, so the card and the page cannot drift apart
    and there is no second place to update. Parsed with a regex rather than a
    YAML library to keep this script dependency-free beyond Pillow.
    """
    match = re.search(
        r"^\s*heroImage:\s*(\S+)", PROFILE_YML.read_text(encoding="utf-8"), re.MULTILINE
    )
    if not match:
        raise SystemExit(f"heroImage not found in {PROFILE_YML}")
    return match.group(1)


_remote_photos: dict[str, bytes] = {}


def open_photo(source: str) -> Image.Image:
    """Load the portrait from wherever profile.yml points.

    A full URL is fetched (the portrait is hosted now, so public/ no longer
    carries a copy); anything else is treated as a path under public/. Remote
    bytes are cached because both cards composite the same portrait and this
    would otherwise download it twice.
    """
    if source.startswith(("http://", "https://")):
        if source not in _remote_photos:
            # Cloudflare in front of media.* answers 403 to urllib's default
            # "Python-urllib/x.y" agent, so send an ordinary browser one.
            request = Request(source, headers={"User-Agent": BROWSER_UA})
            with urlopen(request, timeout=30) as response:  # noqa: S310 - our own host
                _remote_photos[source] = response.read()
        return Image.open(BytesIO(_remote_photos[source]))
    return Image.open(ROOT / "public" / source.lstrip("/"))


def card(label: str, heading: str, lines: list[str], photo: str | None) -> Image.Image:
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
        avatar = circular(open_photo(photo).convert("RGB"), 360)
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
    hero = hero_image_source()

    save(
        card(
            "samyabrata.codeium.xyz",
            "Samyabrata Roy",
            [
                "Statistics, data science, and software.",
                "IDEAS-TIH, ISI Kolkata  ·  IIT Madras",
            ],
            hero,
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
            hero,
        ),
        ROOT / "blogs" / "public" / "og-image.jpg",
    )


if __name__ == "__main__":
    main()
