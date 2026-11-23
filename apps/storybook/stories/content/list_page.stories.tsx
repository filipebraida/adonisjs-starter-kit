import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus, SearchX, Users } from "lucide-react";
import { useState } from "react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { CheckboxFilter } from "@workspace/ui/components/checkbox-filter";
import { DataTable, type ColumnDef } from "@workspace/ui/components/data-table";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { FilterBar } from "@workspace/ui/components/filter-bar";
import { SearchInput } from "@workspace/ui/components/search-input";

/**
 * A pattern, not a component: how every list screen is laid out. The live
 * version, with a server behind it, is Screens/Users.
 */
const meta = {
  title: "Content/List page",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "**Header**: `Heading` with the page title and one sentence on what the list is for; the primary action on the right.",
          '**FilterBar**: `SearchInput` first, then the filters (`CheckboxFilter`, `RadioFilter`). "Clear filters" appears only while something is filtered.',
          "**Search** goes through `useSearchBox`: it searches 300 ms after the last keystroke and at once when cleared (X or Esc). The term lives in the URL (`q`), so back/forward and links restore it; a partial reload asks for `q` and the filters back, which the controller sends as `null` when empty.",
          '**Table**: `DataTable`, the first column identifies the row, row actions in the last column as a ghost icon button. On a narrow table a column hides (`hidden @2xl:table-cell`) and its datum drops under the identifying column (`@2xl:hidden`): the breakpoints follow the width of the table (a `@container`), not of the screen, because the sidebar takes part of the screen. The pagination numbers the pages and shows the range ("21–23 of 23").',
          '**Empty**: never a blank table. Pass `empty` to the `DataTable`: when a search or filter caused it, say so and offer "Clear filters"; when the list has never had anything, offer the action that fills it, as `outline`: the header already holds the primary.',
        ].join("\n\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Row = { name: string; email: string; role: string };

const ROWS: Row[] = [
  "Ada Lovelace",
  "Grace Hopper",
  "Alan Turing",
  "Barbara Liskov",
  "Margaret Hamilton",
  "Edsger Dijkstra",
  "Donald Knuth",
  "Frances Allen",
  "Ken Thompson",
  "Radia Perlman",
  "Tim Berners-Lee",
  "Katherine Johnson",
].map((name, index) => ({
  name,
  email: `${name.split(" ")[0].toLowerCase()}@example.com`,
  role: index === 0 ? "admin" : index % 4 === 0 ? "manager" : "user",
}));

const COLUMNS: ColumnDef<Row>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.email}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    enableSorting: false,
    cell: ({ row }) => <Badge variant="secondary">{row.original.role}</Badge>,
  },
];

const ROLE_OPTIONS = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Manager" },
  { value: "user", label: "User" },
];

function Header() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">
          Everyone who can sign in to this workspace.
        </p>
      </div>
      <Button>
        <Plus data-icon="inline-start" />
        Add user
      </Button>
    </div>
  );
}

/** Filtering here runs in the browser; in the app the server does it (see Screens/Users). */
function ListPage({
  rows,
  initialSearch = "",
}: {
  rows: Row[];
  initialSearch?: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [roles, setRoles] = useState<string[]>([]);
  const term = search.trim().toLowerCase();
  const visible = rows.filter(
    (row) =>
      (!term || `${row.name} ${row.email}`.toLowerCase().includes(term)) &&
      (roles.length === 0 || roles.includes(row.role)),
  );
  const filtered = term !== "" || roles.length > 0;
  const clear = () => {
    setSearch("");
    setRoles([]);
  };

  return (
    <div className="grid gap-6">
      <Header />
      {rows.length > 0 && (
        <FilterBar filtered={filtered} onClear={clear}>
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search by name or email"
          />
          <CheckboxFilter
            title="Role"
            value={roles}
            onChange={setRoles}
            options={ROLE_OPTIONS}
          />
        </FilterBar>
      )}
      <DataTable
        columns={COLUMNS}
        data={visible}
        empty={
          filtered ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle>No users match</EmptyTitle>
                <EmptyDescription>
                  Try another name or email, or clear the filters.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={clear}>
                  Clear filters
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle>No users yet</EmptyTitle>
                <EmptyDescription>
                  Invite the first person, or create the account yourself.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline">
                  <Plus data-icon="inline-start" />
                  Add user
                </Button>
              </EmptyContent>
            </Empty>
          )
        }
      />
    </div>
  );
}

export const WithRows: Story = { render: () => <ListPage rows={ROWS} /> };

/** A search found nothing: say so and offer to clear. */
export const EmptyFiltered: Story = {
  render: () => <ListPage rows={ROWS} initialSearch="zed" />,
};

/** Nothing was ever added: no filters to show, and the empty state offers the action that fills the list. */
export const EmptyFirstUse: Story = { render: () => <ListPage rows={[]} /> };
