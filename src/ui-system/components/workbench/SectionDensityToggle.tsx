import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type SectionDensity = "comfy" | "compact";

export function SectionDensityToggle({
  value,
  onValueChange,
}: {
  value: SectionDensity;
  onValueChange: (value: SectionDensity) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Display</span>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => {
          if (next === "comfy" || next === "compact") {
            onValueChange(next);
          }
        }}
        variant="outline"
        size="sm"
        spacing={1}
        aria-label="Section density"
      >
        <ToggleGroupItem value="comfy" aria-label="Comfy section cards">
          Comfy
        </ToggleGroupItem>
        <ToggleGroupItem value="compact" aria-label="Compact section cards">
          Compact
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
