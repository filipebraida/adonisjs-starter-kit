import { App, router } from "@inertiajs/react";
import { http, HttpResponse } from "msw";
import { useEffect, type ComponentProps, type ComponentType } from "react";

import type { Data } from "@generated/data";

import { CAPABILITIES_AUTH } from "@web/app/auth/enums/capability";
import { ROLES } from "@web/app/auth/enums/role";
import { CAPABILITIES_USERS } from "@web/app/users/enums/capability";

/** Who is signed in, as the shared props carry it. */
export const SIGNED_IN: Record<
  "admin" | "manager" | "user",
  {
    user: NonNullable<Data.SharedProps["user"]>;
    authz: Data.SharedProps["authz"];
    helpArticles: Data.SharedProps["helpArticles"];
  }
> = {
  admin: {
    user: {
      id: 1,
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      avatarUrl: null,
    },
    authz: {
      roles: [ROLES.ADMIN],
      permissions: [
        ...Object.values(CAPABILITIES_USERS),
        ...Object.values(CAPABILITIES_AUTH),
      ],
    },
    helpArticles: [
      "account/profile",
      "account/password",
      "account/appearance",
      "account/api-tokens",
      "administration/users",
      "administration/roles",
      "administration/activity",
    ],
  },
  manager: {
    user: {
      id: 2,
      fullName: "Grace Hopper",
      email: "grace@example.com",
      avatarUrl: null,
    },
    authz: {
      roles: [ROLES.MANAGER],
      permissions: [
        CAPABILITIES_USERS.usersViewList,
        CAPABILITIES_USERS.usersCreate,
        CAPABILITIES_USERS.usersInvite,
      ],
    },
    helpArticles: [
      "account/profile",
      "account/password",
      "account/appearance",
      "administration/users",
    ],
  },
  user: {
    user: {
      id: 3,
      fullName: "Alan Turing",
      email: "alan@example.com",
      avatarUrl: null,
    },
    authz: { roles: [ROLES.USER], permissions: [] },
    helpArticles: ["account/profile", "account/password", "account/appearance"],
  },
};

/**
 * The props a page gets from its own controller: its props minus the shared
 * ones. A story passing the wrong shape fails the typecheck, so the board
 * cannot drift from the page.
 */
export type OwnProps<P> = Omit<P, keyof Data.SharedProps | "children">;

type PageOptions<P> = {
  component: string;
  url: string;
  as?: keyof typeof SIGNED_IN;
  props: OwnProps<P>;
  flash?: { error?: string; success?: string };
  impersonation?: { returnTo: string } | null;
  locale?: "en" | "pt";
  /** A page-modal open over this page, as `inertia.modal(...)` sends it. */
  modal?: ModalOptions;
};

type ModalOptions = {
  component: string;
  // A page-modal's props are its own; the story checks them when it builds the object.
  Page: ComponentType<never>;
  props: Record<string, unknown>;
};

/** What the Inertia middleware shares, typed by it: a new shared prop fails here until the stories send it. */
function sharedProps(options: PageOptions<unknown>): Data.SharedProps {
  return {
    errors: {},
    csrf: "storybook",
    locale: options.locale ?? "en",
    fallbackLocale: "en",
    unseenNotifications: 3,
    impersonation: options.impersonation ?? null,
    ...SIGNED_IN[options.as ?? "admin"],
  };
}

/** The page object the server sends: the shared props the middleware adds, plus the page's own. */
function pageObject<P>(options: PageOptions<P>) {
  return {
    component: options.component,
    url: options.url,
    version: null,
    flash: { error: options.flash?.error, success: options.flash?.success },
    rescuedProps: [],
    rememberedState: {},
    props: {
      ...sharedProps(options as PageOptions<unknown>),
      ...options.props,
      ...(options.modal && {
        modal: {
          component: options.modal.component,
          props: options.modal.props,
          baseUrl: options.url,
          redirectUrl: options.url,
          key: options.modal.component,
        },
      }),
    },
  };
}

// Inertia sets its router up once per load of the iframe, with the first
// story's page; switching stories keeps the iframe. The router resolves
// through the story on screen, and each story hands it its own page on mount:
// otherwise a link from the second story renders the first one's page.
type InitialPage = ComponentProps<typeof App>["initialPage"];
type PageComponent = NonNullable<
  ComponentProps<typeof App>["initialComponent"]
>;

let pageOnScreen: PageComponent | null = null;
let modalOnScreen: ModalOptions | null = null;

function BoardApp({ Page, page }: { Page: PageComponent; page: InitialPage }) {
  useEffect(() => {
    router.replace({
      component: page.component,
      url: page.url,
      props: page.props,
      flash: page.flash,
      preserveState: true,
      preserveScroll: true,
    });
  }, [page]);
  return (
    <App
      initialComponent={Page}
      resolveComponent={(name) =>
        name === modalOnScreen?.component
          ? (modalOnScreen.Page as PageComponent)
          : (pageOnScreen ?? Page)
      }
      initialPage={page}
    />
  );
}

/**
 * Renders a real page through Inertia's own App, as if the server had sent
 * it. Its visits (search, sort, links) reach no server unless the story
 * answers them with `inertiaRoute`.
 */
export function inertiaPage<P>(
  Page: ComponentType<P>,
  options: PageOptions<P>,
) {
  pageOnScreen = Page as PageComponent;
  modalOnScreen = options.modal ?? null;
  return (
    <BoardApp
      Page={Page as PageComponent}
      // Inertia types the initial page with its own error-bag shape; the props
      // were already checked against the page and the middleware above.
      page={pageObject(options) as unknown as InitialPage}
    />
  );
}

/**
 * Answers the page's Inertia visits to `path` (an MSW handler, for a story's
 * `beforeEach`): `respond` reads the query string and the path, as the controller would,
 * and returns the page to send back. The page is passed only to type what
 * `respond` returns. A `post` answers as the redirect the server sends after
 * it would: `respond` names the page's `url` then.
 */
export function inertiaRoute<P>(
  path: string,
  _page: ComponentType<P>,
  respond: (
    query: URLSearchParams,
    url: URL,
  ) => Omit<PageOptions<P>, "url"> & { url?: string },
  method: "get" | "post" = "get",
) {
  return http[method](path, ({ request }) => {
    const url = new URL(request.url);
    const page = pageObject({
      url: url.pathname + url.search,
      ...respond(url.searchParams, url),
    });
    return HttpResponse.json(page, {
      headers: { "X-Inertia": "true", Vary: "X-Inertia" },
    });
  });
}
