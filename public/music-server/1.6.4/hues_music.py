#!/usr/bin/env python3
"""
Hues Music Server — v1
A Soundtrack-style music server for a Raspberry Pi 5 feeding a WiiM Pro
over Wi-Fi / Ethernet, for Hues Floral Park.

How it works
------------
* MPD (Music Player Daemon) is the playback engine on the Pi.
  It holds the library, does the crossfading, and encodes ONE continuous
  stream (MPD "httpd" output, MP3 320 kbps by default).
* The WiiM Pro plays that stream as an "Open Network Stream" — exactly
  like an internet-radio station, except the station is the Pi on the
  same LAN. Because the crossfade happens on the Pi *before* encoding,
  the WiiM receives an already-mixed stream and the crossfade survives.
  (Sending tracks one-by-one to the WiiM over DLNA would lose it.)
* This app is the remote control + scheduler on top of MPD:
  playlists, an adjustable crossfade slider, and day/time scheduling
  (dayparting) like Soundtrack. It also talks to the WiiM over WiiM's
  local HTTP API to start/stop the stream and set the WiiM volume.
* Remote control from a phone offsite is via Tailscale (private VPN).
  The audio stream itself never leaves the farm LAN — only control does.

No third-party Python packages: standard library only.
Run in demo mode without MPD:  HUES_DEMO=1 python3 hues_music.py
"""
import errno
import faulthandler
import hashlib
import http.cookiejar
import json
import os
import re
import shutil
import signal
import socket
import ssl
import sys
import threading
import time
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

# ---------------------------------------------------------------- config
DATA_DIR = Path(os.environ.get("HUES_DATA", str(Path.home() / "hues-music-data")))
MUSIC_DIR = os.environ.get("HUES_MUSIC_DIR", "/srv/hues-music")
MPD_HOST = os.environ.get("MPD_HOST", "127.0.0.1")
MPD_PORT = int(os.environ.get("MPD_PORT", "6600"))
WEB_PORT = int(os.environ.get("HUES_PORT", "8080"))
DEMO = os.environ.get("HUES_DEMO") == "1"
ACCESS_PIN = os.environ.get("HUES_PIN", "")  # optional; Tailscale is the main gate
APP_VERSION = "1.6.4"
# One-tap updates: the app checks this manifest on hues.flowers (Dustin's own
# site), verifies the download against the manifest's SHA-256, stages it under
# DATA_DIR/updates, and a root systemd path unit (hues-update.path) performs
# the swap + health check + rollback. The app itself never runs as root.
UPDATE_MANIFEST_URL = os.environ.get(
    "HUES_UPDATE_URL", "https://hues.flowers/music-server/update.json")
UPDATE_DIR = DATA_DIR / "updates"
# Version check-in: the app reports its version (and nothing else) to a tiny
# receiver on Dustin's Cloudflare on startup and every 6 hours, so Hue can
# see what the Pi is running — and whether it's alive — without asking.
CHECKIN_URL = os.environ.get(
    "HUES_CHECKIN_URL", "https://hues-music-checkin.dustin-boling.workers.dev/checkin")
CHECKIN_INTERVAL = 6 * 3600

DATA_DIR.mkdir(parents=True, exist_ok=True)
STATE_FILE = DATA_DIR / "state.json"

DEFAULT_SETTINGS = {
    "crossfade": 6,            # Dustin's park standard (set 2026-11-02)
    "volume": 85,              # MPD (stream) volume, 0-100
    "random": False,
    "repeat": True,
    "scheduler_enabled": True,
    "wiim_enabled": True,
    "wiim_ip": "",             # e.g. 192.168.1.50 — set in Settings / first-run
    "wiim_autoplay": True,     # start the WiiM whenever playback starts
    "wiim_volume": 80,         # WiiM output volume (the one the amp hears)
    "stream_port": 8000,       # MPD httpd output port
    "stream_host": "",         # override LAN host for stream URL; "" = auto-detect
}

_lock = threading.RLock()


def load_state():
    if STATE_FILE.exists():
        try:
            s = json.loads(STATE_FILE.read_text())
            s["settings"] = {**DEFAULT_SETTINGS, **s.get("settings", {})}
            s.setdefault("playlists", [])   # [{id,name,tracks:[mpd file,...]}]
            s.setdefault("schedules", [])   # [{id,name,playlist_ref,days,start,end,enabled,crossfade,volume}]
            s.setdefault("runtime", {})
            return s
        except Exception:
            pass
    return {"settings": dict(DEFAULT_SETTINGS), "playlists": [], "schedules": [], "runtime": {}}


def save_state():
    with _lock:
        tmp = STATE_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(STATE, indent=2))
        tmp.replace(STATE_FILE)


STATE = load_state()


def settings():
    return STATE["settings"]


def lan_ip():
    """Best-effort LAN IP of this machine (what the WiiM should connect to)."""
    if settings().get("stream_host"):
        return settings()["stream_host"]
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return socket.gethostname()


def stream_url():
    return f"http://{lan_ip()}:{settings()['stream_port']}/"


# ---------------------------------------------------------------- MPD client
class MpdError(Exception):
    pass


class Mpd:
    """Minimal MPD protocol client (socket, text protocol)."""

    def __init__(self, host=MPD_HOST, port=MPD_PORT):
        self.host, self.port = host, port

    def _cmd(self, *commands):
        with socket.create_connection((self.host, self.port), timeout=8) as sock:
            f = sock.makefile("rwb", buffering=0)
            greeting = f.readline().decode("utf-8", "replace")
            if not greeting.startswith("OK MPD"):
                raise MpdError(f"bad greeting: {greeting!r}")
            results = []
            for command in commands:
                f.write((command + "\n").encode())
                out = {}
                last_key = None
                while True:
                    line = f.readline().decode("utf-8", "replace").rstrip("\n")
                    if line == "OK":
                        break
                    if line.startswith("ACK"):
                        raise MpdError(line)
                    if ": " in line:
                        k, v = line.split(": ", 1)
                        if k in out:  # repeated key -> list (e.g. multiple files)
                            if not isinstance(out[k], list):
                                out[k] = [out[k]]
                            out[k].append(v)
                            last_key = (k, len(out[k]) - 1)
                        else:
                            out[k] = v
                            last_key = k
                results.append(out)
            return results if len(results) > 1 else results[0]

    def _cmd_list(self, command):
        """Commands that return a list of records split by 'file:' (or 'directory:')."""
        with socket.create_connection((self.host, self.port), timeout=15) as sock:
            f = sock.makefile("rwb", buffering=0)
            f.readline()
            f.write((command + "\n").encode())
            records, cur = [], None
            while True:
                line = f.readline().decode("utf-8", "replace").rstrip("\n")
                if line == "OK":
                    break
                if line.startswith("ACK"):
                    raise MpdError(line)
                if ": " in line:
                    k, v = line.split(": ", 1)
                    if k in ("file", "directory", "playlist") :
                        if cur:
                            records.append(cur)
                        cur = {k: v}
                    elif cur is not None:
                        cur[k] = v
            if cur:
                records.append(cur)
            return records

    # -- queries
    def status(self):
        return self._cmd("status")

    def current_song(self):
        return self._cmd("currentsong")

    def queue(self):
        try:
            return self._cmd_list("playlistinfo")
        except Exception:
            return []

    def library(self):
        recs = self._cmd_list('listallinfo')
        tracks = []
        for r in recs:
            if "file" not in r:
                continue
            tracks.append({
                "file": r["file"],
                "title": r.get("Title") or Path(r["file"]).stem,
                "artist": r.get("Artist", ""),
                "album": r.get("Album", ""),
                "duration": float(r.get("Time", 0) or 0),
                "folder": str(Path(r["file"]).parent) if str(Path(r["file"]).parent) != "." else "",
            })
        return tracks

    # -- control
    def play(self): return self._cmd("play")
    def pause(self): return self._cmd("pause 1")
    def resume(self): return self._cmd("pause 0")
    def stop(self): return self._cmd("stop")
    def next(self): return self._cmd("next")
    def previous(self): return self._cmd("previous")
    def setvol(self, v): return self._cmd(f"setvol {int(max(0, min(100, v)))}")
    def crossfade(self, s): return self._cmd(f"crossfade {int(max(0, min(30, s)))}")
    def random(self, on): return self._cmd(f"random {1 if on else 0}")
    def repeat(self, on): return self._cmd(f"repeat {1 if on else 0}")
    def update(self): return self._cmd("update")

    def play_files(self, files, shuffle=False):
        cmds = ["clear"]
        for fn in files:
            cmds.append(f'add "{fn}"')
        # apply options, then play
        try:
            self._cmd(*cmds)
        except MpdError:
            # retry adding files one-by-one, skipping any bad file
            self._cmd("clear")
            for fn in files:
                try:
                    self._cmd(f'add "{fn}"')
                except Exception:
                    continue
        # Playback options are best-effort and MUST NOT block play(): on a
        # stream-only MPD (httpd output, no mixer), setvol fails with
        # "No mixer" — in the field (2026-11-14) that exception landed after
        # "clear" and before play(), so tapping a playlist's Play button
        # stopped whatever was playing and started nothing.
        for apply_option in (
            lambda: self.random(shuffle),
            lambda: self.repeat(settings()["repeat"]),
            lambda: self.crossfade(settings()["crossfade"]),
            lambda: self.setvol(settings()["volume"]),
        ):
            try:
                apply_option()
            except Exception:
                pass
        self.play()


# ---------------------------------------------------------------- demo player
class DemoPlayer:
    """Simulated player so the UI/scheduler can be tested with no MPD/WiiM."""
    def __init__(self):
        self.tracks = [
            {"file": f"Park Day/{i:02d}-{n}.mp3", "title": n, "artist": "Hues", "album": "Park Day",
             "duration": 210, "folder": "Park Day"}
            for i, n in enumerate([
                "Petals Open", "Clippers in Hand", "Rows of Color", "Hummin' with the Bees",
                "Zinnia Sky", "September at Hues", "Sunflower Smile", "The Creek Beside",
                "Butterfly Waltz", "Imagine a Place"], start=1)
        ] + [
            {"file": f"Evenings/{i:02d}-{n}.mp3", "title": n, "artist": "Hues", "album": "Evenings",
             "duration": 240, "folder": "Evenings"}
            for i, n in enumerate(["Soft Light Serenade", "Petals on the Breeze", "The Quiet Corner"], start=1)
        ]
        self.queue_files, self.pos, self.state, self.started = [], 0, "stop", time.time()
        self.vol = settings()["volume"]

    def status(self):
        elapsed = 0
        if self.state == "play" and self.queue_files:
            elapsed = min(time.time() - self.started, self._dur())
            if elapsed >= self._dur():  # advance
                self.pos = (self.pos + 1) % len(self.queue_files)
                self.started = time.time()
                elapsed = 0
        st = {"state": self.state, "volume": str(self.vol), "xfade": str(settings()["crossfade"]),
              "random": "1" if settings()["random"] else "0", "repeat": "1" if settings()["repeat"] else "0"}
        if self.queue_files:
            st.update({"song": str(self.pos), "elapsed": str(round(elapsed, 1)),
                       "duration": str(self._dur()), "playlistlength": str(len(self.queue_files))})
        return st

    def _dur(self):
        f = self.queue_files[self.pos]
        return next((t["duration"] for t in self.tracks if t["file"] == f), 200)

    def current_song(self):
        if not self.queue_files:
            return {}
        f = self.queue_files[self.pos]
        t = next((x for x in self.tracks if x["file"] == f), {"file": f})
        return {"file": f, "Title": t.get("title", f), "Artist": t.get("artist", ""), "Pos": str(self.pos)}

    def queue(self):
        out = []
        for i, f in enumerate(self.queue_files):
            t = next((x for x in self.tracks if x["file"] == f), {})
            out.append({"file": f, "Title": t.get("title", Path(f).stem), "Artist": t.get("artist", ""), "Pos": str(i)})
        return out

    def library(self): return list(self.tracks)
    def play(self): self.state, self.started = "play", time.time() - (0 if self.state != "pause" else 0)
    def pause(self): self.state = "pause"
    def resume(self): self.state, self.started = "play", time.time()
    def stop(self): self.state = "stop"
    def next(self):
        if self.queue_files: self.pos = (self.pos + 1) % len(self.queue_files)
        self.started = time.time()
    def previous(self):
        if self.queue_files: self.pos = (self.pos - 1) % len(self.queue_files)
        self.started = time.time()
    def setvol(self, v): self.vol = int(v)
    def crossfade(self, s): pass
    def random(self, on): pass
    def repeat(self, on): pass
    def update(self): pass
    def play_files(self, files, shuffle=False):
        self.queue_files = list(files)
        if shuffle:
            import random as _r; _r.shuffle(self.queue_files)
        self.pos, self.state, self.started = 0, "play", time.time()


PLAYER = DemoPlayer() if DEMO else Mpd()


def player():
    return PLAYER


