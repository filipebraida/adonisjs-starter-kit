import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import RolesPage from "@web/app/auth/ui/pages/roles/index";

import { inertiaPage } from "../../src/inertia_page";

const VOCABULARY = [
  "tokens.create",
  "tokens.delete",
  "tokens.view_list",
  "users.audit",
  "users.create",
  "users.delete",
  "users.impersonate",
  "users.invite",
  "users.manage_roles",
  "users.update",
  "users.view_list",
  "workflows.view",
];

const meta = {
  title: "Screens/Roles",
  parameters: {
    docs: {
      description: {
        component:
          "What each role grants, in words: the roles in code by their name and purpose, every capability as a sentence grouped by its domain. The slug stays in the tooltip.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () =>
    inertiaPage(RolesPage, {
      component: "auth/roles/index",
      url: "/roles",
      props: {
        vocabulary: VOCABULARY,
        roles: [
          {
            name: "admin",
            structural: true,
            capabilities: ["tokens.*", "users.*", "workflows.*"],
            members: 2,
          },
          {
            name: "manager",
            structural: true,
            capabilities: ["users.view_list", "users.create", "users.invite"],
            members: 5,
          },
          { name: "user", structural: true, capabilities: [], members: 120 },
          {
            name: "ethics_committee",
            structural: false,
            capabilities: ["users.audit"],
            members: 0,
          },
        ],
      },
    }),
  async play({ canvas }) {
    await expect(canvas.getByText("Administrator")).toBeVisible();
    await expect(canvas.getByText("Invite users")).toBeVisible();
    // A wildcard grant reads as the whole area, never as `users.*`.
    await expect(canvas.queryByText("users.*")).toBeNull();
    await expect(canvas.getAllByText("Everything in this area")).toHaveLength(
      3,
    );
    await expect(canvas.getByText("ethics_committee")).toBeVisible();
  },
};
