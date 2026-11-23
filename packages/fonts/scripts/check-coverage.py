#!/usr/bin/env python3
"""Glyph-coverage check: every corpus character must exist in the latin +
latin-ext subsets of every face (Thea risk 5: variety names carry accents,
the italic carries Latin binomials).

Reads dist/corpus.txt (built by scripts/build-manifest.mjs from repo
content plus the curated supplement) and the built woff2 files. Exits 1
listing missing characters per face.

Requires: pip install -r scripts/requirements-fonts.txt
"""
from __future__ import annotations

import sys
from pathlib import Path

try:
    from fontTools.ttLib import TTFont
except ImportError:
    sys.exit("ERROR: fontTools not found. Install: pip install -r scripts/requirements-fonts.txt")

ROOT = Path(__file__).resolve().parent.parent
FILES = ROOT / "dist" / "files"
CORPUS = ROOT / "dist" / "corpus.txt"

FACES = [
    "fraunces-roman",
    "fraunces-italic",
    "newsreader-roman",
    "newsreader-italic",
    "source-sans-roman",
]


def cmap_for(stem: str, subset: str) -> set[int]:
    path = FILES / f"{stem}-{subset}.woff2"
    if not path.is_file():
        sys.exit(f"ERROR: built subset not found (run npm run build first): {path}")
    return set(TTFont(path).getBestCmap().keys())


def main() -> None:
    if not CORPUS.is_file():
        sys.exit("ERROR: corpus not found (run npm run manifest first)")
    corpus = {ord(char) for char in CORPUS.read_text(encoding="utf-8") if not char.isspace()}
    failures: list[str] = []
    for face in FACES:
        covered = cmap_for(face, "latin") | cmap_for(face, "latin-ext")
        missing = sorted(code for code in corpus if code not in covered)
        for code in missing:
            failures.append(f"{face}: missing U+{code:04X} ({chr(code)!r})")
    if failures:
        print("GLYPH COVERAGE FAILURES:")
        for failure in failures:
            print(f"  {failure}")
        sys.exit(1)
    print(f"glyph coverage OK: {len(corpus)} corpus characters in all {len(FACES)} faces")


if __name__ == "__main__":
    main()
