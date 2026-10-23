# Icons Library

Source: [Figma / Icon Set, node 6:5659](https://www.figma.com/design/spBZF1HWrU83CHRMF8q3mU/-AEGL-AUG--Design-Library?node-id=6-5659).

## Inventory and provenance

The entire specified subtree was inspected through Figma MCP, including all nested frames, components, and instances. It contains **81 displayed entries: 78 components and three instances, with 74 distinct original names and 80 byte-distinct SVG exports**. The component and displayed instance of `open_in_new_tab` export identical SVGs; both source entries are represented. No component sets, variant properties, or semantic nested categories were found. All entries have 24×24 source frames and `viewBox="0 0 24 24"`. The three instances are included rather than silently omitted. Each entry has its own asset and registry identifier.

The old `src/figma/icons.json` listed 104 names collected across earlier Figma work. It is not the inventory of the requested node and is not used by this explorer. The verified source has one naming prefix, `icon /`; layout frames `row` and `icon-tile` do not become categories. No signal icons or logos outside the requested subtree have been claimed as imported.

Every vector was exported using `node.exportAsync({ format: 'SVG_STRING' })` through a read-only Figma MCP session. No Figma nodes were changed. Original exports are in `src/components/icons/assets/`. Their node IDs, names, dimensions, source/visual bounds, paint bindings, stroke metadata, and SHA-256 hashes are retained in `figma-manifest.json`. No SVG optimizer, external icon library, screenshot reconstruction, path simplification, or geometry normalization was used.

80 entries bind their visible paint to Figma `gray/900` (#030712); `icon/logoff` uses unbound black. There are no multicolor visible drawings in this subtree. `chart_tooltip_off` has a source 1.5px stroke, NONE cap, MITER join, and an SVG mask. Its mask's white paint is preserved. A default render retains all exported child SVG markup; mask IDs are scoped per React instance to avoid collisions. Explicit monochrome recoloring changes only matching visible paints, preserving geometry, masks, and transparent fills.

## Component API

```tsx
import { Icon, type FigmaIconName } from '@socrates/design-system';

// Original Figma appearance; decorative by default.
<Icon name="icon/search" />

// Only 24 is a verified size in this collection.
<Icon name="icon/search" size={24} label="Search markets" />

// Explicit monochrome recoloring; omitted color preserves the original asset.
<Icon name="icon/search" color="var(--ds-color-primary-600)" />

// Native accessibility attributes also work.
<Icon name="icon/notifications" aria-label="Notifications" />

const name: FigmaIconName = 'icon/chart_tooltip_off';
```

Canonical names preserve the `icon/` prefix, normalize case, retain source misspellings (`standart`, `check_box_cheked`), and transliterate the Cyrillic `с` in the two `сondensed` names to ASCII `c`. The complete original name remains in the manifest and explorer. Repeated names append `--<node-id>`, for example `icon/info--38-1034`. These are separate source drawings, not invented style variants. No `variant`, arbitrary size scale, or universal stroke-width prop was added.

`IconName` accepts canonical names and existing legacy short names. `FIGMA_ICON_NAMES`, `ICON_ENTRIES`, and `ICON_REGISTRY` describe the imported collection. `ICON_NAMES` retains the original compatibility list so existing component controls/parity stories are not changed. Old short names retain their original geometry and currentColor rendering, with no changes to Button, Stepper, Accordion, or Popup. Canonical names preserve Figma paints by default; for inheritance, explicitly supply `color="currentColor"`.

Decorative icons render `aria-hidden="true"` and `focusable="false"`. `label`, `aria-label`, or `aria-labelledby` expose a meaningful icon with role img; native explicit ARIA overrides remain available. Unknown runtime names throw rather than quietly displaying a different icon.

## Storybook

Both existing Storybooks expose **Foundations → Icons**:

- HTML Storybook: `npm run storybook`, http://localhost:6006/?path=/docs/foundations-icons--docs
- React Storybook: `npm run storybook:react`, http://localhost:6007/?path=/docs/foundations-icons--docs

The shared React explorer has a responsive native-size gallery, immediate name/node-ID search, filtering by the actual Figma prefix, Clear filters, an individual inspector with Figma links, and Copy name / Copy code actions with live success/error feedback. A Clipboard API fallback supports contexts where direct clipboard access fails. The live playground and Args/Controls canvas render the actual reusable Icon component, including in the HTML Storybook. Only the source size is offered; color is explicit and available only for compatible monochrome assets.

Documentation covers anatomy using the existing numbered annotation style, verified sizes, the absence of formal variants, repeated-name drawings, typed usage examples, paint rules, and a complete registry-generated inventory. SVGs remain at 24×24 in preview containers; no geometry is stretched to fill tiles. Tables scroll horizontally on narrow screens.

## Updating exports

1. Inspect the full target subtree in Figma and record source IDs/properties. Export original SVGs; do not infer drawings or variants.
2. Add/update the source SVG files and manifest entries. Keep existing identifiers stable, and classify visible paints and masks before permitting recoloring.
3. After verifying the new exports against Figma, run `node scripts/build-icons.mjs --record-hashes` to record that import snapshot. This is an intentional source update, not a routine way to bypass a hash mismatch.
4. Run `npm run icons:build` to validate hashes/viewports and regenerate the typed registry. Normal library and Storybook builds run this check automatically.
5. Run `npm run test:icons`, both Storybook builds, and `npm run build:lib`. Visually inspect new drawings in a browser against Figma.

The registry is generated from the actual manifest and SVG files. Search, the playground, and the inventory all use this same registry. Runtime rendering uses trusted repository SVG strings bundled by the existing Vite `?raw` support, with no fetch or added dependency.

## Migration opportunities

- `components/icons/icon-paths.js`: existing HTML shared subset. Keep it until callsites can be compared one by one; the compatibility branch intentionally retains this source.
- Text Input, Text Area, Input Tag and Dropdown duplicate subsets including info/chevron/check-box geometry in `text-input/icons.js` and local wrappers.
- Header, Checkbox, RadioButton and Table have local icon modules. Table also contains signal icons outside this collection. Matching names alone are insufficient evidence for replacement.
- A future migration can compare exact exported geometry, preserve the component's existing size/color behavior, and opt matching callsites into the canonical registry with explicit inherited color. No broad migration was performed here.

## Validation status

Asset checks cover all 81 entries, unique IDs, local file hashes, viewports and original geometry. Server-rendered tests cover every React Icon, unchanged default child markup, mask-safe recoloring and scoped IDs, accessible semantics, legacy rendering, search/filter/clear logic, gallery/inventory output, live-demo options, and exact clipboard name/code output. XML parsing checks original SVG validity and viewports.

HTML Storybook, React Storybook, and library builds are checked separately. The repository-wide `npm run typecheck` currently reports existing errors in the unrelated `Dropdown/zz-dropdown-check.stories.tsx` and `Header/zz-header-check.stories.tsx` stories; those files were not changed. The package declaration build excludes those diagnostic stories.

Browser click-through, responsive screenshots, actual OS clipboard behavior, and pixel comparison against the Figma screenshot have not been validated in this environment. There is no browser automation tool available. Running `npm run storybook -- --ci --no-open` fails with `SB_CORE-SERVER_0018 (NoFreePortError)`, reporting that the environment blocks listening on network ports. The automated rendering and interaction-logic checks do not claim browser visual validation.
