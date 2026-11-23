import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { KeyValue, KeyValueList } from "@workspace/ui/components/key-value";
import { ValueChange } from "@workspace/ui/components/value-change";

const meta = {
  title: "Content/States",
  parameters: {
    docs: {
      description: {
        component:
          "Color means state. A notice is an `Alert` and a label is a `Badge`, each with the variant of its state: `success` (done), `info` (neutral news), `warning` (needs attention), `destructive` (an error). Never a color through `className`.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Notices: Story = {
  render: () => (
    <div className="grid max-w-lg gap-3">
      <Alert variant="success">
        <CircleCheck />
        <AlertTitle>Invitation sent</AlertTitle>
        <AlertDescription>
          Grace will get a link to set her password.
        </AlertDescription>
      </Alert>
      <Alert variant="info">
        <Info />
        <AlertTitle>Import in progress</AlertTitle>
        <AlertDescription>The list updates when it finishes.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>Signed in as another user</AlertTitle>
        <AlertDescription>
          What you do is recorded as you, on their behalf.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>The file could not be read</AlertTitle>
        <AlertDescription>Send a PNG or JPEG up to 1 MB.</AlertDescription>
      </Alert>
    </div>
  ),
};

export const Labels: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success">Active</Badge>
      <Badge variant="info">Pending</Badge>
      <Badge variant="warning">Expiring</Badge>
      <Badge variant="destructive">Failed</Badge>
      <Badge variant="secondary">Draft</Badge>
    </div>
  ),
};

/** What a change did to each field, in a record of activity: old struck out, new beside it. */
export const Changes: Story = {
  render: () => (
    <div className="grid gap-1.5">
      <ValueChange field="fullName" from="Ada Byron" to="Ada Lovelace" />
      <ValueChange field="locale" from={null} to="pt" />
      <ValueChange
        field="avatarUrl"
        from="https://example.com/a.png"
        to={null}
      />
    </div>
  ),
};

/** Saved data shown for reading, before anyone asks to edit it: label on the left, value on the right. */
export const ReadOnlyData: Story = {
  render: () => (
    <div className="max-w-md">
      <KeyValueList>
        <KeyValue label="Name">Ada Lovelace</KeyValue>
        <KeyValue label="E-mail">ada@example.com</KeyValue>
        <KeyValue label="Role">Administrator</KeyValue>
        <KeyValue label="Token" mono>
          oat_1a2b3c
        </KeyValue>
      </KeyValueList>
    </div>
  ),
};
