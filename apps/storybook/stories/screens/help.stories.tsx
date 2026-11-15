import type { Meta, StoryObj } from "@storybook/react-vite";

import HelpIndexPage from "@web/app/help/ui/pages/help/index";
import HelpShowPage from "@web/app/help/ui/pages/help/show";

import {
  helpArticle,
  helpNavigation,
  helpRoutes,
  helpSpaces,
} from "../../src/help_server";
import { inertiaPage, SIGNED_IN } from "../../src/inertia_page";

const meta = {
  title: "Screens/Help",
  parameters: {
    docs: {
      description: {
        component:
          "The global help, with the app's real articles: the spaces a person may read, and an article laid out as documentation. Links to other pages do not navigate on the board.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type As = keyof typeof SIGNED_IN;

/** The article; its drawer and pictures are answered, links to other pages are not. */
function article(as: As, space: string, slug: string): Story {
  const readable = SIGNED_IN[as].helpArticles;
  return {
    beforeEach({ msw }) {
      msw.use(...helpRoutes(readable));
    },
    render: () =>
      inertiaPage(HelpShowPage, {
        component: "help/help/show",
        url: `/help/${space}/${slug}`,
        as,
        props: {
          ...helpArticle(space, slug, readable, "en"),
          navigation: helpNavigation(space, readable, "en"),
        },
      }),
  };
}

/** Everything an administrator may read. */
export const Index: Story = {
  render: () =>
    inertiaPage(HelpIndexPage, {
      component: "help/help/index",
      url: "/help",
      props: { spaces: helpSpaces(SIGNED_IN.admin.helpArticles, "en") },
    }),
};

/** Nothing the person may read: a project whose every article needs a capability. */
export const IndexEmpty: Story = {
  render: () =>
    inertiaPage(HelpIndexPage, {
      component: "help/help/index",
      url: "/help",
      as: "user",
      props: { spaces: [] },
    }),
};

/** The invitation diagram, an alert and a picture. */
export const ArticleWithDiagram = article("admin", "administration", "users");

/** A plain user reads only their account's articles; API tokens are not among them. */
export const ArticleAsUser = article("user", "account", "password");
