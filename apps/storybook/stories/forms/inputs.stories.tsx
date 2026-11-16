import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { userEvent } from "storybook/test";
import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field";
import { FileInput } from "@workspace/ui/components/file-input";
import { Input } from "@workspace/ui/components/input";
import { PasswordInput } from "@workspace/ui/components/password-input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { SearchInput } from "@workspace/ui/components/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Segmented } from "@workspace/ui/components/segmented";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";

import { UserAvatar } from "@web/app/core/ui/components/user_avatar";

const meta = {
  title: "Forms/Inputs",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Every control, in every state it can be left in. Each one sits in a `Field` with its label.",
          "**Input** for one line; **PasswordInput** for secrets (it has the show/hide toggle); **Textarea** for free text over a line.",
          "**Select** for one choice among more than four; **RadioGroup** for up to four, all visible.",
          "**Checkbox** for a yes/no that takes effect when the form is saved; **Switch** for a setting that takes effect the moment it is flipped, with no Save button.",
          "**FileInput** for one document; an image the person is represented by (avatar) shows the image itself with an `outline` button beside it.",
        ].join("\n\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type State = "empty" | "filled" | "invalid" | "disabled";
const STATES: State[] = ["empty", "filled", "invalid", "disabled"];

function Cell({
  id,
  label,
  state,
  children,
}: {
  id: string;
  label: string;
  state: State;
  children: ReactNode;
}) {
  return (
    <Field
      data-invalid={state === "invalid" || undefined}
      data-disabled={state === "disabled" || undefined}
    >
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {state === "invalid" ? (
        <FieldError>Say what to fix, not that it is wrong.</FieldError>
      ) : state === "disabled" ? (
        <FieldDescription>Say why it cannot be changed.</FieldDescription>
      ) : null}
    </Field>
  );
}

function Matrix({
  label,
  render,
}: {
  label: string;
  render: (props: { id: string; state: State }) => ReactNode;
}) {
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-4 gap-6 text-xs text-muted-foreground">
        {STATES.map((state) => (
          <span key={state} className="capitalize">
            {state}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-6">
        {STATES.map((state) => {
          const id = `${label}-${state}`.toLowerCase().replace(/\s/g, "-");
          return (
            <Cell key={state} id={id} label={label} state={state}>
              {render({ id, state })}
            </Cell>
          );
        })}
      </div>
    </div>
  );
}

const common = (state: State) => ({
  "aria-invalid": state === "invalid" || undefined,
  disabled: state === "disabled",
});

export const Text: Story = {
  render: () => (
    <Matrix
      label="Email"
      render={({ id, state }) => (
        <Input
          id={id}
          placeholder="name@example.com"
          defaultValue={
            state === "empty"
              ? undefined
              : state === "invalid"
                ? "ada@"
                : "ada@example.com"
          }
          {...common(state)}
        />
      )}
    />
  ),
};

export const Password: Story = {
  render: () => (
    <Matrix
      label="Password"
      render={({ id, state }) => (
        <PasswordInput
          id={id}
          placeholder="At least 8 characters"
          defaultValue={
            state === "empty"
              ? undefined
              : state === "invalid"
                ? "short"
                : "correct horse battery"
          }
          {...common(state)}
        />
      )}
    />
  ),
};

export const LongText: Story = {
  render: () => (
    <Matrix
      label="Notes"
      render={({ id, state }) => (
        <Textarea
          id={id}
          placeholder="What the next person should know"
          defaultValue={
            state === "empty"
              ? undefined
              : "Joined from the March cohort; prefers email."
          }
          {...common(state)}
        />
      )}
    />
  ),
};

export const Choice: Story = {
  render: () => (
    <Matrix
      label="Role"
      render={({ id, state }) => (
        <Select
          defaultValue={state === "empty" ? undefined : "manager"}
          disabled={state === "disabled"}
        >
          <SelectTrigger
            id={id}
            aria-invalid={state === "invalid" || undefined}
          >
            <SelectValue placeholder="Pick a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrator</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      )}
    />
  ),
};

export const FewChoices: Story = {
  render: () => (
    <div className="grid max-w-sm gap-6">
      <Field>
        <FieldLabel>Theme</FieldLabel>
        <RadioGroup defaultValue="System">
          {["Light", "Dark", "System"].map((value) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem id={`theme-${value}`} value={value} />
              <FieldLabel htmlFor={`theme-${value}`}>{value}</FieldLabel>
            </div>
          ))}
        </RadioGroup>
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="digest" defaultChecked />
        <FieldLabel htmlFor="digest">Send me a weekly digest</FieldLabel>
      </Field>
      <Field orientation="horizontal" data-disabled>
        <Checkbox id="digest-off" disabled />
        <FieldLabel htmlFor="digest-off">
          Disabled: say why next to it
        </FieldLabel>
      </Field>
    </div>
  ),
};

/** Two or three options that apply when picked, on one line: with words, or icons named by `title`. */
export const Segment: Story = {
  render: function Render() {
    const [language, setLanguage] = useState<"en" | "pt">("en");
    const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
    return (
      <div className="grid max-w-sm gap-6">
        <Field>
          <FieldLabel>Language</FieldLabel>
          <Segmented
            label="Language"
            options={[
              { value: "en", label: "English" },
              { value: "pt", label: "Português" },
            ]}
            value={language}
            onValueChange={setLanguage}
          />
        </Field>
        <Field>
          <FieldLabel>Theme, in a menu</FieldLabel>
          <Segmented
            label="Theme"
            options={[
              { value: "light", title: "Light", label: <Sun aria-hidden /> },
              { value: "dark", title: "Dark", label: <Moon aria-hidden /> },
              {
                value: "system",
                title: "System",
                label: <Monitor aria-hidden />,
              },
            ]}
            value={theme}
            onValueChange={setTheme}
          />
        </Field>
        <Field>
          <FieldLabel>Filling the width</FieldLabel>
          <Segmented
            label="Period"
            fill
            options={[
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "year", label: "Year", disabled: true },
            ]}
            defaultValue="month"
          />
        </Field>
      </div>
    );
  },
};

/** Takes effect when flipped: no Save. The label says what is on; the description, what it means. */
export const Toggle: Story = {
  render: () => (
    <div className="grid max-w-md gap-6">
      {[
        {
          id: "mentions",
          title: "Mentions",
          text: "Notify me when someone mentions me.",
          checked: true,
        },
        {
          id: "digest",
          title: "Weekly digest",
          text: "A summary every Monday morning.",
          checked: false,
        },
        {
          id: "security",
          title: "Security alerts",
          text: "Always on: an admin requires them.",
          checked: true,
          disabled: true,
        },
      ].map((row) => (
        <Field
          key={row.id}
          orientation="horizontal"
          data-disabled={row.disabled || undefined}
        >
          <FieldContent>
            <FieldLabel htmlFor={row.id}>{row.title}</FieldLabel>
            <FieldDescription>{row.text}</FieldDescription>
          </FieldContent>
          <Switch
            id={row.id}
            defaultChecked={row.checked}
            disabled={row.disabled}
          />
        </Field>
      ))}
    </div>
  ),
};

/** Empty, then with a file picked (dropped here by the story), invalid and disabled. */
export const File: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      <Field>
        <FieldLabel htmlFor="contract">Contract</FieldLabel>
        <FileInput id="contract" name="contract" accept="application/pdf" />
        <FieldDescription>PDF, up to 10 MB.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="picked">Contract</FieldLabel>
        <FileInput id="picked" name="picked" accept="application/pdf" />
      </Field>
      <Field data-invalid>
        <FieldLabel htmlFor="invalid-file">Contract</FieldLabel>
        <FileInput id="invalid-file" name="invalid" aria-invalid />
        <FieldError>Pick a PDF up to 10 MB.</FieldError>
      </Field>
      <Field data-disabled>
        <FieldLabel htmlFor="disabled-file">Contract</FieldLabel>
        <FileInput id="disabled-file" name="disabled" disabled />
        <FieldDescription>
          Signed contracts cannot be replaced.
        </FieldDescription>
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>("#picked");
    if (input) {
      await userEvent.upload(
        input,
        new globalThis.File(
          ["x".repeat(240_000)],
          "service-contract-2026.pdf",
          { type: "application/pdf" },
        ),
      );
    }
  },
};

/** The person's picture: the image itself, an outline button, the limits as fine print. Never a primary: the section's Save is. */
export const Avatar: Story = {
  render: () => (
    <Field>
      <FieldLabel>Picture</FieldLabel>
      <div className="flex items-center gap-4">
        <UserAvatar
          user={{
            fullName: "Ada Lovelace",
            email: "ada@example.com",
            avatarUrl: null,
          }}
        />
        <div className="grid gap-1">
          <Button type="button" variant="outline" size="sm">
            Change picture
          </Button>
          <span className="text-xs text-muted-foreground">
            JPG or PNG, up to 1 MB.
          </span>
        </div>
      </div>
    </Field>
  ),
};

/** Filters a list. Its label is the placeholder plus an `aria-label`; the X and Esc clear it. Lists debounce it with `useSearchBox`. */
export const Search: Story = {
  render: function Render() {
    const [value, setValue] = useState("ada");
    return (
      <div className="grid max-w-sm gap-4">
        <SearchInput
          value={value}
          onValueChange={setValue}
          placeholder="Search by name or email"
          aria-label="Search"
        />
        <SearchInput
          value=""
          onValueChange={() => {}}
          placeholder="Disabled"
          aria-label="Disabled search"
          disabled
        />
      </div>
    );
  },
};
