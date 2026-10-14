/** @type {import('@storybook/html-vite').StorybookConfig} */
const config = {
  framework: '@storybook/html-vite',
  stories: ['../src/stories/**/*.mdx', '../src/stories/**/*.stories.@(js|ts)'],
  addons: ['@storybook/addon-docs'],
  core: { disableTelemetry: true },
};

export default config;
