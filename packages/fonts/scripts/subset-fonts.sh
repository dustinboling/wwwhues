#!/usr/bin/env bash
# Subset the variable sources into latin + latin-ext woff2 files.
# Type foundation §3 rules: keep opsz+wght on Fraunces (SOFT/WONK pinned
# to defaults unless Elena names WONK) and wght only on Newsreader /
# Source Sans; kern+liga kept; figure features kept (tabular for updating
# numbers, oldstyle for Newsreader prose, lining for Fraunces display).
#
# pyftsubset alone neither drops nor pins axes, so every instancing step
# below runs through fonttools varLib.instancer BEFORE subsetting, and the
# shipped axes are exactly the §2.1 ranges: Fraunces wght 400-700 (opsz
# untouched, 9-144, for font-optical-sizing: auto), Newsreader opsz
# pinned at its 18 default with wght 400-600. Source Sans 3 ships its
# full wght axis uninstanced: restricting it to 400-700 re-expresses
# every delta off a moved default and measures LARGER (26,080 vs 25,100
# bytes latin, fix round 5), so the restriction buys nothing.
#
# Unicode ranges come from scripts/subset-ranges.json (single source of
# truth; build-manifest.mjs scopes the corpus to them and asserts
# fonts.css carries them verbatim).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCES="$ROOT/sources"
OUT="$ROOT/dist/files"
WORK="$ROOT/dist/.work"
RANGES="$ROOT/scripts/subset-ranges.json"

if ! command -v pyftsubset >/dev/null 2>&1; then
  echo "ERROR: pyftsubset not found. Install: pip install -r $ROOT/scripts/requirements-fonts.txt" >&2
  exit 1
fi

mkdir -p "$OUT" "$WORK"

LATIN="$(python3 -c "import json; print(','.join(json.load(open('$RANGES'))['latin']))")"
LATIN_EXT="$(python3 -c "import json; print(','.join(json.load(open('$RANGES'))['latinExt']))")"

FEATURES="kern,liga,tnum,pnum,lnum,onum"

subset_face() {
  local src="$1"
  local stem="$2"
  echo "subset: $stem"
  # NOTE: no --recalc-timestamp: stamping wall-clock time into head.modified
  # makes every build byte-different. Without it the same pinned sources
  # produce byte-identical files, so budget figures are reproducible.
  pyftsubset "$src" \
    --output-file="$OUT/$stem-latin.woff2" \
    --flavor=woff2 \
    --unicodes="$LATIN" \
    --layout-features="$FEATURES" \
    --no-hinting \
    --recalc-bounds \
    --canonical-order
  pyftsubset "$src" \
    --output-file="$OUT/$stem-latin-ext.woff2" \
    --flavor=woff2 \
    --unicodes="$LATIN_EXT" \
    --layout-features="$FEATURES" \
    --no-hinting \
    --recalc-bounds \
    --canonical-order
}

# The instancer stamps wall-clock time into head.modified, which would make
# every build byte-different; pin it back to the source value so builds are
# reproducible from the pinned sources.
pin_timestamp() {
  # recalcTimestamp=False: TTFont.save would otherwise stamp wall-clock
  # time right back into head.modified.
  python3 - "$SOURCES/$1" "$WORK/$1" <<'EOF'
import sys
from fontTools.ttLib import TTFont
src = TTFont(sys.argv[1])
dst = TTFont(sys.argv[2], recalcTimestamp=False)
dst["head"].modified = src["head"].modified
dst.save(sys.argv[2])
EOF
}

# Fraunces: pin SOFT/WONK to their defaults (drops the axes) and restrict
# wght to the shipped 400-700 range before subsetting.
for style in roman italic; do
  src_file="Fraunces-$style.ttf"
  echo "instancing: Fraunces $style (drop SOFT/WONK, wght 400-700)"
  fonttools varLib.instancer "$SOURCES/$src_file" SOFT=0 WONK=0 wght=400:700 \
    --update-name-table \
    -o "$WORK/$src_file"
  pin_timestamp "$src_file"
  subset_face "$WORK/$src_file" "fraunces-$style"
done

# Newsreader: pin opsz at its 18 default (drops the axis; §3.2 keeps wght
# only on Newsreader) and restrict wght to the shipped 400-600 range.
# No --update-name-table: this source's STAT carries no opsz axis value
# for the pinned default and the instancer refuses to rewrite names.
for style in roman italic; do
  src_file="Newsreader-$style.ttf"
  echo "instancing: Newsreader $style (pin opsz=18, wght 400-600)"
  fonttools varLib.instancer "$SOURCES/$src_file" opsz=18 wght=400:600 \
    -o "$WORK/$src_file"
  pin_timestamp "$src_file"
  subset_face "$WORK/$src_file" "newsreader-$style"
done

# Source Sans 3 ships a single wght axis already; see the header note on
# why it is not restricted.
subset_face "$SOURCES/SourceSans3-roman.ttf" "source-sans-roman"

rm -rf "$WORK"
echo "subsets ready in $OUT"
ls -la "$OUT"
