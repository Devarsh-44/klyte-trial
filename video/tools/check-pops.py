"""Scan a render for single-frame pops: frame-difference spikes 3x their neighbours.

Usage: python tools/check-pops.py <ffmpeg> <video.mp4> [--min 0.6]
"""
import subprocess
import sys

import numpy as np

FF, VIDEO = sys.argv[1], sys.argv[2]
MIN = float(sys.argv[sys.argv.index("--min") + 1]) if "--min" in sys.argv else 0.6
S = 240

raw = subprocess.run([FF, "-v", "error", "-i", VIDEO, "-vf", f"scale={S}:{S},format=gray", "-f", "rawvideo", "-"],
                     capture_output=True, check=True).stdout
frames = np.frombuffer(raw, dtype=np.uint8).reshape(-1, S, S).astype(np.float32)
d = np.abs(np.diff(frames, axis=0)).mean(axis=(1, 2))          # d[i] = change from frame i to i+1

pops = []
for i in range(1, len(d) - 1):
    neighbours = max(d[i - 1], d[i + 1])
    if d[i] > MIN and d[i] > 3 * max(neighbours, 0.05):
        pops.append(i + 1)

print(f"{len(frames)} frames, mean change {d.mean():.2f}, max {d.max():.2f} at frame {int(d.argmax()) + 1}")
if not pops:
    print("no single-frame pops")
for f in pops:
    t = f / 60
    print(f"POP frame {f}  t={t:.3f}s  beat {t * 2:.2f}  diff {d[f - 1]:.2f} vs {d[f - 2]:.2f} / {d[f]:.2f}")
