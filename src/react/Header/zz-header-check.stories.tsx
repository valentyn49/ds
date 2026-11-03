import { createRef, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import '../../docs/header-docs.css';
import { Header } from './Header';
import type { HeaderOpenState, HeaderProps } from './Header';

const meta = { title: 'Components/zzheadercheck' } satisfies Meta;
export default meta;

const out: string[] = [];
const check = (name: string, ok: unknown, d = '') => out.push(`${ok ? 'PASS' : 'FAIL'} ${name}${d ? ' :: ' + d : ''}`);
const tick = (ms = 30) => new Promise((r) => setTimeout(r, ms));

function mount(width: number, node: React.ReactNode, height = 700) {
  const host = document.createElement('div');
  host.dataset.zz = '1';
  host.className = 'ds-bd-hd-frame';
  host.style.cssText = `width:${width}px;height:${height}px;position:relative`;
  document.body.append(host);
  const root = createRoot(host);
  flushSync(() => root.render(node));
  return { host, root };
}

const q = <T extends Element = HTMLElement>(host: Element, sel: string) => host.querySelector<T>(sel)!;
const qa = (host: Element, sel: string) => [...host.querySelectorAll<HTMLElement>(sel)];
const key = (el: Element, k: string, opts: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...opts }));
const trigger = (host: Element, label: string) => qa(host, 'button.ds-header__trigger').find((b) => b.textContent === label)!;

