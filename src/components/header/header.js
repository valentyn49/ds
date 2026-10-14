import './header.css';
import { logoSVG } from '../footer/logo.js';
import { icon } from './icons.js';
import { HEADER_PLATFORMS, HEADER_TYPES, HEADER_RESOLUTIONS, HEADER_MARGINS, HEADER_BREAKPOINTS, HEADER_DESKTOP_FIT } from './header.spec.js';
import { NAV_ITEMS, MENUS, PROFILE, CART, LOGGED_OUT, SEARCH_PLACEHOLDER, ENTERPRISE_TAG } from './header.content.js';

export { HEADER_PLATFORMS, HEADER_TYPES, HEADER_RESOLUTIONS, HEADER_MARGINS, HEADER_BREAKPOINTS, HEADER_DESKTOP_FIT };

const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (value) => value.replace(/\s+/g, '-');
let uid = 0;

const link = (label, className) => `<a class="${className}" href="#">${esc(label)}</a>`;
const chevronRight = () => `<span class="ds-header__arrow">${icon('chevron_right')}</span>`;

/* ---------- desktop panels ---------- */

function panelRow(item, base, index, openFlyout) {
  const badge = item.badge ? `<span class="ds-header__badge">${esc(item.badge)}</span>` : '';
  if (item.flyout) {
    const id = `${base}-flyout-${index}`;
    const flyout = `<div class="ds-header__flyout" id="${id}" role="group" aria-label="${esc(item.label)}"${openFlyout ? '' : ' hidden'}>${item.flyout.map((l) => link(l, 'ds-header__panel-item')).join('')}</div>`;
    return `<div class="ds-header__row">${`<button type="button" class="ds-header__panel-item ds-header__panel-item--flyout${openFlyout ? ' is-open' : ''}" aria-expanded="${!!openFlyout}" aria-controls="${id}"><span>${esc(item.label)}</span>${chevronRight()}</button>`}${flyout}</div>`;
  }
  return `<a class="ds-header__panel-item" href="#"><span>${esc(item.label)}</span>${badge}${item.arrow ? chevronRight() : ''}</a>`;
}

function menuPanel(key, base, open) {
  const id = `${base}-panel-${key}`;
  const items = MENUS[key].map((item, i) => panelRow(item, id, i, open.panel === key && open.flyout && item.flyout)).join('');
  return `<div class="ds-header__panel" id="${id}" role="group" aria-label="${esc(key)}"${open.panel === key ? '' : ' hidden'}>${items}</div>`;
}

function profilePanel(base, open) {
  const id = `${base}-panel-profile`;
  return `<div class="ds-header__panel ds-header__panel--profile" id="${id}" role="group" aria-label="Profile"${open.panel === 'profile' ? '' : ' hidden'}><div class="ds-header__profile-head"><div class="ds-header__profile-name">${esc(PROFILE.name)}</div><div class="ds-header__profile-line">${esc(PROFILE.credits)}</div><div class="ds-header__profile-line ds-header__profile-line--muted">${esc(PROFILE.membership)}</div></div><div class="ds-header__profile-list">${PROFILE.items.map((l) => link(l, 'ds-header__profile-item')).join('')}</div></div>`;
}

function cartPanel(base, open) {
  const id = `${base}-panel-cart`;
  const lines = CART.lines
    .map((l) => `<div class="ds-header__cart-line"><div><div class="ds-header__cart-name">${esc(l.name)}</div><div class="ds-header__cart-level">${esc(l.level)}</div></div><div class="ds-header__cart-price">${esc(l.price)}</div></div>`)
    .join('');
  return `<div class="ds-header__panel ds-header__panel--cart" id="${id}" role="group" aria-label="${esc(CART.title)}"${open.panel === 'cart' ? '' : ' hidden'}><div class="ds-header__cart-head"><span class="ds-header__cart-title">${esc(CART.title)}</span><a class="ds-header__cart-edit" href="#">${esc(CART.edit)}</a></div>${lines}<a class="ds-header__checkout" href="#">${esc(CART.checkout)}</a></div>`;
}

/* ---------- drawer (tablet and mobile) ---------- */

