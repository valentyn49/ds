import { footerHTML } from '../components/footer/footer.js';
import {
  FOOTER_MARGINS,
  FOOTER_BREAKPOINTS,
  FOOTER_FRAME_WIDTHS,
  FOOTER_FIGMA_PADDING,
  FOOTER_SPEC,
} from '../components/footer/footer.spec.js';
import { esc, anchor, legendItem } from './doc-helpers.js';

// Documentation-only scale so wide previews fit the page. Layout decisions are made by the footer's own width.
export const PREVIEW_ZOOM = { desktop: 0.62, tablet: 1, mobile: 1 };

export function footerFrame(props, resolution, { showMargins = false, label = '' } = {}) {
  const size = props.size ?? 'big';
  const width = FOOTER_FRAME_WIDTHS[size][resolution];
  const margin = FOOTER_MARGINS[resolution];
  const bands = showMargins
    ? `<span class="ds-bd-ft-band ds-bd-ft-band--left" style="width:${margin}px"><b>${margin}px</b></span><span class="ds-bd-ft-band ds-bd-ft-band--right" style="width:${margin}px"><b>${margin}px</b></span>`
    : '';
  return `<div class="ds-bd-ft-item">
    ${label ? `<code class="ds-bd-ft-label">${esc(label)}</code>` : ''}
    <div class="ds-bd-ft-zoom" style="zoom:${PREVIEW_ZOOM[resolution]}">
      <div class="ds-bd-ft-frame" style="width:${width}px">${footerHTML(props)}${bands}</div>
    </div>
  </div>`;
}

export function renderOverview() {
  return `<div class="ds-bd-ft-stack">
    ${footerFrame({ size: 'big', type: 'standart' }, 'desktop', { label: 'size=big, resolution=desktop, type=standart' })}
    ${footerFrame({ size: 'small' }, 'desktop', { label: 'size=small, resolution=desktop' })}
  </div>`;
}

export function renderAnatomy() {
  let html = footerHTML({ size: 'big', type: 'standart' });
  html = anchor(html, 'ds-footer ds-footer--big ds-footer--standart', 'left', 1);
  html = anchor(html, 'ds-footer__brand', 'top', 2, '81px');
  html = anchor(html, 'ds-footer__notice', 'left', 3);
  html = anchor(html, 'ds-footer__nav', 'top', 4, '50%');
  html = html.replace(
    '<div class="ds-footer__legal">',
    '<div class="ds-footer__legal"><i class="ds-bd-ft-divider ds-bd-anchor ds-bd-anchor--left" data-n="5"></i>',
  );
  html = anchor(html, 'ds-footer__copyright', 'bottom', 6, '40px');
  html = anchor(html, 'ds-footer__legal-links', 'bottom', 7, '50%');

  return `<div class="ds-bd-anatomy">
    <div class="ds-bd-anatomy__stage ds-bd-ft-anatomy">
      <div class="ds-bd-ft-anatomy__figure">${html}</div>
    </div>
    <ol class="ds-bd-anatomy__legend">
      ${legendItem(1, 'Footer container', 'Full-width surface filled with <code>color/header/background</code> (secondary/900). The content inside is inset by the horizontal margin.')}
      ${legendItem(2, 'Logo', 'The Socrates logo, 162px × 32px, in white. The Enterprise type adds a white <code>Enterprise</code> tag next to it.')}
      ${legendItem(3, 'Legal text', 'Two text blocks in Regular 12/18, white: the educational-use notice, and the <code>Important Note</code> with a semibold heading.')}
      ${legendItem(4, 'Link columns', 'Three columns of links. Group headings are Semibold 14/20 in white; links are Regular 14/20 in gray/300.')}
      ${legendItem(5, 'Divider', 'A 1px secondary/800 line, 17px above the legal bar. On desktop it runs the full width of the footer.')}
      ${legendItem(6, 'Copyright', 'Regular 12/18 in gray/200.')}
      ${legendItem(7, 'Legal links', 'Regular 12/18 in gray/300, 24px apart. The Enterprise type shows only <code>Contact</code>.')}
    </ol>
  </div>`;
}

