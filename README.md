# RyOrb: Rift of Ages 3D (1985 // 2098)

Third-person browser action game. RyOrb, the bald cyborg-armed warrior, hunts time portals that rip open
between neon-synthwave **1985** and the **2098** machine war. Jump into 5 portals, then destroy the **OMEGA SENTINEL**.

Play: open `index.html` from any static web server (ES modules need http, not `file://`).

## Controls
| | Desktop | Phone / tablet |
|---|---|---|
| Move | WASD / arrows (camera-relative) | left-thumb virtual joystick |
| Look | mouse (click to lock pointer) or drag | drag on the right side |
| Jump | Space | JUMP |
| Dodge-roll | Shift (or C, right-click) | ROLL |
| Throw disc | Left click / F / J / Enter | DISC |
| Mute | M or the speaker button | speaker button |

Title screen: first input turns audio on and starts the theme, second input starts the game; the theme fades out in play.

URL flags: `?demo` autopilot, `?capture` (autopilot + externally stepped frames for recording), `?lowfx` (no bloom, lower res), `?hifx` (never auto-downgrade), `?fps` (fps readout).

## Code
- `src/eras.js` – **ERAS table** (year, palette, fog, sky, lights, enemy roster + spawn weights, spawn FX, music hook, quips, props builder). Add a year by adding an entry.
- `src/main.js` – game loop, hero, disc + chain, camera, input, enemy registry (`ENEMY_TYPES`) and AI, portals, warp tunnel, boss, HUD, title scene, demo autopilot.
- `src/models.js` – primitive/low-poly models (RyOrb, disc, 1985 crew, 2098 machines, boss, title dragon).
- `src/world.js` – arena layout (AABB colliders, stairs, jump pads, portal spots), collision, sky dome, autopilot nav graph.
- `src/audio.js` – WebAudio SFX + title theme.
- `vendor/three` – Three.js r170 (MIT), vendored.

All characters and designs are original.
