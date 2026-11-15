import * as React from "react";
import { FileIcon, UploadIcon, XIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

type FileInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "onChange" | "value" | "multiple"
> & {
  onFileChange?: (file: File | null) => void;
  prompt?: string;
  browseText?: string;
  removeText?: string;
  formatSize?: (bytes: number) => string;
};

function defaultFormatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * One file, picked or dropped. The file is written to the native input, so a
 * plain `<form>` (or Inertia's `<Form>`) submits it under `name`.
 */
function FileInput({
  className,
  disabled,
  onFileChange,
  prompt = "Drop a file here, or",
  browseText = "browse",
  removeText = "Remove",
  formatSize = defaultFormatSize,
  ...props
}: FileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [dragging, setDragging] = React.useState(false);

  function select(next: File | null) {
    const input = inputRef.current;
    if (input) {
      const transfer = new DataTransfer();
      if (next) transfer.items.add(next);
      input.files = transfer.files;
    }
    setFile(next);
    onFileChange?.(next);
  }

  return (
    <div data-slot="file-input" className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        tabIndex={-1}
        disabled={disabled}
        onChange={(event) => {
          const picked = event.target.files?.[0] ?? null;
          setFile(picked);
          onFileChange?.(picked);
        }}
        {...props}
      />
      {file ? (
        <div
          className="flex items-center gap-3 rounded-lg border border-input px-3 py-2 text-sm aria-invalid:border-destructive"
          aria-invalid={props["aria-invalid"]}
        >
          <FileIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">{file.name}</span>
          <span className="shrink-0 text-muted-foreground">
            {formatSize(file.size)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={removeText}
            disabled={disabled}
            onClick={() => select(null)}
          >
            <XIcon />
          </Button>
        </div>
      ) : (
        <div
          data-dragging={dragging || undefined}
          aria-invalid={props["aria-invalid"]}
          aria-disabled={disabled || undefined}
          onDragOver={(event) => {
            if (disabled) return;
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (!disabled) select(event.dataTransfer.files[0] ?? null);
          }}
          className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-input px-4 py-6 text-center text-sm text-muted-foreground transition-colors data-dragging:border-ring data-dragging:bg-muted aria-disabled:opacity-50 aria-invalid:border-destructive"
        >
          <UploadIcon className="size-5" />
          <span>
            {prompt}{" "}
            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:underline disabled:pointer-events-none"
            >
              {browseText}
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

export { FileInput };
