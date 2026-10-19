import { popupHTML } from '../components/popup/popup.js';
import { textInputHTML } from '../components/text-input/text-input.js';
import { POPUP_FRAMES, POPUP_SPEC, POPUP_BACKDROP, POPUP_BREAKPOINTS, POPUP_DEFAULTS } from '../components/popup/popup.spec.js';
import { esc, anchor, legendItem } from './doc-helpers.js';

// Documentation-only scale so wide previews fit the page. Layout decisions are made by the preview's own width.
export const PREVIEW_ZOOM = { desktop: 0.62, tablet: 0.55, mobile: 0.6 };

export const SCROLL_TITLE = 'Change password';
export const SCROLL_SUBTITLE = 'Prioritize using drag-and-drop the sequence in which you want to see widgets on the main page.';

// Sample content for the scrolling examples: nine fields, 16px apart, as in the Figma Behaviour section.
export const fieldsHTML = (count = 9) =>
  `<div class="ds-bd-pp-fields">${Array.from({ length: count }, () =>
    textInputHTML({ label: 'Enter new password', placeholder: 'Enter current password', showFootnote: false }),
  ).join('')}</div>`;

// A stand-in for the product page behind the popup. It is documentation only.
export const mockPageHTML = (resolution) =>
  `<div class="ds-bd-pp-page ds-bd-pp-page--${resolution}" data-page><div class="ds-bd-pp-page__bar"></div><div class="ds-bd-pp-page__content"><span class="ds-bd-pp-page__line ds-bd-pp-page__line--lg"></span><span class="ds-bd-pp-page__line"></span><span class="ds-bd-pp-page__card"></span><span class="ds-bd-pp-page__card"></span></div></div>`;

// The popup drawn in the flow, at the real width of a Figma frame, in front of the page mock.
export function popupFrame(props, resolution, { height, zoom = PREVIEW_ZOOM[resolution], label = '', width } = {}) {
  const base = POPUP_FRAMES[resolution];
  const frame = { width: width ?? base.width, height: height ?? base.height };
  const html = popupHTML({ ...props, mode: 'static', frame }).replace('<div class="ds-popup__backdrop">', `${mockPageHTML(resolution)}<div class="ds-popup__backdrop">`);
  return `<div class="ds-bd-pp-item">
    ${label ? `<code class="ds-bd-pp-label">${esc(label)}</code>` : ''}
    <div class="ds-bd-pp-zoom" style="zoom:${zoom}">${html}</div>
  </div>`;
}

