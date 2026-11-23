# Leadersheet colours

From `src/brand/presets/leadersheet/tokens/` (DTCG 2025.10 token files; every theme, high contrast included, is resolved at /tokens.json). CMYK is a naive approximation (no print profile); ask the printer to match the HEX.

| Name | Role | Light HEX | Light RGB | Light OKLCH | Light CMYK (approx.) | Dark HEX |
|---|---|---|---|---|---|---|
| background | Page | #f5f3f1 | 245, 243, 241 | oklch(96.5% 0.003 67.8) | 0, 1, 2, 4 | #0c0e13 |
| card | Cards | #ffffff | 255, 255, 255 | oklch(100.0% 0.000 0.0) | 0, 0, 0, 0 | #14171d |
| foreground | Ink | #000000 | 0, 0, 0 | oklch(0.0% 0.000 0.0) | 0, 0, 0, 100 | #f5f3ee |
| muted-foreground | Secondary text | #5c5c5c | 92, 92, 92 | oklch(47.5% 0.000 0.0) | 0, 0, 0, 64 | #a4a8af |
| border | Rules | #e4e4e4 | 228, 228, 228 | oklch(91.9% 0.000 0.0) | 0, 0, 0, 11 | #2a2e36 |
| signal | Signal, one thing per view | #f1228f | 241, 34, 143 | oklch(63.5% 0.245 356.1) | 0, 86, 41, 5 | #ff6fae |
| signal-text | Signal as small text | #ca0d76 | 202, 13, 118 | oklch(55.0% 0.220 355.9) | 0, 94, 42, 21 | #ff6fae |
| signal-2 | Second ink, used rarely | #ddf93c | 221, 249, 60 | oklch(93.1% 0.200 118.1) | 11, 0, 76, 2 | #d4f73e |

## Contrast (WCAG 2.1)

| Mode | Pair | Ratio | Needs |
|---|---|---|---|
| light | foreground on background (Text) | 18.97 | 4.5 pass |
| light | muted-foreground on background (Secondary text) | 6.04 | 4.5 pass |
| light | muted-foreground on card (Secondary text on cards) | 6.69 | 4.5 pass |
| light | signal-text on background (Signal as small text) | 4.95 | 4.5 pass |
| light | signal on background (Signal marks and large text) | 3.54 | 3 pass |
| light | signal-foreground on signal (Text on signal) | 4.63 | 4.5 pass |
| dark | foreground on background (Text) | 17.41 | 4.5 pass |
| dark | muted-foreground on background (Secondary text) | 8.09 | 4.5 pass |
| dark | muted-foreground on card (Secondary text on cards) | 7.52 | 4.5 pass |
| dark | signal-text on background (Signal as small text) | 7.48 | 4.5 pass |
| dark | signal on background (Signal marks and large text) | 7.48 | 3 pass |
| dark | signal-foreground on signal (Text on signal) | 7.48 | 4.5 pass |
