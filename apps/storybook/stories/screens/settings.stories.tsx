import type { Meta, StoryObj } from "@storybook/react-vite";

import SettingsPage from "@web/app/users/ui/pages/settings";

import { helpRoutes } from "../../src/help_server";
import { inertiaPage, inertiaRoute, SIGNED_IN } from "../../src/inertia_page";

const TOKENS = [
  {
    id: "1",
    name: "CI deploy",
    lastUsedAt: "2026-11-14T10:00:00.000Z",
    expiresAt: null,
    createdAt: "2026-10-01T09:00:00.000Z",
  },
  {
    id: "2",
    name: "Local scripts",
    lastUsedAt: null,
    expiresAt: "2027-01-01T00:00:00.000Z",
    createdAt: "2026-11-10T09:00:00.000Z",
  },
];

const meta = {
  // A screen's "?" opens its article in a drawer, answered from the real help.
  // Picking a language posts it and comes back to Settings in that language.
  beforeEach({ msw }) {
    msw.use(
      ...helpRoutes(SIGNED_IN.admin.helpArticles),
      inertiaRoute(
        "/switch/:locale",
        SettingsPage,
        (_query, url) => ({
          ...options("admin", { tokens: TOKENS }),
          url: "/settings",
          locale: url.pathname.endsWith("/pt") ? "pt" : "en",
        }),
        "post",
      ),
    );
  },
  title: "Screens/Settings",
  parameters: {
    docs: {
      description: {
        component:
          "One page, sections stacked: profile, password, appearance, and API tokens for who may hold them. Each section saves on its own.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const options = (
  as: "admin" | "user",
  props: Record<string, unknown>,
  extra = {},
) => ({
  component: "users/settings",
  as,
  props: {
    profile: SIGNED_IN[as].user,
    tokens: [],
    newToken: null,
    ...props,
  },
  ...extra,
});

const page = (
  as: "admin" | "user",
  props: Record<string, unknown>,
  extra = {},
) =>
  inertiaPage(SettingsPage, { url: "/settings", ...options(as, props, extra) });

export const Admin: Story = { render: () => page("admin", { tokens: TOKENS }) };

export const TokenJustCreated: Story = {
  render: () =>
    page("admin", {
      tokens: TOKENS,
      newToken: { name: "CI deploy", value: "oat_MS4xYzJmM2E0" },
    }),
};

export const RegularUser: Story = { render: () => page("user", {}) };

export const WhileImpersonating: Story = {
  render: () =>
    page("user", {}, { impersonation: { returnTo: "Ada Lovelace" } }),
};
