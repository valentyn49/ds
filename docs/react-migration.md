# React migration continuation

The continuation reuses the existing React components and the shared HTML CSS/specifications/assets. Dropdown/DropdownItems, Popup/PopupView, Table and its helpers, and Header are now public library exports with public TypeScript types. No HTML component was removed or redesigned, and no prototype was migrated.

## Branch state

The working tree was clean before synchronization. Fetching origin failed because github.com could not be resolved. The cached origin/main at ea72cf4 was merged into react-migration-wip using `git merge --no-commit --no-ff origin/main`, with no conflicts. The merge remains uncommitted. The verified SVG registry, Highcharts, Toast, Tooltip, tests, and documentation from that revision are preserved. Remote freshness still needs confirmation once network access is available.

## Changes

- Dropdown: explicit combobox/listbox relationships for the trigger and search, accessible search name, unique default IDs for standalone item groups, safe selection after options are removed/replaced, and dismissal when focus leaves. Controlled/uncontrolled APIs and shared CSS are retained.
- Popup: shared modal environment preserves background isolation, original inert/scroll styles, and topmost keyboard handling when dialogs overlap or close out of order. Focus is restored only when the closing dialog was topmost and the destination is available.
- Header: visible drawers isolate background content, lock scrolling, trap keyboard focus, and restore focus on closure. Hidden desktop drawers release modal effects. Desktop Escape selects the visible trigger and honors prevented events; outside presses are scoped to the Header instance. Controlled requests do not mutate state that the consumer has not accepted.
- Table: the existing implementation remains intact. Public exports include its cell/header/divider helpers and data/configuration types. Sorting and toggle glyphs remain presentational, matching the HTML component.
- Stories: diagnostic TypeScript errors are fixed; Dropdown has a dynamic-options example; Header has MDX documentation and separate iframe documents for always-open drawer previews. Existing markup parity stories explicitly account for the intentional nonvisual accessibility additions.

Nested Header expansion uses stable `Section:Row` keys, such as `Socrates Markets:Bonds`; the legacy HTML builder uses generated IDs for nested rows. This existing React API is preserved.

## Validation

Run from the Design System directory, with installed dependencies:

```sh
npm run typecheck
npm run build:lib
npm run typecheck:consumer
npm run build-storybook:react
npm run build-storybook
npm test
```

Build before running the consumer check and tests: some tests inspect library exports and Storybook indexes. `npm run test:react` runs the new integration suite alone. It uses Node's test runner and the existing esbuild installation, with no additional dependencies.

The new integration suite compares normalized server markup against the HTML builders for 64 Dropdown combinations, 66 Table cells (33 variants as cells and row headers), four table configurations, 36 Popup configurations, and 48 Header combinations. It also checks public exports/styles, semantic relationships, standalone IDs, stable nested Header keys, and modal lifecycle/keyboard decisions using small DOM doubles. Those doubles do not emulate browser layout or React event dispatch.

The consumer fixture compiles against generated package declarations. App integration was also checked using a temporary copy of the fixture inside socrates-app, its normal typecheck/build, and a bundle/render smoke check using the app's Vite React deduplication. No application source changes were retained. Direct Node SSR across the two linked node_modules trees does not apply Vite deduplication and encounters duplicate React; it is not an app browser-build check.

Package contents are inspectable with `npm pack --dry-run --json`. The library package excludes proprietary font binaries; application and Storybook builds reference/include fonts locally. No generated site or package was published.

## Browser review still required

Headless Chrome terminated during the launch probe in this environment. Successful builds and normalized markup comparisons do not establish pixel parity, live focus behavior, or screen-reader output.

- Compare HTML and React at 375px, 744px, and 1440px, plus Header layout transition widths.
- Dropdown: click/keyboard selection, search and no matches, controlled requests, option replacement/removal, blur, disabled/error states, and active-descendant announcements.
- Popup: every type/width, scrolling content, close reasons, Tab/Shift+Tab, nested dialogs, lower-dialog removal, contained rendering, focus restoration, and original page scroll styles.
- Table: all cells in both themes, subscription tints, dividers/actions, horizontal scrolling, sticky-column shadow, captions, and row headers.
- Header: account/platform variants, disclosures/flyouts, outside presses across multiple headers, controlled requests, drawer expansion, scrim/Escape, Tab trapping, resizing while open, and isolated drawer preview frames.
- Run the existing diagnostic and HTML parity stories in a browser; verify no console errors. Exercise Icons, Highcharts, Toast, and Tooltip after synchronization.

Once network access returns, fetch and compare origin/main again before finalizing the pending merge. No commit, push, or merge into main was performed by this continuation.
