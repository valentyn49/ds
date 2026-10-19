import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { createDropdown } from '../../components/dropdown/dropdown.js';
import { Dropdown } from './Dropdown';
import type { DropdownProps } from './Dropdown';

const meta = { title: 'Components/zzdropdowncheck' } satisfies Meta;
export default meta;

const out: string[] = [];
const check = (n: string, ok: boolean, d = '') => out.push(`${ok ? 'PASS' : 'FAIL'} ${n}${d ? ' :: ' + d : ''}`);
const tick = (ms = 30) => new Promise((r) => setTimeout(r, ms));
const cs = (el: Element) => getComputedStyle(el);

function mount(node: React.ReactNode) {
  const host = document.createElement('div');
  host.dataset.zz = '1';
  host.style.cssText = 'width:347px;margin:8px;position:relative';
  document.body.append(host);
  const root = createRoot(host);
  flushSync(() => root.render(node));
  return host;
}
const q = <T extends Element = HTMLElement>(host: HTMLElement, sel: string) => host.querySelector(sel) as T;
const key = (el: Element, k: string) => {
  const ev = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
  el.dispatchEvent(ev);
  return ev;
};
const typeInto = (input: HTMLInputElement, text: string) => {
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  set.call(input, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

async function run() {
  // ---- open / close / select with the mouse
  const changes: string[] = [];
  const opens: boolean[] = [];
  const events: string[] = [];
  const a = mount(
    <Dropdown id="a" onValueChange={(v) => changes.push(v)} onOpenChange={(o) => opens.push(o)} className="extra" data-foo="1" />,
  );
  a.addEventListener('ds-dropdown-change', ((e: CustomEvent) => events.push(e.detail.value + '/' + e.detail.label)) as EventListener);
  const trigger = q<HTMLButtonElement>(a, '.ds-dropdown__trigger');
  const menu = q(a, '.ds-dropdown__menu');
  const rootEl = q(a, '.ds-dropdown');
  check('closed at start: aria-expanded false, menu hidden, no open class', trigger.getAttribute('aria-expanded') === 'false' && menu.hidden && !rootEl.classList.contains('ds-dropdown--open'));
  check('className and data-* go to the root', rootEl.classList.contains('extra') && rootEl.dataset.foo === '1');
  check('trigger ARIA: combobox, haspopup, controls, labelledby, describedby', trigger.getAttribute('role') === 'combobox' && trigger.getAttribute('aria-haspopup') === 'listbox' && trigger.getAttribute('aria-controls') === 'a-menu' && trigger.getAttribute('aria-labelledby') === 'a-label a-value' && trigger.getAttribute('aria-describedby') === 'a-caption');
  trigger.focus();
  trigger.click();
  await tick();
  check('click opens: expanded true, menu visible, open class, onOpenChange(true)', trigger.getAttribute('aria-expanded') === 'true' && !menu.hidden && rootEl.classList.contains('ds-dropdown--open') && opens.at(-1) === true);
  const items = [...a.querySelectorAll<HTMLElement>('.ds-dropdown__item')];
  check('first option is active, activedescendant points to it', items[0].classList.contains('is-active') && trigger.getAttribute('aria-activedescendant') === 'a-option-0');
  check('listbox ARIA: roles and aria-selected', a.querySelector('.ds-dropdown__list')!.getAttribute('role') === 'listbox' && items.every((i) => i.getAttribute('role') === 'option' && i.getAttribute('aria-selected') === 'false'));
  const md = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
  items[1].dispatchEvent(md);
  check('mousedown on the list is prevented (focus stays on the trigger)', md.defaultPrevented);
  items[2].dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
  await tick();
  check('mousemove highlights the option', [...a.querySelectorAll('.ds-dropdown__item')][2].classList.contains('is-active'));
  trigger.click();
  await tick();
  check('click on the trigger again closes', trigger.getAttribute('aria-expanded') === 'false' && menu.hidden && opens.at(-1) === false);
  trigger.click();
  await tick();
  (a.querySelectorAll('.ds-dropdown__item')[1] as HTMLElement).click();
  await tick();
  const valueEl = q(a, '.ds-dropdown__value');
  check('choosing an option shows it, drops the placeholder style, closes', valueEl.textContent === 'Paris' && !valueEl.classList.contains('ds-dropdown__value--placeholder') && menu.hidden);
  check('onValueChange and ds-dropdown-change fire with the value', changes.at(-1) === 'Paris' && events.at(-1) === 'Paris/Paris', `${changes} | ${events}`);
  check('focus returns to the trigger after choosing', document.activeElement === trigger);
  check('chosen option has aria-selected=true', q(a, '#a-option-1').getAttribute('aria-selected') === 'true');
  check('activedescendant removed when closed', !trigger.hasAttribute('aria-activedescendant'));

  // ---- outside click
  const outside = document.createElement('input');
  document.body.append(outside);
  trigger.click();
  await tick();
  outside.focus();
  outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  await tick();
  check('mousedown outside closes without stealing focus', menu.hidden && document.activeElement === outside);
  trigger.click();
  await tick();
  q(a, '.ds-dropdown__label-text').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  await tick();
  check('mousedown inside the dropdown does not close', !menu.hidden);
  trigger.click();
  await tick();

  // ---- keyboard
  const kb = mount(<Dropdown id="k" />);
  const kt = q<HTMLButtonElement>(kb, '.ds-dropdown__trigger');
  const km = q(kb, '.ds-dropdown__menu');
  const active = () => [...kb.querySelectorAll('.ds-dropdown__item')].findIndex((i) => i.classList.contains('is-active'));
  for (const k of ['ArrowDown', 'ArrowUp', 'Enter', ' ']) {
    kt.focus();
    const e = key(kt, k);
    await tick();
    check(`closed + ${k === ' ' ? 'Space' : k} opens (and is prevented)`, !km.hidden && e.defaultPrevented);
    key(kt, 'Escape');
    await tick();
  }
  kt.focus();
  key(kt, 'ArrowDown');
  await tick();
  check('open: first option active', active() === 0);
  key(kt, 'ArrowDown'); await tick();
  key(kt, 'ArrowDown'); await tick();
  check('ArrowDown moves down', active() === 2);
  key(kt, 'End'); await tick();
  check('End goes to the last', active() === 3);
  key(kt, 'ArrowDown'); await tick();
  check('ArrowDown stops at the last', active() === 3);
  key(kt, 'Home'); await tick();
  check('Home goes to the first', active() === 0);
  key(kt, 'ArrowUp'); await tick();
  check('ArrowUp stops at the first', active() === 0);
  check('activedescendant follows the active option', kt.getAttribute('aria-activedescendant') === 'k-option-0');
  key(kt, 'ArrowDown'); await tick();
  key(kt, 'Enter'); await tick();
  check('Enter selects the active option and closes', q(kb, '.ds-dropdown__value').textContent === 'Paris' && km.hidden && document.activeElement === kt);
  key(kt, 'ArrowDown'); await tick();
  check('reopen: chosen option is the active one', active() === 1);
  key(kt, 'ArrowDown'); await tick();
  key(kt, ' '); await tick();
  check('Space selects', q(kb, '.ds-dropdown__value').textContent === 'Berlin' && km.hidden);
  key(kt, 'ArrowDown'); await tick();
  const esc = key(kt, 'Escape'); await tick();
  check('Escape closes, is prevented and keeps focus on the trigger', km.hidden && esc.defaultPrevented && document.activeElement === kt);
  key(kt, 'ArrowDown'); await tick();
  const tab = key(kt, 'Tab'); await tick();
  check('Tab closes and is not prevented', km.hidden && !tab.defaultPrevented);

  // ---- search
  const sv: string[] = [];
  const s = mount(<Dropdown id="s" showSearch onValueChange={(v) => sv.push(v)} options={['London', 'Paris', 'Berlin', 'Madrid']} />);
  const st = q<HTMLButtonElement>(s, '.ds-dropdown__trigger');
  const si = q<HTMLInputElement>(s, '.ds-dropdown__search input');
  st.focus();
  st.click();
  await tick();
  check('search: opening moves focus to the search field', document.activeElement === si);
  check('search: activedescendant is on the field, not the trigger', si.getAttribute('aria-activedescendant') === 's-option-0' && !st.hasAttribute('aria-activedescendant'));
  typeInto(si, 'ri');
  await tick();
  const vis = () => [...s.querySelectorAll<HTMLElement>('.ds-dropdown__item')].filter((i) => !i.hidden).map((i) => i.textContent);
  check('search: typing narrows the list', vis().join() === 'Paris,Madrid', vis().join());
  check('search: first visible option is active', q(s, '#s-option-1').classList.contains('is-active') && si.getAttribute('aria-activedescendant') === 's-option-1');
  key(si, 'ArrowDown'); await tick();
  check('search: ArrowDown moves among visible options', q(s, '#s-option-3').classList.contains('is-active'));
  key(si, 'ArrowDown'); await tick();
  check('search: ArrowDown stops at the last visible option', q(s, '#s-option-3').classList.contains('is-active'));
  const sp = key(si, ' '); await tick();
  check('search: Space and Home are not hijacked', !sp.defaultPrevented && !key(si, 'Home').defaultPrevented);
  key(si, 'Enter'); await tick();
  check('search: Enter selects the active visible option', sv.at(-1) === 'Madrid' && q(s, '.ds-dropdown__menu').hidden && document.activeElement === st);
  st.click(); await tick();
  check('search: reopening clears the text and shows all options', si.value === '' && vis().length === 4 && document.activeElement === si);
  key(si, 'Escape'); await tick();
  check('search: Escape closes and returns focus to the trigger', q(s, '.ds-dropdown__menu').hidden && document.activeElement === st);
  st.click(); await tick();
  typeInto(si, 'zzz');
  await tick();
  check('search: no match hides everything', vis().length === 0 && !si.hasAttribute('aria-activedescendant'));
  key(si, 'Escape'); await tick();

  // ---- disabled
  const d = mount(<Dropdown id="d" disabled />);
  const dt = q<HTMLButtonElement>(d, '.ds-dropdown__trigger');
  dt.click();
  dt.focus();
  key(dt, 'ArrowDown');
  await tick();
  check('disabled: does not open and cannot take focus', dt.disabled && q(d, '.ds-dropdown__menu').hidden && document.activeElement !== dt);
  const dopen = mount(<Dropdown id="do" disabled defaultOpen />);
  check('disabled + open stays closed', q(dopen, '.ds-dropdown__menu').hidden && q(dopen, '.ds-dropdown__trigger').getAttribute('aria-expanded') === 'false');

  // ---- controlled
  const cv: string[] = [];
  const co: boolean[] = [];
  const c = mount(<Dropdown id="c" value="Paris" onValueChange={(v) => cv.push(v)} open={false} onOpenChange={(o) => co.push(o)} />);
  const ct = q<HTMLButtonElement>(c, '.ds-dropdown__trigger');
  ct.click(); await tick();
  check('controlled open: request is reported, menu stays closed', co.at(-1) === true && q(c, '.ds-dropdown__menu').hidden);
  check('controlled value shows the given value', q(c, '.ds-dropdown__value').textContent === 'Paris');
  const c2 = mount(<Dropdown id="c2" value="Paris" open onValueChange={(v) => cv.push(v)} />);
  (c2.querySelectorAll('.ds-dropdown__item')[2] as HTMLElement).click(); await tick();
  check('controlled value: choice is reported, display does not change', cv.at(-1) === 'Berlin' && q(c2, '.ds-dropdown__value').textContent === 'Paris');

  // ---- defaultOpen does not steal focus
  outside.focus();
  const dof = mount(<Dropdown id="df" showSearch defaultOpen />);
  check('defaultOpen with search does not take focus on mount', document.activeElement === outside && !q(dof, '.ds-dropdown__menu').hidden);

  // ---- ref
  let refEl: HTMLDivElement | null = null;
  const r = mount(<Dropdown id="r" ref={(n) => (refEl = n)} />);
  check('ref is the root element', refEl === q(r, '.ds-dropdown'));

  // ---- computed styles
  const t0 = cs(trigger);
  check('closed trigger: height 40, radius 8, border gray/200, white fill', t0.height === '40px' && t0.borderRadius === '8px' && t0.boxShadow.includes('rgb(209, 213, 220)') || t0.borderColor === 'rgb(209, 213, 220)', `${t0.height} ${t0.borderRadius} ${t0.borderColor} ${t0.boxShadow.slice(0, 40)}`);
  trigger.click(); await tick();
  const t1 = cs(trigger);
  check('open trigger: gray/500 border look', t1.borderColor === 'rgb(74, 85, 101)' || t1.boxShadow.includes('rgb(74, 85, 101)'), `${t1.borderColor} ${t1.boxShadow.slice(0, 50)}`);
  const m = cs(menu);
  const item0 = a.querySelector('.ds-dropdown__item') as HTMLElement;
  check('menu: absolute, 8px radius, shadow, white; item 58px high 16px/24px', m.position === 'absolute' && m.borderRadius === '8px' && m.boxShadow !== 'none' && Math.round(item0.getBoundingClientRect().height) === 58 && cs(item0).fontSize === '16px', `${m.position} ${m.borderRadius} ${Math.round(item0.getBoundingClientRect().height)} ${cs(item0).fontSize}`);
  trigger.click(); await tick();
  const e = mount(<Dropdown id="e" validation="error" />);
  check('error: aria-invalid and alert/600 border', q(e, '.ds-dropdown__trigger').getAttribute('aria-invalid') === 'true' && (cs(q(e, '.ds-dropdown__trigger')).borderColor === 'rgb(190, 38, 37)' || cs(q(e, '.ds-dropdown__trigger')).boxShadow.includes('rgb(190, 38, 37)')));
  const nb = mount(<Dropdown id="n" showLabel={false} showFootnote={false} />);
  check('no title: labelledby is the value only, listbox labelled by the trigger', q(nb, '.ds-dropdown__trigger').getAttribute('aria-labelledby') === 'n-value' && q(nb, '.ds-dropdown__list').getAttribute('aria-labelledby') === 'n-trigger' && !q(nb, '.ds-dropdown__trigger').hasAttribute('aria-describedby'));
}

function Report() {
  useEffect(() => {
    const t = setTimeout(() => {
      run()
        .catch((e) => out.push('FAIL exception :: ' + e.stack))
        .finally(() => {
          document.querySelectorAll<HTMLElement>('[data-zz]').forEach((h) => (h.style.display = 'none'));
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

// ---- visual grid: ?m=react or ?m=html
const CASES: Array<[string, Record<string, unknown>, number]> = [
  ['default', { id: 'g1' }, 150],
  ['hover', { id: 'g2', 'data-preview-state': 'hover' }, 150],
  ['selected', { id: 'g3', value: 'London' }, 150],
  ['disabled', { id: 'g4', disabled: true }, 150],
  ['error', { id: 'g5', validation: 'error' }, 150],
  ['info', { id: 'g6', info: true }, 150],
  ['bare', { id: 'g7', showLabel: false, showFootnote: false }, 150],
  ['open plain', { id: 'g8', open: true }, 330],
  ['open selected + all parts', { id: 'g9', open: true, value: 'Paris', showPro: true, showCheckbox: true, showRightIcon: true, showColor: true }, 330],
  ['open search', { id: 'g10', open: true, value: 'Berlin', showSearch: true }, 400],
  ['open per-item', { id: 'g11', open: true, value: 'Madrid', options: [{ label: 'London' }, { label: 'Paris', checkbox: true }, { label: 'Berlin', color: 'var(--ds-color-alert-500)' }, { label: 'Madrid', rightIcon: true }, { label: 'Rome', pro: true }] }, 400],
  ['open error', { id: 'g12', open: true, validation: 'error', value: 'Berlin' }, 330],
];

function Grid({ mode }: { mode: string }) {
  useEffect(() => {
    if (mode !== 'html') return;
    document.querySelectorAll<HTMLElement>('[data-html-cell]').forEach((cell, i) => {
      const props = CASES[i][1];
      const node = (createDropdown as (p: Record<string, unknown>) => HTMLElement)(props);
      if (props['data-preview-state']) node.setAttribute('data-preview-state', String(props['data-preview-state']));
      cell.append(node);
    });
  }, [mode]);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', width: 1200, background: '#fff' }}>
      {CASES.map(([name, props, h], i) => {
        const { open, value, ...rest } = props as { open?: boolean; value?: string } & Record<string, unknown>;
        return (
          <div key={name} style={{ width: 380, height: h, padding: 8, boxSizing: 'border-box', position: 'relative' }}>
            <div style={{ width: 347 }} {...(mode === 'html' ? { 'data-html-cell': '1' } : {})}>
              {mode === 'html' ? null : <Dropdown {...(rest as DropdownProps)} defaultOpen={open} defaultValue={value} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const Visual: StoryObj = { render: () => <Grid mode={new URLSearchParams(window.location.search).get('m') ?? 'react'} /> };
