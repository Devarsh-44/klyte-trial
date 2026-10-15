"""Measure tempo, beat phase and per-bar energy for candidate tracks.

Usage: python -I tools/analyze-audio.py <ffmpeg> <file.mp3> [...]
Prints BPM, first downbeat, and a bar-by-bar energy strip (total and kick)
so the drop (biggest kick jump) and breakdown (kick drops out) stand out.
"""
import json
import subprocess
import sys

import numpy as np

SR = 22050
HOP = 512
N_FFT = 2048


def load(ffmpeg, path):
    raw = subprocess.run(
        [ffmpeg, "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32)


def stft_mag(y):
    win = np.hanning(N_FFT).astype(np.float32)
    n = 1 + (len(y) - N_FFT) // HOP
    idx = np.arange(N_FFT)[None, :] + HOP * np.arange(n)[:, None]
    return np.abs(np.fft.rfft(y[idx] * win, axis=1))


def tempo(onset, fps, lo=70, hi=180):
    o = onset - onset.mean()
    ac = np.correlate(o, o, mode="full")[len(o) - 1:]
    lags = np.arange(len(ac))
    bpm = 60 * fps / np.maximum(lags, 1)
    ok = (bpm >= lo) & (bpm <= hi)
    best = lags[ok][np.argmax(ac[ok])]
    # Refine with parabolic interpolation around the peak.
    a, b, c = ac[best - 1], ac[best], ac[best + 1]
    shift = 0.5 * (a - c) / (a - 2 * b + c) if (a - 2 * b + c) else 0
    return 60 * fps / (best + shift)


def analyze(ffmpeg, path):
    y = load(ffmpeg, path)
    mag = stft_mag(y)
    fps = SR / HOP
    freqs = np.fft.rfftfreq(N_FFT, 1 / SR)
    logm = np.log1p(10 * mag)
    onset = np.maximum(0, np.diff(logm, axis=0)).sum(axis=1)
    onset = np.concatenate([[0], onset])

    bpm = tempo(onset, fps)
    period = 60 / bpm
    # Beat phase: offset that lines the grid up with the strongest onsets.
    t = np.arange(len(onset)) / fps
    phases = np.linspace(0, period, 64, endpoint=False)
    score = [onset[np.clip(((np.arange(phase, t[-1], period)) * fps).astype(int), 0, len(onset) - 1)].sum() for phase in phases]
    phase = phases[int(np.argmax(score))]

    kick_band = (freqs > 35) & (freqs < 150)
    kick = mag[:, kick_band].sum(axis=1)
    total = np.sqrt((mag ** 2).sum(axis=1))

    bar = 4 * period
    n_bars = int((len(y) / SR - phase) // bar)
    rows = []
    for i in range(n_bars):
        a = int((phase + i * bar) * fps)
        b = int((phase + (i + 1) * bar) * fps)
        rows.append((phase + i * bar, float(total[a:b].mean()), float(kick[a:b].mean())))
    tot = np.array([r[1] for r in rows])
    kk = np.array([r[2] for r in rows])
    tot_n = tot / tot.max()
    kk_n = kk / kk.max()

    jumps = np.diff(kk_n)
    drop_bar = int(np.argmax(jumps)) + 1
    # Breakdown: quietest kick stretch (2 bars) after the drop.
    after = range(drop_bar + 2, n_bars - 2)
    bd_bar = min(after, key=lambda i: kk_n[i] + kk_n[i + 1]) if len(after) else None

    return {
        "file": path.split("/")[-1],
        "duration": round(len(y) / SR, 2),
        "bpm": round(bpm, 2),
        "first_beat": round(phase, 3),
        "drop_bar": drop_bar,
        "drop_time": round(rows[drop_bar][0], 2),
        "drop_jump": round(float(jumps[drop_bar - 1]), 2),
        "breakdown_bar": bd_bar,
        "breakdown_time": round(rows[bd_bar][0], 2) if bd_bar is not None else None,
        "breakdown_kick": round(float(kk_n[bd_bar]), 2) if bd_bar is not None else None,
        "kick_strip": "".join(" .:-=+*#%@"[min(9, int(v * 9.99))] for v in kk_n),
        "total_strip": "".join(" .:-=+*#%@"[min(9, int(v * 9.99))] for v in tot_n),
    }


if __name__ == "__main__":
    ff = sys.argv[1]
    for p in sys.argv[2:]:
        print(json.dumps(analyze(ff, p)))
