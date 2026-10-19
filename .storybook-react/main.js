/**
 * React Storybook. It runs next to the HTML Storybook in .storybook/ and shares its tokens, fonts, theme and docs CSS.
 * Start it with: storybook dev -p 6007 -c .storybook-react
 * Only src/react is documented here.
 * @type {import('@storybook/react-vite').StorybookConfig}
 */
const config = {
  framework: '@storybook/react-vite',
  stories: ['../src/react/**/*.mdx', '../src/react/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  core: { disableTelemetry: true },
};

export default config;
