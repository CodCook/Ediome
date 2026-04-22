---
status: resolved
trigger: "The user encountered an error during video rendering. The provided screenshot shows the React DOM throwing an error inside the Remotion render process..."
created: 2026-04-18T00:00:00Z
updated: 2026-04-18T00:00:00Z
---

## Current Focus

hypothesis: The Remotion interpolate function in `FadeSlide.tsx` receives an input range that is not strictly monotonically increasing when the shot duration perfectly matches twice the frame rate (e.g. 2 seconds at 30fps).
test: Fixed `FadeSlide.tsx` interpolation logic and reran the render command.
expecting: The render should get past the React DOM inputRange error.
next_action: None, verified.

## Symptoms

expected: Video renders successfully using brief.json without Remotion interpolate errors.
actual: React DOM threw an error: `inputRange must be strictly monotonically increasing but got [0,30,30,60]`.
errors: ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL, inputRange must be strictly monotonically increasing
reproduction: pnpm --filter renderer run render
started: Unknown

## Eliminated

## Evidence

- timestamp: 2026-04-18T16:00:00Z
  checked: Render error stack trace
  found: `Error: inputRange must be strictly monotonically increasing but got [0,30,30,60]` occurring in `src/templates/FadeSlide.tsx:6`
  implication: The `interpolate` function's second argument requires strictly ascending values. `[0, fps, durationInFrames - fps, durationInFrames]` evaluates to `[0, 30, 30, 60]` when `durationInFrames` is 60 (2 seconds at 30 fps), causing the error.

## Resolution

root_cause: In `FadeSlide.tsx`, the fade animation used an interpolate input array of `[0, fps, durationInFrames - fps, durationInFrames]`. For a 2-second shot at 30 fps, this results in `[0, 30, 30, 60]`, which violates Remotion's strict monotonic requirement for interpolation ranges because 30 is not strictly greater than 30.
fix: Modified the input range in `FadeSlide.tsx` to calculate `fadeInEnd` and `fadeOutStart` ensuring they never overlap or equate. Used `Math.min(fps, durationInFrames / 2 - 0.1)` and `Math.max(durationInFrames - fps, durationInFrames / 2 + 0.1)`.
verification: Rerunning `pnpm run render` no longer triggers the `inputRange` React DOM error (it proceeded to try rendering the frames, though halted later due to a 404 on localhost:3000 media assets, which is a separate environment issue).
files_changed: ['apps/renderer/src/templates/FadeSlide.tsx']
