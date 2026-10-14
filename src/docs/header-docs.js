import { headerHTML } from '../components/header/header.js';
import {
  HEADER_MARGINS,
  HEADER_BREAKPOINTS,
  HEADER_DESKTOP_FIT,
  HEADER_FRAME_WIDTHS,
  HEADER_FIGMA_PADDING,
  HEADER_SPEC,
} from '../components/header/header.spec.js';
import { esc, anchor, legendItem } from './doc-helpers.js';

// Documentation-only scale so wide previews fit the page. Layout decisions are made by the header's own width.
export const PREVIEW_ZOOM = { desktop: 0.62, tablet: 1, mobile: 1 };

const marginFor = (width) => (width >= HEADER_BREAKPOINTS.desktopMin ? HEADER_MARGINS.desktop : HEADER_MARGINS.tablet);

/**
 * A header shown at a real width on a page-colored frame. `height` leaves room for open menus; the frame creates the
 * containing block for the fixed drawer, so it opens inside the preview.
 */
export function headerFrame(props, { width = HEADER_FRAME_WIDTHS.desktop, zoom, height, showMargins = false, label = '' } = {}) {
  const z = zoom ?? (width > 1000 ? PREVIEW_ZOOM.desktop : 1);
  const margin = marginFor(width);
  const bands = showMargins
    ? `<span class="ds-bd-hd-band ds-bd-hd-band--left" style="width:${margin}px"><b>${margin}px</b></span><span class="ds-bd-hd-band ds-bd-hd-band--right" style="width:${margin}px"><b>${margin}px</b></span>`
    : '';
  return `<div class="ds-bd-hd-item">
    ${label ? `<code class="ds-bd-hd-label">${esc(label)}</code>` : ''}
    <div class="ds-bd-hd-zoom" style="zoom:${z}">
      <div class="ds-bd-hd-frame" style="width:${width}px${height ? `;height:${height}px` : ''}">${headerHTML(props)}${bands}</div>
    </div>
  </div>`;
}

export function renderOverview() {
  return `<div class="ds-bd-hd-stack">${headerFrame({ platform: 'standart', type: 'yes' }, { label: 'size=desktop, platform=standart, type=yes' })}</div>`;
}

export function renderAnatomy() {
  let desktop = headerHTML({ platform: 'standart', type: 'yes' });
  desktop = anchor(desktop, 'ds-header__bar', 'left', 1);
  desktop = anchor(desktop, 'ds-header__brand', 'top', 2, '50%');
  desktop = anchor(desktop, 'ds-header__nav', 'top', 3, '40%');
  desktop = anchor(desktop, 'ds-header__chevron', 'bottom', 4);
  desktop = anchor(desktop, 'ds-header__search-field', 'top', 5, '50%');
  // Icons are SVGs and cannot hold markers, so the cart and profile markers sit on their buttons.
  const onButton = (html, label, dir, n) =>
    html.replace(`class="ds-header__icon-button" aria-label="${label}`, `class="ds-header__icon-button ds-bd-anchor ds-bd-anchor--${dir}" data-n="${n}" aria-label="${label}`);
  desktop = onButton(desktop, 'Cart, 2 items', 'bottom', 6);
  desktop = anchor(desktop, 'ds-header__counter', 'top', 7);
  desktop = onButton(desktop, 'Profile', 'top', 8);

  let mobile = headerHTML({ platform: 'standart', type: 'yes' });
  mobile = mobile.replace(
    'class="ds-header__icon-button ds-header__menu-button" aria-label="Menu"',
    'class="ds-header__icon-button ds-header__menu-button ds-bd-anchor ds-bd-anchor--top" data-n="9" aria-label="Menu"',
  );

  return `<div class="ds-bd-anatomy">
    <div class="ds-bd-anatomy__stage ds-bd-hd-anatomy">
      <div class="ds-bd-hd-anatomy__figure"><div class="ds-bd-hd-frame ds-bd-hd-frame--plain" style="width:1440px">${desktop}</div></div>
    </div>
    <p class="ds-bd-note">Desktop, type=yes</p>
    <div class="ds-bd-anatomy__stage ds-bd-hd-anatomy ds-bd-hd-anatomy--mobile">
      <div class="ds-bd-hd-anatomy__figure ds-bd-hd-anatomy__figure--mobile"><div class="ds-bd-hd-frame ds-bd-hd-frame--plain" style="width:375px">${mobile}</div></div>
    </div>
    <p class="ds-bd-note">Mobile, type=yes: the search field becomes a search icon, and the menu button (9) replaces the navigation.</p>
    <ol class="ds-bd-anatomy__legend">
      ${legendItem(1, 'Header container', 'Full-width bar filled with <code>color/header/background</code> (secondary/900). Its content is inset by the horizontal margin.')}
      ${legendItem(2, 'Logo', 'The Socrates logo, 162px × 32px. The Enterprise platform adds a white <code>Enterprise</code> tag.')}
      ${legendItem(3, 'Navigation', 'Menu items in Semibold 14/20, white, spread between the logo and the actions. Items with a menu open a panel.')}
      ${legendItem(4, 'Chevron', 'A 20px chevron after the label of items that open a menu. It points down when closed and up when open.')}
      ${legendItem(5, 'Search field', '180px × 40px field in secondary/700 with a search icon and the placeholder "Market Search".')}
      ${legendItem(6, 'Cart', 'A 28px cart icon. It is part of the Standart platform.')}
      ${legendItem(7, 'Cart counter', 'An 18px circle in <code>color/header/pin_background</code> (primary/700) with the count in Bold 12/18.')}
      ${legendItem(8, 'Profile', 'A 29px profile icon that opens the profile menu. With <code>warning</code> on, a small orange warning mark sits on it.')}
      ${legendItem(9, 'Menu button', 'Tablet and mobile only: a 24px menu icon that replaces the navigation and the profile icon, and opens the drawer.')}
    </ol>
  </div>`;
}

