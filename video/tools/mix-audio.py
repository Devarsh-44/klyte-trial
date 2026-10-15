"""Place every SFX by its measured peak on the beat grid, mix under the song,
then loudness-normalise to -14 LUFS (two-pass loudnorm).

Usage: python tools/mix-audio.py <ffmpeg> <out.wav>
"""
import json
import os
import subprocess
import sys

import numpy as np

SR = 48000
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SFX = os.path.join(ROOT, "assets", "audio", "sfx")
FF = sys.argv[1]
OUT = sys.argv[2]

CLICK, POP, BUBBLE, LONGPOP, WHOOSH, AIR, TAB, CRACK = "1117", "2364", "2925", "2358", "1490", "1489", "2857", "1796"
PAPER, PAGE, SLIDE, NOTIFY, CONFIRM, MOTO, POUR, IMPACT, ICE, LIQUID = "1530", "1104", "3120", "2354", "2867", "2732", "3181", "1143", "138", "3000"

# (beat, sfx id, gain dB, max length s or None)
EVENTS = [
    (1.0, AIR, -16, 0.8), (2.0, LONGPOP, -11, None), (3.0, WHOOSH, -19, None), (4.0, CLICK, -7, None),
    (5.0, TAB, -8, None), (6.0, CRACK, -4, None), (6.0, TAB, -13, None), (7.0, POP, -16, None),
    (8.0, PAPER, -10, 0.9), (9.0, PAGE, -10, None), (10.0, SLIDE, -13, 0.9), (11.0, CLICK, -7, None),
    (12.0, IMPACT, -5, None),
    (13.0, BUBBLE, -12, 0.5), (13.25, BUBBLE, -13, 0.5), (13.5, BUBBLE, -12, 0.5), (13.75, BUBBLE, -13, 0.5),
    (14.0, LIQUID, -13, None), (15.2, LIQUID, -10, None),
    (16.0, AIR, -16, 0.8), (16.35, POP, -19, None), (16.47, POP, -20, None), (16.59, POP, -19, None),
    (17.0, CLICK, -7, None), (18.0, POP, -17, None), (18.6, SLIDE, -14, 1.2), (20.0, CLICK, -15, None),
    (21.0, WHOOSH, -14, None), (22.0, LONGPOP, -12, None), (23.0, WHOOSH, -11, None),
    (24.3, NOTIFY, -8, None), (25.0, AIR, -16, 0.8), (26.0, WHOOSH, -17, None), (27.0, LIQUID, -12, None),
    (28.0, WHOOSH, -10, None), (29.2, PAPER, -12, 0.9), (30.9, POP, -20, None), (31.0, AIR, -16, 0.8),
    (32.0, SLIDE, -12, 0.9), (33.0, POP, -10, None), (34.0, PAPER, -14, 0.9), (35.0, CLICK, -7, None),
    (35.05, AIR, -19, 0.6), (36.0, CLICK, -7, None), (37.0, WHOOSH, -12, None), (38.0, CLICK, -6, None),
    (39.0, CONFIRM, -9, None), (40.0, ICE, -13, 1.0), (41.0, MOTO, -17, 1.6), (42.6, POP, -12, None),
    (43.0, CONFIRM, -9, None),
    (44.0, POUR, -6, 1.4), (46.0, AIR, -14, 0.8), (47.0, CRACK, -4, None), (48.0, POUR, -14, 1.0),
    (49.0, WHOOSH, -18, None), (50.0, TAB, -8, None), (50.35, TAB, -11, None), (51.0, TAB, -8, None),
    (52.0, POUR, -6, 1.2), (53.0, AIR, -14, 0.8), (54.0, POP, -16, None),
    (56.0, IMPACT, -5, None), (56.0, LONGPOP, -12, None), (57.4, WHOOSH, -21, None),
]


def decode(path):
    raw = subprocess.run([FF, "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def peak_offset(x):
    """Time of the loudest 5 ms window: the moment that should land on the beat."""
    mono = np.abs(x).mean(axis=1)
    win = int(0.005 * SR)
    env = np.convolve(mono, np.ones(win) / win, mode="same")
    return int(np.argmax(env))


def load_sfx(sid):
    for ext in (".wav", ".mp3"):
        p = os.path.join(SFX, sid + ext)
        if os.path.exists(p):
            return decode(p)
    raise FileNotFoundError(sid)


def main():
    music = decode(os.path.join(ROOT, "assets", "audio", "klyte-cut.wav"))
    total = int(30.0 * SR)
    mix = np.zeros((total, 2), dtype=np.float32)
    mix[: min(total, len(music))] += music[:total] * 0.82          # leave headroom for the SFX

    cache, report = {}, []
    for beat, sid, gain, maxlen in EVENTS:
        if sid not in cache:
            cache[sid] = load_sfx(sid)
        x = cache[sid]
        pk = peak_offset(x)
        if maxlen:
            n = int(maxlen * SR)
            x = x[: pk + n].copy()
            fade = min(len(x), int(0.08 * SR))
            x[-fade:] *= np.linspace(1, 0, fade)[:, None]
        start = int(beat * 0.5 * SR) - pk
        a, b = max(0, start), min(total, start + len(x))
        if b <= a:
            continue
        mix[a:b] += x[a - start: b - start] * (10 ** (gain / 20))
        report.append((beat, sid, round(pk / SR, 3)))

    # Last frame = first frame: make the tail land in silence the way it starts.
    tail = int(0.12 * SR)
    mix[-tail:] *= np.linspace(1, 0, tail)[:, None]

    tmp = OUT + ".pre.wav"
    pcm = (np.clip(mix, -1, 1) * 32767).astype("<i2")
    with open(tmp + ".raw", "wb") as f:
        f.write(pcm.tobytes())
    subprocess.run([FF, "-y", "-v", "error", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", tmp + ".raw", tmp], check=True)
    os.remove(tmp + ".raw")

    # Two-pass loudnorm to -14 LUFS, -1 dBTP.
    probe = subprocess.run([FF, "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"],
                           capture_output=True, text=True).stderr
    m = json.loads(probe[probe.rindex("{"): probe.rindex("}") + 1])
    af = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample={SR}")
    subprocess.run([FF, "-y", "-v", "error", "-i", tmp, "-af", af, "-c:a", "pcm_s16le", OUT], check=True)
    os.remove(tmp)
    print(f"placed {len(report)} sfx; peaks (s): " + ", ".join(f"{sid}:{pk}" for _, sid, pk in report[:6]) + " ...")
    print(OUT)


main()
