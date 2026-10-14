import tokens from '../tokens/tokens.json';
import icons from '../figma/icons.json';

const esc = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export function renderColors() {
  return Object.values(tokens.colors)
    .map(({ label, path, steps }) => {
      const swatches = Object.entries(steps)
        .map(([step, hex]) => {
          const ink = luminance(hex) > 0.4 ? 'var(--ds-color-gray-900)' : 'var(--ds-color-gray-50)';
          return `<div class="ds-swatch">
            <div class="ds-swatch__chip" style="background:${hex};color:${ink}">${esc(step)}</div>
            <code class="ds-swatch__hex">${esc(hex)}</code>
          </div>`;
        })
        .join('');
      return `<section class="ds-color-family">
        <h3 class="ds-color-family__title">${esc(label)}</h3>
        <p class="ds-color-family__path">${esc(path)}</p>
        <div class="ds-swatch-row">${swatches}</div>
      </section>`;
    })
    .join('');
}

export function renderSemanticColors() {
  const rows = Object.entries(tokens.semanticColors)
    .filter(([key]) => key !== '$comment')
    .map(
      ([name, { light, dark }]) =>
        `<tr><td><code>${esc(name)}</code></td><td>${esc(light)}</td><td>${esc(dark)}</td></tr>`,
    )
    .join('');
  return `<table class="ds-table"><thead><tr><th>Token</th><th>Light</th><th>Dark</th></tr></thead><tbody>${rows}</tbody></table>`;
}

export function renderSpacing() {
  const rows = Object.entries(tokens.spacing.steps)
    .reverse()
    .map(([name, px]) => {
      const multiple = px / tokens.spacing.base;
      const description =
        name === 'none' ? 'No spacing, 0px' : name === '1x' ? 'Base spacing value' : `Base * ${multiple}`;
      return `<tr>
        <td class="ds-table__strong">${esc(name)}</td>
        <td class="ds-table__muted">${esc(description)}</td>
        <td><span class="ds-chip">${px}px</span></td>
        <td class="ds-table__bar"><span style="width:${px}px"></span></td>
      </tr>`;
    })
    .join('');
  return `<table class="ds-table"><thead><tr><th>Type</th><th>Description</th><th>Size</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
}

export function renderRadius() {
  const items = Object.entries(tokens.radius)
    .map(
      ([name, px]) => `<div class="ds-radius">
        <div class="ds-radius__box" style="border-radius:${px}px"></div>
        <div class="ds-radius__name">${esc(name)}</div>
        <span class="ds-chip">${px}px</span>
      </div>`,
    )
    .join('');
  return `<div class="ds-radius-row">${items}</div>`;
}

const weightValue = { Regular: 400, Semibold: 600, Bold: 700 };

export function renderTypography() {
  const rows = tokens.typography.styles
    .map((s) => {
      const lh = s.lineHeight ? `${s.lineHeight}px` : 'auto';
      const style = [
        `font-size:${s.size}px`,
        `line-height:${s.lineHeight ? `${s.lineHeight}px` : 'normal'}`,
        `font-weight:${weightValue[s.weight]}`,
        s.textCase ? `text-transform:${s.textCase}` : '',
      ].join(';');
      return `<div class="ds-type-row">
        <div class="ds-type-row__meta">
          <code>${esc(s.name)}</code>
          <span>${esc(tokens.fontFamily.name)} ${esc(s.weight)} · ${s.size}/${lh}</span>
          ${s.page ? `<span>Figma page label: ${esc(s.page)}</span>` : '<span>Not shown on the Figma Typography page</span>'}
        </div>
        <div class="ds-type-row__sample" style="${style}">The quick brown fox jumps over the lazy dog</div>
      </div>`;
    })
    .join('');
  return `<div class="ds-type">${rows}</div>`;
}

export function renderShadows() {
  const cards = tokens.shadows.styles
    .map((s) => {
      const focus = s.name.startsWith('shadow-focus');
      return `<div class="ds-shadow">
        <div class="ds-shadow__card${focus ? ' ds-shadow__card--focus' : ''}" style="box-shadow:${s.css}"></div>
        <code class="ds-shadow__name">${esc(s.name)}</code>
        <span class="ds-shadow__css">${esc(s.css)}</span>
      </div>`;
    })
    .join('');
  return `<div class="ds-shadow-row">${cards}</div>`;
}

export function renderIcons() {
  return icons.groups
    .map(
      (group) => `<section class="ds-icon-group">
        <h3>${esc(group.label)} <span class="ds-chip">${group.items.length}</span></h3>
        <ul class="ds-icon-list">${group.items.map((name) => `<li><code>${esc(name)}</code></li>`).join('')}</ul>
      </section>`,
    )
    .join('');
}