export function renderResponsive() {
  const rows = [
    ['mobile', `up to ${HEADER_BREAKPOINTS.tabletMin - 1}px`, HEADER_MARGINS.mobile, HEADER_FIGMA_PADDING.mobile, 'Search icon, cart and menu button; logo 124px × 24px; auth links show icons only'],
    ['tablet', `${HEADER_BREAKPOINTS.tabletMin}px to ${HEADER_BREAKPOINTS.desktopMin - 1}px`, HEADER_MARGINS.tablet, HEADER_FIGMA_PADDING.tablet, 'Search field, cart and menu button; auth links show icons and text'],
    ['desktop', `${HEADER_BREAKPOINTS.desktopMin}px and up`, HEADER_MARGINS.desktop, HEADER_FIGMA_PADDING.desktop, 'Full menu, search field, cart and profile'],
  ]
    .map(([name, range, margin, figma, content]) => `<tr><th scope="row">${name}</th><td>${range}</td><td><strong>${margin}px</strong></td><td>${figma}</td><td>${esc(content)}</td></tr>`)
    .join('');

  return `<table class="ds-table ds-bd-hd-table">
      <thead><tr><th>Layout</th><th>Header width</th><th>Required content margin</th><th>Padding drawn in Figma</th><th>Content</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="ds-bd-note">The margin is the distance from each side of the header to its content. The background still spans the full width. The blue bands in the previews mark the margins. The layout is chosen by the header's own width (container queries), so it follows the window in a page and the preview width here.</p>
    <div class="ds-bd-hd-stack">
      ${headerFrame({ platform: 'standart', type: 'yes' }, { width: 1440, showMargins: true, label: 'Desktop · 1440px preview · 80px margins' })}
      ${headerFrame({ platform: 'standart', type: 'yes' }, { width: 744, showMargins: true, label: 'Tablet · 744px preview · 40px margins' })}
      ${headerFrame({ platform: 'standart', type: 'yes' }, { width: 375, showMargins: true, label: 'Mobile · 375px preview · 40px margins' })}
      ${headerFrame({ platform: 'standart', type: 'log out' }, { width: 375, showMargins: true, label: 'type=log out · Mobile · 375px · 40px margins' })}
      ${headerFrame({ platform: 'standart', type: 'yes' }, { width: 1280, zoom: 0.72, showMargins: true, label: '1280px preview · 80px margins · the menu does not fit yet, so the tablet layout is kept' })}
    </div>
    <h3>What adapts</h3>
    <ul class="ds-bd-list">
      <li><strong>Navigation:</strong> shown as menu items on desktop; on tablet and mobile it moves into the drawer behind the menu button.</li>
      <li><strong>Search:</strong> a 180px field on desktop and tablet; a search icon on mobile.</li>
      <li><strong>Profile:</strong> an icon on desktop; on tablet and mobile it is at the bottom of the drawer.</li>
      <li><strong>Logo:</strong> 162px × 32px, or 124px × 24px on mobile.</li>
      <li><strong>Logged-out links (type=log out):</strong> icon and text on desktop and tablet; icon only on mobile.</li>
    </ul>
    <p class="ds-bd-note"><strong>Verified in Figma:</strong> which elements each size shows, the logo sizes, the gaps, and the ranges 0-576 / 577-1200 / 1201 and up (the sections on the Headers page show the mobile header up to 576, the tablet header from 577 to 1200 and the desktop header at 1201 and above). <strong>Decisions from outside Figma:</strong> the 80px / 40px / 40px margins, which replace the 24px / 24px / 16px paddings drawn in Figma. With 80px margins the desktop menu needs about ${HEADER_DESKTOP_FIT.standart}px (Standart) or ${HEADER_DESKTOP_FIT.enterprise}px (Enterprise) of width, so between 1201px and that width the tablet layout (menu button) is kept and the margin stays 80px. Figma has no layout for that range.</p>`;
}

