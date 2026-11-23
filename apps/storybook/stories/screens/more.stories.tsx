import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import MorePage from "@web/app/core/ui/pages/more";

import { inertiaPage } from "../../src/inertia_page";

const meta = {
  title: "Screens/More",
  parameters: {
    docs: {
      description: {
        component:
          'The phone\'s "More" page, reached from the last tab of the tab bar: who is signed in, and what the tabs leave out, grouped as the sidebar and the user menu group it. Each shell opens it with its own groups.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const InTheApp: Story = {
  render: () =>
    inertiaPage(MorePage, {
      component: "core/more",
      url: "/more?area=app",
      props: { area: "app" },
    }),
  async play({ canvas }) {
    await expect(canvas.getByRole("link", { name: "Settings" })).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "Admin panel" }),
    ).toBeVisible();
  },
};

export const InTheAdministration: Story = {
  render: () =>
    inertiaPage(MorePage, {
      component: "core/more",
      url: "/more?area=admin",
      props: { area: "admin" },
    }),
  async play({ canvas }) {
    // The desktop sidebar is on screen too: look in the page itself.
    const page = within(canvas.getByRole("main"));
    await expect(
      page.getByRole("link", { name: "Back to the app" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Workflows" })).toBeVisible();
  },
};

/** A user with no admin capability: the admin panel is not offered. */
export const RegularUser: Story = {
  render: () =>
    inertiaPage(MorePage, {
      component: "core/more",
      url: "/more?area=app",
      as: "user",
      props: { area: "app" },
    }),
  async play({ canvas }) {
    await expect(
      canvas.queryByRole("link", { name: "Admin panel" }),
    ).toBeNull();
  },
};
