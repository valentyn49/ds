import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { createRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../docs/popup-docs.css';
import '../../docs/input-docs.css';
import { TextInput } from '../TextInput/TextInput';
import { Popup } from './Popup';
import type { PopupProps } from './Popup';

export default { title: 'Components/zzpopupcheck' } satisfies Meta;

const out: string[] = [];
const check = (n: string, ok: boolean, d = '') => out.push(`${ok ? 'PASS' : 'FAIL'} ${n}${d ? ' :: ' + d : ''}`);
const tick = (ms = 60) => new Promise((r) => setTimeout(r, ms));
const key = (k: string, opts: KeyboardEventInit = {}) => document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...opts }));
const R = (el: Element) => {
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
};
const hosts: HTMLElement[] = [];
const roots: Root[] = [];

interface Harness {
  state: { open: boolean; log: string[]; holdOpen: boolean; props: Partial<PopupProps>; children: ReactNode };
  opener: HTMLButtonElement;
  set: (patch: Partial<Harness['state']>) => Promise<void>;
  q: <T extends Element = HTMLElement>(sel: string) => T;
  host: HTMLElement;
}

function mount(props: Partial<PopupProps> = {}, children: ReactNode = 'Body text', container?: HTMLElement | null): Harness {
  const host = document.createElement('div');
  host.dataset.zz = '1';
  document.body.append(host);
  hosts.push(host);
  const opener = document.createElement('button');
  opener.textContent = 'Open';
  opener.dataset.zz = '1';
  document.body.append(opener);
  hosts.push(opener);
  const root = createRoot(host);
  roots.push(root);
  const state: Harness['state'] = { open: false, log: [], holdOpen: false, props, children };
  const draw = () =>
    root.render(
      <Popup
        title="Premium subscription required"
        container={container}
        {...state.props}
        open={state.open}
        onClose={(reason) => {
          state.log.push('close:' + reason);
          if (!state.holdOpen) {
            state.open = false;
            draw();
          }
        }}
        onPrimary={() => state.log.push('primary')}
        onCancel={() => state.log.push('cancel')}
      >
        {state.children}
      </Popup>,
    );
  draw();
  return {
    state,
    opener,
    host,
    set: async (patch) => {
      Object.assign(state, patch);
      draw();
      await tick();
    },
    q: (sel) => document.querySelector(sel) as never,
  };
}

const dlg = () => document.querySelector<HTMLElement>('.ds-popup__dialog');
const btn = (sel: string) => document.querySelector<HTMLButtonElement>(sel)!;

function Fields({ n = 9 }: { n?: number }) {
  return (
    <div className="ds-bd-pp-fields">
      {Array.from({ length: n }, (_, i) => (
        <TextInput key={i} label="Enter new password" placeholder="Enter current password" />
      ))}
    </div>
  );
}

function frameEl(w: number, h: number) {
  const f = document.createElement('div');
  f.style.cssText = `position:relative;width:${w}px;height:${h}px;overflow:hidden;background:#eee`;
  const page = document.createElement('div');
  page.textContent = 'page';
  page.dataset.page = '1';
  f.append(page);
  f.dataset.zz = '1';
  document.body.append(f);
  hosts.push(f);
  return f;
}

