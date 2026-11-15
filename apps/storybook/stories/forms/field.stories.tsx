import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";

const meta = {
  title: "Forms/Field",
  component: Field,
  parameters: {
    docs: {
      description: {
        component: [
          "Every input lives in a `Field`: label above, the control, then a description or the error.",
          'The label is a noun phrase without a colon ("Email", not "Email:").',
          "A description says what is expected **before** the person types; an error says what to fix **after**. A field never shows both.",
          "Mark the invalid state with `aria-invalid` on the control; the error message goes in `FieldError`.",
        ].join("\n\n"),
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="grid max-w-sm gap-6">
      <Field>
        <FieldLabel htmlFor="normal">Email</FieldLabel>
        <Input id="normal" placeholder="name@example.com" />
        <FieldDescription>We send the invitation here.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="filled">Email</FieldLabel>
        <Input id="filled" defaultValue="ada@example.com" />
      </Field>
      <Field data-invalid>
        <FieldLabel htmlFor="invalid">Email</FieldLabel>
        <Input id="invalid" defaultValue="ada@" aria-invalid />
        <FieldError>Enter a complete email address.</FieldError>
      </Field>
      <Field data-disabled>
        <FieldLabel htmlFor="disabled">Email</FieldLabel>
        <Input id="disabled" defaultValue="ada@example.com" disabled />
        <FieldDescription>Only an admin changes the email.</FieldDescription>
      </Field>
    </div>
  ),
};
