import { Fragment, forwardRef, useEffect, useLayoutEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import type { HTMLAttributes, InputHTMLAttributes, KeyboardEvent, MouseEvent, ReactNode, RefObject } from 'react';
import '../../components/header/header.css';
import { icon } from '../../components/header/icons.js';
import {
  HEADER_PLATFORMS,
  HEADER_TYPES,
  HEADER_RESOLUTIONS,
  HEADER_MARGINS,
  HEADER_BREAKPOINTS,
  HEADER_DESKTOP_FIT,
} from '../../components/header/header.spec.js';
import { NAV_ITEMS, MENUS, PROFILE, CART, LOGGED_OUT, SEARCH_PLACEHOLDER, ENTERPRISE_TAG } from '../../components/header/header.content.js';
import { Logo } from '../Footer/Logo';
import { cx } from '../utils/cx';
import { enterModal, trapModalTab } from '../utils/modalEnvironment';

export { HEADER_PLATFORMS, HEADER_TYPES, HEADER_RESOLUTIONS, HEADER_MARGINS, HEADER_BREAKPOINTS, HEADER_DESKTOP_FIT };

/** Figma `platform`. */
export type HeaderPlatform = 'standart' | 'enterprise';
/** Figma `type`. In the Figma set `registration` is the logo-only header and `log out` is the logged-out one. */
export type HeaderType = 'yes' | 'first purchase' | 'registration' | 'log out';
/** The preview widths of the Figma `size` property. `size` is not a prop: the layout follows the header's own width. */
export type HeaderResolution = 'desktop' | 'tablet' | 'mobile';
/** The desktop panels. The first four belong to the navigation, `profile` and `cart` to the action icons. */
export type HeaderPanel = 'markets' | 'myMarkets' | 'watchlist' | 'help' | 'profile' | 'cart';

/**
 * What is open. `panel` is the open desktop menu (only one at a time), `flyout` its submenu (Performance Trackers,
 * Members Help), `drawer` the tablet/mobile drawer. `expanded` lists the open rows of the drawer: a section name
 * ("Socrates Markets", "My Markets", "Help"), a nested row as "Section:Row" ("Socrates Markets:Bonds") or "account".
 */
export interface HeaderOpenState {
  panel: HeaderPanel | null;
  flyout: boolean;
  drawer: boolean;
  expanded: string[];
}

export interface HeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Figma `platform`. */
  platform?: HeaderPlatform;
  /** Figma `type`. */
  type?: HeaderType;
  /** Figma `warning`: a warning mark on the profile icon (type `yes` and `first purchase`). */
  warning?: boolean;
  /** Controlled open state. Pair it with `onOpenChange`. */
  open?: Partial<HeaderOpenState>;
  /** Initial open state when uncontrolled. Mainly used by the documentation to show open menus without interaction. */
  defaultOpen?: Partial<HeaderOpenState>;
  /** Called with the new open state whenever a menu, submenu, drawer or drawer row opens or closes. */
  onOpenChange?: (next: HeaderOpenState) => void;
  /** Attributes for the search input (value, onChange, onKeyDown, name…). The placeholder and label default to "Market Search". */
  searchInputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;
}

const slug = (value: string) => value.replace(/\s+/g, '-');

const normalize = (open?: Partial<HeaderOpenState>): HeaderOpenState => ({
  panel: open?.panel ?? null,
  flyout: !!open?.flyout,
  drawer: !!open?.drawer,
  expanded: [...(open?.expanded ?? [])],
});

/* ---------- icons: the path data lives in the HTML module (shared icons + header-only icons) ---------- */

const pathCache = new Map<string, string>();
function iconPath(name: string): string {
  let path = pathCache.get(name);
  if (path === undefined) {
    path = /<path d="([^"]*)"/.exec(icon(name) as string)?.[1] ?? '';
    pathCache.set(name, path);
  }
  return path;
}

function HeaderIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg className={className || undefined} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d={iconPath(name)} />
    </svg>
  );
}

const Link = ({ label, className }: { label: string; className: string }) => (
  <a className={className} href="#">
    {label}
  </a>
);

const ChevronRight = () => (
  <span className="ds-header__arrow">
    <HeaderIcon name="chevron_right" />
  </span>
);

/* ---------- content shapes (inferred from header.content.js) ---------- */

type MenuKey = keyof typeof MENUS;
type MenuItem = {
  label: string;
  arrow?: boolean;
  badge?: string;
  flyout?: string[];
  drawerLabel?: string;
  drawerChildren?: string[];
};
const menuItems = (key: MenuKey) => MENUS[key] as MenuItem[];

