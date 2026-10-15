import './tabs.css';
import { ICON_PATHS } from '../icons/icon-paths.js';
import { TABS_TYPES, SMALL_TAB_MODES, TYPE_SLUG, ITEM_COUNT, FIGMA_LABEL, PRO_LABEL, TABS_DEFAULTS } from './tabs.spec.js';

export { TABS_TYPES, SMALL_TAB_MODES, ITEM_COUNT, FIGMA_LABEL, TABS_DEFAULTS };

// "icon / info" and "icon / сondensed" from the Figma icon library (24 x 24 artboard). The condensed glyph is
// drawn rotated by 180 degrees in Figma, so its coordinates are mirrored here. "plus" comes from the shared set.
const INFO =
  'M11.25 16.75H12.75V11H11.25V16.75ZM12 9.2885C12.2288 9.2885 12.4207 9.21108 12.5755 9.05625C12.7303 8.90142 12.8077 8.70958 12.8077 8.48075C12.8077 8.25192 12.7303 8.06008 12.5755 7.90525C12.4207 7.75058 12.2288 7.67325 12 7.67325C11.7712 7.67325 11.5793 7.75058 11.4245 7.90525C11.2697 8.06008 11.1923 8.25192 11.1923 8.48075C11.1923 8.70958 11.2697 8.90142 11.4245 9.05625C11.5793 9.21108 11.7712 9.2885 12 9.2885ZM12.0017 21.5C10.6877 21.5 9.45267 21.2507 8.2965 20.752C7.14033 20.2533 6.13467 19.5766 5.2795 18.7218C4.42433 17.8669 3.74725 16.8617 3.24825 15.706C2.74942 14.5503 2.5 13.3156 2.5 12.0017C2.5 10.6877 2.74933 9.45267 3.248 8.2965C3.74667 7.14033 4.42342 6.13467 5.27825 5.2795C6.13308 4.42433 7.13833 3.74725 8.294 3.24825C9.44967 2.74942 10.6844 2.5 11.9983 2.5C13.3123 2.5 14.5473 2.74933 15.7035 3.248C16.8597 3.74667 17.8653 4.42342 18.7205 5.27825C19.5757 6.13308 20.2528 7.13833 20.7518 8.294C21.2506 9.44967 21.5 10.6844 21.5 11.9983C21.5 13.3123 21.2507 14.5473 20.752 15.7035C20.2533 16.8597 19.5766 17.8653 18.7218 18.7205C17.8669 19.5757 16.8617 20.2528 15.706 20.7518C14.5503 21.2506 13.3156 21.5 12.0017 21.5Z';
const CONDENSED =
  'M 21.5 4.5 L 21.5 19.5 L 2.5 19.5 L 2.5 4.5 L 21.5 4.5 Z M 4 12.75 L 4 18 L 11.5091 18 L 12.7856 18 L 20 18 L 20 12.75 L 12.7856 12.75 L 12.7856 18 L 11.5091 18 L 11.5091 12.75 L 4 12.75 Z M 8.2498 6 L 4 6 L 4 11.25 L 8.2498 11.25 L 8.2498 6 Z M 20 6 L 15.7498 6 L 15.7498 11.25 L 14.2498 11.25 L 14.2498 6 L 9.7498 6 L 9.7498 11.25 L 20 11.25 L 20 6 Z';

// The icon each type uses, its size in Figma and where it sits next to the label.
const ICONS = {
  tab: { path: ICON_PATHS.plus, size: 20, after: true },
  'General tab': { path: INFO, size: 16, after: false },
  'Small tab': { path: CONDENSED, size: 16, after: false },
};

const escapeHTML = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let uid = 0;

/**
 * Sample items for demos. Labels are neutral placeholders; Figma only defines the repeated sample text.
 * Options mirror the optional Figma properties: icon (all types), pro and divider (General tab only).
 */
export function sampleItems(type, count, { icon = false, pro = false, divider = false, labels } = {}) {
  const range = ITEM_COUNT[type] || ITEM_COUNT.tab;
  const n = Math.min(range.max, Math.max(range.min, Math.round(count ?? range.default)));
  return Array.from({ length: n }, (_, i) => ({
    label: labels ? labels[i] ?? labels[labels.length - 1] : `Tab ${i + 1}`,
    icon,
    pro: type === 'General tab' && pro && i === n - 1,
    dividerBefore: type === 'General tab' && divider && n > 2 && i === n - 1,
  }));
}

const iconHTML = (type) => {
  const { path, size } = ICONS[type];
  return `<span class="ds-tabs__icon" aria-hidden="true"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" focusable="false"><path d="${path}"/></svg></span>`;
};

/**
 * Props:
 *   type     -> Figma component: 'tab' | 'General tab' | 'Small tab'
 *   mode     -> 'light' | 'dark' (Small tab only)
 *   items    -> [{ label, disabled, icon, pro, dividerBefore, href, panel, previewState }]
 *   selected -> index of the selected item (null for none, used by the state previews)
 *   ariaLabel-> accessible name of the tab bar
 * 'tab' and 'Small tab' are real tab interfaces (tablist / tab / tabpanel). 'General tab' is navigation: links with aria-current.
 * previewState ('hover' | 'pressed') only forces a look for documentation.
 */
