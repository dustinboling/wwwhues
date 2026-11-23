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
import hashlib
import json
import os
import re
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
APP_VERSION = "1.2.0"
# One-tap updates: the app checks this manifest on hues.flowers (Dustin's own
# site), verifies the download against the manifest's SHA-256, stages it under
# DATA_DIR/updates, and a root systemd path unit (hues-update.path) performs
# the swap + health check + rollback. The app itself never runs as root.
UPDATE_MANIFEST_URL = os.environ.get(
    "HUES_UPDATE_URL", "https://hues.flowers/music-server/update.json")
UPDATE_DIR = DATA_DIR / "updates"

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
        self.random(shuffle)
        self.repeat(settings()["repeat"])
        self.crossfade(settings()["crossfade"])
        self.setvol(settings()["volume"])
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


# ---------------------------------------------------------------- web app
UI = r"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#1e3a2a"><title>Hues Music Server</title>
<link rel="manifest" href="/manifest.json">
<style>
:root{--bg:#12241a;--card:#1e3a2a;--card2:#274934;--ink:#f3efe4;--dim:#b9c6b4;--acc:#e8b34b;--acc2:#7fb069;--bad:#e07a5f}
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--ink);padding-bottom:84px}
header{padding:16px 16px 6px}h1{font-size:21px;margin:0}sub{color:var(--dim)}
.card{background:var(--card);border-radius:16px;padding:14px;margin:10px 12px}
button{background:var(--card2);color:var(--ink);border:1px solid #3a5c46;border-radius:12px;padding:11px 14px;font-size:16px}
button.primary{background:var(--acc);color:#221a05;border:none;font-weight:700}
button.on{background:var(--acc2);color:#0d2013;border:none;font-weight:700}
button.danger{background:transparent;border-color:var(--bad);color:var(--bad)}
input,select{background:#0f1f16;color:var(--ink);border:1px solid #3a5c46;border-radius:10px;padding:10px;font-size:16px;width:100%}
input[type=range]{padding:0}input[type=checkbox]{width:22px;height:22px}
.row{display:flex;gap:8px;align-items:center}.row>*{flex:0 1 auto}.grow{flex:1 1 auto}
label{font-size:13px;color:var(--dim);display:block;margin:8px 0 4px}
.big{font-size:19px;font-weight:700}.dim{color:var(--dim);font-size:14px}
.transport{display:flex;justify-content:space-around;margin:10px 0}.transport button{font-size:22px;width:64px;height:56px}
nav{position:fixed;left:0;right:0;bottom:0;background:#0c1a11;display:flex;border-top:1px solid #2c4a38;padding:8px 4px calc(8px + env(safe-area-inset-bottom))}
nav button{flex:1;background:none;border:none;font-size:13px;color:var(--dim)}nav button.sel{color:var(--acc);font-weight:700}
.track{display:flex;gap:8px;align-items:center;padding:9px 4px;border-bottom:1px solid #2c4a38}
.hide{display:none}.pill{display:inline-block;background:#0f1f16;border:1px solid #3a5c46;border-radius:999px;padding:3px 10px;font-size:12px;color:var(--dim)}
progress{width:100%;height:8px;accent-color:var(--acc)}
.days{display:flex;gap:6px;flex-wrap:wrap}.days button{padding:8px 10px;font-size:14px}
a{color:var(--acc)}
</style></head><body>
<header><h1>🌻 Hues Music Server</h1><sub id="schedBanner">…</sub></header>

<section id="tab-now">
  <div class="card">
    <div class="dim">Now playing</div>
    <div class="big" id="npTitle">—</div>
    <div class="dim" id="npArtist"></div>
    <div class="dim" id="npPlaylist" style="margin-top:4px"></div>
    <progress id="npProg" value="0" max="100"></progress>
    <div class="row"><span class="dim" id="npElapsed">0:00</span><span class="grow"></span><span class="dim" id="npDur">0:00</span></div>
    <div class="transport">
      <button id="btnPrev" aria-label="Previous">⏮</button>
      <button id="btnPlay" class="primary" aria-label="Play or pause">▶️</button>
      <button id="btnNext" aria-label="Next">⏭</button>
    </div>
    <div class="row"><button id="btnShuffle">🔀 Shuffle</button><button id="btnRepeat">🔁 Repeat</button><span class="grow"></span><button id="btnResume" class="hide">↩ Resume schedule</button></div>
  </div>
  <div class="card">
    <label>Volume — park speakers (WiiM) <span id="wiimVolVal"></span></label>
    <input type="range" id="wiimVol" min="0" max="100">
    <label>Stream volume (Pi) <span id="volVal"></span></label>
    <input type="range" id="vol" min="0" max="100">
    <label>Crossfade <span id="xfVal"></span> seconds</label>
    <input type="range" id="xf" min="0" max="12" step="1">
    <div class="dim">6s is your park standard. Applies to the next track change.</div>
  </div>
  <div class="card" id="wiimCard">
    <div class="row"><div class="big grow">WiiM Pro</div><span class="pill" id="wiimState">…</span></div>
    <div class="dim" id="wiimInfo">—</div>
    <div class="dim" id="streamInfo" style="margin-top:4px"></div>
    <div class="row" style="margin-top:10px"><button id="btnWiimPlay" class="primary">▶ Play Hues stream on WiiM</button><button id="btnWiimStop">⏹ Stop WiiM</button></div>
  </div>
  <div class="card"><div class="big">Up next</div><div id="queue"></div></div>
</section>

<section id="tab-playlists" class="hide">
  <div class="card"><div class="big">Playlists</div><div id="playlistList"></div></div>
  <div class="card"><div class="big">New playlist</div>
    <label>Name</label><input id="newPlName" placeholder="e.g. Christmas Morning">
    <div class="dim" style="margin:6px 0">Create it, then add tracks from Library.</div>
    <button id="btnNewPl" class="primary">Create playlist</button></div>
  <div class="card hide" id="plDetail"><div class="big" id="plDetailName"></div><div id="plTracks"></div></div>
</section>

<section id="tab-schedule" class="hide">
  <div class="card"><div class="row"><div class="big grow">Schedule</div><button id="schedToggle">On</button></div>
  <div class="dim">Like Soundtrack: pick a playlist for each part of the day. Times are farm time. A manual choice overrides the schedule until the next block starts.</div><div id="schedList"></div></div>
  <div class="card"><div class="big">Add a block</div>
    <label>Name</label><input id="scName" placeholder="e.g. Morning in the Park">
    <label>Playlist</label><select id="scPlaylist"></select>
    <label>Days</label><div class="days" id="scDays"></div>
    <div class="row"><div class="grow"><label>Start</label><input type="time" id="scStart" value="09:00"></div><div class="grow"><label>End</label><input type="time" id="scEnd" value="17:00"></div></div>
    <label>Park volume — WiiM % (optional; required for a Volume-only block)</label><input type="number" id="scVol" min="0" max="100" placeholder="Leave blank = no change">
    <label>Crossfade seconds (optional)</label><input type="number" id="scXf" min="0" max="12" placeholder="Leave blank = current">
    <div style="margin-top:10px"><button id="btnAddSched" class="primary">Add block</button></div>
  </div>
</section>

<section id="tab-library" class="hide">
  <div class="card"><div class="big">Library</div>
    <label>Search</label><input id="libSearch" placeholder="Search tracks…">
    <label>Add tapped tracks to</label><select id="libTarget"></select>
    <div id="libList"></div>
    <div style="margin-top:10px"><button id="btnRescan">↻ Rescan music folder</button></div>
  </div>
</section>

<section id="tab-settings" class="hide">
  <div class="card"><div class="big">WiiM Pro (network feed)</div>
    <label>WiiM IP address (on the farm network)</label><input id="setWiimIp" placeholder="e.g. 192.168.1.50">
    <div class="dim">Find it in the WiiM Home app: Device → ⚙ → Speaker Info / Network. Tip: reserve this IP in your router so it never changes.</div>
    <div class="row" style="margin-top:8px"><label style="margin:0">Start WiiM automatically when music plays</label><input type="checkbox" id="setWiimAuto"></div>
    <div class="row"><label style="margin:0">WiiM integration enabled</label><input type="checkbox" id="setWiimOn"></div>
    <div style="margin-top:10px"><button id="btnSaveSettings" class="primary">Save settings</button> <button id="btnTestWiim">Test WiiM</button></div>
    <div class="dim" id="testResult" style="margin-top:6px"></div>
  </div>
  <div class="card"><div class="big">How the feed works</div>
    <div class="dim">Pi → (Wi-Fi/Ethernet stream) → WiiM Pro → amp → park speakers.<br>
    The Pi mixes playlists with your crossfade, then streams it like a private radio station at <span id="streamUrlTxt"></span>. The WiiM just plays that one stream, so crossfades and schedules always hold. Control from offsite comes through Tailscale — the audio itself stays on the farm network.</div>
  </div>
  <div class="card"><div class="big">📱 Phone control from anywhere — Tailscale</div>
    <div class="dim" id="tsInfo">Checking…</div>
    <div class="row" style="margin-top:10px"><button id="btnTs" class="primary">Connect Tailscale</button><a id="tsLink" href="#" target="_blank" class="hide">Tap here to sign in →</a></div>
    <div class="dim" style="margin-top:8px">How it works: tap Connect, follow the sign-in link (free Tailscale account), then install the Tailscale app on your phone and sign in with the SAME account. After that this page opens from anywhere at the Pi's Tailscale address — no passwords to type, nothing exposed to the public internet. On the farm Wi-Fi you don't need Tailscale at all.</div>
  </div>
  <div class="card"><div class="big">⬆️ App updates</div>
    <div class="dim" id="updInfo">Version —</div>
    <div class="row" style="margin-top:10px"><button id="btnUpdCheck" class="primary">Check for updates</button><button id="btnUpdInstall" class="hide">Install update</button></div>
    <div class="dim" style="margin-top:8px">Updates come from hues.flowers and are checksum-verified before they install. The app restarts itself (~15 seconds) and rolls back automatically if the new version doesn't come up healthy. Your music, playlists and schedules are never touched by an update.</div>
  </div>
  <div class="card"><div class="big">Server</div><div class="dim" id="serverInfo">—</div></div>
</section>

<nav>
  <button data-tab="now" class="sel">🎵<br>Now</button>
  <button data-tab="playlists">📋<br>Playlists</button>
  <button data-tab="schedule">🕐<br>Schedule</button>
  <button data-tab="library">🎶<br>Library</button>
  <button data-tab="settings">⚙️<br>Settings</button>
</nav>

<script>
const $=id=>document.getElementById(id);
let S=null, playlists=[], library=[], selDays=new Set([0,1,2,3,4,5,6]), openPl=null;
const fmt=s=>{s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
async function api(path,body){const r=await fetch(path,{method:body?"POST":"GET",headers:{"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});const j=await r.json();if(!r.ok)throw new Error(j.error||r.status);return j}
function tab(name){document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("sel",b.dataset.tab===name));["now","playlists","schedule","library","settings"].forEach(t=>$("tab-"+t).classList.toggle("hide",t!==name));if(name==="playlists")loadPlaylists();if(name==="schedule")loadSchedules();if(name==="library")loadLibrary();if(name==="settings")loadSettings();}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>tab(b.dataset.tab));
async function refresh(){
  try{S=await api("/api/status")}catch(e){return}
  const st=S.player, cs=S.current||{};
  $("npTitle").textContent=cs.Title||cs.title||(st.state==="stop"?"Stopped":"—");
  $("npArtist").textContent=cs.Artist||cs.artist||"";
  $("npPlaylist").textContent=S.now_playlist?("Playlist: "+S.now_playlist):"";
  $("btnPlay").textContent=st.state==="play"?"⏸":"▶️";
  if(st.duration){$("npProg").value=100*(st.elapsed||0)/st.duration;$("npElapsed").textContent=fmt(st.elapsed);$("npDur").textContent=fmt(st.duration)}
  $("vol").value=st.volume??S.settings.volume;$("volVal").textContent="— "+(st.volume??S.settings.volume)+"%";
  $("wiimVol").value=S.settings.wiim_volume;$("wiimVolVal").textContent="— "+S.settings.wiim_volume+"%";
  $("xf").value=S.settings.crossfade;$("xfVal").textContent="— "+S.settings.crossfade;
  $("btnShuffle").className=st.random==="1"?"on":"";$("btnRepeat").className=st.repeat==="1"?"on":"";
  const sb=S.schedule||{};
  $("schedBanner").textContent=!S.settings.scheduler_enabled?"Schedule is off":sb.active?("Scheduled: "+sb.active+" · "+(sb.playlist||"")):(sb.next?("Next block: "+sb.next):"No schedule block right now");
  $("btnResume").classList.toggle("hide",!sb.overridden);
  const w=S.wiim||{};
  $("wiimState").textContent=!w.configured?"Not set up":w.demo?"Demo":w.reachable?(w.status==="play"?"Playing":"Connected"):"Unreachable";
  $("wiimInfo").textContent=!w.configured?"Add the WiiM's IP in Settings.":(w.name||"WiiM")+" "+(w.firmware?("· fw "+w.firmware):"")+(w.error?("· "+w.error):"");
  $("streamInfo").textContent="Stream: "+S.stream_url;
  $("streamUrlTxt").textContent=S.stream_url;
  $("queue").innerHTML=(S.queue||[]).slice(0,15).map((t,i)=>`<div class="track"><span class="grow">${i===(+st.song||0)?"▶ ":""}${t.Title||t.file}</span><span class="dim">${t.Artist||""}</span></div>`).join("")||'<div class="dim">Queue is empty — pick a playlist.</div>';
}
setInterval(refresh,3000);
$("btnPlay").onclick=async()=>{await api("/api/control",{action:S.player.state==="play"?"pause":"play"});refresh()};
$("btnNext").onclick=async()=>{await api("/api/control",{action:"next"});refresh()};
$("btnPrev").onclick=async()=>{await api("/api/control",{action:"previous"});refresh()};
$("btnShuffle").onclick=async()=>{await api("/api/settings",{random:S.player.random!=="1"});refresh()};
$("btnRepeat").onclick=async()=>{await api("/api/settings",{repeat:S.player.repeat!=="1"});refresh()};
$("btnResume").onclick=async()=>{await api("/api/schedule/resume",{});refresh()};
$("vol").onchange=async e=>{await api("/api/settings",{volume:+e.target.value});refresh()};
$("wiimVol").onchange=async e=>{await api("/api/wiim/volume",{volume:+e.target.value});refresh()};
$("xf").onchange=async e=>{await api("/api/settings",{crossfade:+e.target.value});refresh()};
$("btnWiimPlay").onclick=async()=>{try{await api("/api/wiim/play",{});alert("Sent to WiiM — give it a few seconds to buffer.")}catch(e){alert(e.message)}refresh()};
$("btnWiimStop").onclick=async()=>{await api("/api/wiim/stop",{});refresh()};
async function loadPlaylists(){
  playlists=await api("/api/playlists");
  $("playlistList").innerHTML=playlists.map(p=>`<div class="track"><span class="grow"><b>${p.name}</b> <span class="dim">${p.count} tracks · ${p.kind}</span></span><button onclick="playPl('${p.ref.replace(/'/g,"\\'")}',false)">▶ Play</button><button onclick="playPl('${p.ref.replace(/'/g,"\\'")}',true)">🔀</button>${p.kind==="custom"?`<button onclick="openPl('${p.ref}')">Tracks</button>`:""}</div>`).join("")||'<div class="dim">No playlists yet — add music to the Pi first.</div>';
  const opts=playlists.map(p=>`<option value="${p.ref}">${p.name}</option>`).join("");
  $("scPlaylist").innerHTML=opts+`<option value="volume-only">🔊 Volume only — don't change the music</option>`; $("libTarget").innerHTML=playlists.filter(p=>p.kind==="custom").map(p=>`<option value="${p.ref}">${p.name}</option>`).join("");
}
window.playPl=async(ref,sh)=>{await api("/api/playlists/play",{ref,shuffle:sh});tab("now");refresh()};
window.openPl=async(ref)=>{openPl=ref;const p=playlists.find(x=>x.ref===ref);$("plDetail").classList.remove("hide");$("plDetailName").textContent=p.name;$("plTracks").innerHTML=p.tracks.map((t,i)=>`<div class="track"><span class="grow">${t}</span><button class="danger" onclick="delTrack(${i})">✕</button></div>`).join("")};
window.delTrack=async i=>{const p=playlists.find(x=>x.ref===openPl);p.tracks.splice(i,1);await api("/api/playlists/save",{id:openPl.split(":")[1],name:p.name,tracks:p.tracks});loadPlaylists();openPl=openPl;};
$("btnNewPl").onclick=async()=>{const n=$("newPlName").value.trim();if(!n)return;await api("/api/playlists/save",{name:n,tracks:[]});$("newPlName").value="";loadPlaylists()};
async function loadSchedules(){
  const d=await api("/api/schedules");await loadPlaylists();
  $("schedToggle").textContent=S&&S.settings.scheduler_enabled?"On":"Off";$("schedToggle").className=S&&S.settings.scheduler_enabled?"on":"";
  const dn=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  $("schedList").innerHTML=d.schedules.map(s=>`<div class="track"><span class="grow"><b>${s.name}</b><br><span class="dim">${s.days.map(x=>dn[x]).join(" ")} · ${s.start}–${s.end} · ${s.playlist_name||s.playlist_ref}${s.volume!=null?` · 🔊 ${s.volume}%`:""}${s.crossfade!=null?` · crossfade ${s.crossfade}s`:""}</span></span><button onclick="togSched('${s.id}',${!s.enabled})">${s.enabled?"On":"Off"}</button><button class="danger" onclick="delSched('${s.id}')">✕</button></div>`).join("")||'<div class="dim">No blocks yet — add your first below.</div>';
  $("scDays").innerHTML=dn.map((n,i)=>`<button class="${selDays.has(i)?"on":""}" onclick="togDay(${i})">${n}</button>`).join("");
}
window.togDay=i=>{selDays.has(i)?selDays.delete(i):selDays.add(i);loadSchedules()};
window.togSched=async(id,en)=>{await api("/api/schedules/toggle",{id,enabled:en});loadSchedules()};
window.delSched=async id=>{if(confirm("Delete this block?")){await api("/api/schedules/delete",{id});loadSchedules()}};
$("schedToggle").onclick=async()=>{await api("/api/settings",{scheduler_enabled:!(S&&S.settings.scheduler_enabled)});await refresh();loadSchedules()};
$("btnAddSched").onclick=async()=>{const v=$("scVol").value,x=$("scXf").value;if($("scPlaylist").value==="volume-only"&&v===""){alert("A Volume-only block needs a volume level.");return}try{await api("/api/schedules/save",{name:$("scName").value||"Block",playlist_ref:$("scPlaylist").value,days:[...selDays].sort(),start:$("scStart").value,end:$("scEnd").value,volume:v===""?null:+v,crossfade:x===""?null:+x,enabled:true});loadSchedules()}catch(e){alert(e.message)}};
async function loadLibrary(){
  library=await api("/api/library");renderLib();
}
function renderLib(){const q=($("libSearch").value||"").toLowerCase();const t=$("libTarget").value;
  $("libList").innerHTML=library.filter(x=>!q||(x.title+" "+x.artist+" "+x.file).toLowerCase().includes(q)).slice(0,200).map(x=>`<div class="track"><span class="grow">${x.title}<br><span class="dim">${x.folder||""}</span></span><button onclick="playTrack('${x.file.replace(/'/g,"\\'")}')">▶</button>${t?`<button onclick="addTrack('${x.file.replace(/'/g,"\\'")}')">＋ Add</button>`:""}</div>`).join("")||'<div class="dim">No tracks found.</div>'}
$("libSearch").oninput=renderLib;$("libTarget").onchange=renderLib;
window.playTrack=async f=>{await api("/api/play-track",{file:f});tab("now");refresh()};
window.addTrack=async f=>{const ref=$("libTarget").value;const p=playlists.find(x=>x.ref===ref);if(!p)return;p.tracks.push(f);await api("/api/playlists/save",{id:ref.split(":")[1],name:p.name,tracks:p.tracks});alert("Added to "+p.name)};
$("btnRescan").onclick=async()=>{await api("/api/rescan",{});setTimeout(loadLibrary,1500)};
async function loadSettings(){$("setWiimIp").value=S?S.settings.wiim_ip:"";$("setWiimAuto").checked=S?!!S.settings.wiim_autoplay:true;$("setWiimOn").checked=S?!!S.settings.wiim_enabled:true;$("serverInfo").textContent="Version: v"+(S?S.version:"?")+" · Music folder: "+(S?S.music_dir:"")+" · Stream: "+(S?S.stream_url:"");if(S)$("updInfo").textContent="Version v"+S.version+" — tap Check for updates.";refreshTs()}
async function refreshTs(){try{const t=await api("/api/tailscale/status");if(!t.installed){$("tsInfo").textContent="Tailscale isn't installed on this Pi.";return}$("tsInfo").textContent=t.state==="Running"?("Connected ✅ — offsite address: http://"+(t.ip||"")+":8080 (open that on your phone with Tailscale on, then Add to Home Screen)"):"Not connected yet — tap Connect and sign in.";if(t.auth_url){$("tsLink").href=t.auth_url;$("tsLink").classList.remove("hide")}}catch(e){}}
$("btnTs").onclick=async()=>{$("tsInfo").textContent="Starting Tailscale — getting your sign-in link…";const r=await api("/api/tailscale/connect",{});if(r.auth_url){$("tsLink").href=r.auth_url;$("tsLink").classList.remove("hide");$("tsInfo").textContent="Tap the sign-in link →"}else{setTimeout(refreshTs,3000)}};
let updAvail=null;
$("btnUpdCheck").onclick=async()=>{$("updInfo").textContent="Checking hues.flowers for updates…";$("btnUpdInstall").classList.add("hide");try{const c=await api("/api/update/check");if(!c.ok){$("updInfo").textContent=c.error;return}if(c.available){updAvail=c;$("updInfo").textContent="Update available: v"+c.latest+" (you have v"+c.current+")"+(c.notes?" — "+c.notes:"");$("btnUpdInstall").classList.remove("hide")}else{$("updInfo").textContent="You're on the latest version (v"+c.current+")."}}catch(e){$("updInfo").textContent="Check failed: "+e.message}};
$("btnUpdInstall").onclick=async()=>{if(!updAvail)return;if(!confirm("Install v"+updAvail.latest+" now? The app will restart (~15 seconds). Music keeps streaming from the Pi during the restart."))return;$("updInfo").textContent="Downloading and verifying the update…";try{const r=await api("/api/update/install",{});if(!r.ok){$("updInfo").textContent=r.error||"Install failed";return}$("updInfo").textContent=r.message||"Installing — the page will reload itself when the Pi is back…";let tries=0;const iv=setInterval(async()=>{tries++;try{const s=await api("/api/status");if(s.version===updAvail.latest){clearInterval(iv);$("updInfo").textContent="✅ Updated to v"+s.version;setTimeout(()=>location.reload(),1200)}}catch(e){}if(tries>40){clearInterval(iv);$("updInfo").textContent="Still waiting — refresh the page in a bit. If the update failed, the Pi rolled back to the previous version automatically."}},3000)}catch(e){$("updInfo").textContent="Install failed: "+e.message}};
$("btnSaveSettings").onclick=async()=>{await api("/api/settings",{wiim_ip:$("setWiimIp").value.trim(),wiim_autoplay:$("setWiimAuto").checked,wiim_enabled:$("setWiimOn").checked});$("testResult").textContent="Saved.";refresh()};
$("btnTestWiim").onclick=async()=>{$("testResult").textContent="Testing…";try{const w=await api("/api/wiim/status");$("testResult").textContent=w.reachable||w.demo?("Connected: "+(w.name||"WiiM")+" — status "+(w.status||"")):("Not reachable: "+(w.error||"check IP / same network"))}catch(e){$("testResult").textContent=e.message}};
refresh();
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
                                   "background_color": "#12241a", "theme_color": "#1e3a2a", "icons": []})
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
        return {
            "player": {"state": st.get("state", "stop"), "volume": int(float(st.get("volume", 0) or 0)),
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
            if path == "/api/rescan":
                p.update(); return self._json({"ok": True})
            return self._json({"error": "not found"}, 404)
        except Exception as e:
            return self._json({"error": str(e)}, 500)


def main():
    # Apply saved playback settings to the engine on boot
    if not DEMO:
        try:
            player().crossfade(settings()["crossfade"])
            player().repeat(settings()["repeat"])
        except Exception as e:
            print(f"[boot] MPD not reachable yet ({e}); will work once MPD is up", file=sys.stderr)
    threading.Thread(target=scheduler_loop, daemon=True).start()
    srv = ThreadingHTTPServer(("0.0.0.0", WEB_PORT), Handler)
    print(f"Hues Music Server on http://0.0.0.0:{WEB_PORT}  demo={DEMO}  stream={stream_url()}")
    srv.serve_forever()


if __name__ == "__main__":
    main()