const row = (label, value) => `<tr><th scope="row">${label}</th><td>${esc(value)}</td></tr>`;
const table = (rows, head = ['', 'Figma value']) =>
  `<table class="ds-table ds-bd-pp-table"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;

const BASIC = { title: POPUP_DEFAULTS.title, body: POPUP_DEFAULTS.body };
const SCROLLING = { title: SCROLL_TITLE, subtitle: SCROLL_SUBTITLE, bodyHTML: fieldsHTML(), primaryLabel: 'Save', scrolling: true };

export function renderOverview() {
  return `<div class="ds-bd-pp-stack">
    ${popupFrame(BASIC, 'desktop', { height: 440, zoom: 0.62, label: 'Desktop, 600px wide, Cancel and a primary action' })}
  </div>
  <p class="ds-bd-note">The darkened layer behind the popup is the <code>blur</code> component. The popup is the Figma <code>modal</code> header (title, optional subtitle, close control), a body and an action area. The same popup becomes a bottom sheet on tablet and mobile.</p>`;
}

export function renderAnatomy() {
  let html = popupHTML({ ...BASIC, subtitle: SCROLL_SUBTITLE, mode: 'static', frame: { width: 1000, height: 520 } });
  html = html.replace('<div class="ds-popup__backdrop">', `${mockPageHTML('desktop')}<div class="ds-popup__backdrop">`);
  html = anchor(html, 'ds-popup__backdrop', 'left', 1);
  html = anchor(html, 'ds-popup__dialog ds-popup__dialog--default ds-popup__dialog--600', 'bottom', 2, '8%');
  html = anchor(html, 'ds-popup__title', 'top', 3, '80px');
  html = anchor(html, 'ds-popup__subtitle', 'left', 4);
  html = anchor(html, 'ds-popup__close', 'right', 5);
  html = anchor(html, 'ds-popup__body', 'left', 6);
  html = anchor(html, 'ds-popup__cancel', 'bottom', 7);
  html = anchor(html, 'ds-popup__primary', 'bottom', 8);

  return `<div class="ds-bd-anatomy">
    <div class="ds-bd-anatomy__stage ds-bd-pp-anatomy">
      <div class="ds-bd-pp-anatomy__figure">${html}</div>
    </div>
    <ol class="ds-bd-anatomy__legend">
      ${legendItem(1, 'Backdrop', `The <code>blur</code> component: ${POPUP_BACKDROP}. It covers the whole page behind the popup.`)}
      ${legendItem(2, 'Popup container', 'gray/50 fill with a 12px radius. No border and no shadow. On desktop it is 600px wide (or 480px), centered, 80px from the top.')}
      ${legendItem(3, 'Title', 'Bold 20/30, gray/900. On tablet and mobile: Bold 16/24.')}
      ${legendItem(4, 'Subtitle', 'Optional (<code>subTitle</code>). Regular 14/20, gray/600, under the title. On tablet and mobile: Regular 12/18.')}
      ${legendItem(5, 'Close control', 'The <code>button-icon-only</code>: a 40px circle, gray/100 fill, 1px gray/200 border, with a 20px close icon in gray/500.')}
      ${legendItem(6, 'Body', 'The content slot. Regular 14/20, gray/900, 20px from each side (16px on tablet and mobile). It is the only part that scrolls.')}
      ${legendItem(7, 'Cancel', 'The Button of type <code>cancel</code> at size 48. Shown on desktop only.')}
      ${legendItem(8, 'Primary action', 'The Button of type <code>primary</code> at size 48, on the right. On tablet and mobile it fills the width.')}
    </ol>
  </div>`;
}

export function renderBasic() {
  return `<div class="ds-bd-pp-stack">
    ${popupFrame(BASIC, 'desktop', { width: 1000, height: 440, zoom: 0.9, label: 'width 600: the Figma frame "600" and the Behaviour examples' })}
    ${popupFrame({ ...BASIC, width: '480' }, 'desktop', { width: 1000, height: 440, zoom: 0.9, label: 'width 480: the Figma frame "480"' })}
  </div>
  ${table(
    [
      row('Width', POPUP_SPEC.desktop.width),
      row('Placement', POPUP_SPEC.desktop.placement),
      row('Surface', POPUP_SPEC.desktop.surface),
      row('Header', POPUP_SPEC.desktop.header),
      row('Title', POPUP_SPEC.desktop.title),
      row('Subtitle', POPUP_SPEC.desktop.subtitle),
      row('Close control', POPUP_SPEC.close),
      row('Body', POPUP_SPEC.desktop.body),
      row('Footer', POPUP_SPEC.desktop.footer),
      row('Gaps', POPUP_SPEC.desktop.gaps),
      row('Actions', 'Cancel (Button type cancel, size 48, 24px high, no fill) then the primary action (type primary, size 48). Right aligned.'),
      row('Backdrop', POPUP_BACKDROP),
    ].join(''),
  )}
  <p class="ds-bd-note">Figma shows the Basic Popup twice. The Popup page has two layout frames, <code>480</code> and <code>600</code>, with the placeholder text "Content". The Behaviour section has the same popup in use, with real copy. The two disagree on spacing. This component follows the Behaviour examples, because they also define the scrolling, tablet and mobile looks. The differences are listed here so that the choice can be checked.</p>
  ${table(
    [
      ['Gap, header to body', '32px', '24px'],
      ['Gap, body to footer', '32px', '24px'],
      ['Gap between the actions', '16px', '32px'],
      ['Cancel', 'Button type white (primary/600 label, 20px padding, 48px high)', 'Button type cancel (gray/600 label, no padding, 24px high)'],
      ['Header', 'Title and close control only', 'Title, optional subtitle and close control'],
      ['Widths', '480 and 600', '600 on desktop; 604 and 343 on tablet and mobile'],
    ]
      .map(([a, b, c]) => `<tr><th scope="row">${a}</th><td>${esc(b)}</td><td>${esc(c)}</td></tr>`)
      .join(''),
    ['', 'Frames 480 and 600', 'Behaviour examples (used here)'],
  )}`;
}

export function renderVariants() {
  const frame = (type, size) => {
    const props = { type, title: 'Customise dashboard', subtitle: SCROLL_SUBTITLE, body: POPUP_DEFAULTS.body };
    if (size === 'desktop') return popupFrame(props, 'desktop', { width: 1000, height: type === 'default' ? 440 : 700, zoom: 0.5, label: `size=desktop, type=${type}` });
    return popupFrame(props, 'mobile', { height: type === 'default' ? 360 : 600, zoom: 0.5, label: `size=mobile, type=${type}` });
  };
  const group = (type) => `<h3>type=${type}</h3><div class="ds-bd-pp-pair">${frame(type, 'desktop')}${frame(type, 'mobile')}</div>`;
  return `${group('default')}${group('successfully')}${group('negative')}
  <p class="ds-bd-note">Figma names the component set <code>modal</code> and defines six header variants: <code>size</code> (desktop, mobile) × <code>type</code> (default, successfully, negative). The set describes the header only. It does not draw a body or actions for the <code>successfully</code> and <code>negative</code> types, so they use the same body and action area as the default type.</p>
  ${table(
    [
      row('type=default', 'Title and close control on one row. The optional subtitle sits under the title.'),
      row('type=successfully', `Desktop: ${POPUP_SPEC.statusHeader.desktop}. Mobile: ${POPUP_SPEC.statusHeader.sheet}. Illustration: a green check (#008236) on a #DCFCE7 circle.`),
      row('type=negative', 'Same layout as successfully. Illustration: a red cross on a #FFE2E1 circle.'),
    ].join(''),
    ['Variant', 'What changes'],
  )}`;
}

export function renderBehaviorTable() {
  const F = 'Figma';
  const D = 'Implementation decision';
  const rows = [
    ['Opening', 'Trigger', D, 'Figma draws the popup open over the page and defines no trigger. The application calls <code>open()</code>.'],
    ['Opening', 'Initial state', D, 'Closed means not rendered. Figma defines no animation, so the popup appears and disappears at once.'],
    ['Opening', 'Initial focus', D, 'Figma defines none. Focus moves to the popup itself, so the title is announced, and the first Tab reaches the close control.'],
    ['Closing', 'Close control', D, 'Figma draws the control but not what it does. It closes the popup.'],
    ['Closing', 'Cancel', F + ' + ' + D, 'Figma shows Cancel on desktop only. It closes the popup.'],
    ['Closing', 'Backdrop click', D, 'Figma defines none. By default a click on the backdrop does nothing, so a person cannot lose work by a stray click. <code>closeOnBackdrop</code> turns dismissal on.'],
    ['Closing', 'Escape', D, 'Figma defines none. Escape closes the popup, which is the standard dialog convention. <code>closeOnEscape</code> turns it off.'],
    ['Closing', 'Primary action', D, 'Figma gives the primary action a label ("Yes", "Button") and nothing else. It does not close the popup. The application decides, through <code>onPrimary</code> or the <code>ds-popup-primary</code> event.'],
    ['Focus', 'Containment and tab order', D, 'Tab and Shift+Tab stay inside the popup, in reading order: close control, content, Cancel, primary action. The page behind is made inert.'],
    ['Focus', 'Restoration', D, 'When the popup closes, focus returns to the element that had it before the popup opened.'],
    ['Content', 'Overflow', F, 'When the content does not fit, the popup grows to the top and bottom limits and the body scrolls. The header and footer stay in place and gain a shadow (shadow-lg and shadow-2xl).'],
    ['Content', 'Page scrolling', D, 'The page behind does not scroll while a popup is open.'],
    ['Content', 'Dynamic height', F, 'Without overflow, the height follows the content. The Behaviour examples are 248px high on desktop and 236px on mobile.'],
    ['Actions', 'Order and alignment', F, 'Desktop: Cancel, then the primary action, aligned to the right, 32px apart. Tablet and mobile: only the primary action, filling the width.'],
  ];
  return table(
    rows.map(([c, r, s, t]) => `<tr><th scope="row">${c} · ${r}</th><td><span class="ds-chip">${s}</span></td><td>${t}</td></tr>`).join(''),
    ['Rule', 'Source', 'Behavior'],
  );
}

export function renderResponsive() {
  const short = { ...BASIC };
  return `<h3>Desktop</h3>
  <div class="ds-bd-pp-stack">
    ${popupFrame(short, 'desktop', { label: '1440 × 900, short content' })}
    ${popupFrame(SCROLLING, 'desktop', { label: '1440 × 900, content scrolls' })}
  </div>
  <h3>Tablet</h3>
  <div class="ds-bd-pp-pair">
    ${popupFrame(short, 'tablet', { label: '744 × 900, short content' })}
    ${popupFrame(SCROLLING, 'tablet', { label: '744 × 900, content scrolls' })}
  </div>
  <h3>Mobile</h3>
  <div class="ds-bd-pp-pair">
    ${popupFrame(short, 'mobile', { label: '375 × 812, short content' })}
    ${popupFrame(SCROLLING, 'mobile', { label: '375 × 812, content scrolls' })}
  </div>
  ${table(
    [
      ['Popup width', '600px (480px also exists)', '604px, 70px from each side', '343px, 16px from each side'],
      ['Placement', 'Centered, 80px from the top (40px when scrolling)', 'Bottom sheet, flush with the bottom edge (16px from the top when scrolling)', 'Bottom sheet, flush with the bottom edge (16px from the top when scrolling)'],
      ['Corners', '12px on all four', '12px on the top two', '12px on the top two'],
      ['Header padding', '24px 20px 0', '16px 16px 0', '16px 16px 0'],
      ['Title / subtitle', '20/30 and 14/20', '16/24 and 12/18', '16/24 and 12/18'],
      ['Close control', 'In the header row, right', 'In the header row, right', 'In the header row, right'],
      ['Cancel', 'Shown', 'Not shown', 'Not shown'],
      ['Primary action', 'Hugs its label, on the right', 'Fills the width', 'Fills the width'],
      ['Footer padding', '24px 20px', '16px', '16px'],
    ]
      .map(([a, b, c, d]) => `<tr><th scope="row">${a}</th><td>${esc(b)}</td><td>${esc(c)}</td><td>${esc(d)}</td></tr>`)
      .join(''),
    ['', 'Desktop', 'Tablet', 'Mobile'],
  )}
  <p class="ds-bd-note">The layout follows the width of the popup's own layer, with the same limits as the Header and Footer: mobile up to ${POPUP_BREAKPOINTS.tabletMin - 1}px, tablet ${POPUP_BREAKPOINTS.tabletMin}px to ${POPUP_BREAKPOINTS.desktopMin - 1}px, desktop from ${POPUP_BREAKPOINTS.desktopMin}px. Tablet and mobile share one layout and differ only in the side margin. The popup does not use the Header and Footer page margins (80px and 40px): its position comes from its own Figma frames.</p>
  <p class="ds-bd-note"><strong>Cancel on tablet and mobile.</strong> None of the four tablet and mobile examples in Figma has a Cancel action, so it is not drawn there. A person can still dismiss the popup with the close control and, on a keyboard, with Escape. If the product needs Cancel on small screens, Figma has to define it first.</p>`;
}

export function renderFormatting() {
  return `<div class="ds-bd-pp-stack">
    ${popupFrame({ ...SCROLLING, subtitle: SCROLL_SUBTITLE }, 'desktop', { width: 1000, height: 640, zoom: 0.9, label: 'Content scrolls: the header and footer stay, the body scrolls between them' })}
  </div>
  <h3>Desktop</h3>
  ${table(
    [
      row('Dimensions', POPUP_SPEC.desktop.width),
      row('Placement', POPUP_SPEC.desktop.placement),
      row('Header spacing', POPUP_SPEC.desktop.header),
      row('Body spacing', POPUP_SPEC.desktop.body),
      row('Footer spacing', POPUP_SPEC.desktop.footer),
      row('Gaps', POPUP_SPEC.desktop.gaps),
      row('Action alignment', 'Right. Cancel, then the primary action, 32px apart, centered vertically with each other.'),
      row('Scrolling', `Header: ${POPUP_SPEC.scrolling.header}. Footer: ${POPUP_SPEC.scrolling.footer}.`),
    ].join(''),
  )}
  <h3>Tablet and mobile</h3>
  ${table(
    [
      row('Dimensions', POPUP_SPEC.sheet.width),
      row('Placement', POPUP_SPEC.sheet.placement),
      row('Surface', POPUP_SPEC.sheet.surface),
      row('Header spacing', POPUP_SPEC.sheet.header),
      row('Body spacing', POPUP_SPEC.sheet.body),
      row('Footer spacing', POPUP_SPEC.sheet.footer),
      row('Gaps', POPUP_SPEC.sheet.gaps),
      row('Action alignment', 'One primary action, filling the width of the footer.'),
    ].join(''),
  )}
  <h3>Text and overlay</h3>
  ${table(
    [
      row('Text wrapping', 'Title, subtitle and body wrap onto more lines and the popup grows in height. A long word breaks rather than overflowing.'),
      row('Overlay', POPUP_BACKDROP),
      row('Close control', POPUP_SPEC.close),
      row('Status header', `Desktop: ${POPUP_SPEC.statusHeader.desktop}. Tablet and mobile: ${POPUP_SPEC.statusHeader.sheet}.`),
    ].join(''),
  )}
  <p class="ds-bd-note">Two details in the Figma examples are not consistent, and the component follows the majority. The tablet scrolling example uses 20px side padding and a 24px top padding in its header, while the tablet short example uses 16px. The Cancel label in the desktop short example is gray/500, while the one in the desktop scrolling example is gray/600; the component uses the <code>cancel</code> Button as it is.</p>`;
}

export function renderStates() {
  return `<p>Figma defines two states for the popup: shown and not shown. It defines no hover, focus, loading, disabled or error look for the popup, the close control or the layout.</p>
  <ul class="ds-bd-list">
    <li><strong>Closed:</strong> the popup is not rendered and the page is interactive.</li>
    <li><strong>Open:</strong> the backdrop and the popup are shown, the page behind is inert and does not scroll.</li>
    <li><strong>Actions:</strong> Cancel and the primary action are Buttons and have the Button states (hover, focus, disabled); see the Button page.</li>
    <li><strong>Close control:</strong> Figma draws it in one state only. A keyboard-focused close control shows the existing <code>shadow-focus-primary</code> ring, as in the notification banner.</li>
  </ul>`;
}