# ---------------------------------------------------------------- WiiM client
class Wiim:
    """WiiM Pro control via its local HTTP API (HTTPS, self-signed cert).

    Official commands used (WiiM HTTP API v1.2):
      getStatusEx, getPlayerStatus,
      setPlayerCmd:play:<url>, setPlayerCmd:stop, setPlayerCmd:pause,
      setPlayerCmd:resume, setPlayerCmd:vol:<0-100>,
      setPlayerCmd:switchmode:line-in / wifi
    """
    def __init__(self):
        self._ctx = ssl.create_default_context()
        self._ctx.check_hostname = False
        self._ctx.verify_mode = ssl.CERT_NONE

    @property
    def ip(self):
        return (settings().get("wiim_ip") or "").strip()

    @property
    def configured(self):
        return bool(self.ip)

    def _get(self, command, timeout=6):
        if not self.configured:
            raise RuntimeError("WiiM IP not set — add it in Settings")
        url = f"https://{self.ip}/httpapi.asp?command={urllib.parse.quote(command, safe=':/?&=')}"
        req = urllib.request.Request(url, headers={"User-Agent": "HuesMusicServer/1.0"})
        with urllib.request.urlopen(req, context=self._ctx, timeout=timeout) as r:
            body = r.read().decode("utf-8", "replace").strip()
        try:
            return json.loads(body)
        except Exception:
            return {"raw": body}

    def status(self):
        if DEMO:
            return {"configured": self.configured, "demo": True, "status": "play", "mode": "stream",
                    "title": "(demo WiiM)", "vol": settings()["wiim_volume"]}
        info, ps = {}, {}
        try:
            info = self._get("getStatusEx")
        except Exception as e:
            return {"configured": self.configured, "reachable": False, "error": str(e)}
        try:
            ps = self._get("getPlayerStatus")
        except Exception:
            pass
        return {"configured": True, "reachable": True,
                "name": info.get("DeviceName") or info.get("ssid") or "WiiM",
                "firmware": info.get("firmware", ""), "model": info.get("project", ""),
                "status": ps.get("status", ""), "mode": ps.get("mode", ""),
                "title": ps.get("Title", ""), "artist": ps.get("Artist", ""),
                "vol": int(float(ps.get("vol", 0))) if str(ps.get("vol", "")).replace(".", "", 1).isdigit() else None,
                "mute": ps.get("mute")}

    def play_stream(self):
        if DEMO:
            return {"ok": True, "demo": True, "url": stream_url()}
        return self._get(f"setPlayerCmd:play:{stream_url()}")

    def stop(self):
        if not DEMO: self._get("setPlayerCmd:stop")
    def pause(self):
        if not DEMO: self._get("setPlayerCmd:pause")
    def resume(self):
        if not DEMO: self._get("setPlayerCmd:resume")
    def set_volume(self, v):
        v = int(max(0, min(100, v)))
        settings()["wiim_volume"] = v
        if not DEMO: self._get(f"setPlayerCmd:vol:{v}")


WIIM = Wiim()


def wiim_kick():
    """If WiiM integration is on, tell the WiiM to play the Pi stream."""
    if settings().get("wiim_enabled") and settings().get("wiim_autoplay") and WIIM.configured:
        try:
            WIIM.play_stream()
            STATE["runtime"]["wiim_last_kick"] = datetime.now().isoformat(timespec="seconds")
        except Exception as e:
            STATE["runtime"]["wiim_last_error"] = str(e)


# ---------------------------------------------------------------- Tailscale
import shutil
import subprocess

_ts_proc = {"proc": None, "url": ""}


def tailscale_status():
    if DEMO:
        return {"installed": True, "demo": True, "state": "Stopped", "auth_url": _ts_proc["url"]}
    if not shutil.which("tailscale"):
        return {"installed": False}
    try:
        out = subprocess.run(["tailscale", "status", "--json"], capture_output=True,
                             text=True, timeout=6).stdout
        j = json.loads(out or "{}")
        ips = j.get("TailscaleIPs") or []
        return {"installed": True, "state": j.get("BackendState", ""),
                "ip": ips[0] if ips else "",
                "hostname": (j.get("Self") or {}).get("HostName", ""),
                "auth_url": _ts_proc["url"]}
    except Exception as e:
        return {"installed": True, "state": "unknown", "error": str(e),
                "auth_url": _ts_proc["url"]}


