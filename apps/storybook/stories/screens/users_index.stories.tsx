import type { Meta, StoryObj } from "@storybook/react-vite";

import ListUsersPage from "@web/app/users/ui/pages/index";

import { inertiaPage, inertiaRoute } from "../../src/inertia_page";

type Row = {
  id: number;
  fullName: string | null;
  email: string;
  roles: string[];
  createdAt: string;
};

const NAMES = [
  "Barbara Liskov",
  "Margaret Hamilton",
  "Edsger Dijkstra",
  "Donald Knuth",
  "Frances Allen",
  "Ken Thompson",
  "Radia Perlman",
  "Tim Berners-Lee",
  "Katherine Johnson",
  "John McCarthy",
  "Hedy Lamarr",
  "Linus Torvalds",
  "Adele Goldberg",
  "Niklaus Wirth",
  "Shafi Goldwasser",
  "Leslie Lamport",
  "Annie Easley",
  "Dennis Ritchie",
  "Sophie Wilson",
];

const USERS: Row[] = [
  {
    id: 1,
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    roles: ["admin"],
    createdAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: 2,
    fullName: "Grace Hopper",
    email: "grace@example.com",
    roles: ["manager"],
    createdAt: "2026-10-12T10:00:00.000Z",
  },
  {
    id: 3,
    fullName: "Alan Turing",
    email: "alan@example.com",
    roles: ["user"],
    createdAt: "2026-11-02T10:00:00.000Z",
  },
  {
    id: 4,
    fullName: null,
    email: "no-name@example.com",
    roles: ["reviewer"],
    createdAt: "2026-11-14T10:00:00.000Z",
  },
  ...NAMES.map((name, index) => ({
    id: 5 + index,
    fullName: name,
    email: `${name.split(" ")[0].toLowerCase()}@example.com`,
    roles: [index % 5 === 0 ? "manager" : "user"],
    createdAt: new Date(Date.UTC(2026, 6, 1 + index * 3)).toISOString(),
  })),
];

type As = "admin" | "manager";

/** What the users controller does with the query string, over the rows above. */
function usersPage(as: As, query: URLSearchParams) {
  const q = (query.get("q") ?? "").trim().toLowerCase();
  const roles = [...query.getAll("roles[]"), ...query.getAll("roles")];
  const sort = query.get("sort") as keyof Row | null;
  const order = query.get("order") === "desc" ? "desc" : "asc";
  const perPage = Number(query.get("perPage") ?? 10);
  const currentPage = Number(query.get("page") ?? 1);

  let rows = USERS.filter(
    (row) =>
      (!q || `${row.fullName ?? ""} ${row.email}`.toLowerCase().includes(q)) &&
      (roles.length === 0 || row.roles.some((role) => roles.includes(role))),
  );
  if (sort) {
    rows = [...rows].sort((a, b) => {
      const result = String(a[sort] ?? "").localeCompare(String(b[sort] ?? ""));
      return order === "desc" ? -result : result;
    });
  }
  const lastPage = Math.max(1, Math.ceil(rows.length / perPage));
  const data = rows.slice((currentPage - 1) * perPage, currentPage * perPage);

  return {
    component: "users/index",
    as,
    props: {
      users: {
        data,
        metadata: {
          total: rows.length,
          perPage,
          currentPage,
          lastPage,
          firstPage: 1,
        },
      },
      q: q || null,
      selectedRoles: roles,
      institutionalRoles: ["reviewer"],
      can:
        as === "admin"
          ? { create: true, invite: true, viewActivity: true }
          : { create: true, invite: true, viewActivity: false },
      rowCan: Object.fromEntries(
        data.map((row) => [
          row.id,
          as === "admin"
            ? { update: true, delete: row.id !== 1, impersonate: row.id !== 1 }
            : { update: false, delete: false, impersonate: false },
        ]),
      ),
      sort: sort ?? null,
      order: sort ? order : null,
    },
  };
}

/** The page as first rendered, plus a fake server for its search, filter, sort and pages. */
function story(as: As, search = ""): Story {
  return {
    beforeEach({ msw }) {
      msw.use(inertiaRoute("/users", (query) => usersPage(as, query)));
    },
    render: () =>
      inertiaPage(ListUsersPage, {
        url: "/users",
        ...usersPage(as, new URLSearchParams(search)),
      }),
  };
}

const meta = {
  title: "Screens/Users",
  parameters: {
    docs: {
      description: {
        component:
          "The real page. Search, the role filter, sorting and paging work: a fake server in the story answers them as the controller would.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Admin = story("admin");

export const Manager = story("manager");

export const NoMatch = story("admin", "q=zed");
