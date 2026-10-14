import './dropdown.css';
import { inputIconSVG } from '../text-input/icons.js';
import { textInputHTML } from '../text-input/text-input.js';
import { DROPDOWN_STATES, DROPDOWN_DEFAULTS, SAMPLE_OPTIONS } from './dropdown.spec.js';

export { DROPDOWN_STATES, DROPDOWN_DEFAULTS, SAMPLE_OPTIONS };

const escapeHTML = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let uid = 0;

// "icon / check_box" from the Figma icon library (24 x 24 artboard); the other icons come from the shared sets.
const CHECK_BOX = 'M3.50003 20.5V3.5H20.5V20.5H3.50003ZM5.00001 19H19V4.99998H5.00001V19Z';
const icon = (name) =>
  name === 'check_box'
    ? `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="${CHECK_BOX}"/></svg>`
    : inputIconSVG(name);

const normalize = (options) => options.map((o) => (typeof o === 'string' ? { value: o, label: o } : { value: o.value ?? o.label, ...o }));

/**
 * Props mirror the Figma component properties.
 *   Trigger ("dropdown-input"): showLabel -> `title`, label -> `title text`, placeholder -> `placeholder text`,
 *     showFootnote -> `footnote`, footnote -> `footnote text`, info -> `info`. `disabled` and `validation: 'error'`
 *     are the Figma `disabled` and `error` states. `selected` is a chosen `value`.
 *   Items ("dropdown item"): showPro -> `Pro`, showCheckbox -> `checkbox`, showRightIcon -> `Right icons`, showColor -> `Color`.
 *     Each option can also set `pro`, `checkbox`, `rightIcon` or `color` itself.
 *   Menu ("dropdown"): showSearch -> `Search`.
 * `open` is the initial open state.
 */
export function dropdownItemsHTML(options, ctx = {}) {
  const { selectedIndex = -1, activeIndex = -1, idPrefix = 'ds-dropdown', showPro, showCheckbox, showRightIcon, showColor, proText = DROPDOWN_DEFAULTS.proText } = ctx;
  return normalize(options)
    .map((opt, i) => {
      const selected = i === selectedIndex;
      const pro = opt.pro ?? showPro;
      const checkbox = opt.checkbox ?? showCheckbox;
      const rightIcon = (opt.rightIcon ?? showRightIcon) && selected;
      const color = opt.color ?? (showColor ? 'var(--ds-color-alert-500)' : null);
      return `<div class="ds-dropdown__item${i === activeIndex ? ' is-active' : ''}" role="option" id="${escapeHTML(idPrefix)}-option-${i}" aria-selected="${selected}" data-index="${i}">${
        checkbox ? `<span class="ds-dropdown__item-icon">${icon('check_box')}</span>` : ''
      }${color ? `<span class="ds-dropdown__swatch" style="background:${escapeHTML(color)}"></span>` : ''}<span class="ds-dropdown__item-label">${escapeHTML(opt.label)}</span>${
        rightIcon ? `<span class="ds-dropdown__item-icon">${icon('check')}</span>` : ''
      }${pro ? `<span class="ds-dropdown__pro">${escapeHTML(typeof pro === 'string' ? pro : proText)}</span>` : ''}</div>`;
    })
    .join('');
}

