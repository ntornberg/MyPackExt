import { AlertCircle, CheckCircle2, ShoppingCartIcon } from "lucide-react";
import { useState } from "react";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { AppLogger } from "../../../utils/logger";
import { submitAddSectionToCart } from "../../services/submitAddSectionToCart";
import type { GroupedSections, ModifiedSection } from "../../types/Section";

const cartButtonClassName =
  "pointer-events-auto shrink-0 gap-2 rounded-lg border border-primary/35 bg-gradient-to-b from-primary via-primary to-primary/88 px-3.5 font-semibold text-primary-foreground shadow-sm transition-[transform,filter,box-shadow,border-color] duration-150 hover:border-primary/55 hover:brightness-[1.03] hover:shadow-md active:scale-[1.03]";

const disabledCartButtonClassName =
  "pointer-events-auto shrink-0 gap-2 rounded-lg border border-primary/20 bg-primary/50 px-3.5 font-semibold text-primary-foreground opacity-50";

/**
 * Shared local toast feedback component. Absolute positioned relative to wrapper.
 */
function ToastFeedback({
  open,
  message,
  severity,
}: {
  open: boolean;
  message: string;
  severity: "success" | "error";
}) {
  if (!open) return null;
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-[1000] mb-2 flex w-max max-w-[min(280px,calc(100vw-2rem))] -translate-x-1/2 animate-in justify-center fade-in slide-in-from-bottom-2">
      <Alert
        variant={severity === "error" ? "destructive" : "default"}
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg border bg-popover px-3 py-2 text-center shadow-lg",
          severity === "error" ? "text-destructive" : "text-green-500",
        )}
      >
        {severity === "success" && <CheckCircle2 className="size-4" />}
        {severity === "error" && <AlertCircle className="size-4" />}
        <AlertTitle className="mb-0 text-center text-xs leading-snug text-foreground">
          {message || "Course added to cart"}
        </AlertTitle>
      </Alert>
    </div>
  );
}

/**
 * Renders an Add to Cart button for a section and invokes the MyPack add-to-cart endpoint.
 */
export const ToCartButtonCell = (
  selectedSection: ModifiedSection,
  parent?: ModifiedSection,
) => {
  const { course_id, classNumber, catalog_nbr, courseData } = selectedSection;

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error">("success");

  if (!course_id || !classNumber || !catalog_nbr || !courseData) {
    AppLogger.warn("Missing required data for section: ", selectedSection);
    return (
      <Button
        type="button"
        variant="default"
        size="sm"
        disabled
        className={disabledCartButtonClassName}
      >
        <ShoppingCartIcon className="size-4 opacity-95" strokeWidth={2.25} />
        Add to cart
      </Button>
    );
  }

  const handleAddToCart = async () => {
    const data = await submitAddSectionToCart(selectedSection, parent);
    if (data.ok) {
      AppLogger.info("Added to cart! " + data.message);
      setMessage(data.message);
      setSeverity("success");
      setOpen(true);
    } else {
      AppLogger.warn("Add to cart failed:", data.message);
      setMessage(data.message);
      setSeverity("error");
      setOpen(true);
    }
    setTimeout(() => setOpen(false), 3000);
  };

  return (
    <div className="relative inline-block w-full text-right" onClick={(e) => e.stopPropagation()}>
      <Button
        type="button"
        variant="default"
        size="sm"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          void handleAddToCart();
        }}
        className={cartButtonClassName}
      >
        <ShoppingCartIcon className="size-4 opacity-95" strokeWidth={2.25} />
        Add to cart
      </Button>
      <ToastFeedback open={open} message={message} severity={severity} />
    </div>
  );
};

/**
 * Picks which lab to pair with the lecture for add-to-cart.
 * Prefers the externally controlled selection (from the card's lab picker);
 * falls back to the first lab when none is chosen yet.
 */
function resolveSelectedLab(
  labs: ModifiedSection[],
  selectedLabClassNumber: string | undefined,
): ModifiedSection {
  if (selectedLabClassNumber) {
    const match = labs.find(
      (lab) => String(lab.classNumber) === String(selectedLabClassNumber),
    );
    if (match) {
      return match;
    }
  }
  return labs[0]!;
}

export type ToCartGroupedSectionCellProps = GroupedSections & {
  /**
   * Class number of the lab currently selected in the parent card's lab picker.
   * When provided, the cart submission uses this lab; otherwise the first lab is used.
   */
  selectedLabClassNumber?: string;
};

/**
 * Main course row: adds lecture alone if there are no labs, else adds the currently
 * selected lab paired with its lecture. The lab selection is driven by the parent
 * card's lab picker (via {@link ToCartGroupedSectionCellProps.selectedLabClassNumber}),
 * so this cell never renders its own lab dropdown.
 */
export function ToCartGroupedSectionCell({
  lecture,
  labs: rawLabs,
  selectedLabClassNumber,
}: ToCartGroupedSectionCellProps) {
  if (!lecture) {
    return null;
  }
  const labs = (rawLabs ?? []).filter(Boolean) as ModifiedSection[];
  if (labs.length === 0) {
    return ToCartButtonCell(lecture);
  }
  const selectedLab = resolveSelectedLab(labs, selectedLabClassNumber);
  return ToCartButtonCell(selectedLab, lecture);
}
