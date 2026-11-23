const TOKENS: { name: string; use: string }[] = [
  { name: "background", use: "Page" },
  { name: "foreground", use: "Body text" },
  { name: "card", use: "Surfaces on the page" },
  { name: "muted", use: "Quiet fills, hover on ghost" },
  { name: "muted-foreground", use: "Secondary text, hints" },
  { name: "primary", use: "The one primary action" },
  { name: "secondary", use: "Secondary fills" },
  { name: "border", use: "Dividers, outlines" },
  { name: "ring", use: "Focus ring" },
  { name: "destructive", use: "Errors, irreversible actions" },
  { name: "warning", use: "Needs attention" },
  { name: "success", use: "Done, a rising metric" },
  { name: "info", use: "Neutral news, in progress" },
  { name: "success-subtle", use: "Fill of a success notice" },
  { name: "warning-subtle", use: "Fill of a warning notice" },
  { name: "destructive-subtle", use: "Fill of an error notice" },
  { name: "info-subtle", use: "Fill of an info notice" },
];

export function Swatches() {
  return (
    <div className="not-prose grid grid-cols-2 gap-3 sm:grid-cols-3">
      {TOKENS.map((token) => (
        <div key={token.name} className="overflow-hidden rounded-lg border">
          <div
            className="h-12"
            style={{ background: `var(--${token.name})` }}
          />
          <div className="p-2 text-xs">
            <div className="font-medium">{token.name}</div>
            <div className="text-muted-foreground">{token.use}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
