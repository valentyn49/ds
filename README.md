# Test Design System

Public Storybook documentation for Test Design System is deployed to GitHub Pages:

- **React Storybook (primary):** https://valentyn49.github.io/ds/
- **HTML Storybook (legacy):** https://valentyn49.github.io/ds/html/

## Local development

Install dependencies once:

```bash
npm ci
```

Run the Storybooks locally:

```bash
npm run storybook        # HTML Storybook on http://localhost:6006
npm run storybook:react  # React Storybook on http://localhost:6007
```

## Production builds

Repository-local validation builds:

```bash
npm run build-storybook         # HTML Storybook -> storybook-static/
npm run build-storybook:react   # React Storybook -> storybook-static-react/
```

GitHub Pages builds and assembly:

```bash
npm run build:pages
npm run verify:pages
```

That produces:

```text
storybook-react-static/   # React Storybook prepared for Pages root
storybook-html-static/    # HTML Storybook prepared for /html/
pages-dist/               # final GitHub Pages artifact
```

The final deployed structure is:

```text
pages-dist/
├── index.html
├── assets/
├── ...
└── html/
    ├── index.html
    ├── assets/
    └── ...
```

## Deployment

GitHub Pages deployment is handled by `.github/workflows/deploy-storybook.yml`.

It runs automatically on pushes to `main` and can also be started manually from the GitHub Actions UI with **workflow_dispatch**.

High-level flow:

1. `npm ci`
2. Build React Storybook for the Pages root
3. Build HTML Storybook for `/html/`
4. Assemble `pages-dist/`
5. Verify that both builds exist, use relative asset paths, and publish no proprietary font binaries
6. Upload the GitHub Pages artifact
7. Deploy with `actions/deploy-pages`

## Troubleshooting

### React or HTML Storybook loads without styles or icons

Run:

```bash
npm run build:pages
npm run verify:pages
```

The verification step checks that the root build and the nested `/html/` build both resolve assets with relative paths.

### GitHub Pages deployment succeeds but the site looks wrong

Confirm that the workflow uploaded `pages-dist/` and not an individual Storybook directory.

### Why Proxima Nova is missing on GitHub Pages

The repository does not bundle Proxima Nova font binaries. Browsers use Proxima Nova only when it is installed locally; otherwise Storybook falls back to the system font stack defined in the design tokens. Public Pages builds intentionally keep those proprietary binaries out of the deployment artifact.

### Component package consumers

To validate the React package build and public consumer types after Storybook changes:

```bash
npm run build:lib
npm run typecheck:consumer
npm test
```