function drawerHTML(base, platform, type, open) {
  const expanded = new Set(open.expanded ?? []);
  const sections = {
    'Socrates Markets': MENUS.markets.map((m) => ({ label: m.drawerLabel ?? m.label, children: m.drawerChildren })),
    'My Markets': MENUS.myMarkets.map((m) => ({ label: m.label })),
    Help: MENUS.help.map((m) => ({ label: m.label })),
  };
  // The drawer lists the same items as the desktop menu, in the same order, for the platform.
  const names = NAV_ITEMS[platform].map((n) => n.label);

  const nested = (rows, id) =>
    rows
      .map((row, i) => {
        if (!row.children) return link(row.label, 'ds-header__row-link ds-header__row-link--sub');
        const cid = `${id}-sub-${i}`;
        const isOpen = expanded.has(`${id}:${row.label}`);
        return `<button type="button" class="ds-header__row-button ds-header__row-button--sub" aria-expanded="${isOpen}" aria-controls="${cid}"><span>${esc(row.label)}</span><span class="ds-header__row-chevron">${icon('chevron')}</span></button><div class="ds-header__subrows" id="${cid}"${isOpen ? '' : ' hidden'}>${row.children.map((c) => link(c, 'ds-header__row-link ds-header__row-link--sub2')).join('')}</div>`;
      })
      .join('');

  const rows = names
    .map((name, i) => {
      if (!sections[name]) return link(name, 'ds-header__row-link');
      const id = `${base}-drawer-${i}`;
      const isOpen = expanded.has(name);
      return `<button type="button" class="ds-header__row-button" aria-expanded="${isOpen}" aria-controls="${id}"><span>${esc(name)}</span><span class="ds-header__row-chevron">${icon('chevron')}</span></button><div class="ds-header__subrows" id="${id}"${isOpen ? '' : ' hidden'}>${nested(sections[name], id)}</div>`;
    })
    .join('');

  const accountId = `${base}-drawer-account`;
  const accountOpen = expanded.has('account');
  return `<div class="ds-header__scrim" data-close-drawer${open.drawer ? '' : ' hidden'}></div><div class="ds-header__drawer" id="${base}-drawer" role="dialog" aria-modal="true" aria-label="Menu"${open.drawer ? '' : ' hidden'}><div class="ds-header__drawer-head"><span class="ds-header__drawer-title">Menu</span><button type="button" class="ds-header__drawer-close" aria-label="Close menu">${icon('close')}</button></div><nav class="ds-header__drawer-nav" aria-label="Main">${rows}</nav><div class="ds-header__drawer-account"><button type="button" class="ds-header__row-button ds-header__account-button" aria-expanded="${accountOpen}" aria-controls="${accountId}"><span class="ds-header__account-text"><span class="ds-header__account-name">${esc(PROFILE.name)}</span><span class="ds-header__account-line">${esc(PROFILE.credits)}</span><span class="ds-header__account-line">${esc(PROFILE.membership)}</span></span><span class="ds-header__row-chevron">${icon('chevron')}</span></button><div class="ds-header__subrows" id="${accountId}"${accountOpen ? '' : ' hidden'}>${PROFILE.items.map((l) => link(l, 'ds-header__row-link ds-header__row-link--sub')).join('')}</div></div></div>`;
}

/* ---------- header ---------- */

/**
 * Props mirror the Figma component properties: `platform` (standart | enterprise), `type` (yes | first purchase |
 * registration | log out) and `warning`. `size` (desktop | tablet | mobile) is not a prop: the layout follows the header's
 * own width with container queries. `open` is the initial open state ({ panel, flyout, drawer, expanded }) and is
 * mainly used by the documentation to show open menus without interaction.
 */
