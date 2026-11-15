import type { Meta, StoryObj } from "@storybook/react-vite";

import HelpIndexPage from "@web/app/help/ui/pages/help/index";
import HelpShowPage from "@web/app/help/ui/pages/help/show";

import {
  helpArticle,
  helpNavigation,
  helpRoutes,
  helpSpaces,
} from "../../src/help_server";
import { inertiaPage, inertiaRoute, SIGNED_IN } from "../../src/inertia_page";

const meta = {
  title: "Screens/Help",
  parameters: {
    docs: {
      description: {
        component:
          "The global help, with the app's real articles: the spaces a person may read, and an article laid out as documentation. Its links between articles work: a fake server answers them as the controller would.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type As = keyof typeof SIGNED_IN;

function article(as: As, space: string, slug: string): Story {
  const readable = SIGNED_IN[as].helpArticles;
  const props = (s: string, a: string) => ({
    ...helpArticle(s, a, readable, "en"),
    navigation: helpNavigation(s, readable, "en"),
  });
  return {
    beforeEach({ msw }) {
      msw.use(
        ...helpRoutes(readable),
        inertiaRoute("/help/:space/:article", HelpShowPage, (_query, url) => {
          const [, , s, a] = url.pathname.split("/");
          return { component: "help/help/show", as, props: props(s, a) };
        }),
      );
    },
    render: () =>
      inertiaPage(HelpShowPage, {
        component: "help/help/show",
        url: `/help/${space}/${slug}`,
        as,
        props: props(space, slug),
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

/** The invitation diagram, an alert and a picture. */
export const ArticleWithDiagram = article("admin", "administration", "users");

/** A plain user reads only their account's articles; API tokens are not among them. */
export const ArticleAsUser = article("user", "account", "password");
