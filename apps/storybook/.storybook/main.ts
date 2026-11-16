import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.tsx"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-mcp",
    "msw-storybook-addon",
    "@storybook/addon-vitest",
  ],
  // The MSW service worker, which answers the pages' Inertia visits.
  staticDirs: ["../public"],
  framework: { name: "@storybook/react-vite", options: {} },
  // The board is the landing page: no onboarding checklist, no update
  // notices, and no usage data sent from a student's machine.
  features: {
    sidebarOnboardingChecklist: false,
    menuOnboardingChecklist: false,
  },
  core: { disableTelemetry: true, disableWhatsNewNotifications: true },
};

export default config;
