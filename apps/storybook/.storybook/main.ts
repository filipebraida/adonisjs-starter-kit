import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.tsx"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-mcp",
    "msw-storybook-addon",
  ],
  // The MSW service worker, which answers the pages' Inertia visits.
  staticDirs: ["../public"],
  framework: { name: "@storybook/react-vite", options: {} },
};

export default config;
