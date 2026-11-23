import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { expect } from "storybook/test";

import NotificationsPage from "@web/app/notifications/ui/pages/index";

import { inertiaPage, inertiaRoute } from "../../src/inertia_page";

const now = Date.now();
const HOUR = 3_600_000;

const NOTIFICATIONS: ComponentProps<typeof NotificationsPage>["notifications"] =
  [
    {
      id: 3,
      type: "user-welcome",
      status: "unseen",
      title: "Welcome to the workspace",
      body: "Set your password to sign in.",
      link: "/settings",
      createdAt: new Date(now - HOUR).toISOString(),
    },
    {
      id: 2,
      type: "role-changed",
      status: "unseen",
      title: "Your role changed to Manager",
      body: null,
      link: null,
      createdAt: new Date(now - 2 * HOUR).toISOString(),
    },
    {
      id: 1,
      type: "user-welcome",
      status: "read",
      title:
        "A very long title that keeps going to show how the row wraps when the text does not fit on one line",
      body: "And a body that is long as well, so that the second line wraps too and the time stays on the right.",
      link: null,
      createdAt: new Date(now - 30 * HOUR).toISOString(),
    },
  ];

function page(filter: "unread" | null) {
  const notifications = filter
    ? NOTIFICATIONS.filter((item) => item.status !== "read")
    : NOTIFICATIONS;
  return {
    component: "notifications/index",
    props: { notifications, unread: 2, filter },
  };
}

const meta = {
  title: "Screens/Notifications",
  parameters: {
    docs: {
      description: {
        component:
          'The whole inbox, grouped by day; the bell shows only the latest and links here with "See all". The tabs slice it to the unread ones.',
      },
    },
  },
  beforeEach({ msw }) {
    msw.use(
      inertiaRoute("/notifications", NotificationsPage, (query) =>
        page(query.get("filter") === "unread" ? "unread" : null),
      ),
    );
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inbox: Story = {
  render: () =>
    inertiaPage(NotificationsPage, { url: "/notifications", ...page(null) }),
  async play({ canvas, userEvent }) {
    await expect(canvas.getByText("Today")).toBeVisible();
    await userEvent.click(canvas.getByRole("radio", { name: /Unread/ }));
    await expect(
      await canvas.findByText("Your role changed to Manager"),
    ).toBeVisible();
  },
};

export const Empty: Story = {
  render: () =>
    inertiaPage(NotificationsPage, {
      url: "/notifications",
      component: "notifications/index",
      props: { notifications: [], unread: 0, filter: null },
    }),
};

export const AllRead: Story = {
  render: () =>
    inertiaPage(NotificationsPage, {
      url: "/notifications?filter=unread",
      component: "notifications/index",
      props: { notifications: [], unread: 0, filter: "unread" },
    }),
};