async function run() {
  // ---------- portal mode ----------
  const h = mount({ subtitle: 'Sub text' });
  h.opener.focus();
  await h.set({ open: true });
  const d = dlg()!;
  check('renders in a fixed overlay on body', !!document.querySelector('body > .ds-popup--fixed') && d.getAttribute('role') === 'dialog' && d.getAttribute('aria-modal') === 'true');
  check('labelled by title, described by subtitle', document.getElementById(d.getAttribute('aria-labelledby')!)?.textContent === 'Premium subscription required' && document.getElementById(d.getAttribute('aria-describedby')!)?.textContent === 'Sub text');
  check('focus moved to the dialog', document.activeElement === d && d.tabIndex === -1);
  check('page behind is inert', h.host.inert === true && h.opener.inert === true);
  check('page scroll locked', document.body.style.overflow === 'hidden');
  check('ds-popup-open dispatched and primary/cancel visible on desktop', (document.querySelector('.ds-popup__cancel .ds-button') as HTMLElement).getClientRects().length > 0, 'vw=' + window.innerWidth);

  const close = btn('.ds-popup__close');
  const cancel = btn('.ds-popup__cancel .ds-button');
  const primary = btn('.ds-popup__primary .ds-button');
  primary.focus();
  key('Tab');
  check('Tab from last wraps to first (close)', document.activeElement === close);
  close.focus();
  key('Tab', { shiftKey: true });
  check('Shift+Tab from first wraps to last (primary)', document.activeElement === primary);
  d.focus();
  key('Tab', { shiftKey: true });
  check('Shift+Tab from the dialog goes to last', document.activeElement === primary);
  cancel.focus();
  key('Tab');
  check('Tab order cancel -> primary is native (not hijacked)', document.activeElement === cancel);

  let primaryEvents = 0;
  const onP = () => primaryEvents++;
  document.body.addEventListener('ds-popup-primary', onP);
  primary.click();
  await tick();
  check('primary does not close; onPrimary and event fired', !!dlg() && h.state.log.join() === 'primary' && primaryEvents === 1);
  document.body.addEventListener('ds-popup-close', (e) => h.state.log.push('evt:' + (e as CustomEvent).detail.reason), { once: true });
  (document.querySelector('.ds-popup__backdrop') as HTMLElement).click();
  await tick();
  check('backdrop click ignored by default', !!dlg() && !h.state.log.includes('close:backdrop'));

  key('Escape');
  await tick();
  check('Escape closes with reason escape; event carries the reason', !dlg() && h.state.log.includes('close:escape') && h.state.log.includes('evt:escape'), h.state.log.join());
  check('portal removed, focus restored to opener', !document.querySelector('.ds-popup') && document.activeElement === h.opener);
  check('inert removed and scroll lock released', h.host.inert === false && h.opener.inert === false && document.body.style.overflow !== 'hidden');
  document.body.removeEventListener('ds-popup-primary', onP);

  // close button, cancel
  await h.set({ open: true });
  btn('.ds-popup__close').click();
  await tick();
  check('close control: reason close-button', h.state.log.at(-1) === 'close:close-button' && !dlg());
  await h.set({ open: true });
  btn('.ds-popup__cancel .ds-button').click();
  await tick();
  check('cancel: onCancel then close:cancel', h.state.log.slice(-2).join() === 'cancel,close:cancel' && !dlg(), h.state.log.join());

  // options
  const h2 = mount({ closeOnEscape: false, closeOnBackdrop: true });
  await h2.set({ open: true });
  key('Escape');
  await tick();
  check('closeOnEscape=false keeps it open', !!dlg());
  (document.querySelector('.ds-popup__backdrop') as HTMLElement).click();
  await tick();
  check('closeOnBackdrop=true closes with reason backdrop', !dlg() && h2.state.log.at(-1) === 'close:backdrop');

  // controlled: consumer can refuse to close
  const h3 = mount();
  h3.state.holdOpen = true;
  await h3.set({ open: true });
  key('Escape');
  await tick();
  check('controlled: if the app keeps open=true the popup stays', !!dlg() && h3.state.log.at(-1) === 'close:escape');
  await h3.set({ open: false, holdOpen: false } as never);

  // escape stack + ref-counted scroll lock
  const a = mount({ title: 'A' });
  const b = mount({ title: 'B' });
  await a.set({ open: true });
  await b.set({ open: true });
  check('two popups open: scroll locked once', document.body.style.overflow === 'hidden' && document.querySelectorAll('.ds-popup').length === 2);
  key('Escape');
  await tick();
  check('Escape closes only the topmost popup', a.state.open && !b.state.open && b.state.log.includes('close:escape') && !a.state.log.length);
  check('scroll still locked after the first closes', document.body.style.overflow === 'hidden');
  key('Escape');
  await tick();
  check('second Escape closes the next one; scroll lock released', !a.state.open && document.body.style.overflow !== 'hidden');

  // autoFocus + returnFocusTo
  const target = document.createElement('button');
  target.dataset.zz = '1';
  document.body.append(target);
  hosts.push(target);
  const ret: RefObject<HTMLElement | null> = createRef();
  (ret as { current: HTMLElement | null }).current = target;
  const af = mount({ autoFocus: false, returnFocusTo: ret });
  af.opener.focus();
  await af.set({ open: true });
  check('autoFocus=false leaves focus where it was', document.activeElement === af.opener);
  key('Escape');
  await tick();
  check('returnFocusTo wins on close', document.activeElement === target);

  // ref / passthrough / override
  const rf = createRef<HTMLDivElement>();
  const pt = mount({ ref: rf, className: 'extra', 'aria-label': 'Custom' } as never);
  await pt.set({ open: true });
  check('ref points to the dialog; className and aria-* pass through', rf.current === dlg() && dlg()!.classList.contains('extra') && dlg()!.getAttribute('aria-label') === 'Custom');
  key('Escape');
  await tick();

  // dynamic content while open recalculates the scroll look and React re-render keeps it
  const dy = mount({}, 'Short');
  await dy.set({ open: true });
  check('short content: no scroll look', !dlg()!.hasAttribute('data-scroll'));
  await dy.set({ children: <Fields n={14} /> });
  check('content grows while open -> data-scroll set', dlg()!.hasAttribute('data-scroll'));
  await dy.set({ props: { title: 'Another title' } });
  check('a re-render keeps the scroll look', dlg()!.hasAttribute('data-scroll'));
  await dy.set({ children: 'Short again' });
  check('content shrinks -> data-scroll removed', !dlg()!.hasAttribute('data-scroll'));
  key('Escape');
  await tick();

  // status headers
  const st = mount({ type: 'successfully' });
  await st.set({ open: true });
  check('successfully: illustration image in the header', !!document.querySelector('.ds-popup__illustration--successfully img'));
  key('Escape');
  await tick();
  const ng = mount({ type: 'negative' });
  await ng.set({ open: true });
  check('negative: circle and cross images', !!document.querySelector('.ds-popup__circle') && !!document.querySelector('.ds-popup__cross'));
  key('Escape');
  await tick();

  // ---------- contained mode: geometry from the Figma examples ----------
  const geo = async (name: string, w: number, hgt: number, children: ReactNode, expected: Record<string, number>, props: Partial<PopupProps> = {}, expectScroll?: boolean) => {
    const f = frameEl(w, hgt);
    const m = mount({ title: 'Premium subscription required', ...props }, children, f);
    await m.set({ open: true });
    await tick(120);
    const dd = f.querySelector<HTMLElement>('.ds-popup__dialog')!;
    const fr = R(f);
    const r = R(dd);
    const rel = { x: r.x - fr.x, y: r.y - fr.y, w: r.w, h: r.h };
    const ok = Object.entries(expected).every(([k, v]) => (rel as Record<string, number>)[k] === v);
    check(`${name} geometry`, ok, `got ${JSON.stringify(rel)} scroll=${dd.hasAttribute('data-scroll')} want ${JSON.stringify(expected)}`);
    if (expectScroll !== undefined) check(`${name} scroll look = ${expectScroll}`, dd.hasAttribute('data-scroll') === expectScroll);
    check(`${name}: page in the frame is inert, window not locked`, (f.querySelector('[data-page]') as HTMLElement).parentElement === f && (f.firstElementChild as HTMLElement).inert === true && document.body.style.overflow !== 'hidden');
    return { f, m, dd };
  };
  const SHORT = 'Upgrade to Premium subscription to unlock Arrays and Reversals. Would you like to upgrade to Premium now?';
  const long = (n = 9) => <Fields n={n} />;
  await geo('desktop short', 1440, 900, SHORT, { x: 420, y: 80, w: 600, h: 248 }, {}, false);
  await geo('desktop scroll', 1440, 900, long(), { x: 420, y: 40, w: 600, h: 820 }, { subtitle: 'Prioritize using drag-and-drop the sequence in which you want to see widgets on the main page.' }, true);
  await geo('desktop width 480', 1440, 900, SHORT, { x: 480, w: 480 }, { width: 480 });
  await geo('tablet short', 744, 900, SHORT, { x: 70, w: 604, y: 684, h: 216 });
  await geo('tablet scroll', 744, 900, long(), { x: 70, w: 604, y: 16, h: 884 }, {}, true);
  const mob = await geo('mobile short', 375, 812, SHORT, { x: 16, w: 343, y: 576, h: 236 });
  await geo('mobile scroll', 375, 812, long(), { x: 16, w: 343, y: 16, h: 796 }, {}, true);
  check('mobile: Cancel not visible, close visible, primary fills 311px', (mob.f.querySelector('.ds-popup__cancel .ds-button') as HTMLElement).getClientRects().length === 0 && (mob.f.querySelector('.ds-popup__close') as HTMLElement).getClientRects().length > 0 && R(mob.f.querySelector('.ds-popup__primary .ds-button')!).w === 311);
  (mob.f.querySelector('.ds-popup__primary .ds-button') as HTMLElement).focus();
  key('Tab');
  check('mobile: Tab wraps past the hidden Cancel to the close control', document.activeElement === mob.f.querySelector('.ds-popup__close'));
  const cs = getComputedStyle(mob.dd);
  check('sheet corners 12px top, 0 bottom', cs.borderTopLeftRadius === '12px' && cs.borderBottomLeftRadius === '0px');

  // computed look of the desktop popup
  const f2 = frameEl(1440, 900);
  const lk = mount({ title: 'T', subtitle: 'S' }, SHORT, f2);
  await lk.set({ open: true });
  const dd = f2.querySelector<HTMLElement>('.ds-popup__dialog')!;
  const dcs = getComputedStyle(dd);
  const title = getComputedStyle(f2.querySelector('.ds-popup__title')!);
  check('dialog white, radius 12; title 20/30 bold gray/900; Proxima Nova', dcs.backgroundColor === 'rgb(255, 255, 255)' && dcs.borderRadius === '12px' && title.fontSize === '20px' && title.lineHeight === '30px' && Number(title.fontWeight) >= 600 && title.color === 'rgb(3, 7, 18)' && /Proxima Nova/.test(title.fontFamily), `${title.fontSize} ${title.fontWeight} ${title.fontFamily.slice(0, 20)}`);
  const bd = getComputedStyle(f2.querySelector('.ds-popup__backdrop')!);
  check('backdrop gray/900 at 60%', /rgba\(3, 7, 18, 0\.6\)|color\(srgb 0\.0117/.test(bd.backgroundColor), bd.backgroundColor);
  check('close control 40px circle', R(f2.querySelector('.ds-popup__close')!).w === 40 && getComputedStyle(f2.querySelector('.ds-popup__close')!).borderRadius.endsWith('px'));

  // unmount cleanup
  const um = mount();
  await um.set({ open: true });
  roots[roots.length - 1].unmount();
  await tick();
  check('unmounting an open popup removes it and releases inert/lock', !document.querySelector('body > .ds-popup--fixed') && document.body.style.overflow !== 'hidden' && um.host.inert === false);

  // all leftover popups
  check('no popup left over', document.querySelectorAll('.ds-popup').length === document.querySelectorAll('[data-zz] .ds-popup').length);

  hosts.forEach((el) => (el.style.display = 'none'));
  const pre = document.createElement('pre');
  pre.style.cssText = 'position:relative;z-index:99999;background:#fff;color:#000;font:11px/14px monospace;white-space:pre-wrap;margin:0;padding:8px';
  pre.textContent = (out.filter((l) => l.startsWith('FAIL')).join('\n') || 'NO FAILURES') + '\n' + out.filter((l) => l.startsWith('PASS')).length + ' of ' + out.length + ' checks passed\n' + out.join('\n');
  document.body.prepend(pre);
  window.scrollTo(0, 0);
}

let started = false;
export const Check: StoryObj = {
  render: () => {
    if (started) return <span>running</span>;
    started = true;
    setTimeout(() => {
      run().catch((e) => {
        const pre = document.createElement('pre');
        pre.textContent = 'ERROR ' + e.stack;
        pre.style.cssText = 'position:relative;z-index:99999;background:#fff;color:#000;white-space:pre-wrap';
        document.body.prepend(pre);
      });
    }, 400);
    return <span>running</span>;
  },
};