export function headerHTML({ platform = 'standart', type = 'yes', warning = false, open = {} } = {}) {
  const hp = HEADER_PLATFORMS.includes(platform) ? platform : 'standart';
  const ht = HEADER_TYPES.includes(type) ? type : 'yes';
  const base = `ds-header-${++uid}`;
  const enterprise = hp === 'enterprise';
  const panelOpen = open.panel ?? null;

  const brand = `<span class="ds-header__brand">${logoSVG()}${enterprise ? `<span class="ds-header__tag">${ENTERPRISE_TAG}</span>` : ''}</span>`;

  // Desktop navigation
  const navItem = (item) => {
    if (!item.menu) return link(item.label, 'ds-header__nav-link');
    const id = `${base}-panel-${item.menu}`;
    const isOpen = panelOpen === item.menu;
    return `<div class="ds-header__item${isOpen ? ' is-open' : ''}"><button type="button" class="ds-header__trigger" aria-expanded="${isOpen}" aria-controls="${id}"><span>${esc(item.label)}</span><span class="ds-header__chevron">${icon('chevron')}</span></button>${menuPanel(item.menu, base, open)}</div>`;
  };
  const navItems = ht === 'yes' ? NAV_ITEMS[hp] : ht === 'first purchase' ? NAV_ITEMS[hp].filter((n) => n.label === 'Help') : [];
  const nav = navItems.length ? `<nav class="ds-header__nav" aria-label="Main">${navItems.map(navItem).join('')}</nav>` : '';

  // Actions
  const profileButton = (extraClass) =>
    `<div class="ds-header__item ds-header__item--end ds-header__profile${extraClass}${panelOpen === 'profile' ? ' is-open' : ''}"><button type="button" class="ds-header__icon-button" aria-label="Profile" aria-expanded="${panelOpen === 'profile'}" aria-controls="${base}-panel-profile">${icon('profile', 'ds-header__profile-icon')}${warning ? `<span class="ds-header__warning" role="img" aria-label="Warning">${icon('warning_circle')}</span>` : ''}</button>${profilePanel(base, open)}</div>`;

  let actions = '';
  if (ht === 'yes') {
    const cart = `<div class="ds-header__item ds-header__item--end ds-header__cart${enterprise ? ' ds-header__cart--mobile-only' : ''}${panelOpen === 'cart' ? ' is-open' : ''}"><button type="button" class="ds-header__icon-button" aria-label="Cart, ${CART.count} items" aria-expanded="${panelOpen === 'cart'}" aria-controls="${base}-panel-cart">${icon('cart', 'ds-header__cart-icon')}<span class="ds-header__counter">${CART.count}</span></button>${cartPanel(base, open)}</div>`;
    actions = `<div class="ds-header__actions"><div class="ds-header__search"><label class="ds-header__search-field"><span class="ds-header__search-icon">${icon('search')}</span><input class="ds-header__search-input" type="search" placeholder="${SEARCH_PLACEHOLDER}" aria-label="${SEARCH_PLACEHOLDER}"></label><button type="button" class="ds-header__icon-button ds-header__search-button" aria-label="${SEARCH_PLACEHOLDER}">${icon('search')}</button></div>${cart}${profileButton(' ds-header__profile--desktop')}<button type="button" class="ds-header__icon-button ds-header__menu-button" aria-label="Menu" aria-expanded="${!!open.drawer}" aria-controls="${base}-drawer">${icon('menu')}</button></div>`;
  } else if (ht === 'first purchase') {
    actions = `<div class="ds-header__actions">${profileButton('')}</div>`;
  } else if (ht === 'log out') {
    const items = LOGGED_OUT[hp].map((i) => `<a class="ds-header__auth" href="#">${icon(i.icon, 'ds-header__auth-icon')}<span class="ds-header__auth-label">${esc(i.label)}</span></a>`).join('');
    actions = `<div class="ds-header__actions ds-header__actions--auth">${items}</div>`;
  }

  const veil = `<div class="ds-header__veil"${panelOpen ? '' : ' hidden'}></div>`;
  const drawer = ht === 'yes' ? drawerHTML(base, hp, ht, open) : '';

  return `<header class="ds-header ds-header--${hp} ds-header--${slug(ht)}"><div class="ds-header__container"><div class="ds-header__bar"><div class="ds-header__inner">${brand}${nav}${actions}</div>${veil}</div></div>${drawer}</header>`;
}

/**
 * Interactive header. Desktop menus follow the disclosure-navigation pattern: each trigger is a button with
 * `aria-expanded`; Escape closes the open menu and returns focus to its trigger; clicking outside closes it.
 * The tablet and mobile drawer is a modal dialog: it opens from the menu button, traps Tab, closes with Escape, the
 * close button or the dimmed area, and returns focus to the menu button.
 */
