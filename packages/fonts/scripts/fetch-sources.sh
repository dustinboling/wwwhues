#!/usr/bin/env bash
# Fetch variable font sources + OFL texts from the official google/fonts
# mirror at pinned paths, verifying against scripts/font-sources.lock.json.
#
# First fetch records hashes into the lock file (verify the fetched files
# out of band before committing the lock); later fetches verify and fail
# loudly on any mismatch or 404. Nothing here guesses a source: an
# unreachable or changed upstream fails the build with the URL.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCES="$ROOT/sources"
LOCK="$ROOT/scripts/font-sources.lock.json"
GF_RAW="https://raw.githubusercontent.com/google/fonts/main"

mkdir -p "$SOURCES" "$ROOT/licenses"

fetch() {
  local rel_path="$1"
  local dest="$2"
  local url="$GF_RAW/$rel_path"
  echo "fetch: $url"
  if ! curl --fail --silent --show-error --location --output "$dest" "$url"; then
    echo "ERROR: fetch failed (URL may have moved): $url" >&2
    exit 1
  fi
}

record_or_verify() {
  local dest="$1"
  local key="$2"
  local sha
  sha="$(sha256sum "$dest" | cut -d' ' -f1)"
  local locked
  locked="$(node -e "const l=require('$LOCK');console.log(l['$key']?.sha256 ?? 'null')")"
  if [ "$locked" = "null" ]; then
    echo "lock: recording $key sha256=$sha (verify out of band, then commit the lock)"
    node -e "
      const fs = require('node:fs');
      const lock = JSON.parse(fs.readFileSync('$LOCK', 'utf8'));
      lock['$key'].sha256 = '$sha';
      fs.writeFileSync('$LOCK', JSON.stringify(lock, null, 2) + '\n');
    "
  elif [ "$locked" != "$sha" ]; then
    echo "ERROR: sha256 mismatch for $key (locked $locked, fetched $sha)" >&2
    exit 1
  fi
}

get_face() {
  local key="$1"
  local rel_path="$2"
  local file="$3"
  fetch "$rel_path" "$SOURCES/$file"
  record_or_verify "$SOURCES/$file" "$key"
}

# Variable sources (Thea §2.1 three-face system; Source Sans ships no italic).
get_face "fraunces-roman" "ofl/fraunces/Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf" "Fraunces-roman.ttf"
get_face "fraunces-italic" "ofl/fraunces/Fraunces-Italic%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf" "Fraunces-italic.ttf"
get_face "newsreader-roman" "ofl/newsreader/Newsreader%5Bopsz%2Cwght%5D.ttf" "Newsreader-roman.ttf"
get_face "newsreader-italic" "ofl/newsreader/Newsreader-Italic%5Bopsz%2Cwght%5D.ttf" "Newsreader-italic.ttf"
get_face "source-sans-roman" "ofl/sourcesans3/SourceSans3%5Bwght%5D.ttf" "SourceSans3-roman.ttf"

# OFL texts, vendored beside the files (dashboard habit, generalized).
fetch "ofl/fraunces/OFL.txt" "$ROOT/licenses/Fraunces-OFL.txt"
fetch "ofl/newsreader/OFL.txt" "$ROOT/licenses/Newsreader-OFL.txt"
fetch "ofl/sourcesans3/OFL.txt" "$ROOT/licenses/SourceSans3-OFL.txt"

echo "sources ready in $SOURCES"
