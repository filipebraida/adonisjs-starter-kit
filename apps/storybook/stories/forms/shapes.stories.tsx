import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@workspace/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@workspace/ui/components/input-group";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";

/** The shapes a whole form takes. The rules are in Forms/Rules. */
const meta = {
  title: "Forms/Shapes",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Optional({ children }: { children: string }) {
  return (
    <>
      {children}{" "}
      <span className="font-normal text-muted-foreground">(optional)</span>
    </>
  );
}

/** More than one group: each is a FieldSet with a legend, split by a separator. Optional fields say so; required ones carry no mark. */
export const Grouped: Story = {
  render: () => (
    <form className="max-w-md">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Contact</FieldLegend>
          <FieldDescription>Who we write to about this order.</FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="g-name">Full name</FieldLabel>
              <Input id="g-name" />
            </Field>
            <Field>
              <FieldLabel htmlFor="g-email">Email</FieldLabel>
              <Input id="g-email" placeholder="name@example.com" />
            </Field>
          </FieldGroup>
        </FieldSet>
        <FieldSeparator />
        <FieldSet>
          <FieldLegend>Delivery</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="g-street">Street and number</FieldLabel>
              <Input id="g-street" />
            </Field>
            <Field>
              <FieldLabel htmlFor="g-extra">
                <Optional>Apartment, floor</Optional>
              </FieldLabel>
              <Input id="g-extra" />
            </Field>
          </FieldGroup>
        </FieldSet>
        <Field orientation="responsive">
          <Button type="submit">Place order</Button>
        </Field>
      </FieldGroup>
    </form>
  ),
};

/** A field that only applies to one answer appears right under the question that opens it, and its value is not sent when hidden. */
export const Conditional: Story = {
  render: function Render() {
    const [kind, setKind] = useState("company");
    return (
      <FieldGroup className="max-w-md">
        <Field>
          <FieldLabel>Invoice to</FieldLabel>
          <RadioGroup value={kind} onValueChange={setKind}>
            {[
              ["person", "A person"],
              ["company", "A company"],
            ].map(([value, label]) => (
              <Field key={value} orientation="horizontal">
                <RadioGroupItem id={`c-${value}`} value={value} />
                <FieldLabel htmlFor={`c-${value}`}>{label}</FieldLabel>
              </Field>
            ))}
          </RadioGroup>
        </Field>
        {kind === "company" && (
          <Field>
            <FieldLabel htmlFor="c-tax">Company tax ID</FieldLabel>
            <Input id="c-tax" placeholder="00.000.000/0000-00" />
          </Field>
        )}
      </FieldGroup>
    );
  },
};

/** A list the person grows: each row removable, "Add" under the last one. One row is always there. */
export const Repeatable: Story = {
  render: function Render() {
    const [rows, setRows] = useState([{ id: 1 }, { id: 2 }]);
    return (
      <FieldSet className="max-w-md">
        <FieldLegend>Phones</FieldLegend>
        <FieldGroup>
          {rows.map((row, index) => (
            <Field key={row.id} orientation="horizontal">
              <FieldLabel htmlFor={`r-${row.id}`} className="sr-only">
                Phone {index + 1}
              </FieldLabel>
              <Input id={`r-${row.id}`} placeholder="(21) 99999-0000" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove phone ${index + 1}`}
                disabled={rows.length === 1}
                onClick={() => setRows(rows.filter((r) => r.id !== row.id))}
              >
                <Trash2 />
              </Button>
            </Field>
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setRows([
                  ...rows,
                  { id: Math.max(...rows.map((r) => r.id)) + 1 },
                ])
              }
            >
              <Plus data-icon="inline-start" />
              Add phone
            </Button>
          </div>
        </FieldGroup>
      </FieldSet>
    );
  },
};

/** A unit or a fixed part of the value sits inside the field, not in the label. */
export const Affixes: Story = {
  render: () => (
    <FieldGroup className="max-w-xs">
      <Field>
        <FieldLabel htmlFor="a-price">Price</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>R$</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            id="a-price"
            inputMode="decimal"
            placeholder="0,00"
          />
        </InputGroup>
      </Field>
      <Field>
        <FieldLabel htmlFor="a-discount">Discount</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="a-discount"
            inputMode="numeric"
            placeholder="10"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>%</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <Field>
        <FieldLabel htmlFor="a-handle">Instagram</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>@</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput id="a-handle" placeholder="starterkit" />
        </InputGroup>
      </Field>
    </FieldGroup>
  ),
};

/** A form that needs the page behind it in view (editing a row while reading the list), or one too long for a modal. Actions stay in the footer. */
export const InASidePanel: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <Sheet open>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Grace Hopper</SheetTitle>
          <SheetDescription>
            Changes apply as soon as you save.
          </SheetDescription>
        </SheetHeader>
        <FieldGroup className="px-4">
          <Field>
            <FieldLabel htmlFor="s-name">Full name</FieldLabel>
            <Input id="s-name" defaultValue="Grace Hopper" />
          </Field>
          <Field>
            <FieldLabel htmlFor="s-email">Email</FieldLabel>
            <Input id="s-email" defaultValue="grace@example.com" />
          </Field>
        </FieldGroup>
        <SheetFooter>
          <Button>Save</Button>
          <Button variant="outline">Cancel</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
