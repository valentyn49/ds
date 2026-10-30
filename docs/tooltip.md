# Tooltip

The standard informational Tooltip is implemented independently of Welcomer, onboarding coachmarks, chart hints, Toast, and Popups. No existing flow or global Storybook theme is changed, and no dependency is added.

## Source inspection

Figma section `329:492`, component set `98:1151` on page `98:711`, contains four pointer-edge types: `bottom` (`98:1150`), `right` (`98:1152`), `top` (`98:1157`), `left` (`98:1162`). The entire tree, text properties, layout, fills, strokes, effects and arrow geometry were inspected. Detailed design context/screenshots were retrieved for top, right, left and the bottom content frame `98:1145`. The bottom component's Code Connect response did not return code; its full Plugin API tree and original SVG export provide the verified geometry without reconstructing it.

Original arrow nodes `98:1149`, `98:1161`, `98:1156`, `98:1166` were exported directly as SVG_STRING into `src/components/tooltip/assets`. The source slots are 34×8, 34×8, 8×34, and 8×16 respectively; visible SVG bounds are 17×8, 17×8, 8×17, 8×16. No CSS triangles, copied external icons or expiring Figma URLs are used.

There is one white surface style and no size/state variants. Title is Semibold 14/20, subtitle Regular 12/18, padding 8/12, radius 4, shadow-2xl, white surface and Gray 900 text. Source frame widths differ: bottom/top 220, right 228 (content 221), left 228. Top/left arrows extend 7 px outside the frame; bottom/right include their arrow in the frame with 1 px overlap. The naming is preserved: type=bottom means a downward arrow, with the tooltip above its trigger.

## Architecture and API

- `src/react/Tooltip/Tooltip.tsx`: reusable component, trigger description, body portal, hover/focus events, Escape, layout measurement and cleanup.
- `src/react/Tooltip/position.ts`: typed pointer edges, measured alignment, flipping/shifting, pointer alignment and available-height calculation.
- `src/react/Tooltip/tooltip-controller.ts`: independent per-instance reasons, delays, dismissal latch and fade lifecycle.
- `src/components/tooltip/tooltip.css`: scoped token-based visuals, original arrows, hover bridge, opacity transitions and reduced motion.
- `src/components/tooltip/figma-spec.json`: complete source inventory and SVG hashes.
- `src/react/Tooltip/TooltipDocs.tsx`, `Tooltip.stories.tsx`, `Tooltip.mdx`: all ten requested documentation sections and actual interactive specimens.
- `src/stories/components/tooltips/tooltip.mdx`, `tooltip.stories.js`: established HTML Storybook page mounting the same React implementation, with root cleanup.
- `src/docs/tooltip-docs.css`, `tests/tooltip.test.mjs`, public exports in `src/react/index.ts`, and `test:tooltip` script.

```tsx
<Tooltip title="Tooltip text" subtitle="Small tooltips provide the additional information." type="bottom">
  <Button variant="secondary" size={36}>Hover or focus</Button>
</Tooltip>
```

Props: title, optional subtitle, showSubtitle, type, one focusable child, optional id and className. No visual styling/options kitchen sink or onboarding controls are exposed. The child forwards aria-describedby; existing descriptions are merged, and its refs/events are not replaced. Hidden descriptive content remains associated for assistive technology. No essential information should depend on a tooltip.

## Adopted behavior

Figma has no trigger, gap, delays, collision rules, animations, or min/max width constraints. These are explicit implementation decisions:

- Hover 100 ms; focus immediate; leave grace 100 ms. Trigger focus and trigger/tooltip hover combine rather than cancel each other. Content has no expiry timer.
- Escape dismisses without moving focus, prevents reopening until all reasons leave, and does not bubble into an enclosing popup. Only visible instances install the listener.
- A transparent bridge spans the 8 px tip-to-trigger gap so slow pointer movement across the gap stays hoverable.
- Entrance 150 ms ease-out, exit 120 ms ease-in; opacity only. Reduced motion removes fade durations, including preference changes during a transition.
- Pointer edge preference tries opposite and then other source directions; selected widths are remeasured. Position responds to scroll, resize, ResizeObserver, visual viewport and font changes.
- Adopted collision inset 8 px. Widths shrink only in narrow viewports. Long content is bounded to readable available space and can scroll. If no readable surface can fit without covering the trigger, visual display is suppressed while its accessible description remains.
- Timers, observers, frames and listeners clean up. A generation guard makes real unmount cleanup safe during React StrictMode effect replay. No global positioning or interaction state is shared.

Behavior references: [WAI-ARIA Tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) and [WCAG content on hover or focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html). Carbon was reviewed for documentation hierarchy only; its tooltip styles and variants are not used.

## Run and verification

From `design system`:

```sh
npm run storybook:react
# http://localhost:6007/?path=/docs/components-tooltips-tooltip--docs
npm run storybook
# http://localhost:6006/?path=/docs/components-tooltips-tooltip--docs
npm run build:lib
npm run build-storybook:react
npm run build-storybook
npm run test:tooltip
```

Build both Storybooks before the generated-index check. Tests cover four source directions, flips/shifts, viewport/scroll offsets, arrow centering, available height, combined hover/focus, pointer transfer, Escape latching, re-entry races, reduced motion, cleanup, independent instances, SSR descriptions/IDs, source SVG hashes and generated sidebar entries.

Library and both Storybook builds pass. Full-project typechecking still reports the pre-existing Dropdown/Header check-story errors; no Tooltip errors are reported. Existing bundle-size warnings are not suppressed.

Browser automation is unavailable in this environment. No claim is made that rendered pixels, live hover/focus/Escape, scroll/resize layout, transitions, screen-reader output or Anatomy annotations have been browser-validated. Those require an interactive browser review. Unit geometry/controller tests and SSR output do not substitute for those checks.

The remaining Figma gaps are interaction timing, trigger distance, viewport handling, long-content overflow and responsive rules. Their adopted behavior is documented rather than labeled as a Figma specification. Source asymmetries are retained rather than normalized.
