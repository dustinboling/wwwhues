#!/bin/bash
# Hues Music Server — one-time bootstrap for the one-tap updater.
# Installs app v1.2.0 (which contains the "Check for updates" button) plus
# the root apply-helper and its systemd path trigger. Run as root:
#   curl -fsSL https://hues.flowers/music-server/bootstrap-v1.2.sh | sudo bash
set -euo pipefail
BASE="https://hues.flowers/music-server"
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

echo "→ Downloading v1.2.0 from $BASE"
curl -fsSL "$BASE/v1.2.0/hues_music.py" -o "$WORK/hues_music.py"
curl -fsSL "$BASE/update.json" -o "$WORK/update.json"
SHA=$(python3 -c "import json; print(json.load(open('$WORK/update.json'))['sha256'])")
echo "$SHA  $WORK/hues_music.py" | sha256sum -c -
for f in hues-apply-update hues-update.service hues-update.path; do
  curl -fsSL "$BASE/$f" -o "$WORK/$f"
done
python3 -m py_compile "$WORK/hues_music.py"

echo "→ Installing (current app backed up alongside itself)"
cp -a /opt/hues-music/hues_music.py "/opt/hues-music/hues_music.py.bak-bootstrap" 2>/dev/null || true
install -m 644 "$WORK/hues_music.py" /opt/hues-music/hues_music.py
install -m 755 "$WORK/hues-apply-update" /usr/local/sbin/hues-apply-update
install -m 644 "$WORK/hues-update.service" /etc/systemd/system/hues-update.service
install -m 644 "$WORK/hues-update.path" /etc/systemd/system/hues-update.path
mkdir -p /var/lib/hues-music/updates
chown huesmusic:huesmusic /var/lib/hues-music/updates

systemctl daemon-reload
systemctl enable --now hues-update.path
systemctl restart hues-music.service

for _ in $(seq 1 30); do
  sleep 1
  if curl -fsS http://127.0.0.1:8080/api/status >/dev/null 2>&1; then
    echo "✅ Done — Hues Music Server v1.2.0 is up. Settings now has 'Check for updates'."
    exit 0
  fi
done
echo "⚠️ The service didn't answer within 30s. Check: systemctl status hues-music" >&2
exit 1