/* ---------- desktop panels ---------- */

function PanelRow({ item, base, index, openFlyout, onFlyoutClick }: { item: MenuItem; base: string; index: number; openFlyout: boolean; onFlyoutClick: () => void }) {
  if (item.flyout) {
    const id = `${base}-flyout-${index}`;
    return (
      <div className="ds-header__row">
        <button
          type="button"
          className={cx('ds-header__panel-item', 'ds-header__panel-item--flyout', openFlyout && 'is-open')}
          aria-expanded={openFlyout}
          aria-controls={id}
          onClick={onFlyoutClick}
        >
          <span>{item.label}</span>
          <ChevronRight />
        </button>
        <div className="ds-header__flyout" id={id} role="group" aria-label={item.label} hidden={!openFlyout}>
          {item.flyout.map((label) => (
            <Link key={label} label={label} className="ds-header__panel-item" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <a className="ds-header__panel-item" href="#">
      <span>{item.label}</span>
      {item.badge ? <span className="ds-header__badge">{item.badge}</span> : null}
      {item.arrow ? <ChevronRight /> : null}
    </a>
  );
}

function MenuPanel({ menu, base, open, onFlyoutClick }: { menu: MenuKey; base: string; open: HeaderOpenState; onFlyoutClick: () => void }) {
  const id = `${base}-panel-${menu}`;
  const isOpen = open.panel === menu;
  return (
    <div className="ds-header__panel" id={id} role="group" aria-label={menu} hidden={!isOpen}>
      {menuItems(menu).map((item, i) => (
        <PanelRow key={item.label} item={item} base={id} index={i} openFlyout={isOpen && open.flyout && !!item.flyout} onFlyoutClick={onFlyoutClick} />
      ))}
    </div>
  );
}

function ProfilePanel({ base, open }: { base: string; open: HeaderOpenState }) {
  return (
    <div className="ds-header__panel ds-header__panel--profile" id={`${base}-panel-profile`} role="group" aria-label="Profile" hidden={open.panel !== 'profile'}>
      <div className="ds-header__profile-head">
        <div className="ds-header__profile-name">{PROFILE.name}</div>
        <div className="ds-header__profile-line">{PROFILE.credits}</div>
        <div className="ds-header__profile-line ds-header__profile-line--muted">{PROFILE.membership}</div>
      </div>
      <div className="ds-header__profile-list">
        {PROFILE.items.map((label) => (
          <Link key={label} label={label} className="ds-header__profile-item" />
        ))}
      </div>
    </div>
  );
}

function CartPanel({ base, open }: { base: string; open: HeaderOpenState }) {
  return (
    <div className="ds-header__panel ds-header__panel--cart" id={`${base}-panel-cart`} role="group" aria-label={CART.title} hidden={open.panel !== 'cart'}>
      <div className="ds-header__cart-head">
        <span className="ds-header__cart-title">{CART.title}</span>
        <a className="ds-header__cart-edit" href="#">
          {CART.edit}
        </a>
      </div>
      {CART.lines.map((line) => (
        <div className="ds-header__cart-line" key={line.name}>
          <div>
            <div className="ds-header__cart-name">{line.name}</div>
            <div className="ds-header__cart-level">{line.level}</div>
          </div>
          <div className="ds-header__cart-price">{line.price}</div>
        </div>
      ))}
      <a className="ds-header__checkout" href="#">
        {CART.checkout}
      </a>
    </div>
  );
}

/* ---------- drawer (tablet and mobile) ---------- */

interface DrawerRow {
  label: string;
  children?: string[];
}

function Drawer({
  base,
  platform,
  open,
  toggleExpanded,
  onClose,
  closeRef,
}: {
  base: string;
  platform: HeaderPlatform;
  open: HeaderOpenState;
  toggleExpanded: (key: string) => void;
  onClose: () => void;
  closeRef: RefObject<HTMLButtonElement | null>;
}) {
  const expanded = new Set(open.expanded);
  const sections: Record<string, DrawerRow[]> = {
    'Socrates Markets': menuItems('markets').map((m) => ({ label: m.drawerLabel ?? m.label, children: m.drawerChildren })),
    'My Markets': menuItems('myMarkets').map((m) => ({ label: m.label })),
    Help: menuItems('help').map((m) => ({ label: m.label })),
  };
  // The drawer lists the same items as the desktop menu, in the same order, for the platform.
  const names = (NAV_ITEMS[platform] as Array<{ label: string }>).map((n) => n.label);

  const rowButton = (className: string, label: string, isOpen: boolean, controls: string, onClick: () => void) => (
    <button type="button" className={className} aria-expanded={isOpen} aria-controls={controls} onClick={onClick}>
      <span>{label}</span>
      <span className="ds-header__row-chevron">
        <HeaderIcon name="chevron" />
      </span>
    </button>
  );

  const accountId = `${base}-drawer-account`;
  const accountOpen = expanded.has('account');

  return (
    <>
      <div className="ds-header__scrim" data-close-drawer="" hidden={!open.drawer} onClick={onClose} />
      <div className="ds-header__drawer" id={`${base}-drawer`} role="dialog" aria-modal="true" aria-label="Menu" hidden={!open.drawer} tabIndex={-1}>
        <div className="ds-header__drawer-head">
          <span className="ds-header__drawer-title">Menu</span>
          <button type="button" className="ds-header__drawer-close" aria-label="Close menu" ref={closeRef} onClick={onClose}>
            <HeaderIcon name="close" />
          </button>
        </div>
        <nav className="ds-header__drawer-nav" aria-label="Main">
          {names.map((name, i) => {
            const rows = sections[name];
            if (!rows) return <Link key={name} label={name} className="ds-header__row-link" />;
            const id = `${base}-drawer-${i}`;
            return (
              <Fragment key={name}>
                {rowButton('ds-header__row-button', name, expanded.has(name), id, () => toggleExpanded(name))}
                <div className="ds-header__subrows" id={id} hidden={!expanded.has(name)}>
                  {rows.map((row, j) => {
                    if (!row.children) return <Link key={row.label} label={row.label} className="ds-header__row-link ds-header__row-link--sub" />;
                    const cid = `${id}-sub-${j}`;
                    const key = `${name}:${row.label}`;
                    const isOpen = expanded.has(key);
                    return (
                      <Fragment key={row.label}>
                        {rowButton('ds-header__row-button ds-header__row-button--sub', row.label, isOpen, cid, () => toggleExpanded(key))}
                        <div className="ds-header__subrows" id={cid} hidden={!isOpen}>
                          {row.children.map((child) => (
                            <Link key={child} label={child} className="ds-header__row-link ds-header__row-link--sub2" />
                          ))}
                        </div>
                      </Fragment>
                    );
                  })}
                </div>
              </Fragment>
            );
          })}
        </nav>
        <div className="ds-header__drawer-account">
          <button type="button" className="ds-header__row-button ds-header__account-button" aria-expanded={accountOpen} aria-controls={accountId} onClick={() => toggleExpanded('account')}>
            <span className="ds-header__account-text">
              <span className="ds-header__account-name">{PROFILE.name}</span>
              <span className="ds-header__account-line">{PROFILE.credits}</span>
              <span className="ds-header__account-line">{PROFILE.membership}</span>
            </span>
            <span className="ds-header__row-chevron">
              <HeaderIcon name="chevron" />
            </span>
          </button>
          <div className="ds-header__subrows" id={accountId} hidden={!accountOpen}>
            {PROFILE.items.map((label) => (
              <Link key={label} label={label} className="ds-header__row-link ds-header__row-link--sub" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- header ---------- */

/**
 * Socrates header. Same markup and classes as the HTML `headerHTML()` builder, styled by the same `header.css`.
 *
 * `size` (desktop | tablet | mobile) is not a prop: the layout follows the header's own width with container queries.
 * Desktop menus follow the disclosure-navigation pattern: each trigger is a button with `aria-expanded`; Escape closes
 * the open menu and returns focus to its trigger; a click outside closes it. The tablet and mobile drawer is a modal
 * dialog: it opens from the menu button, keeps Tab inside, closes with Escape, the close button or the dimmed area,
 * and returns focus to the menu button.
 */
export const Header = forwardRef<HTMLElement, HeaderProps>(function Header(
  { platform = 'standart', type = 'yes', warning = false, open: openProp, defaultOpen, onOpenChange, searchInputProps, className, onClick, onKeyDown, ...rest },
  ref,
) {
  const hp: HeaderPlatform = (HEADER_PLATFORMS as string[]).includes(platform) ? platform : 'standart';
  const ht: HeaderType = (HEADER_TYPES as string[]).includes(type) ? type : 'yes';
  const enterprise = hp === 'enterprise';
  const base = `ds-header-${useId()}`;

  const rootRef = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLElement);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);


  const controlled = openProp !== undefined;
  const [inner, setInner] = useState<HeaderOpenState>(() => normalize(defaultOpen));
  const state = controlled ? normalize(openProp) : inner;
  const stateRef = useRef(state);
  stateRef.current = state;

  const update = (patch: Partial<HeaderOpenState>) => {
    const next = { ...stateRef.current, ...patch };
    if (!controlled) {
      stateRef.current = next;
      setInner(next);
    }
    onOpenChange?.(next);
  };

  const closePanels = () => update({ panel: null, flyout: false });
  const openPanel = (panel: HeaderPanel) => update({ panel, flyout: false });
  const togglePanel = (panel: HeaderPanel) => (stateRef.current.panel === panel ? closePanels() : openPanel(panel));

  const toggleFlyout = () => update({ flyout: !stateRef.current.flyout });

  const toggleExpanded = (key: string) => {
    const current = stateRef.current.expanded;
    update({ expanded: current.includes(key) ? current.filter((k) => k !== key) : [...current, key] });
  };

  const hasDrawer = ht === 'yes';

  const openDrawer = () => {
    update({ panel: null, flyout: false, drawer: true });
  };

  const closeDrawer = () => {
    if (!stateRef.current.drawer) return;
    update({ drawer: false });
  };

  const closeDrawerRef = useRef(closeDrawer);
  closeDrawerRef.current = closeDrawer;

  // Only a visible drawer is modal. Container queries can hide it when a desktop layout takes over.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const drawer = root?.querySelector<HTMLElement>('.ds-header__drawer');
    if (!root || !drawer || !hasDrawer || !state.drawer) return;
    let release: (() => void) | undefined;
    const synchronize = () => {
      const visible = drawer.getClientRects().length > 0;
      if (!visible) { release?.(); release = undefined; return; }
      if (release) return;
      const modal = enterModal(drawer, root.ownerDocument.body, true, [...root.querySelectorAll<HTMLElement>('.ds-header__scrim')]);
      drawerCloseRef.current?.focus({ preventScroll: true });
      const onKeydown = (event: globalThis.KeyboardEvent) => {
        if (!modal.isTop()) return;
        if (event.key === 'Escape' && !event.defaultPrevented) {
          event.preventDefault();
          closeDrawerRef.current();
        } else trapModalTab(event, drawer);
      };
      root.ownerDocument.addEventListener('keydown', onKeydown, true);
      release = () => {
        root.ownerDocument.removeEventListener('keydown', onKeydown, true);
        if (modal.dispose() && menuButtonRef.current?.getClientRects().length) menuButtonRef.current.focus({ preventScroll: true });
      };
    };
    synchronize();
    const observer = new ResizeObserver(synchronize);
    observer.observe(root);
    return () => { observer.disconnect(); release?.(); };
  }, [hasDrawer, state.drawer]);

  // A press outside the open menu closes it (focus is not moved).
  useEffect(() => {
    if (!state.panel) return undefined;
    const onDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Element | null;
      if (target && !rootRef.current?.contains(target.closest?.('.ds-header__item.is-open'))) {
        update({ panel: null, flyout: false });
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.panel]);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    // The links have no destination in Figma ("#"); they do not navigate.
    if ((event.target as Element).closest('a[href="#"]')) event.preventDefault();
    onClick?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Escape') return;
    if (hasDrawer && stateRef.current.drawer) {
      event.preventDefault();
      closeDrawer();
    } else if (stateRef.current.panel) {
      const trigger = [...(rootRef.current?.querySelectorAll<HTMLElement>('.ds-header__item.is-open > [aria-expanded]') ?? [])].find((el) => el.getClientRects().length > 0);
      if (trigger) {
        event.preventDefault();
        closePanels();
        trigger.focus();
      }
    }
  };

  /* brand */
  const brand = (
    <span className="ds-header__brand">
      <Logo />
      {enterprise ? <span className="ds-header__tag">{ENTERPRISE_TAG}</span> : null}
    </span>
  );

  /* desktop navigation */
  type NavItem = { label: string; menu?: MenuKey };
  const allNav = NAV_ITEMS[hp] as NavItem[];
  const navItems = ht === 'yes' ? allNav : ht === 'first purchase' ? allNav.filter((n) => n.label === 'Help') : [];

  const navItem = (item: NavItem) => {
    if (!item.menu) return <Link key={item.label} label={item.label} className="ds-header__nav-link" />;
    const id = `${base}-panel-${item.menu}`;
    const isOpen = state.panel === item.menu;
    const menu = item.menu;
    return (
      <div className={cx('ds-header__item', isOpen && 'is-open')} key={item.label}>
        <button type="button" className="ds-header__trigger" aria-expanded={isOpen} aria-controls={id} onClick={() => togglePanel(menu)}>
          <span>{item.label}</span>
          <span className="ds-header__chevron">
            <HeaderIcon name="chevron" />
          </span>
        </button>
        <MenuPanel menu={menu} base={base} open={state} onFlyoutClick={toggleFlyout} />
      </div>
    );
  };

  /* actions */
  const profileButton = (extraClass: string) => (
    <div className={cx('ds-header__item', 'ds-header__item--end', 'ds-header__profile', extraClass, state.panel === 'profile' && 'is-open')}>
      <button
        type="button"
        className="ds-header__icon-button"
        aria-label="Profile"
        aria-expanded={state.panel === 'profile'}
        aria-controls={`${base}-panel-profile`}
        onClick={() => togglePanel('profile')}
      >
        <HeaderIcon name="profile" className="ds-header__profile-icon" />
        {warning ? (
          <span className="ds-header__warning" role="img" aria-label="Warning">
            <HeaderIcon name="warning_circle" />
          </span>
        ) : null}
      </button>
      <ProfilePanel base={base} open={state} />
    </div>
  );

  let actions: ReactNode = null;
  if (ht === 'yes') {
    actions = (
      <div className="ds-header__actions">
        <div className="ds-header__search">
          <label className="ds-header__search-field">
            <span className="ds-header__search-icon">
              <HeaderIcon name="search" />
            </span>
            <input className="ds-header__search-input" type="search" placeholder={SEARCH_PLACEHOLDER} aria-label={SEARCH_PLACEHOLDER} {...searchInputProps} />
          </label>
          <button type="button" className="ds-header__icon-button ds-header__search-button" aria-label={SEARCH_PLACEHOLDER}>
            <HeaderIcon name="search" />
          </button>
        </div>
        <div className={cx('ds-header__item', 'ds-header__item--end', 'ds-header__cart', enterprise && 'ds-header__cart--mobile-only', state.panel === 'cart' && 'is-open')}>
          <button
            type="button"
            className="ds-header__icon-button"
            aria-label={`Cart, ${CART.count} items`}
            aria-expanded={state.panel === 'cart'}
            aria-controls={`${base}-panel-cart`}
            onClick={() => togglePanel('cart')}
          >
            <HeaderIcon name="cart" className="ds-header__cart-icon" />
            <span className="ds-header__counter">{CART.count}</span>
          </button>
          <CartPanel base={base} open={state} />
        </div>
        {profileButton('ds-header__profile--desktop')}
        <button
          type="button"
          className="ds-header__icon-button ds-header__menu-button"
          aria-label="Menu"
          aria-expanded={state.drawer}
          aria-controls={`${base}-drawer`}
          ref={menuButtonRef}
          onClick={openDrawer}
        >
          <HeaderIcon name="menu" />
        </button>
      </div>
    );
  } else if (ht === 'first purchase') {
    actions = <div className="ds-header__actions">{profileButton('')}</div>;
  } else if (ht === 'log out') {
    actions = (
      <div className="ds-header__actions ds-header__actions--auth">
        {(LOGGED_OUT[hp] as Array<{ label: string; icon: string }>).map((item) => (
          <a className="ds-header__auth" href="#" key={item.label}>
            <HeaderIcon name={item.icon} className="ds-header__auth-icon" />
            <span className="ds-header__auth-label">{item.label}</span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <header
      ref={rootRef}
      className={cx('ds-header', `ds-header--${hp}`, `ds-header--${slug(ht)}`, className)}
      {...rest}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="ds-header__container">
        <div className="ds-header__bar">
          <div className="ds-header__inner">
            {brand}
            {navItems.length ? (
              <nav className="ds-header__nav" aria-label="Main">
                {navItems.map(navItem)}
              </nav>
            ) : null}
            {actions}
          </div>
          <div className="ds-header__veil" hidden={!state.panel} onClick={closePanels} />
        </div>
      </div>
      {hasDrawer ? (
        <Drawer base={base} platform={hp} open={state} toggleExpanded={toggleExpanded} onClose={closeDrawer} closeRef={drawerCloseRef} />
      ) : null}
    </header>
  );
});
