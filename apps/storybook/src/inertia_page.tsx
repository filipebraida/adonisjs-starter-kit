import { App } from "@inertiajs/react";
import { http, HttpResponse } from "msw";
import type { ComponentType } from "react";

import { CAPABILITIES_AUTH } from "@web/app/auth/enums/capability";
import { ROLES } from "@web/app/auth/enums/role";
import { CAPABILITIES_USERS } from "@web/app/users/enums/capability";

type Props = Record<string, unknown>;

/** Who is signed in, as the shared props carry it. */
export const SIGNED_IN = {
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
  },
  user: {
    user: {
      id: 3,
      fullName: "Alan Turing",
      email: "alan@example.com",
      avatarUrl: null,
    },
    authz: { roles: [ROLES.USER], permissions: [] },
  },
} as const;

type PageOptions = {
  component: string;
  url: string;
  as?: keyof typeof SIGNED_IN;
  props?: Props;
  flash?: { error?: string; success?: string };
  impersonation?: { returnTo: string } | null;
};

/** The page object the server sends: the shared props the middleware adds, plus the page's own. */
function pageObject(options: PageOptions) {
  const signedIn = SIGNED_IN[options.as ?? "admin"];
  return {
    component: options.component,
    url: options.url,
    version: null,
    flash: { error: options.flash?.error, success: options.flash?.success },
    rescuedProps: [],
    rememberedState: {},
    props: {
      errors: {},
      locale: "en",
      fallbackLocale: "en",
      csrf: "storybook",
      unseenNotifications: 3,
      impersonation: options.impersonation ?? null,
      ...signedIn,
      ...options.props,
    },
  };
}

/**
 * Renders a real page through Inertia's own App, as if the server had sent
 * it. Its visits (search, sort, links) reach no server unless the story
 * answers them with `inertiaRoute`.
 */
export function inertiaPage(Page: ComponentType<any>, options: PageOptions) {
  return (
    <App
      initialComponent={Page}
      resolveComponent={() => Page}
      initialPage={pageObject(options)}
    />
  );
}

/**
 * Answers the page's Inertia visits to `path` (an MSW handler, for a story's
 * `beforeEach`): `respond` reads the query string, as the controller would,
 * and returns the page to send back.
 */
export function inertiaRoute(
  path: string,
  respond: (query: URLSearchParams) => Omit<PageOptions, "url">,
) {
  return http.get(path, ({ request }) => {
    const url = new URL(request.url);
    const page = pageObject({
      ...respond(url.searchParams),
      url: url.pathname + url.search,
    });
    return HttpResponse.json(page, {
      headers: { "X-Inertia": "true", Vary: "X-Inertia" },
    });
  });
}