export function createHeader(props = {}) {
  const template = document.createElement('template');
  template.innerHTML = headerHTML(props);
  const root = template.content.firstElementChild;

  const veil = root.querySelector('.ds-header__veil');
  let openTrigger = null;

  const closePanels = (returnFocus) => {
    root.querySelectorAll('.ds-header__item.is-open').forEach((item) => {
      item.classList.remove('is-open');
      const trigger = item.querySelector(':scope > [aria-expanded]');
      const panel = item.querySelector(':scope > .ds-header__panel');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (panel) panel.hidden = true;
      panel?.querySelectorAll('.ds-header__flyout').forEach((f) => (f.hidden = true));
      panel?.querySelectorAll('.ds-header__panel-item--flyout').forEach((b) => {
        b.setAttribute('aria-expanded', 'false');
        b.classList.remove('is-open');
      });
    });
    if (veil) veil.hidden = true;
    if (returnFocus && openTrigger) openTrigger.focus();
    openTrigger = null;
  };

  const openPanel = (item) => {
    closePanels(false);
    item.classList.add('is-open');
    const trigger = item.querySelector(':scope > [aria-expanded]');
    const panel = item.querySelector(':scope > .ds-header__panel');
    trigger.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    if (veil) veil.hidden = false;
    openTrigger = trigger;
  };

  root.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href="#"]');
    if (anchor) event.preventDefault();

    const trigger = event.target.closest('.ds-header__trigger, .ds-header__icon-button[aria-controls$="-panel-profile"], .ds-header__icon-button[aria-controls$="-panel-cart"]');
    if (trigger) {
      const item = trigger.closest('.ds-header__item');
      if (item.classList.contains('is-open')) closePanels(false);
      else openPanel(item);
      return;
    }

    const flyoutButton = event.target.closest('.ds-header__panel-item--flyout');
    if (flyoutButton) {
      const target = root.querySelector(`#${flyoutButton.getAttribute('aria-controls')}`);
      const willOpen = flyoutButton.getAttribute('aria-expanded') !== 'true';
      flyoutButton.closest('.ds-header__panel').querySelectorAll('.ds-header__flyout').forEach((f) => (f.hidden = true));
      flyoutButton.closest('.ds-header__panel').querySelectorAll('.ds-header__panel-item--flyout').forEach((b) => {
        b.setAttribute('aria-expanded', 'false');
        b.classList.remove('is-open');
      });
      if (willOpen) {
        target.hidden = false;
        flyoutButton.setAttribute('aria-expanded', 'true');
        flyoutButton.classList.add('is-open');
      }
      return;
    }

    if (event.target.closest('.ds-header__veil')) closePanels(false);

    const rowButton = event.target.closest('.ds-header__row-button');
    if (rowButton) {
      const target = root.querySelector(`#${rowButton.getAttribute('aria-controls')}`);
      const expanded = rowButton.getAttribute('aria-expanded') === 'true';
      rowButton.setAttribute('aria-expanded', String(!expanded));
      target.hidden = expanded;
    }
  });

  document.addEventListener('mousedown', (event) => {
    if (!root.isConnected) return;
    if (openTrigger && !event.target.closest('.ds-header__item.is-open')) closePanels(false);
  });

  // Drawer
  const menuButton = root.querySelector('.ds-header__menu-button');
  const drawer = root.querySelector('.ds-header__drawer');
  const scrim = root.querySelector('.ds-header__scrim');
  const closeDrawer = () => {
    if (!drawer || drawer.hidden) return;
    drawer.hidden = true;
    scrim.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.focus();
  };
  if (menuButton && drawer) {
    menuButton.addEventListener('click', () => {
      closePanels(false);
      drawer.hidden = false;
      scrim.hidden = false;
      menuButton.setAttribute('aria-expanded', 'true');
      drawer.querySelector('.ds-header__drawer-close').focus();
    });
    drawer.querySelector('.ds-header__drawer-close').addEventListener('click', closeDrawer);
    scrim.addEventListener('click', closeDrawer);
    drawer.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const focusable = [...drawer.querySelectorAll('a[href], button')].filter((el) => el.offsetParent !== null);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (drawer && !drawer.hidden) {
      event.preventDefault();
      closeDrawer();
    } else if (openTrigger) {
      event.preventDefault();
      closePanels(true);
    }
  });

  // Reflect an initially open panel
  const initial = root.querySelector('.ds-header__item.is-open > [aria-expanded]');
  if (initial) openTrigger = initial;

  return root;
}
