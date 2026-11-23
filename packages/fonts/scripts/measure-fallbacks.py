#!/usr/bin/env python3
"""Measure metric-matched fallback overrides for the built latin faces.

Reads each built latin subset plus operator-supplied fallback files and
prints the override block for fonts.css, matching the next/font
adjustFontFallback technique by hand (type foundation section 3 rule 4:
Georgia/serif for the serifs, system sans for Source Sans 3).

Method (advance matching): size-adjust scales the fallback so the same
string measures the same width; the vertical overrides then match the
web face's ascent, descent, and line gap in em-box percentages. The
committed values are verified by the CLS-0 font-swap check on the home,
season, variety, and board templates (type section 3.4): if the swap
shifts, the overrides move, not the test.

Usage:
  python3 scripts/measure-fallbacks.py \
    --fallback-serif /path/to/Georgia.ttf \
    --fallback-sans /path/to/Arial.ttf [--write]

Requires: pip install -r scripts/requirements-fonts.txt
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from fontTools.ttLib import TTFont
except ImportError:
    sys.exit("ERROR: fontTools not found. Install: pip install -r scripts/requirements-fonts.txt")

ROOT = Path(__file__).resolve().parent.parent
FILES = ROOT / "dist" / "files"
FONTS_CSS = ROOT / "fonts.css"

SAMPLE = "abcdefghijklmnopqrstuvwxyz0123456789"
FACES = {
    "Fraunces": ("fraunces-roman-latin.woff2", "serif"),
    "Newsreader": ("newsreader-roman-latin.woff2", "serif"),
    "Source Sans 3": ("source-sans-roman-latin.woff2", "sans"),
}


def normalized_metrics(path: Path) -> dict[str, float]:
    font = TTFont(path)
    upm = float(font["head"].unitsPerEm)
    hhea = font["hhea"]
    hmtx = font["hmtx"]
    cmap = font.getBestCmap()
    advances: list[float] = []
    for char in SAMPLE:
        glyph = cmap.get(ord(char))
        if glyph is not None and glyph in hmtx.metrics:
            advances.append(float(hmtx.metrics[glyph][0]))
    if not advances:
        sys.exit(f"ERROR: no sample advances measurable in {path}")
    return {
        "upm": upm,
        "ascent": float(hhea.ascent) / upm,
        "descent": abs(float(hhea.descent)) / upm,
        "line_gap": float(hhea.lineGap) / upm,
        "avg_advance": (sum(advances) / len(advances)) / upm,
    }


def overrides(web: dict[str, float], fallback: dict[str, float]) -> dict[str, str]:
    size_adjust = fallback["avg_advance"] / web["avg_advance"]

    def pct(value: float) -> str:
        return f"{value * 100:.2f}%"

    return {
        "size-adjust": pct(size_adjust),
        "ascent-override": pct(web["ascent"] / size_adjust),
        "descent-override": pct(web["descent"] / size_adjust),
        "line-gap-override": pct(web["line_gap"] / size_adjust),
    }


def block(face: str, local_name: str, values: dict[str, str]) -> str:
    return (
        f'@font-face {{\n  font-family: "{face} Fallback";\n'
        f'  src: local("{local_name}");\n'
        + "".join(f"  {prop}: {val};\n" for prop, val in values.items())
        + "}\n"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Measure fallback overrides.")
    parser.add_argument("--fallback-serif", required=True, help="Path to Georgia (or equivalent serif) file")
    parser.add_argument("--fallback-sans", required=True, help="Path to Arial (or equivalent sans) file")
    parser.add_argument("--write", action="store_true", help="Write the measured block into fonts.css")
    args = parser.parse_args()

    fallbacks = {
        "serif": (Path(args.fallback_serif), "Georgia"),
        "sans": (Path(args.fallback_sans), "Arial"),
    }
    for path, _name in fallbacks.values():
        if not path.is_file():
            sys.exit(f"ERROR: fallback file not found: {path}")

    measured: dict[str, dict[str, str]] = {}
    rendered: list[str] = []
    for face, (stem, kind) in FACES.items():
        web_path = FILES / stem
        if not web_path.is_file():
            sys.exit(f"ERROR: built face not found (run npm run build first): {web_path}")
        fallback_path, local_name = fallbacks[kind]
        web = normalized_metrics(web_path)
        fallback = normalized_metrics(fallback_path)
        values = overrides(web, fallback)
        measured[face] = values
        rendered.append(block(face, local_name, values))
        print(f"# {face}: " + ", ".join(f"{k}={v}" for k, v in values.items()))

    output = "\n".join(rendered)
    if args.write:
        text = FONTS_CSS.read_text()
        start = text.index("/* fallback-overrides:start */")
        end = text.index("/* fallback-overrides:end */")
        head = text[: start + len("/* fallback-overrides:start */")]
        tail = text[end:]
        FONTS_CSS.write_text(head + "\n" + output + tail)
        print(f"wrote measured overrides to {FONTS_CSS}")
    else:
        print("\n" + output)
        print("# pass --write to update fonts.css, then run the CLS-0 check")


if __name__ == "__main__":
    main()