export function dropdownHTML({
  id,
  name,
  options = SAMPLE_OPTIONS,
  value,
  open = false,
  disabled = false,
  validation,
  showLabel = true,
  label = DROPDOWN_DEFAULTS.label,
  info = false,
  placeholder = DROPDOWN_DEFAULTS.placeholder,
  showFootnote = true,
  footnote = DROPDOWN_DEFAULTS.footnote,
  showPro = false,
  showCheckbox = false,
  showRightIcon = false,
  showColor = false,
  showSearch = false,
  activeIndex = -1,
} = {}) {
  const base = id ?? `ds-dropdown-${++uid}`;
  const opts = normalize(options);
  const selectedIndex = opts.findIndex((o) => o.value === value);
  const isOpen = open && !disabled;
  const error = validation === 'error';

  const rootClass = ['ds-dropdown', disabled ? 'ds-dropdown--disabled' : '', error ? 'ds-dropdown--error' : '', isOpen ? 'ds-dropdown--open' : ''].filter(Boolean).join(' ');

  const labelRow = showLabel
    ? `<div class="ds-dropdown__label"><span class="ds-dropdown__label-text" id="${base}-label">${escapeHTML(label)}</span>${info ? `<span class="ds-dropdown__info">${icon('info')}</span>` : ''}</div>`
    : '';

  const triggerAttrs = [
    'class="ds-dropdown__trigger"',
    `id="${base}-trigger"`,
    'type="button"',
    'role="combobox"',
    'aria-haspopup="listbox"',
    `aria-expanded="${isOpen}"`,
    `aria-controls="${base}-menu"`,
    `aria-labelledby="${showLabel ? `${base}-label ` : ''}${base}-value"`,
    showFootnote ? `aria-describedby="${base}-caption"` : '',
    error ? 'aria-invalid="true"' : '',
    disabled ? 'disabled' : '',
    name ? `data-name="${escapeHTML(name)}"` : '',
    isOpen && activeIndex >= 0 ? `aria-activedescendant="${base}-option-${activeIndex}"` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const shown = selectedIndex >= 0 ? opts[selectedIndex].label : placeholder;
  const valueClass = `ds-dropdown__value${selectedIndex >= 0 ? '' : ' ds-dropdown__value--placeholder'}`;

  const search = showSearch
    ? `<div class="ds-dropdown__search">${textInputHTML({ id: `${base}-search`, showLabel: false, showFootnote: false, showLeftIcon: true, leftIcon: 'search', placeholder: DROPDOWN_DEFAULTS.searchPlaceholder })}</div>`
    : '';

  const ctx = { selectedIndex, activeIndex, idPrefix: base, showPro, showCheckbox, showRightIcon, showColor };
  const menu = `<div class="ds-dropdown__menu" id="${base}-menu"${isOpen ? '' : ' hidden'}>${search}<div class="ds-dropdown__list" role="listbox" aria-labelledby="${showLabel ? `${base}-label` : `${base}-trigger`}">${dropdownItemsHTML(opts, ctx)}</div></div>`;
  const caption = showFootnote ? `<div class="ds-dropdown__caption" id="${base}-caption">${escapeHTML(footnote)}</div>` : '';

  return `<div class="${rootClass}">${labelRow}<div class="ds-dropdown__control"><button ${triggerAttrs}><span class="${valueClass}" id="${base}-value">${escapeHTML(shown)}</span><span class="ds-dropdown__chevron">${icon('chevron')}</span></button>${menu}</div>${caption}</div>`;
}

/**
 * Builds the interactive dropdown: a select-only combobox with a listbox (WAI-ARIA authoring practices).
 * Fires a bubbling `ds-dropdown-change` event with `detail: { value, label }` when an option is chosen.
 */
export function createDropdown(props = {}) {
  const template = document.createElement('template');
  template.innerHTML = dropdownHTML(props);
  const root = template.content.firstElementChild;

  const options = normalize(props.options ?? SAMPLE_OPTIONS);
  const placeholder = props.placeholder ?? DROPDOWN_DEFAULTS.placeholder;
  const base = root.querySelector('.ds-dropdown__trigger').id.replace(/-trigger$/, '');
  const trigger = root.querySelector('.ds-dropdown__trigger');
  const menu = root.querySelector('.ds-dropdown__menu');
  const list = root.querySelector('.ds-dropdown__list');
  const valueEl = root.querySelector('.ds-dropdown__value');
  const search = root.querySelector('.ds-dropdown__search input');
  const itemCtx = { idPrefix: base, showPro: props.showPro, showCheckbox: props.showCheckbox, showRightIcon: props.showRightIcon, showColor: props.showColor };

  let selectedIndex = options.findIndex((o) => o.value === props.value);
  let activeIndex = -1;
  let isOpen = false;
  let query = '';

  const matches = (i) => !query || options[i].label.toLowerCase().includes(query.toLowerCase());
  const visible = () => options.map((_, i) => i).filter(matches);
  const focusTarget = () => search ?? trigger;

  const renderList = () => {
    list.innerHTML = dropdownItemsHTML(options, { ...itemCtx, selectedIndex, activeIndex });
    list.querySelectorAll('.ds-dropdown__item').forEach((li) => {
      li.hidden = !matches(Number(li.dataset.index));
    });
  };

  const setActive = (index) => {
    activeIndex = index;
    list.querySelectorAll('.ds-dropdown__item').forEach((li) => li.classList.toggle('is-active', Number(li.dataset.index) === index));
    const target = focusTarget();
    if (index >= 0) target.setAttribute('aria-activedescendant', `${base}-option-${index}`);
    else target.removeAttribute('aria-activedescendant');
  };

  const open = () => {
    if (isOpen || trigger.disabled) return;
    isOpen = true;
    query = '';
    if (search) search.value = '';
    menu.hidden = false;
    root.classList.add('ds-dropdown--open');
    trigger.setAttribute('aria-expanded', 'true');
    renderList();
    setActive(selectedIndex >= 0 ? selectedIndex : (visible()[0] ?? -1));
    if (search) search.focus();
    document.addEventListener('mousedown', onOutside);
  };

  const close = (returnFocus = true) => {
    if (!isOpen) return;
    isOpen = false;
    menu.hidden = true;
    root.classList.remove('ds-dropdown--open');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-activedescendant');
    if (search) search.removeAttribute('aria-activedescendant');
    document.removeEventListener('mousedown', onOutside);
    if (returnFocus) trigger.focus();
  };

  const select = (index) => {
    selectedIndex = index;
    valueEl.textContent = options[index].label;
    valueEl.classList.remove('ds-dropdown__value--placeholder');
    root.dispatchEvent(new CustomEvent('ds-dropdown-change', { bubbles: true, detail: { value: options[index].value, label: options[index].label } }));
    close();
  };

  function onOutside(event) {
    if (!root.contains(event.target)) close(false);
  }

  const move = (delta) => {
    const items = visible();
    if (!items.length) return;
    const at = items.indexOf(activeIndex);
    setActive(items[Math.min(items.length - 1, Math.max(0, at + delta))]);
  };

  const onListKey = (event, isSearch) => {
    switch (event.key) {
      case 'ArrowDown': event.preventDefault(); move(1); break;
      case 'ArrowUp': event.preventDefault(); move(-1); break;
      case 'Home': if (!isSearch) { event.preventDefault(); setActive(visible()[0] ?? -1); } break;
      case 'End': if (!isSearch) { event.preventDefault(); setActive(visible().at(-1) ?? -1); } break;
      case 'Enter': event.preventDefault(); if (activeIndex >= 0) select(activeIndex); break;
      case ' ': if (!isSearch) { event.preventDefault(); if (activeIndex >= 0) select(activeIndex); } break;
      case 'Escape': event.preventDefault(); close(); break;
      case 'Tab': close(false); break;
      default: break;
    }
  };

  trigger.addEventListener('click', () => (isOpen ? close() : open()));
  trigger.addEventListener('keydown', (event) => {
    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        open();
      }
      return;
    }
    onListKey(event, false);
  });

  list.addEventListener('mousedown', (event) => event.preventDefault());
  list.addEventListener('click', (event) => {
    const li = event.target.closest('.ds-dropdown__item');
    if (li && !li.hidden) select(Number(li.dataset.index));
  });
  list.addEventListener('mousemove', (event) => {
    const li = event.target.closest('.ds-dropdown__item');
    if (li && Number(li.dataset.index) !== activeIndex) setActive(Number(li.dataset.index));
  });

  if (search) {
    search.addEventListener('keydown', (event) => onListKey(event, true));
    search.addEventListener('input', () => {
      query = search.value;
      renderList();
      setActive(visible()[0] ?? -1);
    });
  }

  if (props.open) {
    isOpen = false;
    open();
  }

  return root;
}