def tailscale_connect():
    """Start `tailscale up` and capture the sign-in URL it prints."""
    if DEMO:
        _ts_proc["url"] = "https://login.tailscale.com/a/demo"
        return {"ok": True, "auth_url": _ts_proc["url"]}
    if _ts_proc["proc"] and _ts_proc["proc"].poll() is None:
        return {"ok": True, "auth_url": _ts_proc["url"]}

    def _run():
        try:
            p = subprocess.Popen(["tailscale", "up", "--hostname=huesaudio"],
                                 stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            _ts_proc["proc"] = p
            for line in p.stdout:
                m = re.search(r"https://login\.tailscale\.com/\S+", line)
                if m:
                    _ts_proc["url"] = m.group(0)
        except Exception as e:
            STATE["runtime"]["tailscale_error"] = str(e)

    threading.Thread(target=_run, daemon=True).start()
    for _ in range(24):
        if _ts_proc["url"]:
            break
        time.sleep(0.25)
    return {"ok": True, "auth_url": _ts_proc["url"]}


# ---------------------------------------------------------------- playlists
def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "playlist"


def all_playlists(library=None):
    """Folder playlists (from the music directory layout) + custom playlists."""
    lib = library if library is not None else player().library()
    folders = {}
    for t in lib:
        folders.setdefault(t["folder"] or "(Library root)", []).append(t["file"])
    out = []
    for name in sorted(folders):
        out.append({"ref": f"folder:{name}", "name": name, "kind": "folder",
                    "count": len(folders[name]), "tracks": sorted(folders[name])})
    for p in STATE["playlists"]:
        out.append({"ref": f"custom:{p['id']}", "name": p["name"], "kind": "custom",
                    "count": len(p["tracks"]), "tracks": list(p["tracks"])})
    if lib:
        out.insert(0, {"ref": "all", "name": "Everything — shuffle the library", "kind": "all",
                       "count": len(lib), "tracks": [t["file"] for t in lib]})
    return out


def resolve_playlist(ref):
    for p in all_playlists():
        if p["ref"] == ref:
            return p
    return None


def play_playlist(ref, shuffle=False, manual=True):
    p = resolve_playlist(ref)
    if not p or not p["tracks"]:
        raise RuntimeError("Playlist is empty or not found")
    player().play_files(p["tracks"], shuffle=shuffle or (ref == "all"))
    if manual:
        mark_manual_override()
    STATE["runtime"]["now_playlist_ref"] = ref
    STATE["runtime"]["now_playlist_name"] = p["name"]
    save_state()
    wiim_kick()
    return p


# ---------------------------------------------------------------- scheduler
def block_signature(sched, day):
    return f"{sched['id']}@{day.isoformat()}"


def _block_at(sched, now):
    """Signature of `sched` if it is active at `now` (handles overnight), else None."""
    try:
        sh, sm = map(int, sched["start"].split(":"))
        eh, em = map(int, sched["end"].split(":"))
    except Exception:
        return None
    start_m, end_m, cur_m = sh * 60 + sm, eh * 60 + em, now.hour * 60 + now.minute
    days = sched["days"]  # 0=Mon .. 6=Sun
    if end_m > start_m:  # same-day block
        if now.weekday() in days and start_m <= cur_m < end_m:
            return block_signature(sched, now.date())
    else:  # overnight block, belongs to its start day
        if now.weekday() in days and cur_m >= start_m:
            return block_signature(sched, now.date())
        yesterday = now - timedelta(days=1)
        if yesterday.weekday() in days and cur_m < end_m:
            return block_signature(sched, yesterday.date())
    return None


def active_block(now=None, want="music"):
    """Active schedule block at `now`.

    want="music": playlist blocks only. want="volume": volume-only blocks
    (playlist_ref == "volume-only") — they layer on top of music blocks and
    only change the WiiM volume when they start.
    """
    now = now or datetime.now()
    if not settings()["scheduler_enabled"]:
        return None, None
    for sched in STATE["schedules"]:
        if not sched.get("enabled", True):
            continue
        is_volume_only = sched.get("playlist_ref") == "volume-only"
        if want == "music" and is_volume_only:
            continue
        if want == "volume" and not is_volume_only:
            continue
        sig = _block_at(sched, now)
        if sig:
            return sched, sig
    return None, None


def wiim_ramp_volume(target, seconds=15):
    """Glide the WiiM volume to `target` instead of jumping (park-friendly)."""
    target = int(max(0, min(100, target)))

    def _ramp():
        try:
            cur = settings().get("wiim_volume", target)
            ws = WIIM.status()
            if ws.get("vol") is not None:
                cur = int(ws["vol"])
            steps = max(1, min(15, abs(target - cur)))
            if steps <= 1:
                WIIM.set_volume(target); save_state(); return
            for i in range(1, steps + 1):
                WIIM.set_volume(round(cur + (target - cur) * i / steps))
                time.sleep(seconds / steps)
            save_state()
        except Exception as e:
            STATE["runtime"]["wiim_last_error"] = str(e)

    threading.Thread(target=_ramp, daemon=True).start()


def apply_scheduled_volume(sched):
    if sched.get("volume") is not None and settings().get("wiim_enabled") and (WIIM.configured or DEMO):
        wiim_ramp_volume(int(sched["volume"]))


def _active_block_legacy(now=None):
    """Return (schedule, signature) active at `now`, handling overnight blocks."""
    now = now or datetime.now()
    if not settings()["scheduler_enabled"]:
        return None, None
    for sched in STATE["schedules"]:
        if not sched.get("enabled", True):
            continue
        try:
            sh, sm = map(int, sched["start"].split(":"))
            eh, em = map(int, sched["end"].split(":"))
        except Exception:
            continue
        start_m, end_m, cur_m = sh * 60 + sm, eh * 60 + em, now.hour * 60 + now.minute
        days = sched["days"]  # 0=Mon .. 6=Sun
        if end_m > start_m:  # same-day block
            if now.weekday() in days and start_m <= cur_m < end_m:
                return sched, block_signature(sched, now.date())
        else:  # overnight block, belongs to its start day
            if now.weekday() in days and cur_m >= start_m:
                return sched, block_signature(sched, now.date())
            yesterday = now - timedelta(days=1)
            if yesterday.weekday() in days and cur_m < end_m:
                return sched, block_signature(sched, yesterday.date())
    return None, None


def next_boundary(now=None):
    now = now or datetime.now()
    times = []
    for sched in STATE["schedules"]:
        if not sched.get("enabled", True):
            continue
        for d in range(0, 8):
            day = (now + timedelta(days=d)).date()
            if day.weekday() not in sched["days"]:
                continue
            for tstr in (sched["start"], sched["end"]):
                try:
                    h, m = map(int, tstr.split(":"))
                except Exception:
                    continue
                dt = datetime(day.year, day.month, day.day, h, m)
                if dt > now:
                    times.append(dt)
    return min(times) if times else None


def mark_manual_override():
    """A manual choice wins until the next schedule boundary."""
    _, sig = active_block()
    if sig:
        STATE["runtime"]["override_sig"] = sig
        save_state()


def scheduler_tick():
    rt = STATE["runtime"]
    # Volume-only layer: when a volume block starts, glide the WiiM to its level.
    # It never touches what's playing — it layers over the music blocks.
    vsched, vsig = active_block(want="volume")
    if vsched and rt.get("volume_sig") != vsig:
        rt["volume_sig"] = vsig
        rt["active_volume_block"] = vsched["name"]
        save_state()
        apply_scheduled_volume(vsched)
    elif not vsched and rt.get("volume_sig"):
        rt["volume_sig"] = None
        rt.pop("active_volume_block", None)
        save_state()
    sched, sig = active_block()
    rt = STATE["runtime"]
    if not sched:
        # No block now: if we started the last block and it has ended, stop.
        if rt.get("active_sig") and settings()["scheduler_enabled"]:
            try:
                player().stop()
                if settings().get("wiim_enabled") and WIIM.configured:
                    WIIM.stop()
            except Exception:
                pass
            rt["active_sig"] = None
            rt.pop("now_playlist_ref", None); rt.pop("now_playlist_name", None)
            save_state()
        return
    if rt.get("override_sig") == sig:
        return  # Dustin overrode this block manually — leave it alone
    if rt.get("active_sig") != sig:
        # New block: apply its crossfade/volume if set, then play its playlist.
        if sched.get("crossfade") is not None:
            settings()["crossfade"] = int(sched["crossfade"])
            try: player().crossfade(settings()["crossfade"])
            except Exception: pass
        p = resolve_playlist(sched["playlist_ref"])
        if p and p["tracks"]:
            player().play_files(p["tracks"], shuffle=bool(sched.get("shuffle")))
            rt["active_sig"] = sig
            rt["now_playlist_ref"] = p["ref"]; rt["now_playlist_name"] = p["name"]
            rt["active_block_name"] = sched["name"]
            save_state()
            wiim_kick()
            apply_scheduled_volume(sched)


def scheduler_loop():
    while True:
        try:
            scheduler_tick()
        except Exception as e:
            print(f"[scheduler] {e}", file=sys.stderr)
        # Watchdog: in an active block, if the WiiM dropped the stream, re-kick it.
        try:
            sched, sig = active_block()
            if sched and STATE["runtime"].get("active_sig") == sig and WIIM.configured \
               and settings().get("wiim_enabled"):
                ws = WIIM.status()
                if ws.get("reachable") and ws.get("status") not in ("play", "loading"):
                    last = STATE["runtime"].get("wiim_last_kick", "")
                    try:
                        last_dt = datetime.fromisoformat(last)
                    except Exception:
                        last_dt = datetime.min
                    if (datetime.now() - last_dt) > timedelta(minutes=2):
                        wiim_kick()
        except Exception:
            pass
        time.sleep(20)


# ---------------------------------------------------------------- self-update
def _fetch(url, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": f"HuesMusicServer/{APP_VERSION}"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def _version_tuple(v):
    try:
        return tuple(int(x) for x in str(v).split(".") if x.isdigit() or x == "0")
    except Exception:
        return (0,)


def update_check():
    """Compare APP_VERSION with the published manifest."""
    try:
        m = json.loads(_fetch(UPDATE_MANIFEST_URL).decode())
    except Exception as e:
        return {"ok": False, "error": f"Couldn't reach the update channel: {e}",
                "current": APP_VERSION}
    latest = str(m.get("version", ""))
    return {"ok": True, "current": APP_VERSION, "latest": latest,
            "available": bool(latest) and _version_tuple(latest) > _version_tuple(APP_VERSION),
            "notes": m.get("notes", ""), "url": m.get("url", ""), "sha256": m.get("sha256", "")}


def update_install():
    """Download, verify (SHA-256 + compiles), and stage the update.

    The root helper (hues-update.path/service) notices the staged files and
    does the actual swap with rollback. In DEMO mode we verify and report
    without staging anything privileged.
    """
    chk = update_check()
    if not chk.get("ok"):
        return chk
    if not chk["available"]:
        return {"ok": True, "installed": False, "message": "Already up to date", **chk}
    data = _fetch(chk["url"], timeout=60)
    import hashlib as _hl
    digest = _hl.sha256(data).hexdigest()
    if chk["sha256"] and digest != chk["sha256"]:
        return {"ok": False, "error": "Downloaded update failed its checksum — not installed"}
    try:
        compile(data.decode(), "hues_music.py", "exec")
    except Exception as e:
        return {"ok": False, "error": f"Downloaded update doesn't parse — not installed: {e}"}
    if DEMO:
        (UPDATE_DIR).mkdir(parents=True, exist_ok=True)
        (UPDATE_DIR / "result.json").write_text(json.dumps(
            {"ok": True, "simulated": True, "from": APP_VERSION, "to": chk["latest"],
             "message": "Demo mode: update verified and would install"}))
        return {"ok": True, "installed": True, "simulated": True, **chk}
    UPDATE_DIR.mkdir(parents=True, exist_ok=True)
    (UPDATE_DIR / "pending.py").write_bytes(data)
    (UPDATE_DIR / "pending.json").write_text(json.dumps(
        {"version": chk["latest"], "sha256": digest, "from": APP_VERSION,
         "staged_at": datetime.now().isoformat(timespec="seconds")}))
    return {"ok": True, "installed": True, "staged": True,
            "message": "Update staged — the Pi applies it in a few seconds and restarts the app",
            **chk}


def update_status():
    out = {"current": APP_VERSION}
    try:
        out["result"] = json.loads((UPDATE_DIR / "result.json").read_text())
    except Exception:
        out["result"] = None
    out["pending"] = (UPDATE_DIR / "pending.py").exists()
    return out


# ---------------------------------------------------------------- check-in
def device_id():
    """Stable per-Pi identifier for version check-ins: the hostname plus a
    random suffix generated once and kept in the data dir."""
    p = DATA_DIR / "device_id.txt"
    try:
        v = p.read_text().strip()
        if v:
            return v
    except Exception:
        pass
    import uuid as _u
    v = f"{socket.gethostname() or 'pi'}-{_u.uuid4().hex[:8]}"
    try:
        p.write_text(v)
    except Exception:
        pass
    return v


def checkin_now():
    """Report the running version to the check-in receiver, carrying the
    latest drop beacon from the outbox (see the music-drops section).
    Returns (ok, why): the beacon sender needs to SEE failures — the old
    version swallowed them, which is part of how drop failures stayed
    invisible for three releases. Still never raises: the music never
    waits on the network."""
    global _last_send_fail
    try:
        payload = {"device": device_id(), "version": APP_VERSION}
        with _drop_lock:
            ob = dict(_outbox) if _outbox else {}
        if ob.get("drop"):
            payload["drop"] = ob["drop"]
        data = json.dumps(payload).encode()
        req = urllib.request.Request(
            CHECKIN_URL, data=data, method="POST",
            headers={"Content-Type": "application/json",
                     "User-Agent": f"HuesMusicServer/{APP_VERSION}"})
        with urllib.request.urlopen(req, timeout=8) as r:
            r.read()
        _last_send_fail = ""
        return True, ""
    except Exception as e:
        _last_send_fail = _ecode(e)
        try:
            with _drop_lock:
                if _outbox:
                    _outbox["sx"] = _last_send_fail
            _outbox_save()
        except Exception:
            pass
        return False, _last_send_fail


def checkin_loop():
    # Demo mode stays silent unless a check-in URL was explicitly provided
    # (the smoke test points it at a local stub to verify the payload).
    if DEMO and "HUES_CHECKIN_URL" not in os.environ:
        return
    while True:
        checkin_now()
        time.sleep(CHECKIN_INTERVAL)


# ---------------------------------------------------------------- music drops
# Hue stages new music as a "drop": a manifest on hues.flowers listing
# tracks (playlist, filename, URL, SHA-256); since v1.6.3 the files live
# in Cloudflare R2 and are served by the hues-music-checkin Worker (they
# were on Google Drive 2026-11-15 → 2026-11-16, until Drive's confirm
# page kept breaking downloads on the Pi's network). Once a drop is
# reported downloaded, the Worker deletes its files from R2.
# The app downloads new drops into the music folder, verifies every file's
# checksum, and rescans — that's how new playlists reach the Pi with
# nobody touching a terminal.
#
# v1.6.4 — SELF-DIAGNOSING REWRITE (design: Kiro consult,
# KIRO-CONSULT-2026-11-16.md). Root cause of the v1.6.1–1.6.3 failures,
# confirmed in this repo's own build scripts: /srv/hues-music is owned by
# mpd:audio with mode 755 and the app user (huesmusic, no supplementary
# groups) cannot write there — so the old code's folder.mkdir(), which
# ran BEFORE its try block, raised PermissionError and killed the job
# thread instantly: no state change (the UI ring vanished at the next
# poll), zero bytes, and no report, because only code inside the try
# could report. Three downloader rewrites changed code that never ran.
# This rewrite makes that class of silence impossible:
#   * the WHOLE job (setup included) runs inside one guarded wrapper
#     catching BaseException; threading.excepthook is a backstop and
#     leaves a one-line crash note on disk;
#   * a PREFLIGHT (target-folder write probe in the real folder, disk
#     room, DNS, a 64 KB Range probe of track 1) runs before any track
#     download and its result is ALWAYS phoned home;
#   * progress beacons ride the check-in channel as a cumulative
#     single-slot OUTBOX persisted on disk (drop_outbox.json): the
#     receiver keeps only the latest drop object, so each beacon carries
#     the whole step trail; a single sender thread delivers them in
#     order, and the outbox is also flushed at startup and on every
#     periodic check-in;
#   * a write-ahead JOURNAL (drop_job.json) records the job's phase; if
#     the process dies mid-job, the next startup sends a "died" beacon
#     naming the last phase reached — a silent death localizes itself;
#   * "done" is trustworthy (the Worker deletes the drop's R2 files on
#     "done", so a false one is destructive): the manifest must carry a
#     SHA-256 and byte count for every track, landed files are fsynced
#     and RE-HASHED from disk at their final paths, and the done beacon
#     carries a proof hash over the track checksums.
DROPS_MANIFEST_URL = os.environ.get(
    "HUES_DROPS_URL", "https://hues.flowers/music-server/drops.json")
DROPS_STATE_FILE = DATA_DIR / "drops.json"
OUTBOX_FILE = DATA_DIR / "drop_outbox.json"
JOURNAL_FILE = DATA_DIR / "drop_job.json"
CRASH_FILE = DATA_DIR / "last_crash.txt"
_drop_job = {"state": "idle"}
_drop_lock = threading.Lock()
_outbox = {}
_outbox_seq = 0
_job_counter = 0
_send_evt = threading.Event()
_last_send_fail = ""
_BACKOFF = (2, 5, 15, 30, 60, 120)
_TERMINAL_PHASES = ("done", "error", "cancelled", "died")
_DEFAULT_THREAD_HOOK = threading.excepthook


# ------------------------------------------------------------ small utils
def _atomic_write(path, data):
    tmp = path.with_name(path.name + ".tmp")
    with open(tmp, "w") as f:
        f.write(data)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)


def _ecode(e):
    """Short machine-readable code for an exception (Kiro's encoder;
    isinstance order matters: HTTPError ⊂ URLError ⊂ OSError)."""
    if isinstance(e, urllib.error.HTTPError):
        return f"H{e.code}"
    if isinstance(e, urllib.error.URLError):
        r = e.reason
        if isinstance(r, socket.gaierror):
            return "DNS"
        if isinstance(r, ssl.SSLError):
            return "TLS"
        if isinstance(r, (TimeoutError, socket.timeout)):
            return "TMO"
        if isinstance(r, OSError) and r.errno:
            return errno.errorcode.get(r.errno, "NET")
        return "NET"
    if isinstance(e, (TimeoutError, socket.timeout)):
        return "TMO"
    if isinstance(e, OSError) and e.errno:
        return errno.errorcode.get(e.errno, "OS")
    return type(e).__name__[:12]


def _enc(segs, limit=300):
    """Join beacon segments in priority order, skipping any segment that
    would overflow the receiver's 300-char error field — the important
    facts survive truncation."""
    out = ""
    for s in segs:
        if s and len(out) + len(s) + (1 if out else 0) <= limit:
            out = f"{out};{s}" if out else s
    return out


def _fmt_bytes(n):
    n = int(n or 0)
    if n >= 1 << 20:
        return f"{n / 1048576:.0f}M"
    if n >= 1 << 10:
        return f"{n / 1024:.0f}K"
    return str(n)


def _sha256_file(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for blk in iter(lambda: f.read(1 << 20), b""):
            h.update(blk)
    return h.hexdigest()


def _fsync_file(p):
    fd = os.open(p, os.O_RDONLY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def _fsync_dir(p):
    try:
        fd = os.open(p, os.O_RDONLY)
    except Exception:
        return
    try:
        os.fsync(fd)
    except Exception:
        pass
    finally:
        os.close(fd)


def _boot_id():
    try:
        return Path("/proc/sys/kernel/random/boot_id").read_text().strip()
    except Exception:
        return ""


# ------------------------------------------------- outbox, journal, hooks
def _outbox_save():
    try:
        _atomic_write(OUTBOX_FILE, json.dumps(_outbox))
    except Exception:
        pass


def _outbox_load():
    global _outbox, _outbox_seq, _job_counter
    try:
        _outbox = json.loads(OUTBOX_FILE.read_text())
        _outbox_seq = int(_outbox.get("seq") or 0)
    except Exception:
        _outbox = {}
    try:
        j = json.loads(JOURNAL_FILE.read_text())
        _job_counter = int(j.get("job") or 0)
    except Exception:
        pass


def _journal(**kw):
    """Write-ahead job journal: the phase is on disk BEFORE the work it
    describes, so a process that dies still testifies at the next boot."""
    try:
        cur = {}
        try:
            cur = json.loads(JOURNAL_FILE.read_text())
        except Exception:
            cur = {}
        cur.update(kw)
        _atomic_write(JOURNAL_FILE, json.dumps(cur))
    except Exception:
        pass


def _beacon(state, segs=(), drop_id=None):
    """Compose the cumulative beacon for the current job and queue it in
    the outbox. Every beacon carries the job's whole step trail (p=) plus
    progress, so the LAST one to arrive says everything — the receiver
    stores only the latest. Never raises."""
    global _outbox, _outbox_seq
    try:
        with _drop_lock:
            _outbox_seq += 1
            seq = _outbox_seq
            job = dict(_drop_job)
        did = drop_id if drop_id is not None else str(job.get("drop") or "")
        parts = [f"j={job.get('job', 0)}.{seq}", f"p={job.get('trail', '')}"]
        parts.extend(str(s) for s in segs)
        if _last_send_fail:
            parts.append(f"sx={_last_send_fail}")
        with _drop_lock:
            _outbox = {"seq": seq,
                       "drop": {"state": state, "drop": did,
                                "error": _enc(parts),
                                "at": datetime.now().isoformat(timespec="seconds")},
                       "sent": False, "sx": _outbox.get("sx", "")}
        _outbox_save()
        _send_evt.set()
    except Exception:
        pass


def _outbox_sender():
    """Single poster for beacons. checkin_now always sends the CURRENT
    outbox contents, so beacons can never land out of order (the old
    design spawned a thread per report and the receiver is latest-wins,
    so an older report could overwrite a newer one)."""
    if DEMO and "HUES_CHECKIN_URL" not in os.environ:
        return
    while True:
        _send_evt.wait(timeout=30)
        _send_evt.clear()
        with _drop_lock:
            pending = bool(_outbox) and not _outbox.get("sent")
            seq = _outbox.get("seq")
        if not pending:
            continue
        ok, _why = checkin_now()
        if ok:
            with _drop_lock:
                if _outbox.get("seq") == seq:
                    _outbox["sent"] = True
            _outbox_save()


def _note_crash(text):
    try:
        _atomic_write(CRASH_FILE, str(text)[:400])
    except Exception:
        pass


def _install_crash_hooks():
    """Last-resort testimony: unhandled exceptions (in any thread) and
    hard crashes leave a one-line summary on disk, where the next
    startup's died beacon can quote it."""
    try:
        f = open(DATA_DIR / "faulthandler.log", "a")
        faulthandler.enable(file=f)
    except Exception:
        pass

    def _thread_hook(args):
        try:
            e = args.exc_value
            _note_crash(f"{type(e).__name__}: {e} (thread {args.thread.name})")
        except Exception:
            pass
        if _DEFAULT_THREAD_HOOK:
            _DEFAULT_THREAD_HOOK(args)
    threading.excepthook = _thread_hook

    def _sys_hook(t, v, tb):
        try:
            _note_crash(f"{t.__name__}: {v}")
        except Exception:
            pass
        sys.__excepthook__(t, v, tb)
    sys.excepthook = _sys_hook


def _term_handler(signum, frame):
    """systemd stops the service with SIGTERM: mark the journal before
    going down, so the next startup can tell a service stop from a
    power loss or a hard crash."""
    try:
        j = {}
        try:
            j = json.loads(JOURNAL_FILE.read_text())
        except Exception:
            j = {}
        if j and str(j.get("phase") or "") not in _TERMINAL_PHASES:
            j["phase"] = str(j.get("phase") or "") + "!term"
            _atomic_write(JOURNAL_FILE, json.dumps(j))
    except Exception:
        pass
    raise SystemExit(0)


def _reconcile_journal():
    """Startup: if the journal shows a job that never reached a terminal
    phase, the previous process died mid-job. Report it as "died" with
    the evidence (same boot → the service restarted; new boot → the Pi
    rebooted; plus the crash note and systemd's restart count)."""
    try:
        j = json.loads(JOURNAL_FILE.read_text())
    except Exception:
        return
    phase = str(j.get("phase") or "")
    if not phase or phase in _TERMINAL_PHASES:
        return
    same_boot = bool(j.get("boot_id")) and j.get("boot_id") == _boot_id()
    segs = [f"e=DIED@{phase} {'svc' if same_boot else 'boot'}"]
    if j.get("track") is not None:
        segs.append(f"t={j.get('track')}/{j.get('total', '?')}")
    try:
        crash = CRASH_FILE.read_text().strip()[:80]
        if crash:
            segs.append(f"crash={crash}")
    except Exception:
        pass
    try:
        out = subprocess.run(
            ["systemctl", "show", "hues-music", "-p", "NRestarts",
             "-p", "Result", "--value"],
            capture_output=True, text=True, timeout=3)
        nr = "/".join(out.stdout.split())[:40]
        if nr:
            segs.append(f"svc={nr}")
    except Exception:
        pass
    with _drop_lock:
        _drop_job.update({"state": "idle", "drop": str(j.get("did") or ""),
                          "job": int(j.get("job") or 0),
                          "trail": str(j.get("trail") or "")})
    _journal(phase="died")
    _beacon("died", segs, drop_id=str(j.get("did") or ""))


def _trail_add(letter):
    with _drop_lock:
        tr = str(_drop_job.get("trail") or "")
        if letter not in tr:
            _drop_job["trail"] = tr + letter
        tr = str(_drop_job.get("trail") or "")
    _journal(trail=tr)


# ------------------------------------------------------------- fetch core
class _Interstitial(Exception):
    """The host served an HTML page (e.g. Google Drive's download-confirm
    page) instead of the music file."""


class _Cancelled(Exception):
    """The user cancelled the running drop job."""


def _confirm_url(html):
    """Find the real download URL inside a Drive confirm page: a direct
    link carrying confirm+uuid, or the download form's action plus its
    hidden fields."""
    m = re.search(r'href="(https?://[^"]*?/download\?[^"]*?confirm=[^"]*)"', html)
    if m:
        return m.group(1).replace("&amp;", "&")
    m = re.search(r"(https://drive\.usercontent\.google\.com/download\?[^\"'\s<>]+)", html)
    if m:
        return m.group(1).replace("&amp;", "&")
    m = re.search(r'action="(https://drive\.usercontent\.google\.com/download)"', html)
    if m:
        fields = dict(re.findall(
            r'name="(id|export|confirm|uuid)" value="([^"]*)"', html))
        if fields.get("id"):
            return m.group(1) + "?" + urllib.parse.urlencode(fields)
    return ""


def _open_audio(opener, url, start=0, end=None, timeout=30):
    """Open a track URL and return the response stream. start/end ask for
    a Range slice (the R2 drop endpoint honours it; a host that answers
    200 instead of 206 tells the caller to restart from scratch). The
    socket timeout is per-read (30s): a stalled connection surfaces in
    seconds instead of hanging a job for minutes. If the host answers
    with an HTML confirm page instead of the file — Google Drive does
    this inconsistently, depending on the requesting network — follow
    its confirm link; the opener's cookie jar carries the session."""
    for hop in range(4):
        headers = {"User-Agent": f"HuesMusicServer/{APP_VERSION}"}
        if hop == 0 and (start or end is not None):
            headers["Range"] = f"bytes={start}-" + ("" if end is None else str(end))
        req = urllib.request.Request(url, headers=headers)
        r = opener.open(req, timeout=timeout)
        if (r.headers.get_content_type() or "") != "text/html":
            return r
        body = r.read(1 << 20).decode("utf-8", "replace")
        r.close()
        nxt = _confirm_url(body)
        if nxt:
            url = nxt
            continue
        if "drive.google.com" in url and hop == 0:
            continue  # the cookie is in the jar now; retry the same URL once
        raise _Interstitial("Google served a web page instead of the music file")
    raise _Interstitial("Google kept serving web pages instead of the music file")


def _track_variants(url):
    """Download URLs to try for one track: the manifest URL, plus Google
    Drive's alternate form when the manifest URL carries a Drive file id."""
    out = [url]
    m = re.search(r"[?&]id=([A-Za-z0-9_-]{10,})", url or "")
    if m:
        alt = f"https://drive.google.com/uc?export=download&id={m.group(1)}&confirm=t"
        if alt not in out:
            out.append(alt)
    return out


def _fetch_json(url, tries=3):
    """GET JSON with retries — a dropped connection shouldn't fail a
    100+ MB music drop; the checksum still guards every byte that lands."""
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(
                url, headers={"User-Agent": f"HuesMusicServer/{APP_VERSION}"})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read())
        except Exception as e:
            last = e
            if i < tries - 1:
                time.sleep(2)
    raise last


def _drops_manifest():
    return _fetch_json(DROPS_MANIFEST_URL)


def _drops_installed():
    try:
        return json.loads(DROPS_STATE_FILE.read_text())
    except Exception:
        return {}


def _safe_name(name, fallback):
    n = re.sub(r"[^A-Za-z0-9 .&'()\-]", "", str(name or "")).strip().strip(".")
    return n or fallback


def _safe_file(name):
    base = Path(str(name or "")).name
    return base if base.lower().endswith((".mp3", ".wav", ".m4a", ".flac", ".ogg")) else ""


def drops_available():
    try:
        man = _drops_manifest()
    except Exception as e:
        return {"ok": False, "error": f"Couldn't check for new music ({e})",
                "drops": [], "job": dict(_drop_job)}
    installed = _drops_installed()
    out = []
    for d in man.get("drops", []):
        did = str(d.get("id") or "")
        if not did:
            continue
        out.append({"id": did, "playlist": d.get("playlist", did),
                    "notes": d.get("notes", ""),
                    "tracks": len(d.get("tracks", [])),
                    "mb": round(sum(int(t.get("bytes") or 0)
                                    for t in d.get("tracks", [])) / 1048576, 1),
                    "installed": did in installed})
    return {"ok": True, "drops": out, "job": dict(_drop_job)}


# --------------------------------------------------------------- preflight
class _PfFail(Exception):
    """Preflight failure: carries the beacon segments describing it."""

    def __init__(self, segs, msg):
        super().__init__(msg)
        self.segs = segs


def _preflight(drop, folder, total_bytes):
    """Prove the job can succeed BEFORE downloading anything, and gather
    the facts the beacon reports either way: who owns the music folder,
    who the app runs as, whether the REAL target folder accepts a write
    (a probe file — os.access and exist_ok both lied about the old bug),
    disk room, DNS answers, and a 64 KB Range probe of track 1 (proves
    the large-GET path, not just small JSON). Raises _PfFail on the
    first failed check."""
    segs = []
    try:
        st = os.stat(MUSIC_DIR)
        segs.append(f"o={st.st_uid}:{st.st_gid}:{oct(st.st_mode & 0o7777)[2:]}")
    except FileNotFoundError:
        # Not fatal: the target folder's mkdir(parents=True) below will
        # create the whole path if the parent allows it — its result is
        # the verdict that matters.
        segs.append("o=ENOENT")
    except Exception as e:
        raise _PfFail([f"e={_ecode(e)}@stat {MUSIC_DIR}"],
                      f"Can't see the music folder ({e})")
    try:
        segs.append(f"u={os.geteuid()}:{os.getegid()}")
    except Exception:
        pass
    try:
        folder.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        raise _PfFail(segs + [f"e={_ecode(e)}@mkdir {folder}"],
                      f"Can't create the playlist folder ({e})")
    probe = folder / ".hues-probe"
    try:
        with open(probe, "wb") as f:
            f.write(b"ok")
            f.flush()
            os.fsync(f.fileno())
        probe.unlink()
        segs.append("pf=W1,P1")
    except Exception as e:
        raise _PfFail(segs + ["pf=W0,P0", f"e={_ecode(e)}@probe {folder}"],
                      f"The playlist folder isn't writable ({e})")
    try:
        du = shutil.disk_usage(MUSIC_DIR)
        segs.append(f"D={_fmt_bytes(du.free)}")
        if du.free < int(total_bytes * 1.1) + 50 * 1048576:
            raise _PfFail(segs + ["e=ENOSPC@disk"],
                          "Not enough free space on the Pi for this drop")
        if os.statvfs(MUSIC_DIR).f_flag & getattr(os, "ST_RDONLY", 1):
            raise _PfFail(segs + ["e=EROFS@statvfs"],
                          "The music folder is on a read-only filesystem")
    except _PfFail:
        raise
    except Exception:
        pass
    tracks = drop.get("tracks") or []
    host = ""
    try:
        host = urllib.parse.urlparse(str(tracks[0].get("url") or "")).hostname or ""
        infos = socket.getaddrinfo(host, 443, proto=socket.IPPROTO_TCP)
        v4 = sum(1 for i in infos if i[0] == socket.AF_INET)
        v6 = sum(1 for i in infos if i[0] == socket.AF_INET6)
        segs.append(f"N={v4}+{v6}")
    except Exception as e:
        raise _PfFail(segs + [f"e={_ecode(e)}@dns {host}"],
                      f"Can't resolve the download host ({e})")
    t0 = time.time()
    try:
        opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
        with _open_audio(opener, str(tracks[0]["url"]), 0, end=65535) as r:
            status = getattr(r, "status", 200)
            got = 0
            while got <= 65536:
                chunk = r.read(min(65536, 65537 - got))
                if not chunk:
                    break
                got += len(chunk)
        ms = int((time.time() - t0) * 1000)
        segs.append(f"G={status}/{got}/{ms}ms")
        if got == 0:
            raise _PfFail(segs + ["e=EMPTY@probe"],
                          "The download host sent no data")
    except _PfFail:
        raise
    except Exception as e:
        raise _PfFail(segs + [f"e={_ecode(e)}@probe"],
                      f"The download host didn't answer a test fetch ({e})")
    return segs


# ------------------------------------------------------------ track fetch
def _fetch_track(opener, t, folder, on_chunk):
    """Resumable single-track download: the .part file stays across
    attempts and resumes with a Range request; Content-Range is
    validated against the manifest (a misaligned resume restarts the
    file); a 416 with a complete .part goes straight to verification;
    backoff grows 2→120s and resets whenever bytes land; the track is
    abandoned after 6 consecutive attempts with no progress. Only a true
    checksum mismatch discards the partial. Returns the byte count;
    raises _Cancelled or the final error."""
    fn = _safe_file(t.get("file"))
    dest = folder / fn
    part = folder / (fn + ".part")
    want = str(t.get("sha256") or "")
    want_bytes = int(t.get("bytes") or 0)
    variants = _track_variants(str(t["url"]))
    attempt = 0
    stalls = 0
    last_got = -1
    got = 0
    err = None
    while attempt < 100:
        attempt += 1
        try:
            start = part.stat().st_size if part.exists() else 0
            if want_bytes and start > want_bytes:
                part.unlink(missing_ok=True)
                start = 0
            if want_bytes and 0 < start == want_bytes:
                # A previous attempt (or job) may have completed the body
                # without renaming — verify before asking for more.
                if _sha256_file(part) == want:
                    part.replace(dest)
                    return start
                part.unlink(missing_ok=True)
                start = 0
            h = hashlib.sha256()
            if start:
                with open(part, "rb") as pf:
                    for blk in iter(lambda: pf.read(1 << 20), b""):
                        h.update(blk)
            got = start
            on_chunk(got)
            with _open_audio(opener, variants[attempt % len(variants)], start) as r:
                status = getattr(r, "status", 200)
                if start and status == 200:
                    start = 0  # host ignored Range: restart the file
                    got = 0
                    h = hashlib.sha256()
                    on_chunk(0)
                elif start and status == 206:
                    cr = r.headers.get("Content-Range") or ""
                    m = re.match(r"bytes (\d+)-(\d+)/(\d+|\*)", cr)
                    if not m or int(m.group(1)) != start or (
                            m.group(3) != "*" and want_bytes
                            and int(m.group(3)) != want_bytes):
                        part.unlink(missing_ok=True)
                        raise ValueError(f"bad Content-Range on {fn}: {cr!r}")
                with open(part, "ab" if start else "wb") as f:
                    while True:
                        if _drop_job.get("cancel"):
                            raise _Cancelled()
                        chunk = r.read(1 << 18)
                        if not chunk:
                            break
                        h.update(chunk)
                        f.write(chunk)
                        got += len(chunk)
                        on_chunk(got)
            if want_bytes and got != want_bytes:
                raise ValueError(
                    f"short download on {fn} ({got} of {want_bytes} bytes)")
            if want and h.hexdigest() != want:
                part.unlink(missing_ok=True)
                raise ValueError(f"checksum mismatch on {fn}")
            part.replace(dest)
            return got
        except _Cancelled:
            part.unlink(missing_ok=True)
            raise
        except Exception as e:
            err = e
            if isinstance(e, urllib.error.HTTPError) and e.code == 416 \
                    and want_bytes and part.exists() \
                    and part.stat().st_size == want_bytes:
                time.sleep(1)
                continue  # the verify at the top of the loop will keep it
            if got == last_got:
                stalls += 1
                if stalls >= 6:
                    break
            else:
                stalls = 0
            last_got = got
            time.sleep(_BACKOFF[min(stalls, len(_BACKOFF) - 1)])
    raise ValueError(f"{fn} wouldn't download after {attempt} tries ({err})")


# ---------------------------------------------------------------- the job
_SHA_RE = re.compile(r"^[0-9a-f]{64}$")


def _gate_manifest(drop):
    """A drop may only run if EVERY track carries a SHA-256 and a byte
    count — without them a "done" can't be proven, and the receiver
    deletes the drop's R2 files on "done"."""
    tracks = drop.get("tracks") or []
    if not tracks:
        return "the drop has no tracks"
    for t in tracks:
        if not _safe_file(t.get("file")):
            return f"bad filename in drop: {t.get('file')!r}"
        if not _SHA_RE.match(str(t.get("sha256") or "")):
            return f"no checksum for {t.get('file')}"
        try:
            if int(t.get("bytes") or 0) <= 0:
                return f"no size for {t.get('file')}"
        except Exception:
            return f"bad size for {t.get('file')}"
    return ""


def _drop_run(drop):
    did = str(drop.get("id"))
    tracks = drop.get("tracks", [])
    total_bytes = sum(int(t.get("bytes") or 0) for t in tracks)
    folder = Path(MUSIC_DIR) / _safe_name(drop.get("playlist"), did)
    with _drop_lock:
        _drop_job.update({"state": "downloading", "done": 0,
                          "total": len(tracks), "current": "", "error": "",
                          "done_bytes": 0, "current_bytes": 0,
                          "total_bytes": total_bytes, "cancel": False})
    _journal(did=did, phase="preflight", track=0, total=len(tracks),
             started=datetime.now().isoformat(timespec="seconds"))
    pf_segs = _preflight(drop, folder, total_bytes)
    _trail_add("P")
    _trail_add("F")
    _journal(phase="fetching")
    _beacon("preflight", pf_segs)
    opener = urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    first_byte = [False]
    last_beacon = [time.time()]

    def progress(n):
        with _drop_lock:
            _drop_job["current_bytes"] = n
        if n > 0 and not first_byte[0]:
            first_byte[0] = True
            _beacon("fetching", ["fb=1", f"b={_fmt_bytes(n)}"])

    try:
        for idx, t in enumerate(tracks):
            if _drop_job.get("cancel"):
                raise _Cancelled()
            _journal(track=idx + 1)
            fn = _safe_file(t.get("file"))
            dest = folder / fn
            want = str(t.get("sha256") or "")
            with _drop_lock:
                _drop_job["current"] = fn
                _drop_job["current_bytes"] = 0
            if dest.exists() and _sha256_file(dest) == want:
                got = dest.stat().st_size  # already landed: skip the fetch
            else:
                got = _fetch_track(opener, t, folder, progress)
            with _drop_lock:
                _drop_job["done"] += 1
                _drop_job["done_bytes"] += got
                _drop_job["current_bytes"] = 0
                done_now = _drop_job["done"]
                bytes_now = _drop_job["done_bytes"]
            if time.time() - last_beacon[0] >= 15:
                last_beacon[0] = time.time()
                _beacon("fetching", [f"t={done_now}/{len(tracks)}",
                                     f"b={_fmt_bytes(bytes_now)}"])
    except _Cancelled:
        with _drop_lock:
            _drop_job.update({"state": "cancelled", "current": ""})
        _journal(phase="cancelled")
        _beacon("cancelled", [f"t={_drop_job.get('done', 0)}/{len(tracks)}"])
        return
    # Verify: fsync everything, then RE-HASH every file from disk at its
    # final path — the streaming hash is not trusted for the one report
    # that deletes the R2 copies.
    _trail_add("V")
    _journal(phase="verifying")
    for t in tracks:
        dest = folder / _safe_file(t.get("file"))
        _fsync_file(dest)
        if _sha256_file(dest) != str(t.get("sha256") or ""):
            raise ValueError(f"checksum mismatch on {_safe_file(t.get('file'))} after landing")
    _fsync_dir(folder)
    # Commit: mark installed (atomically), rescan, then report done.
    _trail_add("C")
    _journal(phase="committing")
    inst = _drops_installed()
    inst[did] = {"playlist": drop.get("playlist", did), "tracks": len(tracks),
                 "at": datetime.now().isoformat(timespec="seconds")}
    _atomic_write(DROPS_STATE_FILE, json.dumps(inst))
    try:
        player().update()
    except Exception:
        pass
    _trail_add("D")
    _journal(phase="done")
    with _drop_lock:
        _drop_job.update({"state": "done", "current": ""})
    proof = hashlib.sha256(
        (did + "\n" + "\n".join(sorted(str(t.get("sha256") or "")
                                       for t in tracks))).encode()
    ).hexdigest()[:16]
    _beacon("done", [f"ok={len(tracks)}/{len(tracks)}", f"sz={total_bytes}",
                     f"px={proof}", f"b={_fmt_bytes(total_bytes)}"])


def _drop_guarded(drop):
    """The whole job — setup included — inside one guard. In v1.6.3 the
    setup ran outside the try; a PermissionError there killed the thread
    with no state change and no report. That class of death is now
    impossible: anything raised here becomes the job's error state AND
    a beacon."""
    try:
        _drop_run(drop)
    except _PfFail as pf:
        with _drop_lock:
            _drop_job.update({"state": "error", "error": str(pf), "current": ""})
            job = dict(_drop_job)
        _journal(phase="error")
        _beacon("pf_fail", list(pf.segs) + [
            f"t={job.get('done', 0)}/{job.get('total', 0)}"])
    except BaseException as e:
        msg = f"{type(e).__name__}: {e}"
        with _drop_lock:
            _drop_job.update({"state": "error", "error": msg, "current": ""})
            job = dict(_drop_job)
        _journal(phase="error")
        _beacon("error", [f"e={_ecode(e)}@job {msg}"[:200],
                          f"t={job.get('done', 0)}/{job.get('total', 0)}",
                          f"b={_fmt_bytes(job.get('done_bytes', 0))}"])


def drops_install(drop_id):
    global _job_counter
    with _drop_lock:
        busy = _drop_job.get("state") in ("starting", "downloading")
    if busy:
        return {"ok": False, "error": "A download is already running"}
    try:
        man = _drops_manifest()
    except Exception as e:
        return {"ok": False, "error": f"Couldn't fetch the drop list ({e})"}
    drop = next((d for d in man.get("drops", []) if str(d.get("id")) == str(drop_id)), None)
    if not drop:
        return {"ok": False, "error": "That drop is no longer offered"}
    gate = _gate_manifest(drop)
    if gate:
        return {"ok": False,
                "error": f"That drop can't be verified ({gate}) — Hue needs to re-stage it"}
    tracks = drop.get("tracks", [])
    with _drop_lock:
        _job_counter += 1
        job_no = _job_counter
        _drop_job.clear()
        _drop_job.update({"state": "starting", "drop": str(drop_id),
                          "job": job_no, "trail": "Q", "done": 0,
                          "total": len(tracks), "current": "", "error": "",
                          "done_bytes": 0, "current_bytes": 0,
                          "total_bytes": sum(int(t.get("bytes") or 0) for t in tracks),
                          "cancel": False})
    _journal(did=str(drop_id), job=job_no, phase="queued", trail="Q",
             track=0, total=len(tracks), pid=os.getpid(), boot_id=_boot_id(),
             started=datetime.now().isoformat(timespec="seconds"))
    _beacon("queued", [f"t=0/{len(tracks)}"])
    threading.Thread(target=_drop_guarded, args=(drop,), daemon=True).start()
    return {"ok": True, "started": True, "id": str(drop_id)}


def drops_cancel():
    if _drop_job.get("state") in ("starting", "downloading"):
        _drop_job["cancel"] = True
        return {"ok": True, "cancelling": True}
    return {"ok": False, "error": "Nothing is downloading"}


# ---------------------------------------------------------------- web app
UI = r"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#f7f1de"><title>Hues Music Server</title>
<link rel="manifest" href="/manifest.json">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>
/* Print Edition theme — mirrors hues.flowers/m (p.css): warm cream paper,
   deep-green ink, flat gold, seed-packet cards with a dashed stitch rule.
   v1.4.0 polish: iOS-style hierarchy — one job per screen, grouped lists,
   switches instead of buttons, 44px targets, quiet chrome. */
:root{--paper:#f7f1de;--paper2:#fffdf4;--ink:#2e4438;--deep:#23362b;--gold:#b08d37;--golddeep:#927128;--sage:#5a6b58;--line:#e0d5b8;--bad:#a8564d}
*{box-sizing:border-box}body{margin:0;font-family:Inter,-apple-system,system-ui,Segoe UI,Roboto,sans-serif;background:var(--paper);color:var(--ink);padding-bottom:96px;-webkit-tap-highlight-color:transparent;-webkit-font-smoothing:antialiased;overscroll-behavior-y:none}
::selection{background:rgba(176,141,55,.35)}
header{padding:22px 16px 0;text-align:center}
.eyebrow{font-size:10.5px;letter-spacing:.34em;text-transform:uppercase;color:var(--golddeep);font-weight:600}
h1{font-family:Fraunces,Georgia,'Times New Roman',serif;font-size:30px;margin:5px 0 2px;font-weight:600}
.rule{display:flex;align-items:center;gap:10px;margin:12px 26px 0}
.rule::before,.rule::after{content:'';height:1px;flex:1;background:linear-gradient(to right,transparent,var(--gold),transparent)}
.rule i{width:7px;height:7px;background:var(--gold);transform:rotate(45deg);display:block}
.bannerrow{margin-top:10px;min-height:0}
.connbanner{margin:10px 12px 0;background:#f6e3dd;border:1px solid var(--bad);color:#7c3a30;border-radius:12px;padding:12px 14px;font-size:15px;font-weight:600;text-align:center;cursor:pointer}
.chev{color:var(--sage);font-size:22px;flex:0 0 auto;padding:0 2px}
.pill{display:inline-block;background:var(--paper2);border:1px solid var(--line);border-radius:999px;padding:4px 12px;font-size:12.5px;color:var(--sage);white-space:nowrap}
.ringbtn{width:48px;height:48px;flex:0 0 auto;cursor:pointer;-webkit-tap-highlight-color:transparent}
.ringbtn:active{transform:scale(.92);opacity:.7}
#wiimState{flex:0 0 auto}
.pill.live{color:var(--golddeep);border-color:var(--gold);font-weight:600}
.secthead{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--golddeep);font-weight:600;margin:20px 16px 0}
.card{background:var(--paper2);border:1px solid var(--line);border-radius:14px;box-shadow:0 12px 32px rgba(46,68,56,.08);padding:16px;margin:8px 12px 4px;position:relative}
.card::after{content:'';position:absolute;inset:0;border-radius:inherit;outline:1.5px dashed rgba(146,113,40,.45);outline-offset:-7px;pointer-events:none}
button{background:var(--paper2);color:var(--ink);border:1px solid var(--gold);border-radius:10px;padding:11px 14px;font-size:16px;min-height:44px;touch-action:manipulation;cursor:pointer;transition:transform .08s ease}
button:active{transform:scale(.96)}
button.primary{background:var(--deep);color:var(--paper);border-color:var(--deep);font-weight:700}
button.on{background:var(--gold);color:var(--deep);border-color:var(--gold);font-weight:700}
button.danger{background:transparent;border-color:var(--bad);color:var(--bad)}
button.plain{border-color:var(--line);color:var(--sage)}
input,select{background:var(--paper2);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:11px;font-size:16px;width:100%;min-height:44px}
input:focus,select:focus{outline:2px solid var(--gold);outline-offset:0;border-color:var(--gold)}
.row{display:flex;gap:8px;align-items:center}.row>*{flex:0 1 auto}.grow{flex:1 1 auto}
label{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--golddeep);font-weight:600;display:block;margin:12px 0 4px}
label:first-child{margin-top:0}
.big{font-family:Fraunces,Georgia,'Times New Roman',serif;font-size:20px;font-weight:600}.dim{color:var(--sage);font-size:14px;line-height:1.45}
.nptitle{font-family:Fraunces,Georgia,'Times New Roman',serif;font-size:25px;font-weight:600;line-height:1.2;margin-top:2px}
.npartist{color:var(--sage);font-size:16px;margin-top:3px}
.prog{height:5px;border-radius:99px;background:var(--line);margin:16px 0 6px;overflow:hidden}
.progfill{height:100%;width:0%;background:var(--gold);border-radius:99px;transition:width 1s linear}
.times{display:flex;justify-content:space-between;font-size:13px;color:var(--sage);font-variant-numeric:tabular-nums}
.transport{display:flex;justify-content:center;align-items:center;gap:26px;margin:14px 0 6px}
.transport button{border-radius:50%;display:flex;align-items:center;justify-content:center;padding:0}
#btnPlay{width:74px;height:74px;font-size:29px;background:var(--deep);color:var(--paper);border-color:var(--deep)}
#btnPrev,#btnNext{width:52px;height:52px;font-size:19px;border-color:var(--line);color:var(--ink)}
.toggles{display:flex;justify-content:center;gap:8px;margin-top:8px}
.toggles button{font-size:14px;min-height:38px;padding:7px 14px;border-radius:999px;border-color:var(--line);color:var(--sage)}
.toggles button.on{background:var(--gold);border-color:var(--gold);color:var(--deep)}
.stepper{display:flex;align-items:center;gap:10px;margin:2px 0 6px}
.stepper button{width:62px;height:50px;font-size:26px;line-height:1;flex:0 0 auto;font-weight:600;padding:0}
.stepval{flex:1;text-align:center;font-family:Fraunces,Georgia,serif;font-size:25px;font-weight:600}
.switch{position:relative;width:50px;height:30px;flex:0 0 auto;-webkit-appearance:none;appearance:none;background:#ddd3b4;border-radius:99px;border:none;padding:0;min-height:0;cursor:pointer;transition:background .18s;outline:none}
.switch::after{content:'';position:absolute;top:2px;left:2px;width:26px;height:26px;border-radius:50%;background:#fffdf4;box-shadow:0 1px 4px rgba(35,54,43,.35);transition:left .18s}
.switch:checked{background:var(--deep)}
.switch:checked::after{left:22px}
.switch.sm{width:44px;height:26px}.switch.sm::after{width:22px;height:22px}.switch.sm:checked::after{left:20px}
.setrow{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line)}
.setrow:last-child{border-bottom:none;padding-bottom:2px}
.setrow .grow{font-size:16px}
nav{position:fixed;left:0;right:0;bottom:0;background:rgba(255,253,244,.94);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4);display:flex;border-top:1px solid var(--line);padding:6px 4px calc(6px + env(safe-area-inset-bottom));z-index:30}
nav button{flex:1;background:none;border:none;font-size:11px;line-height:1.25;color:var(--sage);min-height:50px;padding:4px 0}
nav button .ic{font-size:21px}
nav button.sel{color:var(--golddeep);font-weight:700}
.track{display:flex;gap:10px;align-items:center;padding:11px 2px;border-bottom:1px solid var(--line)}
.track:last-child{border-bottom:none;padding-bottom:4px}
.track .t{font-weight:600;font-size:16px}
.track .s{color:var(--sage);font-size:13.5px;margin-top:1px}
.playbtn{width:46px;height:46px;border-radius:50%;background:var(--deep);color:var(--paper);border-color:var(--deep);font-size:16px;padding:0;flex:0 0 auto;display:flex;align-items:center;justify-content:center}
.mini{font-size:14px;min-height:40px;padding:7px 12px}
.hide{display:none!important}
.days{display:flex;gap:6px;flex-wrap:wrap}.days button{padding:8px 12px;font-size:14px;min-height:40px}
details.more{margin-top:12px;border-top:1px solid var(--line);padding-top:10px}
details.more summary{color:var(--golddeep);font-size:14px;font-weight:600;cursor:pointer;list-style:none;padding:4px 0}
details.more summary::-webkit-details-marker{display:none}
details.more summary::after{content:' ›';color:var(--sage)}
details.more[open ] summary::after{content:' ⌄'}
.empty{text-align:center;color:var(--sage);padding:14px 6px;font-size:15px}
.empty .serif{font-family:Fraunces,Georgia,serif;font-size:18px;color:var(--ink);display:block;margin-bottom:3px}
#toast{position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(16px);background:var(--deep);color:var(--paper);font-size:15px;font-weight:600;padding:11px 18px;border-radius:999px;box-shadow:0 10px 28px rgba(35,54,43,.35);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;z-index:50;white-space:nowrap}
#toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
a{color:var(--golddeep)}
</style></head><body>
<header><div class="eyebrow">Hues Floral Park</div><h1>Hues Music Server</h1><div class="rule"><i></i></div><div class="bannerrow"><span class="pill hide" id="schedBanner"></span></div></header>
<div class="connbanner hide" id="connBanner">Can't reach the music server — tap to retry</div>

<section id="tab-now">
  <div class="secthead">Now Playing</div>
  <div class="card">
    <div class="nptitle" id="npTitle">—</div>
    <div class="npartist" id="npArtist"></div>
    <div style="margin-top:8px"><span class="pill hide" id="npPlaylist"></span></div>
    <div class="prog" id="npProg"><div class="progfill" id="npProgFill"></div></div>
    <div class="times"><span id="npElapsed">0:00</span><span id="npDur">0:00</span></div>
    <div class="transport" id="transportRow">
      <button id="btnPrev" aria-label="Previous track">⏮</button>
      <button id="btnPlay" aria-label="Play or pause">▶</button>
      <button id="btnNext" aria-label="Next track">⏭</button>
    </div>
    <div class="toggles"><button id="btnShuffle">Shuffle</button><button id="btnRepeat">Repeat</button><button id="btnResume" class="hide">Resume schedule</button></div>
    <button id="btnPickPl" class="primary hide" style="width:100%;margin-top:12px">Choose a playlist</button>
  </div>
  <div class="secthead">Park Speakers</div>
  <div class="card">
    <label>WiiM volume</label>
    <div class="stepper"><button id="wiimDown" aria-label="WiiM volume down">−</button><span class="stepval" id="wiimVolVal">—</span><button id="wiimUp" aria-label="WiiM volume up">+</button></div>
    <div class="row" style="margin-top:8px"><span class="pill" id="wiimState">…</span><span class="dim grow" id="wiimInfo">—</span></div>
    <div class="row" id="wiimBtns" style="margin-top:12px"><button id="btnWiimPlay" class="primary grow">Play on the WiiM</button><button id="btnWiimStop">Stop WiiM</button></div>
  </div>
  <div id="queueCard">
    <div class="secthead">Up Next</div>
    <div class="card"><div id="queue"></div></div>
  </div>
</section>

<section id="tab-playlists" class="hide">
  <div class="secthead">Playlists</div>
  <div class="card"><div id="playlistList"></div></div>
  <div class="card" style="margin-top:12px">
    <button id="btnShowNewPl" class="plain" style="width:100%">＋ New playlist</button>
    <div id="newPlForm" class="hide">
      <div class="row"><input id="newPlName" class="grow" placeholder="e.g. Christmas Morning" style="flex:1 1 auto"><button id="btnNewPl" class="primary">Create</button></div>
      <div class="dim" style="margin-top:8px">Then add tracks from the Library tab.</div>
    </div>
  </div>
  <div class="card hide" id="plDetail"><div class="big" id="plDetailName"></div><div id="plTracks"></div></div>
</section>

<section id="tab-schedule" class="hide">
  <div class="secthead">Schedule</div>
  <div class="card">
    <div class="setrow"><span class="grow">Schedule on</span><input type="checkbox" class="switch" id="schedToggle"></div>
    <div class="dim" style="margin:8px 0 2px">A playlist for each part of the day. Playing something yourself overrides the schedule until the next block starts.</div>
    <div id="schedList"></div>
  </div>
  <div class="secthead" id="scFormHead">Add a Block</div>
  <div class="card">
    <label>Name</label><input id="scName" placeholder="e.g. Morning in the Park">
    <label>Playlist</label><select id="scPlaylist"></select>
    <label>Days</label><div class="days" id="scDays"></div>
    <div class="row"><div class="grow"><label>Start</label><input type="time" id="scStart" value="09:00"></div><div class="grow"><label>End</label><input type="time" id="scEnd" value="17:00"></div></div>
    <details class="more"><summary>Volume &amp; crossfade (optional)</summary>
      <label>Park volume — WiiM % (required for a Volume-only block)</label><input type="number" id="scVol" min="0" max="100" placeholder="Leave blank = no change">
      <label>Crossfade seconds</label><input type="number" id="scXf" min="0" max="12" placeholder="Leave blank = current">
    </details>
    <div class="row" style="margin-top:14px"><button id="btnCancelEdit" class="plain hide">Cancel</button><button id="btnAddSched" class="primary grow">Add block</button></div>
    <button id="btnDelBlock" class="danger hide" style="width:100%;margin-top:10px">Delete this block</button>
  </div>
</section>

<section id="tab-library" class="hide">
  <div class="secthead">Library</div>
  <div class="card hide" id="dropCard">
    <div style="font-weight:700;margin-bottom:4px">New music from Hue</div>
    <div id="dropList"></div>
    <div id="dropProg" class="track hide" style="border-top:1px dashed var(--line);margin-top:6px;padding-top:10px">
      <div class="ringbtn" id="dropRingBtn" role="button" aria-label="Stop download" title="Stop download">
        <svg width="48" height="48" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--line)" stroke-width="3"/>
          <circle id="dropRing" cx="18" cy="18" r="15.5" fill="none" stroke="var(--gold)" stroke-width="3" stroke-linecap="round" stroke-dasharray="97.39" stroke-dashoffset="97.39" transform="rotate(-90 18 18)"/>
          <rect x="14.5" y="14.5" width="7" height="7" rx="1.5" fill="var(--ink)"/>
        </svg>
      </div>
      <span class="grow"><span class="t" id="dropProgTitle">Downloading…</span><div class="s" id="dropProgSub"></div></span>
    </div>
    <div id="dropStatus" class="dim" style="margin-top:6px"></div>
  </div>
  <div class="card">
    <input id="libSearch" placeholder="Search tracks…">
    <div id="libTargetRow" class="hide"><label>Add tapped tracks to</label><select id="libTarget"></select></div>
    <div id="libList"></div>
    <button id="btnRescan" class="plain" style="width:100%;margin-top:12px">Rescan music folder</button>
    <div class="dim" style="margin-top:6px;text-align:center">Run this after adding new music files to the Pi.</div>
  </div>
</section>

<section id="tab-settings" class="hide">
  <div class="secthead">Playback</div>
  <div class="card">
    <label>Crossfade</label>
    <div class="stepper"><button id="xfDown" aria-label="Crossfade down">−</button><span class="stepval" id="xfVal">—</span><button id="xfUp" aria-label="Crossfade up">+</button></div>
    <div class="dim">6 seconds is your park standard. Applies to the next track change.</div>
    <label>Stream volume</label>
    <div class="stepper"><button id="volDown" aria-label="Stream volume down">−</button><span class="stepval" id="volVal">—</span><button id="volUp" aria-label="Stream volume up">+</button></div>
    <div class="dim">A fine trim applied before the music reaches the WiiM. For everyday loudness, use the WiiM volume on the Now screen.</div>
  </div>
  <div class="secthead">WiiM Pro</div>
  <div class="card">
    <label>IP address (on the farm network)</label><input id="setWiimIp" placeholder="e.g. 192.168.1.50">
    <div class="dim">Find it in the WiiM Home app: Device → ⚙ → Speaker Info. Tip: reserve this IP in your router so it never changes.</div>
    <div class="setrow" style="margin-top:6px"><span class="grow">Start WiiM when music plays</span><input type="checkbox" class="switch" id="setWiimAuto"></div>
    <div class="setrow"><span class="grow">WiiM integration</span><input type="checkbox" class="switch" id="setWiimOn"></div>
    <div class="row" style="margin-top:12px"><button id="btnSaveSettings" class="primary grow">Save settings</button><button id="btnTestWiim">Test WiiM</button></div>
    <div class="dim" id="testResult" style="margin-top:6px"></div>
  </div>
  <div class="secthead">Phone Control From Anywhere</div>
  <div class="card">
    <div class="big" style="margin-bottom:4px">Tailscale</div>
    <div class="dim" id="tsInfo">Checking…</div>
    <div class="row" style="margin-top:12px"><button id="btnTs" class="primary">Connect Tailscale</button><a id="tsLink" href="#" target="_blank" class="hide">Tap here to sign in →</a></div>
    <div class="dim" style="margin-top:8px">Tap Connect and sign in (free Tailscale account), then install the Tailscale app on your phone with the same account. After that, this page opens from anywhere — nothing is exposed to the public internet. On farm Wi-Fi you don't need it.</div>
  </div>
  <div class="secthead">App Updates</div>
  <div class="card">
    <div class="dim" id="updInfo">Version —</div>
    <div class="row" style="margin-top:12px"><button id="btnUpdCheck" class="primary grow">Check for updates</button><button id="btnUpdInstall" class="hide">Install update</button></div>
    <div class="dim" style="margin-top:8px">From hues.flowers, checksum-verified before installing. The app restarts itself (~15 seconds) and rolls back automatically if the new version isn't healthy. Music, playlists and schedules are never touched.</div>
  </div>
  <div class="secthead">About</div>
  <div class="card"><div class="dim">The Pi mixes playlists with your crossfade and streams them like a private radio station to the WiiM Pro → amp → park speakers, so crossfades and schedules always hold. Stream: <span id="streamUrlTxt"></span></div>
  <div class="dim" id="serverInfo" style="margin-top:6px">—</div></div>
</section>

<nav>
  <button data-tab="now" class="sel"><span class="ic">🎵</span><br>Now</button>
  <button data-tab="playlists"><span class="ic">📋</span><br>Playlists</button>
  <button data-tab="schedule"><span class="ic">🕐</span><br>Schedule</button>
  <button data-tab="library"><span class="ic">🎶</span><br>Library</button>
  <button data-tab="settings"><span class="ic">⚙️</span><br>Settings</button>
</nav>
<div id="toast"></div>

<script>
const $=id=>document.getElementById(id);
let S=null, playlists=[], library=[], selDays=new Set([0,1,2,3,4,5,6]), openPl=null;
const fmt=s=>{s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
async function api(path,body){const r=await fetch(path,{method:body?"POST":"GET",headers:{"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});const j=await r.json();if(!r.ok)throw new Error(j.error||r.status);return j}
let toastT=null;
function showToast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("show"),2400)}
window.addEventListener("unhandledrejection",()=>showToast("Something went wrong — try again"));
const fmtT=t=>{if(!t)return"";let[h,m]=t.split(":").map(Number);const ap=h>=12?"PM":"AM";h=h%12||12;return h+":"+String(m).padStart(2,"0")+" "+ap};
$("playlistList").innerHTML='<div class="empty">Loading…</div>';$("schedList").innerHTML='<div class="empty">Loading…</div>';$("libList").innerHTML='<div class="empty">Loading…</div>';
function tab(name){document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("sel",b.dataset.tab===name));["now","playlists","schedule","library","settings"].forEach(t=>$("tab-"+t).classList.toggle("hide",t!==name));try{history.replaceState(null,"","#"+name)}catch(e){}window.scrollTo(0,0);if(name==="playlists")loadPlaylists();if(name==="schedule")loadSchedules();if(name==="library")loadLibrary();if(name==="settings")loadSettings();}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>tab(b.dataset.tab));
window.addEventListener("hashchange",()=>{const h=(location.hash||"").replace("#","");if(["now","playlists","schedule","library","settings"].includes(h))tab(h)});
async function refresh(){
  try{S=await api("/api/status")}catch(e){$("connBanner").classList.remove("hide");return}
  $("connBanner").classList.add("hide");
  const st=S.player, cs=S.current||{};
  const idle=st.state==="stop"&&!(cs.Title||cs.title);
  $("npTitle").textContent=idle?"Nothing playing":(cs.Title||cs.title||"—");
  $("npArtist").textContent=idle?"Pick a playlist and the park fills with music.":(cs.Artist||cs.artist||"");
  $("btnPickPl").classList.toggle("hide",!idle);
  $("transportRow").classList.toggle("hide",idle);
  if(idle){$("npProgFill").style.width="0%";$("npElapsed").textContent="0:00";$("npDur").textContent=""}
  const np=S.now_playlist?("Playlist · "+S.now_playlist):"";$("npPlaylist").textContent=np;$("npPlaylist").classList.toggle("hide",!np);
  $("btnPlay").textContent=st.state==="play"?"❚❚":"▶";
  if(st.duration){$("npProgFill").style.width=(100*(st.elapsed||0)/st.duration)+"%";$("npElapsed").textContent=fmt(st.elapsed);$("npDur").textContent="−"+fmt((st.duration||0)-(st.elapsed||0))}
  $("volVal").textContent=(st.volume??S.settings.volume)+"%";
  $("wiimVolVal").textContent=S.settings.wiim_volume+"%";
  $("xfVal").textContent=S.settings.crossfade+"s";
  $("btnShuffle").className=st.random==="1"?"on":"";$("btnRepeat").className=st.repeat==="1"?"on":"";
  const sb=S.schedule||{};
  const bTxt=!S.settings.scheduler_enabled?"Schedule is off":sb.overridden?"Schedule overridden — you're driving":sb.active?("On schedule · "+sb.active):"";
  $("schedBanner").textContent=bTxt;$("schedBanner").classList.toggle("hide",!bTxt);$("schedBanner").classList.toggle("live",!!sb.active&&!sb.overridden);
  $("btnResume").classList.toggle("hide",!sb.overridden);
  const w=S.wiim||{};
  $("wiimState").textContent=!w.configured?"Not set up":w.demo?"Demo":w.reachable?(w.status==="play"?"Playing":"Connected"):"Unreachable";
  $("wiimState").classList.toggle("live",!!(w.reachable&&w.status==="play"));
  $("wiimInfo").textContent=!w.configured?"Set up the WiiM in Settings to control the park speakers.":!w.reachable?"Can't reach the WiiM — check it's on and connected to the farm Wi-Fi.":(w.name||"WiiM");
  $("btnWiimPlay").classList.toggle("hide",!(w.configured&&w.reachable&&w.status!=="play"));
  $("btnWiimStop").classList.toggle("hide",!(w.configured&&w.reachable&&w.status==="play"));
  $("wiimBtns").classList.toggle("hide",!(w.configured&&w.reachable));
  $("streamUrlTxt").textContent=S.stream_url;
  if(S.now_playlist!==refresh._np){refresh._np=S.now_playlist;if(!$("tab-playlists").classList.contains("hide"))loadPlaylists()}
  const q=(S.queue||[]);const cur=+st.song||0;
  $("queueCard").classList.toggle("hide",!q.length);
  $("queue").innerHTML=q.slice(0,12).map((t,i)=>`<div class="track"><span class="grow"><span class="t">${i===cur?"▶ ":""}${t.Title||t.file}</span>${t.Artist?`<div class="s">${t.Artist}</div>`:""}</span></div>`).join("")+(q.length>12?`<div class="dim" style="padding-top:8px">…and ${q.length-12} more</div>`:"");
}
setInterval(refresh,3000);
$("btnPlay").onclick=async()=>{await api("/api/control",{action:S.player.state==="play"?"pause":"play"});refresh()};
$("btnNext").onclick=async()=>{await api("/api/control",{action:"next"});refresh()};
$("btnPrev").onclick=async()=>{await api("/api/control",{action:"previous"});refresh()};
$("btnShuffle").onclick=async()=>{await api("/api/settings",{random:S.player.random!=="1"});refresh()};
$("btnRepeat").onclick=async()=>{await api("/api/settings",{repeat:S.player.repeat!=="1"});refresh()};
$("btnResume").onclick=async()=>{await api("/api/schedule/resume",{});showToast("Back on schedule");refresh()};
$("btnPickPl").onclick=()=>tab("playlists");
$("connBanner").onclick=()=>refresh();
const clampN=(v,a,b)=>Math.max(a,Math.min(b,v));
$("wiimUp").onclick=async()=>{await api("/api/wiim/volume",{volume:clampN(S.settings.wiim_volume+5,0,100)});refresh()};
$("wiimDown").onclick=async()=>{await api("/api/wiim/volume",{volume:clampN(S.settings.wiim_volume-5,0,100)});refresh()};
$("volUp").onclick=async()=>{await api("/api/settings",{volume:clampN(S.settings.volume+5,0,100)});refresh()};
$("volDown").onclick=async()=>{await api("/api/settings",{volume:clampN(S.settings.volume-5,0,100)});refresh()};
$("xfUp").onclick=async()=>{await api("/api/settings",{crossfade:clampN(S.settings.crossfade+1,0,12)});refresh()};
$("xfDown").onclick=async()=>{await api("/api/settings",{crossfade:clampN(S.settings.crossfade-1,0,12)});refresh()};
$("btnWiimPlay").onclick=async()=>{try{await api("/api/wiim/play",{});showToast("Sent to WiiM — give it a few seconds")}catch(e){alert(e.message)}refresh()};
$("btnWiimStop").onclick=async()=>{await api("/api/wiim/stop",{});refresh()};
async function loadPlaylists(){
  playlists=await api("/api/playlists");
  const npName=S?S.now_playlist:null, playing=S&&S.player&&(S.player.state==="play"||S.player.state==="pause");
  $("playlistList").innerHTML=playlists.map(p=>`<div class="track" onclick="if(event.target.tagName!=='BUTTON')playPl('${p.ref.replace(/'/g,"\\'")}',false)"><span class="grow"><span class="t">${p.name}</span>${playing&&p.name===npName?' <span class="pill live">Playing</span>':""}<div class="s">${p.count} tracks · ${p.kind==="folder"?"Folder":p.kind==="all"?"Everything":"Custom"}</div></span><button class="mini" onclick="playPl('${p.ref.replace(/'/g,"\\'")}',true)" aria-label="Shuffle ${p.name}">🔀</button><button class="playbtn" onclick="playPl('${p.ref.replace(/'/g,"\\'")}',false)" aria-label="Play ${p.name}">▶</button>${p.kind==="custom"?`<button class="mini plain" onclick="openPl('${p.ref}')">Tracks</button>`:""}</div>`).join("")||'<div class="empty"><span class="serif">No playlists yet</span>Add music to the Pi to get started.</div>';
  const opts=playlists.map(p=>`<option value="${p.ref}">${p.name}</option>`).join("");
  $("scPlaylist").innerHTML=opts+`<option value="volume-only">🔊 Volume only — don't change the music</option>`;
  const customs=playlists.filter(p=>p.kind==="custom");
  $("libTarget").innerHTML=customs.map(p=>`<option value="${p.ref}">${p.name}</option>`).join("");
  $("libTargetRow").classList.toggle("hide",!customs.length);
}
window.playPl=async(ref,sh)=>{await api("/api/playlists/play",{ref,shuffle:sh});tab("now");refresh()};
window.openPl=async(ref)=>{openPl=ref;const p=playlists.find(x=>x.ref===ref);if(!library.length){try{library=await api("/api/library")}catch(e){}}const titleOf=f=>{const e=library.find(x=>x.file===f);return e?e.title:f};$("plDetail").classList.remove("hide");$("plDetailName").textContent=p.name;$("plTracks").innerHTML=p.tracks.map((t,i)=>`<div class="track"><span class="grow">${titleOf(t)}</span><button class="danger mini" onclick="delTrack(${i})">Remove</button></div>`).join("")||'<div class="empty">No tracks yet — add some from the Library tab.</div>';$("plDetail").scrollIntoView({behavior:"smooth"})};
window.delTrack=async i=>{const p=playlists.find(x=>x.ref===openPl);p.tracks.splice(i,1);await api("/api/playlists/save",{id:openPl.split(":")[1],name:p.name,tracks:p.tracks});loadPlaylists();openPl=openPl;};
$("btnShowNewPl").onclick=()=>{$("newPlForm").classList.remove("hide");$("btnShowNewPl").classList.add("hide");$("newPlName").focus()};
$("btnNewPl").onclick=async()=>{const n=$("newPlName").value.trim();if(!n)return;await api("/api/playlists/save",{name:n,tracks:[]});$("newPlName").value="";$("newPlForm").classList.add("hide");$("btnShowNewPl").classList.remove("hide");showToast("Playlist created");loadPlaylists()};
let scheds=[], editingId=null;
const DN=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
function renderDays(){$("scDays").innerHTML=DN.map((n,i)=>`<button class="${selDays.has(i)?"on":""}" onclick="togDay(${i})">${n}</button>`).join("")}
async function loadSchedules(){
  const d=await api("/api/schedules");await loadPlaylists();
  scheds=d.schedules;
  $("schedToggle").checked=!!(S&&S.settings.scheduler_enabled);
  $("schedList").innerHTML=scheds.map(s=>`<div class="track" onclick="editSched('${s.id}')" style="cursor:pointer"><span class="grow"><span class="t">${s.name}</span><div class="s">${fmtT(s.start)}–${fmtT(s.end)} · ${s.playlist_name||s.playlist_ref}${s.volume!=null?(s.playlist_ref==="volume-only"?` · ${s.volume}%`:` · 🔊 ${s.volume}%`):""}${s.crossfade!=null?` · crossfade ${s.crossfade}s`:""}</div><div class="s">${s.days.map(x=>DN[x]).join(" ")}</div></span><input type="checkbox" class="switch sm" ${s.enabled?"checked":""} onclick="event.stopPropagation()" onchange="togSched('${s.id}',this.checked)" aria-label="Enable ${s.name}"><span class="chev">›</span></div>`).join("")||'<div class="empty"><span class="serif">No blocks yet</span>Add your first one below.</div>';
  renderDays();
}
window.togDay=i=>{selDays.has(i)?selDays.delete(i):selDays.add(i);renderDays()};
window.togSched=async(id,en)=>{await api("/api/schedules/toggle",{id,enabled:en});const s=scheds.find(x=>x.id===id);if(s)s.enabled=en};
window.editSched=id=>{const s=scheds.find(x=>x.id===id);if(!s)return;editingId=id;$("scName").value=s.name;$("scPlaylist").value=s.playlist_ref;selDays=new Set(s.days);renderDays();$("scStart").value=s.start;$("scEnd").value=s.end;$("scVol").value=s.volume!=null?s.volume:"";$("scXf").value=s.crossfade!=null?s.crossfade:"";if(s.volume!=null||s.crossfade!=null)document.querySelector("details.more").open=true;$("scFormHead").textContent="Edit Block";$("btnAddSched").textContent="Save changes";$("btnCancelEdit").classList.remove("hide");$("btnDelBlock").classList.remove("hide");$("scFormHead").scrollIntoView({behavior:"smooth"})};
function resetSchedForm(){editingId=null;$("scName").value="";$("scVol").value="";$("scXf").value="";selDays=new Set([0,1,2,3,4,5,6]);renderDays();$("scFormHead").textContent="Add a Block";$("btnAddSched").textContent="Add block";$("btnCancelEdit").classList.add("hide");$("btnDelBlock").classList.add("hide")}
$("btnCancelEdit").onclick=()=>resetSchedForm();
$("btnDelBlock").onclick=async()=>{if(!editingId)return;if(!confirm("Delete this block? The park will follow the remaining blocks instead."))return;await api("/api/schedules/delete",{id:editingId});showToast("Block deleted");resetSchedForm();loadSchedules()};
$("schedToggle").onchange=async()=>{await api("/api/settings",{scheduler_enabled:$("schedToggle").checked});showToast($("schedToggle").checked?"Schedule on":"Schedule off");await refresh();loadSchedules()};
$("btnAddSched").onclick=async()=>{const v=$("scVol").value,x=$("scXf").value;if($("scPlaylist").value==="volume-only"&&v===""){alert("A Volume-only block needs a volume level.");return}const body={name:$("scName").value||"Block",playlist_ref:$("scPlaylist").value,days:[...selDays].sort(),start:$("scStart").value,end:$("scEnd").value,volume:v===""?null:+v,crossfade:x===""?null:+x,enabled:true};if(editingId){body.id=editingId;const cur=scheds.find(s=>s.id===editingId);if(cur)body.enabled=cur.enabled}try{await api("/api/schedules/save",body);showToast(editingId?"Block updated":"Block added");resetSchedForm();loadSchedules()}catch(e){alert(e.message)}};
async function loadLibrary(){
  loadDrops();
  library=await api("/api/library");await loadPlaylists();renderLib();
}
async function loadDrops(){
  try{const d=await api("/api/drops");const card=$("dropCard");
    if(!d.ok||!d.drops.length){card.classList.add("hide");return}
    card.classList.remove("hide");
    const job=d.job||{};
    $("dropList").innerHTML=d.drops.map(x=>`<div class="track"><span class="grow"><span class="t">${x.playlist}</span><div class="s">${x.tracks} tracks · ${x.mb} MB${x.notes?" · "+x.notes:""}</div></span>${x.installed?'<span class="pill">On the Pi</span>':((job.state==="downloading"||job.state==="starting")&&job.drop===x.id?'<span class="s">Downloading…</span>':`<button class="mini" onclick="installDrop('${x.id}')">Download</button>`)}</div>`).join("");
    if(job.state==="downloading"||job.state==="starting")pollDrop();
  }catch(e){}
}
window.installDrop=async id=>{
  const r=await api("/api/drops/install",{id});
  if(!r.ok){showToast(r.error||"Couldn't start the download");return}
  dropRowSynced=false;loadDrops();pollDrop();
};
$("dropRingBtn").onclick=async()=>{await api("/api/drops/cancel",{});};
const RING_C=97.39;
function fmtMB(b){return (b/1048576).toFixed(b>=10485760?0:1)}
function renderDropProg(j){
  const pct=j.total_bytes>0?Math.min(1,(j.done_bytes+(j.current_bytes||0))/j.total_bytes):(j.total?j.done/j.total:0);
  $("dropRing").style.strokeDashoffset=(RING_C*(1-pct)).toFixed(2);
  $("dropProgTitle").textContent=j.state==="starting"?"Starting download…":"Downloading · "+Math.round(pct*100)+"%";
  $("dropProgSub").textContent=(j.total_bytes>0?fmtMB(j.done_bytes+(j.current_bytes||0))+" of "+fmtMB(j.total_bytes)+" MB · ":"")+"Track "+Math.min(j.done+1,j.total)+" of "+j.total+(j.current?" · "+j.current:"");
}
let dropPolling=false,dropRowSynced=false;
function pollDrop(){
  if(dropPolling)return;dropPolling=true;
  $("dropProg").classList.remove("hide");
  const iv=setInterval(async()=>{
    try{const j=await api("/api/drops/status");
      if(j.state==="downloading"||j.state==="starting"){renderDropProg(j);if(!dropRowSynced){dropRowSynced=true;loadDrops()}return}
      clearInterval(iv);dropPolling=false;
      $("dropProg").classList.add("hide");
      if(j.state==="done"){$("dropStatus").textContent="";showToast("New music is on the Pi 🎶");loadLibrary()}
      else if(j.state==="cancelled"){$("dropStatus").textContent="Download stopped — tracks already saved stay on the Pi. Tap Download to pick up where it left off.";loadDrops()}
      else if(j.state==="error"){$("dropStatus").textContent="Download stopped: "+(j.error||"unknown error");loadDrops()}
      else{$("dropStatus").textContent="The download didn't start — Hue has been told automatically. Try again in a bit.";loadDrops()}
    }catch(e){clearInterval(iv);dropPolling=false;$("dropProg").classList.add("hide")}
  },1000);
}
function renderLib(){const q=($("libSearch").value||"").toLowerCase();const t=$("libTarget").value;
  $("libList").innerHTML=library.filter(x=>!q||(x.title+" "+x.artist+" "+x.file).toLowerCase().includes(q)).slice(0,200).map(x=>`<div class="track"><span class="grow"><span class="t">${x.title}</span><div class="s">${x.folder||""}</div></span><button class="playbtn" style="width:40px;height:40px;font-size:13px" onclick="playTrack('${x.file.replace(/'/g,"\\'")}')" aria-label="Play ${x.title}">▶</button>${t?`<button class="mini" onclick="addTrack('${x.file.replace(/'/g,"\\'")}')">＋ Add</button>`:""}</div>`).join("")||'<div class="empty"><span class="serif">No tracks found</span>Try a different search.</div>'}
$("libSearch").oninput=renderLib;$("libTarget").onchange=renderLib;
window.playTrack=async f=>{await api("/api/play-track",{file:f});tab("now");refresh()};
window.addTrack=async f=>{const ref=$("libTarget").value;const p=playlists.find(x=>x.ref===ref);if(!p)return;p.tracks.push(f);await api("/api/playlists/save",{id:ref.split(":")[1],name:p.name,tracks:p.tracks});showToast("Added to "+p.name)};
$("btnRescan").onclick=async()=>{await api("/api/rescan",{});showToast("Rescanning the music folder…");setTimeout(loadLibrary,1500)};
async function loadSettings(){$("setWiimIp").value=S?S.settings.wiim_ip:"";$("setWiimAuto").checked=S?!!S.settings.wiim_autoplay:true;$("setWiimOn").checked=S?!!S.settings.wiim_enabled:true;$("serverInfo").textContent="Version: v"+(S?S.version:"?")+" · Music folder: "+(S?S.music_dir:"");if(S)$("updInfo").textContent="Version v"+S.version+" — tap Check for updates.";refreshTs()}
async function refreshTs(){try{const t=await api("/api/tailscale/status");if(!t.installed){$("tsInfo").textContent="Tailscale isn't installed on this Pi.";return}$("tsInfo").textContent=t.state==="Running"?("Connected ✅ — offsite address: http://"+(t.ip||"")+":8080 (open that on your phone with Tailscale on, then Add to Home Screen)"):"Not connected yet — tap Connect and sign in.";if(t.auth_url){$("tsLink").href=t.auth_url;$("tsLink").classList.remove("hide")}}catch(e){}}
$("btnTs").onclick=async()=>{$("tsInfo").textContent="Starting Tailscale — getting your sign-in link…";const r=await api("/api/tailscale/connect",{});if(r.auth_url){$("tsLink").href=r.auth_url;$("tsLink").classList.remove("hide");$("tsInfo").textContent="Tap the sign-in link →"}else{setTimeout(refreshTs,3000)}};
let updAvail=null;
$("btnUpdCheck").onclick=async()=>{$("updInfo").textContent="Checking hues.flowers for updates…";$("btnUpdInstall").classList.add("hide");try{const c=await api("/api/update/check");if(!c.ok){$("updInfo").textContent=c.error;return}if(c.available){updAvail=c;$("updInfo").textContent="Update available: v"+c.latest+" (you have v"+c.current+")"+(c.notes?" — "+c.notes:"");$("btnUpdInstall").classList.remove("hide")}else{$("updInfo").textContent="You're on the latest version (v"+c.current+")."}}catch(e){$("updInfo").textContent="Check failed: "+e.message}};
$("btnUpdInstall").onclick=async()=>{if(!updAvail)return;if(!confirm("Install v"+updAvail.latest+" now? The app will restart (~15 seconds). Music keeps streaming from the Pi during the restart."))return;$("updInfo").textContent="Downloading and verifying the update…";try{const r=await api("/api/update/install",{});if(!r.ok){$("updInfo").textContent=r.error||"Install failed";return}$("updInfo").textContent=r.message||"Installing — the page will reload itself when the Pi is back…";let tries=0;const iv=setInterval(async()=>{tries++;try{const s=await api("/api/status");if(s.version===updAvail.latest){clearInterval(iv);$("updInfo").textContent="✅ Updated to v"+s.version;setTimeout(()=>location.reload(),1200)}}catch(e){}if(tries>40){clearInterval(iv);$("updInfo").textContent="Still waiting — refresh the page in a bit. If the update failed, the Pi rolled back to the previous version automatically."}},3000)}catch(e){$("updInfo").textContent="Install failed: "+e.message}};
$("btnSaveSettings").onclick=async()=>{await api("/api/settings",{wiim_ip:$("setWiimIp").value.trim(),wiim_autoplay:$("setWiimAuto").checked,wiim_enabled:$("setWiimOn").checked});showToast("Settings saved");refresh()};
$("btnTestWiim").onclick=async()=>{$("testResult").textContent="Testing…";try{const w=await api("/api/wiim/status");$("testResult").textContent=w.reachable||w.demo?("Connected: "+(w.name||"WiiM")+" — status "+(w.status||"")):("Not reachable: "+(w.error||"check IP / same network"))}catch(e){$("testResult").textContent=e.message}};
refresh().then(()=>{const h=(location.hash||"").replace("#","");if(["playlists","schedule","library","settings"].includes(h))tab(h)});
</script></body></html>
"""


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    # -- helpers
    def _json(self, obj, code=200):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _html(self, text):
        body = text.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        if not n:
            return {}
        try:
            return json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            return {}

    def _pin_ok(self):
        if not ACCESS_PIN:
            return True
        return self.headers.get("X-Hues-Pin") == ACCESS_PIN or \
            f"pin={ACCESS_PIN}" in (self.headers.get("Cookie") or "")

    # -- routing
    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        try:
            if path == "/":
                return self._html(UI)
            if path == "/manifest.json":
                return self._json({"name": "Hues Music Server", "short_name": "Hues Music",
                                   "start_url": "/", "display": "standalone",
                                   "background_color": "#f7f1de", "theme_color": "#23362b", "icons": []})
            if path == "/api/status":
                return self._json(self.status_payload())
            if path == "/api/library":
                return self._json(player().library())
            if path == "/api/playlists":
                return self._json([{k: v for k, v in p.items()} for p in all_playlists()])
            if path == "/api/schedules":
                pls = {p["ref"]: p["name"] for p in all_playlists()}
                out = []
                for s in STATE["schedules"]:
                    s2 = dict(s); s2["playlist_name"] = "🔊 Volume only" if s["playlist_ref"] == "volume-only" else pls.get(s["playlist_ref"], "")
                    out.append(s2)
                return self._json({"schedules": out, "enabled": settings()["scheduler_enabled"]})
            if path == "/api/wiim/status":
                return self._json(WIIM.status())
            if path == "/api/tailscale/status":
                return self._json(tailscale_status())
            if path == "/api/update/check":
                return self._json(update_check())
            if path == "/api/update/status":
                return self._json(update_status())
            if path == "/api/drops":
                return self._json(drops_available())
            if path == "/api/drops/status":
                return self._json(dict(_drop_job))
            return self._json({"error": "not found"}, 404)
        except Exception as e:
            return self._json({"error": str(e)}, 500)

    def status_payload(self):
        p = player()
        try:
            st = p.status()
        except Exception as e:
            st = {"state": "error", "error": str(e)}
        try:
            cs = p.current_song()
        except Exception:
            cs = {}
        try:
            q = p.queue()
        except Exception:
            q = []
        sched, sig = active_block()
        nb = next_boundary()
        # MPD omits volume (or reports -1) when the output has no mixer
        # (stream-only setups); fall back to the stored setting so the UI
        # shows a sane %.
        try:
            raw_vol = int(float(st["volume"])) if st.get("volume") is not None else -1
        except Exception:
            raw_vol = -1
        disp_vol = raw_vol if raw_vol >= 0 else int(settings()["volume"])
        return {
            "player": {"state": st.get("state", "stop"), "volume": disp_vol,
                       "elapsed": float(st.get("elapsed", 0) or 0), "duration": float(st.get("duration", 0) or 0),
                       "song": int(st.get("song", 0) or 0), "random": st.get("random", "0"), "repeat": st.get("repeat", "1")},
            "current": cs, "queue": q,
            "settings": settings(), "stream_url": stream_url(), "music_dir": MUSIC_DIR,
            "version": APP_VERSION,
            "now_playlist": STATE["runtime"].get("now_playlist_name"),
            "wiim": WIIM.status() if WIIM.configured or DEMO else {"configured": False},
            "schedule": {"active": sched["name"] if sched else None,
                         "playlist": STATE["runtime"].get("now_playlist_name") if sched else None,
                         "next": (f"{nb.strftime('%a %I:%M %p')}" if nb else None),
                         "overridden": bool(sched and STATE["runtime"].get("override_sig") == sig)},
            "demo": DEMO,
        }

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        b = self._body()
        try:
            if not self._pin_ok():
                return self._json({"error": "PIN required"}, 401)
            p = player()
            if path == "/api/control":
                act = b.get("action")
                if act == "play":
                    try: st = p.status()
                    except Exception: st = {}
                    if st.get("state") == "pause": p.resume()
                    else: p.play()
                    wiim_kick()
                elif act == "pause":
                    p.pause(); mark_manual_override()
                elif act == "stop":
                    p.stop(); mark_manual_override()
                    if WIIM.configured:
                        try: WIIM.stop()
                        except Exception: pass
                elif act == "next": p.next()
                elif act == "previous": p.previous()
                else: return self._json({"error": "unknown action"}, 400)
                return self._json({"ok": True})
            if path == "/api/play-track":
                p.play_files([b["file"]]); mark_manual_override(); wiim_kick()
                return self._json({"ok": True})
            if path == "/api/settings":
                for k in ("crossfade", "volume", "wiim_volume"):
                    if k in b: settings()[k] = int(b[k])
                for k in ("random", "repeat", "scheduler_enabled", "wiim_enabled", "wiim_autoplay"):
                    if k in b: settings()[k] = bool(b[k])
                if "wiim_ip" in b: settings()["wiim_ip"] = str(b["wiim_ip"]).strip()
                if "stream_host" in b: settings()["stream_host"] = str(b["stream_host"]).strip()
                save_state()
                try:
                    p.crossfade(settings()["crossfade"]); p.setvol(settings()["volume"])
                    p.random(settings()["random"]); p.repeat(settings()["repeat"])
                except Exception: pass
                return self._json({"ok": True, "settings": settings()})
            if path == "/api/playlists/play":
                play_playlist(b["ref"], shuffle=bool(b.get("shuffle")))
                return self._json({"ok": True})
            if path == "/api/playlists/save":
                pid = b.get("id") or slug(b["name"]) + "-" + hashlib.md5(b["name"].encode()).hexdigest()[:6]
                existing = next((x for x in STATE["playlists"] if x["id"] == pid), None)
                if existing:
                    existing["name"], existing["tracks"] = b["name"], list(b.get("tracks", []))
                else:
                    STATE["playlists"].append({"id": pid, "name": b["name"], "tracks": list(b.get("tracks", []))})
                save_state()
                return self._json({"ok": True, "id": pid})
            if path == "/api/playlists/delete":
                STATE["playlists"] = [x for x in STATE["playlists"] if x["id"] != b["id"]]
                save_state(); return self._json({"ok": True})
            if path == "/api/schedules/save":
                if b.get("playlist_ref") == "volume-only" and b.get("volume") is None:
                    return self._json({"error": "A Volume-only block needs a volume level (0-100)"}, 400)
                sid = b.get("id") or "s" + hashlib.md5((b["name"] + b["start"] + b["end"]).encode()).hexdigest()[:8]
                entry = {"id": sid, "name": b["name"], "playlist_ref": b["playlist_ref"],
                         "days": sorted(int(x) for x in b["days"]), "start": b["start"], "end": b["end"],
                         "enabled": bool(b.get("enabled", True)), "shuffle": bool(b.get("shuffle", False)),
                         "volume": b.get("volume"), "crossfade": b.get("crossfade")}
                STATE["schedules"] = [s for s in STATE["schedules"] if s["id"] != sid] + [entry]
                save_state(); return self._json({"ok": True, "id": sid})
            if path == "/api/schedules/delete":
                STATE["schedules"] = [s for s in STATE["schedules"] if s["id"] != b["id"]]
                save_state(); return self._json({"ok": True})
            if path == "/api/schedules/toggle":
                for s in STATE["schedules"]:
                    if s["id"] == b["id"]: s["enabled"] = bool(b["enabled"])
                save_state(); return self._json({"ok": True})
            if path == "/api/schedule/resume":
                STATE["runtime"].pop("override_sig", None); STATE["runtime"].pop("active_sig", None)
                save_state(); return self._json({"ok": True})
            if path == "/api/wiim/play":
                r = WIIM.play_stream(); return self._json({"ok": True, "result": r})
            if path == "/api/wiim/stop":
                WIIM.stop(); return self._json({"ok": True})
            if path == "/api/wiim/volume":
                WIIM.set_volume(int(b["volume"])); save_state(); return self._json({"ok": True})
            if path == "/api/wiim/status":
                return self._json(WIIM.status())
            if path == "/api/tailscale/connect":
                return self._json(tailscale_connect())
            if path == "/api/update/install":
                return self._json(update_install())
            if path == "/api/drops/install":
                return self._json(drops_install(b.get("id", "")))
            if path == "/api/drops/cancel":
                return self._json(drops_cancel())
            if path == "/api/rescan":
                p.update(); return self._json({"ok": True})
            return self._json({"error": "not found"}, 404)
        except Exception as e:
            return self._json({"error": str(e)}, 500)


def main():
    # Drop-job forensics first (v1.6.4): crash hooks, the on-disk beacon
    # outbox, and reconciliation of any job the previous process left
    # unfinished (which phones home a "died" beacon via the sender).
    _install_crash_hooks()
    _outbox_load()
    _reconcile_journal()
    try:
        signal.signal(signal.SIGTERM, _term_handler)
    except Exception:
        pass
    # Apply saved playback settings to the engine on boot
    if not DEMO:
        try:
            player().crossfade(settings()["crossfade"])
            player().repeat(settings()["repeat"])
        except Exception as e:
            print(f"[boot] MPD not reachable yet ({e}); will work once MPD is up", file=sys.stderr)
    threading.Thread(target=scheduler_loop, daemon=True).start()
    threading.Thread(target=checkin_loop, daemon=True).start()
    threading.Thread(target=_outbox_sender, daemon=True).start()
    srv = ThreadingHTTPServer(("0.0.0.0", WEB_PORT), Handler)
    print(f"Hues Music Server on http://0.0.0.0:{WEB_PORT}  demo={DEMO}  stream={stream_url()}")
    srv.serve_forever()


if __name__ == "__main__":
    main()
