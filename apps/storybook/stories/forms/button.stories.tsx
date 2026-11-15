import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

const meta = {
  title: "Forms/Button",
  component: Button,
  args: { children: "Save changes" },
  parameters: {
    docs: {
      description: {
        component: [
          "**default**: the one primary action of the screen (Save, Create, Send). Never two side by side.",
          "**outline**: secondary actions next to the primary (Cancel, Export).",
          "**ghost**: actions inside lists, toolbars and menus, where a border would be noise.",
          "**destructive**: irreversible actions; always behind a confirmation dialog.",
          "**link**: navigation that reads as text.",
          "A button with only an icon uses an `icon*` size and needs an `aria-label`.",
        ].join("\n\n"),
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Every variant in every state it can be left in. Disabled is also how a submit looks while its request is in flight. Hover and pressed are interactive: point at them. Buttons have no invalid state: the field is invalid, not the button. */
export const States: Story = {
  render: () => {
    const variants = [
      "default",
      "outline",
      "secondary",
      "ghost",
      "destructive",
      "link",
    ] as const;
    return (
      <div className="grid grid-cols-[8rem_repeat(2,auto)] items-center gap-x-6 gap-y-3 text-sm">
        <span />
        <span className="text-muted-foreground">Normal</span>
        <span className="text-muted-foreground">Disabled</span>
        {variants.map((variant) => (
          <div key={variant} className="contents">
            <span className="font-medium">{variant}</span>
            <Button variant={variant}>Save changes</Button>
            <Button variant={variant} disabled>
              Save changes
            </Button>
          </div>
        ))}
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
      <Button size="xl" shape="pill">
        Hero (marketing only)
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <Plus data-icon="inline-start" />
        New user
      </Button>
      <Button variant="ghost" size="icon" aria-label="Delete">
        <Trash2 />
      </Button>
    </div>
  ),
};
