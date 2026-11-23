#!/usr/bin/env bash
# Subset the variable sources into latin + latin-ext woff2 files.
# Type foundation §3 rules: keep opsz+wght on Fraunces and wght on
# Newsreader/Source Sans; SOFT/WONK dropped unless Elena names WONK;
# kern+liga kept; figure features kept (tabular for updating numbers,
# oldstyle for Newsreader prose, lining for Fraunces display).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCES="$ROOT/sources"
OUT="$ROOT/dist/files"
WORK="$ROOT/dist/.work"

if ! command -v pyftsubset >/dev/null 2>&1; then
  echo "ERROR: pyftsubset not found. Install: pip install -r $ROOT/scripts/requirements-fonts.txt" >&2
  exit 1
fi

mkdir -p "$OUT" "$WORK"

LATIN="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
LATIN_EXT="U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1E9F,U+1EA0-1EF9,U+1FA0-1FA6,U+1FA9-1FB9,U+1FBB-1FBC,U+1FC2-1FC5,U+1FC6-1FCB,U+1FD0-1FD3,U+1FD6-1FDB,U+1FE0-1FEC,U+1FF2-1FF4,U+1FF6-1FFC"

FEATURES="kern,liga,tnum,pnum,lnum,onum"

subset_face() {
  local src="$1"
  local stem="$2"
  echo "subset: $stem"
  pyftsubset "$src" \
    --output-file="$OUT/$stem-latin.woff2" \
    --flavor=woff2 \
    --unicodes="$LATIN" \
    --layout-features="$FEATURES" \
    --no-hinting \
    --recalc-bounds \
    --recalc-timestamp \
    --canonical-order
  pyftsubset "$src" \
    --output-file="$OUT/$stem-latin-ext.woff2" \
    --flavor=woff2 \
    --unicodes="$LATIN_EXT" \
    --layout-features="$FEATURES" \
    --no-hinting \
    --recalc-bounds \
    --recalc-timestamp \
    --canonical-order
}

# Fraunces: pin SOFT/WONK to their defaults (drops the axes) before subsetting.
for style in roman italic; do
  src_file="Fraunces-$style.ttf"
  echo "instancing: Fraunces $style (drop SOFT/WONK)"
  fonttools varLib.instancer "$SOURCES/$src_file" SOFT=0 WONK=0 \
    --update-font-names \
    -o "$WORK/$src_file"
  subset_face "$WORK/$src_file" "fraunces-$style"
done

subset_face "$SOURCES/Newsreader-roman.ttf" "newsreader-roman"
subset_face "$SOURCES/Newsreader-italic.ttf" "newsreader-italic"
subset_face "$SOURCES/SourceSans3-roman.ttf" "source-sans-roman"

rm -rf "$WORK"
echo "subsets ready in $OUT"
ls -la "$OUT"
