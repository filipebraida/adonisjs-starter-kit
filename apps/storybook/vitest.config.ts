import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

/**
 * Every story is a test, rendered in a real Chromium: it fails when the story
 * throws, its `play` fails, or a page logs an error. `pnpm test` here, and CI.
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [storybookTest({ configDir: ".storybook" })],
    test: {
      name: "storybook",
      browser: {
        enabled: true,
        headless: true,
        provider: playwright(),
        instances: [{ browser: "chromium" }],
      },
    },
  }),
);
