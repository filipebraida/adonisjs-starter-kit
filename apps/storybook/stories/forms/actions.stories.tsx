import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";

import { ConfirmDialog } from "@web/app/core/ui/components/confirm_dialog";

/**
 * Where the buttons of a form go, per context. The rules are in Forms/Rules;
 * each story shows the context idle and with the request in flight.
 */
const meta = {
  title: "Forms/Actions",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Modal: Cancel then the primary, right-aligned. Settings section: the primary alone, left. Auth page: the primary full width. Destructive: Cancel then `destructive`, in a `ConfirmDialog`. While the request is in flight the primary is disabled.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function NameField() {
  return (
    <Field>
      <FieldLabel htmlFor="name">Full name</FieldLabel>
      <Input id="name" defaultValue="Ada Lovelace" />
    </Field>
  );
}

function Side({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export const InAModal: Story = {
  render: () => (
    <div className="grid gap-8 md:grid-cols-2">
      {[false, true].map((processing) => (
        <Side key={String(processing)} label={processing ? "Saving" : "Idle"}>
          <div className="max-w-md space-y-4 rounded-lg border bg-background p-6 shadow-sm">
            <header className="space-y-1">
              <h2 className="text-lg font-semibold">Add a user</h2>
              <p className="text-sm text-muted-foreground">
                They get an email to set a password.
              </p>
            </header>
            <FieldGroup>
              <NameField />
            </FieldGroup>
            <footer className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Cancel</Button>
              <Button disabled={processing}>Add</Button>
            </footer>
          </div>
        </Side>
      ))}
    </div>
  ),
};

export const InASettingsSection: Story = {
  render: () => (
    <div className="grid gap-8 md:grid-cols-2">
      {[false, true].map((processing) => (
        <Side key={String(processing)} label={processing ? "Saving" : "Idle"}>
          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">Profile</h3>
              <p className="text-sm text-muted-foreground">
                How others see you in the app.
              </p>
            </div>
            <FieldGroup>
              <NameField />
              <Field orientation="responsive">
                <Button disabled={processing}>Save</Button>
              </Field>
            </FieldGroup>
          </section>
        </Side>
      ))}
    </div>
  ),
};

export const OnAnAuthPage: Story = {
  render: () => (
    <div className="mx-auto grid max-w-sm gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-muted-foreground">Welcome back.</p>
      </div>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" placeholder="name@example.com" />
        </Field>
        <Field orientation="responsive">
          <Button>Sign in</Button>
        </Field>
        <Alert variant="destructive">
          <AlertTitle>A form-wide error goes under the actions</AlertTitle>
          <AlertDescription>Wrong email or password.</AlertDescription>
        </Alert>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Button variant="outline" className="w-full">
          Google
        </Button>
      </FieldGroup>
    </div>
  ),
};

export const DestructiveConfirmation: Story = {
  parameters: { layout: "fullscreen" },
  render: function Render() {
    const [typed, setTyped] = useState("");
    const email = "alan@example.com";
    return (
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="Delete this user?"
        desc={
          <div className="space-y-4">
            <p>
              Type <span className="font-bold">{email}</span> to confirm. Their
              activity stays in the audit trail.
            </p>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={email}
            />
          </div>
        }
        confirmText="Delete user"
        destructive
        disabled={typed !== email}
        handleConfirm={() => {}}
      />
    );
  },
};