export function tabsHTML({
  type = TABS_DEFAULTS.type,
  mode = TABS_DEFAULTS.mode,
  items = sampleItems(type, ITEM_COUNT[type]?.default),
  selected = 0,
  ariaLabel = TABS_DEFAULTS.ariaLabel,
} = {}) {
  const t = TABS_TYPES.includes(type) ? type : TABS_DEFAULTS.type;
  const isNav = t === 'General tab';
  const list = items.map((item) => ({ ...item, disabled: Boolean(item.disabled) && t !== 'tab' }));
  let current = selected === null ? -1 : Math.min(Math.max(Number(selected) || 0, 0), list.length - 1);
  if (current >= 0 && list[current]?.disabled) current = list.findIndex((item) => !item.disabled);
  const tabStop = current >= 0 ? current : list.findIndex((item) => !item.disabled);

  const id = `ds-tabs-${++uid}`;
  const hasPanels = !isNav && list.some((item) => item.panel !== undefined);
  const modeClass = t === 'Small tab' ? ` ds-tabs--${SMALL_TAB_MODES.includes(mode) ? mode : 'light'}` : '';

  const itemHTML = (item, i) => {
    const on = i === current;
    const icon = item.icon ? iconHTML(t) : '';
    const label = `<span class="ds-tabs__label">${escapeHTML(item.label)}</span>`;
    const main = `<span class="ds-tabs__main">${ICONS[t].after ? label + icon : icon + label}</span>`;
    const pro = t === 'General tab' && item.pro ? `<span class="ds-tabs__pro">${PRO_LABEL}</span>` : '';
    const preview = item.previewState ? ` data-preview-state="${item.previewState}"` : '';
    const divider = item.dividerBefore ? '<span class="ds-tabs__divider" aria-hidden="true"></span>' : '';
    if (isNav) {
      const attrs = [
        'class="ds-tabs__item"',
        `href="${escapeHTML(item.href || '#')}"`,
        on ? 'aria-current="page"' : '',
        item.disabled ? 'aria-disabled="true" tabindex="-1"' : '',
      ];
      return `${divider}<a ${attrs.filter(Boolean).join(' ')}${preview}>${main}${pro}</a>`;
    }
    const attrs = [
      'type="button"',
      'role="tab"',
      'class="ds-tabs__item"',
      `id="${id}-tab-${i}"`,
      `aria-selected="${on}"`,
      hasPanels ? `aria-controls="${id}-panel-${i}"` : '',
      `tabindex="${i === tabStop ? 0 : -1}"`,
      item.disabled ? 'disabled' : '',
    ];
    return `<button ${attrs.filter(Boolean).join(' ')}${preview}>${main}</button>`;
  };

  const panels = hasPanels
    ? list
        .map(
          (item, i) =>
            `<div class="ds-tabs__panel" role="tabpanel" id="${id}-panel-${i}" aria-labelledby="${id}-tab-${i}" tabindex="0"${i === current ? '' : ' hidden'}>${item.panel ?? ''}</div>`,
        )
        .join('')
    : '';

  const bar = `<div class="ds-tabs__scroll"><div class="ds-tabs__list"${isNav ? '' : ` role="tablist" aria-label="${escapeHTML(ariaLabel)}"`}>${list.map(itemHTML).join('')}</div></div>`;
  const cls = `ds-tabs ds-tabs--${TYPE_SLUG[t]}${modeClass}`;
  return isNav
    ? `<nav class="${cls}" aria-label="${escapeHTML(ariaLabel)}">${bar}</nav>`
    : `<div class="${cls}">${bar}${panels}</div>`;
}

function wireTabs(root) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];

  const select = (tab, focus) => {
    tabs.forEach((other, i) => {
      const on = other === tab;
      other.setAttribute('aria-selected', String(on));
      other.tabIndex = on ? 0 : -1;
      if (panels[i]) panels[i].hidden = !on;
    });
    if (focus) tab.focus();
    root.dispatchEvent(new CustomEvent('ds-tabs-change', { bubbles: true, detail: { index: tabs.indexOf(tab), label: tab.textContent.trim() } }));
  };

  tabs.forEach((tab) => tab.addEventListener('click', () => tab.getAttribute('aria-selected') !== 'true' && select(tab, false)));

  root.querySelector('[role="tablist"]').addEventListener('keydown', (event) => {
    const enabled = tabs.filter((tab) => !tab.disabled);
    const at = enabled.indexOf(document.activeElement);
    if (at < 0) return;
    let next;
    if (event.key === 'ArrowRight') next = enabled[(at + 1) % enabled.length];
    else if (event.key === 'ArrowLeft') next = enabled[(at - 1 + enabled.length) % enabled.length];
    else if (event.key === 'Home') next = enabled[0];
    else if (event.key === 'End') next = enabled[enabled.length - 1];
    else return;
    event.preventDefault();
    if (next !== document.activeElement || next.getAttribute('aria-selected') !== 'true') select(next, true);
  });
}

function wireNav(root) {
  const links = [...root.querySelectorAll('a.ds-tabs__item')];
  links.forEach((link) =>
    link.addEventListener('click', (event) => {
      if (link.getAttribute('aria-disabled') === 'true') return event.preventDefault();
      if (link.getAttribute('href') === '#') event.preventDefault();
      links.forEach((other) => (other === link ? other.setAttribute('aria-current', 'page') : other.removeAttribute('aria-current')));
      root.dispatchEvent(new CustomEvent('ds-tabs-change', { bubbles: true, detail: { index: links.indexOf(link), label: link.textContent.trim() } }));
    }),
  );
}

export function createTabs(props = {}) {
  const template = document.createElement('template');
  template.innerHTML = tabsHTML(props);
  const root = template.content.firstElementChild;
  if (root.matches('nav')) wireNav(root);
  else wireTabs(root);
  return root;
}
