# Toast Notifications

Implemented separately from Messages (Banners), with no new dependencies or changes to the Storybook theme.

## Files

- `src/react/Toast/Toast.tsx`: visual primitive, original centralized icons, optional Undo and close.
- `src/react/Toast/toast-manager.ts`: DOM-independent FIFO queue, timing, pauses, action and dismissal lifecycle.
- `src/react/Toast/ToastProvider.tsx`: React context/hooks, body portal, polite announcer, focus restoration and browser preference handling.
- `src/components/toast/toast.css`: exact surfaces and device placement, animations and reduced motion.
- `src/components/toast/figma-spec.json`: inventory of all five variants, source nodes, dimensions and placement measurements.
- `src/react/Toast/Toast.stories.tsx`, `Toast.mdx`, `ToastDocs.tsx`: React playground, all ten requested documentation sections, actual iframe device previews, motion and queue demos.
- `src/stories/components/toast/message.mdx`, `message.stories.js`: existing HTML Storybook documentation with the same React component and lifecycle.
- `src/docs/toast-docs.css`: scoped documentation styling.
- `tests/toast.test.mjs`: lifecycle, rendering, queue and build-index checks.
- `src/react/index.ts`, `package.json`: public exports and `test:toast` command.

## Source and behavior

Figma `81:289` defines `purchase`, `warning`, `alert`, `neutral`, `info`. Each source surface is 343 × 36 px, 8/12 px padding, 4 px radius, shadow-lg, Proxima Nova Semibold 14/20 and 20 px original icons. Optional action is UNDO, 12/16 uppercase. Close uses Gray 200 on colored surfaces and Gray 900 on neutral. Centralized Icon assets correspond to the actual Figma main components.

Figma `5265:17694` defines desktop 1440 × 900 at X16/Y848, width 343; tablet 744 × 900 at X194/Y848, width 356; mobile 375 × 812 at X16/Y760, width 343. Every bottom gap is 16. Tablet is centered; desktop is left aligned. Mobile keeps 16 px side margins. No 80/40 px Header/Footer margins are used. Breakpoints 576/992, mobile fluid width beyond the single reference, and wrapping are documented adaptations, not Figma specifications.

Material fills missing lifecycle rules: one active toast, queued FIFO, short entrance/quicker exit, no focus stealing. Adopted timings are desktop/tablet 180/150 ms and mobile 225/195 ms, with deceleration/acceleration easing and 12 px movement from below. Reduced motion skips animation. Animationend normally completes each phase; a guarded duration+50 ms timer handles missing events.

Default reading time is 4000 ms, extended 10000 ms, configurable positive milliseconds or null for persistence. Action messages persist unless explicitly overridden. No timing differences are assigned by visual type. Provider-level defaultDuration supports a reading-time preference. The timer starts after entrance, pauses for hover/focus/hidden document/window blur, and resumes remaining time only after all pause reasons clear. Queued notifications have no running display timer. IDs guard every delayed completion. Timers are canceled on removal, clear and provider cleanup; StrictMode effect replay is guarded.

Actions call consumer callbacks then dismiss. A thrown callback keeps the toast available. Close dismisses; Escape acts only from within a close-enabled toast. A focused toast restores focus to its connected trigger on dismissal, including reduced-motion dismissal. No automatic focus, global Escape handler, modal layer or swipe interaction is added. Polite live announcements include a semantic type independent of color and clear between records so repeated identical messages can announce again.

Behavior sources:

- https://m1.material.io/components/snackbars-toasts.html
- https://m1.material.io/motion/duration-easing.html
- https://developer.android.com/reference/com/google/android/material/snackbar/Snackbar
- https://m3.material.io/components/snackbar/overview
- https://docs.flutter.dev/release/breaking-changes/snackbar-with-action-behavior-update
- https://github.com/material-components/material-components-web/blob/master/packages/mdc-snackbar/README.md

The Material3 guidelines page requires JavaScript in the browsing environment. Google's official Flutter update provides accessible confirmation of the current Material3 action-persistence rule. Archived Material web guidance is used for polite live regions/local Escape, not as an override of current accessibility requirements. No Material visual styles are copied.

## Run

From `design system`:

```sh
npm run storybook:react
# http://localhost:6007/?path=/docs/components-toast-toast-notifications--docs
npm run storybook
# http://localhost:6006/?path=/docs/components-toast-message--docs
npm run build:lib
npm run build-storybook:react
npm run build-storybook
npm run test:toast
```

Use one application provider for a single notification stream. Device previews intentionally use independent iframe documents and providers so each verifies its own viewport. The motion/queue documentation canvases use separate iframes to avoid overlapping the main playground's notification stream.

## Verification and limits

Automated coverage includes original type names and icons, optional controls, escaped dynamic content, delayed timer start, entrance/exit fallbacks, overlapping pause reasons, action persistence and single invocation, thrown callbacks, custom/persistent durations, 100 rapid FIFO messages, targeted queued dismissal, stale completions, clear/reset cleanup, reduced-motion lifecycle, independent managers, subscriber cleanup, SSR safety, and both generated Storybook indexes.

Library and both Storybook builds pass. All 15 Toast tests pass; the combined Toast, Icons, and Highcharts run passes all 32 tests. Build both Storybooks before the artifact-index checks. Full-project typechecking still reports pre-existing errors in the Dropdown/Header check stories; no Toast errors were reported. Existing large-chunk build warnings remain visible.

Browser automation is unavailable in this environment. Actual pixel comparison, iframe positioning, animations, pointer/keyboard behavior, screen-reader announcements and focus restoration require an interactive browser review. Configuration and server-render tests do not verify those browser behaviors. The responsive examples are live implementations, but are not claimed as browser-validated.

Figma does not specify breakpoint thresholds, overflow/long-message behavior, or lifecycle timing. Those decisions are explicit in the documentation. Original white text on warning orange and info blue does not meet the WCAG AA 4.5:1 contrast target at 14 px. The source palette is preserved; conformance would require a design-approved change.
