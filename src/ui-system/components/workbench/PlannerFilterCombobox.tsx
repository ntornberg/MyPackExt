import { useRef } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

/** Base UI resets the filter text when the `items` array *reference* changes; callers often pass `Object.keys(...)` which is a new array every render. */
function useStableStringItems(items: string[]): string[] {
  const signature = items.join("\u0000");
  const cache = useRef<{ signature: string; items: string[] }>({
    signature: "",
    items: [],
  });
  if (cache.current.signature !== signature) {
    cache.current = { signature, items };
  }
  return cache.current.items;
}

type PlannerFilterComboboxProps = {
  items: string[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder: string;
  emptyLabel: string;
  disabled?: boolean;
  portalContainer: HTMLElement | null;
};

export function PlannerFilterCombobox({
  items,
  value,
  onValueChange,
  placeholder,
  emptyLabel,
  disabled = false,
  portalContainer,
}: PlannerFilterComboboxProps) {
  const stableItems = useStableStringItems(items);

  return (
    <Combobox
      items={stableItems}
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue ?? null)}
      autoHighlight
    >
      <ComboboxInput
        placeholder={placeholder}
        disabled={disabled}
        showClear={!disabled}
        className="w-full"
      />
      <ComboboxContent container={portalContainer}>
        <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
