import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { logEvent } from "../../../analytics/ga4";

const LS_KEY = "firstStartDismissed";

type FirstStartDialogProps = {
  suppressAutoOpen?: boolean;
};

/**
 * Displays a quick-start guide the first time the user opens the extension.
 * A persistent "Don't show again" checkbox lets them skip the dialog next time.
 */
export default function FirstStartDialog({
  suppressAutoOpen = false,
}: FirstStartDialogProps) {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (suppressAutoOpen) {
      setOpen(false);
      return;
    }
    const dismissed = localStorage.getItem(LS_KEY) === "true";
    setOpen(!dismissed);
  }, [suppressAutoOpen]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(LS_KEY, "true");
    }
    void logEvent("first_start_dismissed", { dont_show_again: dontShowAgain });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-lg gap-0 overflow-hidden p-0">
        {/* Header */}
        <div className="border-b border-border px-5 py-4">
          <DialogHeader>
            <DialogTitle>Extension Quick-Start Guide</DialogTitle>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">
            <Section title="Course Search tab">
              <Item text="Open Planning & Enrollment → Enrollment Wizard, then use the Course Search button in the page header." />
              <Item text="Search by department and catalog number. Results only include sections that are currently open." />
              <Item text="Each section card displays the professor, their Rate-My-Professor score, and historical grade distributions." />
              <Item text="Use the info icon to view meeting time, location, and a mini-calendar. Your current schedule is shown in red, the candidate section in green." />
              <Item text="Use Add to Cart to queue a section for enrollment." />
            </Section>

            <Section title="Plan Search tab">
              <Item text="Search for courses by major, minor, or major sub-plan instead of typing catalog numbers." />
              <Item text="Requirements are based on Registrar data. Open any requirement to see matching courses and their available sections." />
            </Section>

            <Section title="GEP Search tab">
              <Item text="Find classes that fulfill General Education Program requirements." />
              <Item text="The interface follows the same flow as the other search tabs." />
            </Section>

            <Section title="General notes">
              <Item text="The extension is still in active development." />
              <Item text="Feedback and bug reports are useful and appreciated." />
            </Section>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex-row items-center justify-between rounded-none border-t border-border bg-muted/40 px-5 py-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(v) => setDontShowAgain(!!v)}
            />
            <Label htmlFor="dont-show-again" className="cursor-pointer text-sm font-normal">
              Don't show again
            </Label>
          </div>
          <Button size="sm" onClick={handleClose} autoFocus>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold">{title}</h3>
      <ul className="flex flex-col gap-1.5 pl-4">{children}</ul>
    </div>
  );
}

function Item({ text }: { text: string }) {
  return (
    <li className="list-disc text-sm text-muted-foreground">{text}</li>
  );
}