async function run() {
  /* ---------- desktop: disclosure menus ---------- */
  const changes: HeaderOpenState[] = [];
  const clicks: string[] = [];
  const ref = createRef<HTMLElement>();
  const d = mount(
    1440,
    <Header ref={ref} className="extra" data-test="x" onOpenChange={(s) => changes.push(s)} onClick={() => clicks.push('root')} searchInputProps={{ name: 'q' }} />,
  );
  const h = d.host;
  check('ref is the header element; className and data-* pass through', ref.current === q(h, 'header') && q(h, 'header').classList.contains('extra') && q(h, 'header').dataset.test === 'x');
  check('search input defaults + searchInputProps', q<HTMLInputElement>(h, '.ds-header__search-input').name === 'q' && q<HTMLInputElement>(h, '.ds-header__search-input').placeholder === 'Market Search');

  const markets = trigger(h, 'Test Design System Markets');
  const help = trigger(h, 'Help');
  const panelOf = (t: HTMLElement) => document.getElementById(t.getAttribute('aria-controls')!)!;
  check('aria-controls points to an existing hidden panel', !!panelOf(markets) && panelOf(markets).hidden && markets.getAttribute('aria-expanded') === 'false');

  markets.click(); await tick();
  check('click opens the menu: aria-expanded, panel visible, is-open, veil visible', markets.getAttribute('aria-expanded') === 'true' && !panelOf(markets).hidden && markets.closest('.ds-header__item')!.classList.contains('is-open') && !q(h, '.ds-header__veil').hidden);
  check('onOpenChange received panel=markets', changes.at(-1)?.panel === 'markets', JSON.stringify(changes.at(-1)));
  check('consumer onClick still runs', clicks.length > 0);

  help.click(); await tick();
  check('opening Help closes Markets (one at a time)', help.getAttribute('aria-expanded') === 'true' && markets.getAttribute('aria-expanded') === 'false' && panelOf(markets).hidden);
  help.click(); await tick();
  check('click on the open trigger closes it and hides the veil', help.getAttribute('aria-expanded') === 'false' && panelOf(help).hidden && q(h, '.ds-header__veil').hidden);

  markets.click(); await tick();
  const fly = q<HTMLButtonElement>(panelOf(markets), '.ds-header__panel-item--flyout');
  const flyBox = document.getElementById(fly.getAttribute('aria-controls')!)!;
  check('flyout starts closed', fly.getAttribute('aria-expanded') === 'false' && flyBox.hidden);
  fly.click(); await tick();
  check('flyout opens', fly.getAttribute('aria-expanded') === 'true' && !flyBox.hidden && fly.classList.contains('is-open'));
  fly.click(); await tick();
  check('flyout toggles closed', fly.getAttribute('aria-expanded') === 'false' && flyBox.hidden);
  fly.click(); await tick();
  markets.click(); await tick(); markets.click(); await tick();
  check('reopening a menu starts with its flyout closed', fly.getAttribute('aria-expanded') === 'false' && flyBox.hidden);

  // Escape returns focus to the trigger
  markets.focus();
  key(markets, 'Escape'); await tick();
  check('Escape closes the menu and returns focus to its trigger', markets.getAttribute('aria-expanded') === 'false' && document.activeElement === markets);

  // outside press / inside press / veil
  markets.click(); await tick();
  document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); await tick();
  check('press outside closes the menu (focus not moved)', markets.getAttribute('aria-expanded') === 'false');
  markets.click(); await tick();
  q(h, '.ds-header__panel-item--flyout').dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); await tick();
  check('press inside the open item keeps it open', markets.getAttribute('aria-expanded') === 'true');
  q(h, '.ds-header__veil').click(); await tick();
  check('click on the veil closes the menu', markets.getAttribute('aria-expanded') === 'false' && q(h, '.ds-header__veil').hidden);

  // profile and cart
  const profile = q(h, 'button[aria-label="Profile"]');
  const cart = q(h, 'button[aria-label^="Cart"]');
  profile.click(); await tick();
  check('profile opens', profile.getAttribute('aria-expanded') === 'true' && !document.getElementById(profile.getAttribute('aria-controls')!)!.hidden && profile.closest('.ds-header__item')!.classList.contains('is-open'));
  cart.click(); await tick();
  check('cart opens and replaces the profile', cart.getAttribute('aria-expanded') === 'true' && profile.getAttribute('aria-expanded') === 'false');
  cart.focus(); key(cart, 'Escape'); await tick();
  check('Escape on the cart returns focus to the cart button', cart.getAttribute('aria-expanded') === 'false' && document.activeElement === cart);

  // links with "#" do not navigate
  const link = qa(h, 'a.ds-header__nav-link')[0];
  const notPrevented = link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  check('# links do not navigate (default prevented)', notPrevented === false);

  // geometry and colors, desktop
  const cs = (el: Element, p: keyof CSSStyleDeclaration) => String(getComputedStyle(el)[p]);
  const hr = q(h, 'header').getBoundingClientRect();
  const brand = q(h, '.ds-header__brand').getBoundingClientRect();
  const logo = q(h, '.ds-footer__logo').getBoundingClientRect();
  check('desktop: surface secondary/900, content margin 80px, logo 162x32, bar 72px', cs(q(h, 'header'), 'backgroundColor') === 'rgb(48, 59, 77)' || cs(q(h, '.ds-header__bar'), 'backgroundColor') === 'rgb(48, 59, 77)', cs(q(h, 'header'), 'backgroundColor') + ' | ' + cs(q(h, '.ds-header__bar'), 'backgroundColor'));
  check('desktop: margin 80, logo 162x32', Math.round(brand.left - hr.left) === 80 && Math.round(logo.width) === 162 && Math.round(logo.height) === 32, `margin ${Math.round(brand.left - hr.left)} logo ${Math.round(logo.width)}x${Math.round(logo.height)}`);
  check('desktop: bar height 72, menu button hidden, nav visible', Math.round(q(h, '.ds-header__bar').getBoundingClientRect().height) === 72 && q(h, '.ds-header__menu-button').getClientRects().length === 0 && q(h, '.ds-header__nav').getClientRects().length > 0, String(q(h, '.ds-header__bar').getBoundingClientRect().height));
  check('desktop: trigger Semibold/Bold 14/20 white', cs(markets, 'fontSize') === '14px' && cs(markets, 'lineHeight') === '20px' && cs(markets, 'color') === 'rgb(255, 255, 255)', `${cs(markets, 'fontSize')} ${cs(markets, 'lineHeight')} ${cs(markets, 'color')}`);
  check('Proxima Nova applied', /Proxima Nova/.test(cs(markets, 'fontFamily')));
  d.root.unmount(); d.host.remove();

  /* ---------- controlled ---------- */
  const spy: HeaderOpenState[] = [];
  let hostC = mount(1440, <Header open={{ panel: null }} onOpenChange={(s) => spy.push(s)} />);
  const cm = trigger(hostC.host, 'Test Design System Markets');
  cm.click(); await tick();
  check('controlled: state does not change until the parent updates, callback fires', cm.getAttribute('aria-expanded') === 'false' && spy.at(-1)?.panel === 'markets');
  cm.click(); await tick();
  check('controlled: a repeated click still requests opening when the parent has not accepted it', spy.at(-1)?.panel === 'markets' && cm.getAttribute('aria-expanded') === 'false');
  flushSync(() => hostC.root.render(<Header open={{ panel: 'markets', flyout: true }} onOpenChange={(s) => spy.push(s)} />));
  check('controlled: parent opens the menu and its flyout', trigger(hostC.host, 'Test Design System Markets').getAttribute('aria-expanded') === 'true' && q(hostC.host, '.ds-header__panel-item--flyout').getAttribute('aria-expanded') === 'true');
  hostC.root.unmount(); hostC.host.remove();

  /* ---------- defaultOpen ---------- */
  const di = mount(1440, <Header defaultOpen={{ panel: 'help', flyout: true }} />);
  check('defaultOpen shows the menu and flyout; Escape works from the initial state', trigger(di.host, 'Help').getAttribute('aria-expanded') === 'true' && q(di.host, '.ds-header__flyout:not([hidden])') !== null);
  trigger(di.host, 'Help').focus(); key(trigger(di.host, 'Help'), 'Escape'); await tick();
  check('defaultOpen menu closes with Escape', trigger(di.host, 'Help').getAttribute('aria-expanded') === 'false');
  di.root.unmount(); di.host.remove();

  /* ---------- mobile: drawer ---------- */
  const dr: HeaderOpenState[] = [];
  const m = mount(375, <Header onOpenChange={(s) => dr.push(s)} />, 812);
  const mh = m.host;
  const menuBtn = q<HTMLButtonElement>(mh, '.ds-header__menu-button');
  const drawer = q(mh, '.ds-header__drawer');
  const scrim = q(mh, '.ds-header__scrim');
  const closeBtn = q<HTMLButtonElement>(mh, '.ds-header__drawer-close');
  check('mobile: menu button visible, nav hidden, drawer closed', menuBtn.getClientRects().length > 0 && q(mh, '.ds-header__nav').getClientRects().length === 0 && drawer.hidden && scrim.hidden && menuBtn.getAttribute('aria-expanded') === 'false');
  const mhr = q(mh, 'header').getBoundingClientRect();
  const mbrand = q(mh, '.ds-header__brand').getBoundingClientRect();
  const mlogo = q(mh, '.ds-footer__logo').getBoundingClientRect();
  check('mobile: margin 40, logo 124x24, bar 56', Math.round(mbrand.left - mhr.left) === 40 && Math.round(mlogo.width) === 124 && Math.round(mlogo.height) === 24 && Math.round(q(mh, '.ds-header__bar').getBoundingClientRect().height) === 56, `margin ${Math.round(mbrand.left - mhr.left)} logo ${Math.round(mlogo.width)}x${Math.round(mlogo.height)} bar ${q(mh, '.ds-header__bar').getBoundingClientRect().height}`);

  menuBtn.focus(); menuBtn.click(); await tick();
  check('menu button opens the drawer: visible, scrim visible, aria-expanded', !drawer.hidden && !scrim.hidden && menuBtn.getAttribute('aria-expanded') === 'true' && dr.at(-1)?.drawer === true);
  check('focus moves to the drawer close button', document.activeElement === closeBtn);
  check('drawer is a modal dialog named Menu', drawer.getAttribute('role') === 'dialog' && drawer.getAttribute('aria-modal') === 'true' && drawer.getAttribute('aria-label') === 'Menu' && menuBtn.getAttribute('aria-controls') === drawer.id);

  const rowBtn = (label: string) => qa(drawer, 'button.ds-header__row-button').find((b) => b.textContent!.startsWith(label))!;
  const sm = rowBtn('Test Design System Markets');
  const subrows = document.getElementById(sm.getAttribute('aria-controls')!)!;
  check('section row starts collapsed', sm.getAttribute('aria-expanded') === 'false' && subrows.hidden);
  sm.click(); await tick();
  check('section row expands', sm.getAttribute('aria-expanded') === 'true' && !subrows.hidden && dr.at(-1)?.expanded.includes('Test Design System Markets') === true);
  const bonds = qa(subrows, 'button.ds-header__row-button--sub').find((b) => b.textContent!.startsWith('Bonds'))!;
  bonds.click(); await tick();
  check('nested row expands', bonds.getAttribute('aria-expanded') === 'true' && !document.getElementById(bonds.getAttribute('aria-controls')!)!.hidden && dr.at(-1)?.expanded.includes('Test Design System Markets:Bonds') === true);
  bonds.click(); sm.click(); await tick();
  check('rows collapse again', bonds.getAttribute('aria-expanded') === 'false' && sm.getAttribute('aria-expanded') === 'false');
  const account = q<HTMLButtonElement>(drawer, '.ds-header__account-button');
  account.click(); await tick();
  check('account row expands', account.getAttribute('aria-expanded') === 'true' && !document.getElementById(account.getAttribute('aria-controls')!)!.hidden);
  account.click(); await tick();

  // focus trap
  const focusables = () => qa(drawer, 'a[href], button').filter((el) => el.offsetParent !== null);
  let list = focusables();
  list[list.length - 1].focus();
  const tabEv = key(list[list.length - 1], 'Tab');
  await tick();
  check('Tab on the last focusable wraps to the first', document.activeElement === list[0] && tabEv === false, String((document.activeElement as HTMLElement).textContent));
  list = focusables();
  list[0].focus();
  key(list[0], 'Tab', { shiftKey: true }); await tick();
  check('Shift+Tab on the first wraps to the last', document.activeElement === list[list.length - 1]);

  // closers return focus to the menu button
  key(closeBtn, 'Escape'); await tick();
  check('Escape closes the drawer and returns focus to the menu button', drawer.hidden && scrim.hidden && menuBtn.getAttribute('aria-expanded') === 'false' && document.activeElement === menuBtn);
  menuBtn.click(); await tick(); closeBtn.click(); await tick();
  check('close button closes the drawer, focus returns', drawer.hidden && document.activeElement === menuBtn);
  menuBtn.click(); await tick(); scrim.click(); await tick();
  check('scrim click closes the drawer, focus returns', drawer.hidden && document.activeElement === menuBtn);
  m.root.unmount(); m.host.remove();

  // drawer opened over an open desktop panel closes the panel
  const mixed = mount(375, <Header defaultOpen={{ panel: 'profile' }} />, 812);
  q(mixed.host, '.ds-header__menu-button').click(); await tick();
  check('opening the drawer closes an open panel', q(mixed.host, 'button[aria-label="Profile"]').getAttribute('aria-expanded') === 'false' && !q(mixed.host, '.ds-header__drawer').hidden);
  mixed.root.unmount(); mixed.host.remove();

  // variants without a drawer
  for (const type of ['first purchase', 'registration', 'log out'] as const) {
    const v = mount(375, <Header type={type} />, 200);
    check(`type=${type}: no drawer, no menu button`, !v.host.querySelector('.ds-header__drawer') && !v.host.querySelector('.ds-header__menu-button'));
    v.root.unmount(); v.host.remove();
  }
  const ent = mount(1440, <Header platform="enterprise" warning type="yes" />, 200);
  check('enterprise: tag shown; cart is mobile-only on desktop', !!ent.host.querySelector('.ds-header__tag') && ent.host.querySelector('.ds-header__cart')!.getClientRects().length === 0);
  const warn = mount(1440, <Header warning />, 200);
  check('warning mark rendered with role=img', !!warn.host.querySelector('.ds-header__warning[role="img"][aria-label="Warning"]'));
}

function Report() {
  useEffect(() => {
    const t = setTimeout(() => {
      run()
        .catch((e) => out.push('FAIL exception :: ' + (e as Error).stack))
        .finally(() => {
          document.querySelectorAll<HTMLElement>('[data-zz]').forEach((el) => (el.style.display = 'none'));
          const pre = document.createElement('pre');
          pre.style.cssText = 'position:relative;z-index:99999;background:#fff;color:#000;font:11px/14px monospace;white-space:pre-wrap;margin:0;padding:8px';
          pre.textContent = (out.filter((l) => l.startsWith('FAIL')).join('\n') || 'NO FAILURES') + '\n' + out.filter((l) => l.startsWith('PASS')).length + ' of ' + out.length + ' checks passed\n' + out.join('\n');
          document.body.prepend(pre);
          window.scrollTo(0, 0);
        });
    }, 300);
    return () => clearTimeout(t);
  }, []);
  return <span>running</span>;
}

export const Check: StoryObj = { render: () => <Report /> };
