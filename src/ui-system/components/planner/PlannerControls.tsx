import { SearchIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type ScheduleFitFieldProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: ReactNode;
};

export function ScheduleFitField({
  id,
  checked,
  onCheckedChange,
  description = "Hide sections that overlap classes in your cart or enrolled schedule.",
}: ScheduleFitFieldProps) {
  return (
    <Field>
      <div className="flex items-start gap-3 rounded-lg border-2 border-border bg-card p-3.5 shadow-sm dark:bg-card/95">
        <PlannerCheckbox
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-describedby={`${id}-desc`}
          className="mt-0.5"
        />
        <div className="min-w-0 space-y-1">
          <FieldLabel
            htmlFor={id}
            className="cursor-pointer text-sm font-medium text-foreground"
          >
            Fits my schedule
          </FieldLabel>
          <FieldDescription id={`${id}-desc`}>{description}</FieldDescription>
        </div>
      </div>
    </Field>
  );
}

type HideEmptySectionsFieldProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
};

export function HideEmptySectionsField({
  id,
  checked,
  onCheckedChange,
  label = "Hide courses with no open sections",
}: HideEmptySectionsFieldProps) {
  return (
    <Field orientation="horizontal">
      <PlannerCheckbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <FieldLabel htmlFor={id} className="font-normal">
        {label}
      </FieldLabel>
    </Field>
  );
}

type PlannerCheckboxProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  "aria-describedby"?: string;
};

export function PlannerCheckbox({
  id,
  checked,
  onCheckedChange,
  className,
  "aria-describedby": ariaDescribedBy,
}: PlannerCheckboxProps) {
  return (
    <Checkbox
      id={id}
      checked={checked}
      onCheckedChange={(value) => onCheckedChange(value === true)}
      aria-describedby={ariaDescribedBy}
      className={cn(
        "size-5 rounded-md border-2 border-foreground/40 bg-background shadow-sm dark:border-foreground/50 dark:bg-muted/80 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
        className,
      )}
    />
  );
}

type SearchSubmitButtonProps = {
  disabled?: boolean;
  onClick: () => void;
  children?: ReactNode;
  showIcon?: boolean;
  className?: string;
};

export function SearchSubmitButton({
  disabled,
  onClick,
  children = "Search",
  showIcon = false,
  className,
}: SearchSubmitButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn("w-full font-semibold", className)}
    >
      {showIcon ? <SearchIcon data-icon="inline-start" /> : null}
      {children}
    </Button>
  );
}
