// Small helpers shared by the field-style component docs (Input Tag, Text Area).

export const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Preview tile used on every component page (classes come from button-docs.css and input-docs.css).
export const tile = (inner, className = '') =>
  `<div class="ds-bd-tile ds-bd-tile--start ${className}"><div class="ds-bd-input-box">${inner}</div></div>`;

// Adds an anatomy marker (see .ds-bd-anchor in input-docs.css) to the first element with the given class attribute.
export const anchor = (html, cls, dir, n, ax = '') =>
  html.replace(`class="${cls}"`, `class="${cls} ds-bd-anchor ds-bd-anchor--${dir}" data-n="${n}"${ax ? ` style="--ax:${ax}"` : ''}`);

export const specRows = (group, items) =>
  items.map(([label, value]) => `<tr><th scope="row">${group} · ${label}</th><td>${esc(value)}</td></tr>`).join('');

export const legendItem = (n, title, text) => `<li><b>${n}</b><div><strong>${title}</strong><span>${text}</span></div></li>`;