export function renderVariants() {
  const combos = [];
  for (const platform of ['standart', 'enterprise'])
    for (const type of ['yes', 'first purchase', 'registration', 'log out']) combos.push({ platform, type });
  return `<div class="ds-bd-hd-stack ds-bd-hd-stack--tight">${combos
    .map((props) => headerFrame(props, { width: 1440, label: `platform=${props.platform}, type=${props.type}` }))
    .join('')}</div>
    ${headerFrame({ platform: 'standart', type: 'yes', warning: true }, { width: 1440, label: 'warning on (platform=standart, type=yes)' })}
    <p class="ds-bd-note">Figma names 24 variants from <code>size</code> (desktop, tablet, mobile), <code>platform</code> (standart, enterprise) and <code>type</code> (yes, first purchase, registration, log out), plus a boolean <code>warning</code>. The <code>size</code> variants are the responsive layouts above, so they are not a prop. In the Figma set <code>registration</code> is the logo-only header and <code>log out</code> is the logged-out header with Login and Sign Up (Request Information on Enterprise).</p>`;
}

export function renderStates() {
  const panel = (panelKey, label, extra = {}) =>
    headerFrame({ platform: 'standart', type: 'yes', open: { panel: panelKey, ...extra } }, { width: 1440, height: extra.height ?? 600, label });
  return `<h3>Desktop menus</h3>
    <div class="ds-bd-hd-stack">
      ${panel('markets', 'Socrates Markets open, with the Performance Trackers submenu', { flyout: true, height: 640 })}
      ${panel('myMarkets', 'My Markets open', { height: 300 })}
      ${panel('help', 'Help open, with the Members Help submenu', { flyout: true, height: 330 })}
      ${panel('profile', 'Profile open', { height: 460 })}
      ${panel('cart', 'Cart open', { height: 380 })}
    </div>
    <h3>Drawer (tablet and mobile)</h3>
    <div class="ds-bd-hd-row">
      ${headerFrame({ platform: 'standart', type: 'yes', open: { drawer: true, expanded: ['Socrates Markets'] } }, { width: 375, height: 812, label: 'Mobile · Socrates Markets expanded' })}
      ${headerFrame({ platform: 'standart', type: 'yes', open: { drawer: true, expanded: ['account'] } }, { width: 375, height: 812, label: 'Mobile · account expanded' })}
    </div>
    <p class="ds-bd-note">Figma shows the open menus as page frames and does not name them as component states. Menus open from their button; the open item's chevron points up and the page below is blurred. Figma defines no hover look for header items (the hovered <code>Purchase</code> item in its frame does not change), so none is built. The Watchlist menu (Energy, Tech-list, Bonds, Commodities) is defined too; open it in the Live Demo.</p>`;
}

export function renderFormatting() {
  const row = (label, value) => `<tr><th scope="row">${label}</th><td>${esc(value)}</td></tr>`;
  return `<div class="ds-bd-callout">
      <strong>Horizontal content margins: 80px on desktop, 40px on tablet, 40px on mobile.</strong>
      <span>Applied on both sides. The header background spans the full width.</span>
    </div>
    <table class="ds-table">
      <thead><tr><th></th><th>Figma value</th></tr></thead>
      <tbody>
        ${row('Surface', HEADER_SPEC.surface)}
        ${row('Padding', HEADER_SPEC.padding)}
        ${row('Height', HEADER_SPEC.heights)}
        ${row('Logo', HEADER_SPEC.logo)}
        ${row('Gaps', HEADER_SPEC.gaps)}
        ${row('Menu item', HEADER_SPEC.menuItem)}
        ${row('Actions', HEADER_SPEC.actions)}
        ${row('Counter', HEADER_SPEC.counter)}
        ${row('Warning', HEADER_SPEC.warning)}
        ${row('Panels', HEADER_SPEC.panel)}
        ${row('Panel items', HEADER_SPEC.panelItem)}
        ${row('Drawer', HEADER_SPEC.drawer)}
        ${row('Overlays', HEADER_SPEC.overlay)}
      </tbody>
    </table>
    <p class="ds-bd-note">Items are vertically centered in the bar. The <code>registration</code> header centers the logo; the other types space the logo, menu and actions apart. Standart menu items have no horizontal padding while Enterprise items have 12px, as drawn in Figma. Figma defines no border or divider on the header bar.</p>`;
}
