import { AlertCircle, CheckCircle2, ChevronDown, ShoppingCartIcon } from "lucide-react";
import { useRef, useState } from "react";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { AppLogger } from "../../../utils/logger";
import { submitAddSectionToCart } from "../../services/submitAddSectionToCart";
import type { GroupedSections, ModifiedSection } from "../../types/Section";

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
    <div className="absolute bottom-full right-0 z-[1000] mb-2 animate-in fade-in slide-in-from-bottom-2">
      <Alert
        variant={severity === "error" ? "destructive" : "default"}
        className={cn(
          "flex w-auto items-center gap-2 whitespace-nowrap bg-popover px-3 py-2 shadow-lg",
          severity === "error" ? "text-destructive" : "text-green-500",
        )}
      >
        {severity === "success" && <CheckCircle2 className="size-4" />}
        {severity === "error" && <AlertCircle className="size-4" />}
        <AlertTitle className="mb-0 text-xs text-foreground">
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
        className="pointer-events-auto shrink-0 gap-2 rounded-lg border-0 bg-primary/50 px-3.5 font-semibold text-primary-foreground opacity-50"
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
        className="pointer-events-auto shrink-0 gap-2 rounded-lg border-0 bg-gradient-to-b from-primary via-primary to-primary/88 px-3.5 font-semibold text-primary-foreground transition-[transform,filter] hover:brightness-[1.03] active:translate-y-px"
      >
        <ShoppingCartIcon className="size-4 opacity-95" strokeWidth={2.25} />
        Add to cart
      </Button>
      <ToastFeedback open={open} message={message} severity={severity} />
    </div>
  );
};

/**
 * Several labs for one lecture: labs live in a collapsed list.
 */
function ToCartLectureWithLabAccordion({
  lecture,
  labs,
}: {
  lecture: ModifiedSection;
  labs: ModifiedSection[];
}) {
  const [labPanelOpen, setLabPanelOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState<ModifiedSection>(() => labs[0]!);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error">("success");
  const anchorRef = useRef<HTMLDivElement>(null);

  const showFeedback = (data: { ok: boolean; message: string }) => {
    setMessage(data.message);
    setSeverity(data.ok ? "success" : "error");
    setFeedbackOpen(true);
    setTimeout(() => setFeedbackOpen(false), 3000);
  };

  const handleAddToCart = async () => {
    const data = await submitAddSectionToCart(selectedLab, lecture);
    showFeedback(data);
  };

  const canAddLecture =
    lecture.course_id &&
    lecture.classNumber &&
    lecture.catalog_nbr &&
    lecture.courseData;

  if (!canAddLecture) {
    return (
      <Button
        type="button"
        variant="default"
        size="sm"
        disabled
        className="pointer-events-auto shrink-0 gap-2 rounded-lg border-0 bg-primary/50 px-3.5 font-semibold text-primary-foreground opacity-50"
      >
        <ShoppingCartIcon className="size-4 opacity-95" strokeWidth={2.25} />
        Add to cart
      </Button>
    );
  }

  return (
    <div
      ref={anchorRef}
      className="relative flex min-w-[196px] flex-col gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-row flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            void handleAddToCart();
          }}
          className="pointer-events-auto shrink-0 gap-2 rounded-lg border-0 bg-gradient-to-b from-primary via-primary to-primary/88 px-3.5 font-semibold text-primary-foreground transition-[transform,filter] hover:brightness-[1.03] active:translate-y-px"
        >
          <ShoppingCartIcon className="size-4 opacity-95" strokeWidth={2.25} />
          Add to cart
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-expanded={labPanelOpen}
          aria-label={labPanelOpen ? "Hide lab sections" : "Show lab sections"}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            setLabPanelOpen((v) => !v);
          }}
          className="h-8 w-8 text-secondary-foreground"
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200 ease-in-out",
              labPanelOpen ? "rotate-180" : "rotate-0",
            )}
          />
        </Button>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          setLabPanelOpen((v) => !v);
        }}
        className="h-auto justify-start px-2 py-1 text-[0.65rem] font-normal leading-tight text-muted-foreground hover:bg-transparent hover:text-foreground"
      >
        Lab #{selectedLab.classNumber} · {selectedLab.dayTime}
      </Button>

      {labPanelOpen && (
        <ul className="mt-1 flex max-h-[200px] flex-col overflow-auto rounded-md border border-border bg-muted/30">
          <div className="px-2 py-1.5 text-[0.62rem] font-semibold leading-tight text-muted-foreground">
            Lecture sec. {lecture.section} (#{lecture.classNumber}) — choose a lab
          </div>
          {labs.map((lab) => {
            const selected = lab.classNumber === selectedLab.classNumber;
            return (
              <button
                key={lab.id ?? lab.classNumber}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLab(lab);
                }}
                className={cn(
                  "flex w-full flex-col items-start border-t border-border px-2 py-1.5 text-left transition-colors hover:bg-accent hover:text-accent-foreground",
                  selected && "bg-accent/80 text-accent-foreground",
                )}
              >
                <div className="text-[0.75rem] font-medium leading-tight">
                  {lab.component} · Sec {lab.section} · #{lab.classNumber}
                </div>
                <div className="text-[0.62rem] text-muted-foreground">
                  {lab.dayTime} · {lab.location}
                </div>
              </button>
            );
          })}
        </ul>
      )}

      <ToastFeedback open={feedbackOpen} message={message} severity={severity} />
    </div>
  );
}

/**
 * Main course row: adds lecture alone if there are no labs; adds lecture+the only lab
 * in one step when there is exactly one lab; when several labs exist, an accordion-style
 * nested list picks the lab, then **Add to cart** pairs it with the lecture.
 */
export function ToCartGroupedSectionCell(group: GroupedSections) {
  const lecture = group.lecture;
  if (!lecture) {
    return null;
  }
  const labs = (group.labs ?? []).filter(Boolean) as ModifiedSection[];
  if (labs.length === 0) {
    return ToCartButtonCell(lecture);
  }
  if (labs.length === 1) {
    return ToCartButtonCell(labs[0]!, lecture);
  }
  return <ToCartLectureWithLabAccordion lecture={lecture} labs={labs} />;
}
