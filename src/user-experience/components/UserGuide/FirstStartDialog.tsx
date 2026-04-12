import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { logEvent } from "../../../analytics/ga4";

const LS_KEY = "firstStartDismissed";

type FirstStartDialogProps = {
  suppressAutoOpen?: boolean;
};

/**
 * Displays a quick‑start guide the first time the user opens the extension.
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
    void logEvent("first_start_dismissed", {
      dont_show_again: dontShowAgain,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Extension Quick‑Start Guide</DialogTitle>

      <DialogContent sx={{ maxWidth: 600 }}>
        <SectionHeading text="Course Search tab" />
        <UnorderedList
          items={[
            "Open Planning & Enrollment -> Enrollment Wizard, then use the Course Search button in the page header.",
            "Search by department and catalog number. Results only include sections that are currently open.",
            "Each section card displays the professor, their Rate‑My‑Professor score, and historical grade distributions.",
            "Use the info icon to view meeting time, location, and a mini-calendar. Your current schedule is shown in red, the candidate section in green, and overlaps are semi-transparent.",
            "Use Add to Cart to queue a section for enrollment.",
          ]}
        />

        <SectionHeading text="Plan Search tab" />
        <UnorderedList
          items={[
            "Search for courses by major, minor, or major sub‑plan instead of typing catalog numbers.",
            "Requirements are based on Registrar data. Open any requirement to see matching courses and their available sections.",
          ]}
        />

        <SectionHeading text="GEP Search tab" />
        <UnorderedList
          items={[
            "Find classes that fulfill General Education Program requirements.",
            "The interface follows the same flow as the other search tabs.",
          ]}
        />

        <SectionHeading text="General notes" />
        <UnorderedList
          items={[
            "The extension is still in active development.",
            "Feedback and bug reports are useful and appreciated.",
          ]}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={dontShowAgain}
              onChange={(_, val) => setDontShowAgain(val)}
            />
          }
          label="Don't show again"
        />
        <Button variant="contained" onClick={handleClose} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SectionHeading({ text }: { text: string }) {
  return (
    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
      {text}
    </Typography>
  );
}

function UnorderedList({ items }: { items: string[] }) {
  return (
    <List dense sx={{ pl: 2, listStyleType: "disc" }}>
      {items.map((item, idx) => (
        <ListItem key={idx} sx={{ display: "list-item", py: 0 }}>
          <ListItemText
            primary={<Typography variant="body2">{item}</Typography>}
          />
        </ListItem>
      ))}
    </List>
  );
}
