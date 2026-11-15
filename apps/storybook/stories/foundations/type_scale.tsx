const ROLES = [
  {
    sample: <h2 className="text-2xl font-bold tracking-tight">Users</h2>,
    role: "Page title: the Heading component",
    classes: "text-2xl font-bold tracking-tight",
  },
  {
    sample: <h2 className="text-lg font-semibold">Add a user</h2>,
    role: "Modal and dialog title",
    classes: "text-lg font-semibold",
  },
  {
    sample: <h3 className="text-base font-semibold">Password</h3>,
    role: "Section title, inside a page",
    classes: "text-base font-semibold",
  },
  {
    sample: <p className="text-sm">The invitation link expires in 7 days.</p>,
    role: "Body",
    classes: "text-sm",
  },
  {
    sample: (
      <p className="text-sm text-muted-foreground">
        Only an admin changes the email.
      </p>
    ),
    role: "Secondary text, descriptions under a title",
    classes: "text-sm text-muted-foreground",
  },
  {
    sample: (
      <p className="text-xs text-muted-foreground">JPG or PNG, up to 1 MB.</p>
    ),
    role: "Fine print, hints",
    classes: "text-xs text-muted-foreground",
  },
];

/** Each text size beside its role and its classes. */
export function TypeScale() {
  return (
    <div className="sb-unstyled grid gap-4 rounded-lg border p-6">
      {ROLES.map((item) => (
        <div key={item.classes}>
          {item.sample}
          <p className="text-xs text-muted-foreground">
            {item.role}: <code>{item.classes}</code>
          </p>
        </div>
      ))}
    </div>
  );
}
