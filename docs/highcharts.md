# Highcharts implementation

Entry: `src/react/Highcharts/Highcharts.tsx`. Public types: `types.ts`. Data-to-options mapping and Figma paints: `options.ts`. Styles and original exported control SVGs: `src/components/highcharts/`. Source inventory: `figma-spec.json`.

## Run and review

```sh
npm run storybook:react
# http://localhost:6007/?path=/docs/components-highchart-highcharts--docs
npm run storybook
# http://localhost:6006/?path=/docs/components-highchart-chart--docs

npm run build:lib
npm run build-storybook:react
npm run build-storybook
node --test tests/highcharts.test.mjs
```

The HTML Storybook mounts the same React chart, with root cleanup through Storybook preview hooks. Both documentation pages preserve the existing light theme. The React component includes no sample data; deterministic documentation fixtures live in `mock-data.ts`.

## Verified source

All nine variants under Figma `3444:3753` were inspected, together with the adjacent Tooltip logic and options sections. Three types (`default`, `price sparkline`, `homepage`) each have desktop, tablet and mobile configurations. Original control and legend glyphs were exported with SVG_STRING; the plotted graph uses Highcharts, never copied static vectors.

The source binds the Price Channel legend and primary OHLC geometry to the same `price` property. The implementation retains that relationship instead of adding an unverified blue channel plot. Both technical plot lines are orange; the original orange/green legend drawing remains unchanged.

## Integration

- Highcharts Stock **12.6.2**, official `@highcharts/react` **5.1.0** Stock wrapper, React 19.3.1, TypeScript 7.0.2.
- Wrapper and accessibility module use the same ESM Stock engine. No global theme, engine reassignment, or `setOptions` call.
- Data is copied, IDs remain stable, and the wrapper uses `chart.update(..., true, true)` for updates. The wrapper version lacks unmount destruction; parent cleanup destroys its chart after a microtask, with a generation guard for StrictMode effect replay.
- Container observation selects the documented layout. Highcharts' own reflow observes the drawing container. Observers and listeners are released on unmount.
- Figma does not define a financial point-tooltip format. `formatTooltip` accepts plain text, which is escaped before Highcharts renders it. No formatter means no financial tooltip. The verified study-control hints remain separate.
- Standard fullscreen uses the browser API. The product provides `onFullscreenRequest` to enable Advanced Fullscreen and define its workflow. When supplied, the callback handles both modes.

## Dependency retrieval in this environment

The npm registry could not resolve from this sandbox. To perform actual build validation, the required published runtime/type source graph was fetched read-only from the official `highcharts/highcharts-dist` **v12.6.2** and `highcharts/highcharts-react` **v5.1.0** GitHub tags into ignored `node_modules`. Those sources are not vendored or committed. The normal package declarations and npm-accepted lockfile record the exact versions; no tarball integrity values were fabricated. A clean install requires registry access. Runtime imports, the Stock constructor, OHLC renderer, accessibility module, and official wrapper were checked directly.

## Verification limits

Library and both Storybook builds pass. Automated tests verify the nine configuration combinations, data copying/updates, input rejection, study visibility isolation, tooltip inclusion and escaping, runtime integration, and generated sidebar entries. These are configuration/runtime-import checks, not browser interaction tests.

Browser automation is unavailable in this environment; local server binding and headless Chrome launch were blocked. Pixel comparison, pointer/keyboard interaction, actual resize and fullscreen behavior, screen-reader behavior, and repeated browser mount/unmount still need an interactive review. Do not treat the implementation as pixel-validated against Figma.

Full-project `npm run typecheck` remains blocked by pre-existing errors in `Dropdown/zz-dropdown-check.stories.tsx` and `Header/zz-header-check.stories.tsx`. The chart has no reported TypeScript errors, and the library declaration build passes. Builds report the existing large-bundle warnings; no global build settings were changed to suppress them.

## Remaining product decisions

Financial tooltip contents, Advanced Fullscreen behavior, and exact responsive breakpoints are not defined in Figma. Auto layout uses the existing 576/992 px application conventions. Data values and date domains are supplied by the consumer rather than hardcoded from the design image. Native Highcharts axis/navigator geometry and all source-sized previews require browser comparison before visual sign-off.