export function renderResponsive() {
  const rows = ['desktop', 'tablet', 'mobile']
    .map((resolution) => {
      const range =
        resolution === 'desktop'
          ? `${FOOTER_BREAKPOINTS.desktopMin}px and up`
          : resolution === 'tablet'
            ? `${FOOTER_BREAKPOINTS.tabletMin}px to ${FOOTER_BREAKPOINTS.desktopMin - 1}px`
            : `up to ${FOOTER_BREAKPOINTS.tabletMin - 1}px`;
      const figma = FOOTER_FIGMA_PADDING.big[resolution];
      return `<tr><th scope="row">${resolution}</th><td>${range}</td><td><strong>${FOOTER_MARGINS[resolution]}px</strong></td><td>${figma}</td></tr>`;
    })
    .join('');

  return `<table class="ds-table ds-bd-ft-table">
      <thead><tr><th>Layout</th><th>Footer width</th><th>Required content margin</th><th>Padding drawn in Figma</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="ds-bd-note">The margin is the distance from each side of the footer to its content. The background still spans the full width. The blue bands in the previews mark the margins. The layout is chosen by the footer's own width (container queries), so it follows the window in a page and the preview width here.</p>
    <div class="ds-bd-ft-stack">
      ${footerFrame({ size: 'big' }, 'desktop', { showMargins: true, label: 'Desktop · 1440px preview · 80px margins' })}
      ${footerFrame({ size: 'big' }, 'tablet', { showMargins: true, label: 'Tablet · 744px preview · 40px margins' })}
      ${footerFrame({ size: 'big' }, 'mobile', { showMargins: true, label: 'Mobile · 392px preview · 40px margins' })}
      ${footerFrame({ size: 'small' }, 'mobile', { showMargins: true, label: 'size=small · Mobile · 375px preview · 40px margins' })}
    </div>
    <h3>What adapts</h3>
    <ul class="ds-bd-list">
      <li><strong>Desktop:</strong> ${esc(FOOTER_SPEC.desktopLayout)}.</li>
      <li><strong>Tablet:</strong> ${esc(FOOTER_SPEC.tabletLayout)}.</li>
      <li><strong>Mobile:</strong> ${esc(FOOTER_SPEC.mobileLayout)}.</li>
    </ul>
    <p class="ds-bd-note"><strong>Verified in Figma:</strong> the three layouts above, their gaps and the vertical padding. <strong>Decisions from outside Figma:</strong> the 80px / 40px / 40px margins (project requirement, replacing the 130px / 24px / 16px paddings drawn in Figma), and the widths where each layout starts. The Footer variants do not state thresholds; the values come from the size ranges on the Figma Headers page. Link text breaks inside words on very narrow footers so nothing overflows, and the margins stay unchanged.</p>`;
}

export function renderVariants() {
  const items = [
    { label: 'size=big, type=standart', props: { size: 'big', type: 'standart' } },
    { label: 'size=big, type=enterprise', props: { size: 'big', type: 'enterprise' } },
    { label: 'size=small', props: { size: 'small' } },
  ];
  return `<div class="ds-bd-ft-stack">${items.map(({ label, props }) => footerFrame(props, 'desktop', { label })).join('')}</div>
    <p class="ds-bd-note">Figma names nine variants from three properties: <code>size</code> (big, small), <code>resolution</code> (desktop, tablet, mobile) and <code>type</code> (standart, enterprise). The <code>resolution</code> variants are the responsive layouts shown above, so they are not a prop. <code>type</code> exists only for <code>big</code>.</p>`;
}

export function renderFormatting() {
  const row = (label, value) => `<tr><th scope="row">${label}</th><td>${esc(value)}</td></tr>`;
  return `<div class="ds-bd-callout">
      <strong>Horizontal content margins: 80px on desktop, 40px on tablet, 40px on mobile.</strong>
      <span>Applied on both sides. The footer background spans the full width.</span>
    </div>
    <table class="ds-table">
      <thead><tr><th></th><th>Figma value</th></tr></thead>
      <tbody>
        ${row('Surface', FOOTER_SPEC.surface)}
        ${row('Vertical padding', FOOTER_SPEC.verticalPadding)}
        ${row('Between sections', FOOTER_SPEC.sectionGap)}
        ${row('Brand', FOOTER_SPEC.brand)}
        ${row('About block gaps', FOOTER_SPEC.aboutGap)}
        ${row('Legal text', FOOTER_SPEC.text)}
        ${row('Group heading', FOOTER_SPEC.heading)}
        ${row('Link', FOOTER_SPEC.link)}
        ${row('Link spacing', FOOTER_SPEC.linkGaps)}
        ${row('Copyright', FOOTER_SPEC.legalCopyright)}
        ${row('Legal links', FOOTER_SPEC.legalLinks)}
        ${row('Divider', FOOTER_SPEC.divider)}
        ${row('size=small', FOOTER_SPEC.small)}
      </tbody>
    </table>
    <p class="ds-bd-note">Text is left-aligned in the big footer and centered in the small one. In the My Account mockup the footer sits at the bottom of the page at full width, below the page content, which is inset 130px from each side; the footer's required margin is 80px on desktop. Figma defines no fixed height, so the footer grows with its content.</p>`;
}
