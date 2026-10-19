import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

/*
  Library build: `npm run build:lib`. The file is not called vite.config.* on purpose: Storybook loads that name
  automatically and would merge library mode into both Storybooks.

  Output (dist/):
    index.js        ESM bundle of src/react/index.ts. React is not bundled; it is a peer dependency.
    styles.css      design tokens + the CSS of every exported component (no fonts)
    types/          TypeScript declarations (tsc, see tsconfig.build.json)
    fonts.css       @font-face rules (scripts/build-lib-assets.mjs); the font files are NOT copied into dist
*/
export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: fileURLToPath(new URL('./src/react/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'index.js',
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: [/^react(\/.*)?$/, /^react-dom(\/.*)?$/],
    },
  },
});
