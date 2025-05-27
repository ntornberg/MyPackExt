import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel
} from "@mui/material";

/* -------------------------------------------------------------------------- */
/*                       Helper: localStorage key constant                    */
/* -------------------------------------------------------------------------- */
const LS_KEY = "firstStartDismissed";

/**
 * Displays a quick‑start guide the first time the user opens the extension.
 * A persistent "Don't show again" checkbox lets them skip the dialog next time.
 */
export default function FirstStartDialog() {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  /* On mount: check localStorage; if the user has dismissed before, don't open */
  useEffect(() => {
    const dismissed = localStorage.getItem(LS_KEY) === "true";
    setOpen(!dismissed);
  }, []);

  /* Handle close: persist the checkbox choice */
  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(LS_KEY, "true");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Extension Quick‑Start Guide</DialogTitle>

      <DialogContent sx={{ maxWidth: 600 }}>
        {/* ===== COURSE SEARCH TAB ===== */}
        <SectionHeading text="Course Search tab" />
        <UnorderedList
          items={[
            "Navigate to Planning & Enrollment → Enrollment Wizard, then click the new **Course Search** button in the page header.",
            "Search by *department* and *catalog number*. Only sections that are **open** for registration are shown.",
            "Each section card displays the professor, their Rate‑My‑Professor score, and historical grade distributions.",
            "Hover the info icon to view meeting time, location, and a mini‑calendar. Your current schedule appears in **red**; the prospective section in **green**. Overlaps are rendered semi‑transparent.",
            "Click **Add to Cart** to queue the section for enrollment. (Status feedback coming soon.)"
          ]}
        />

        {/* ===== PLAN SEARCH TAB ===== */}
        <SectionHeading text="Plan Search tab" />
        <UnorderedList
          items={[
            "Search for courses by **major, minor, or major sub‑plan** instead of typing catalog numbers.",
            "Requirements are based on Registrar data (accuracy may vary). Click a requirement to see matching courses and their open sections in the familiar grid view."
          ]}
        />

        {/* ===== GEP SEARCH TAB ===== */}
        <SectionHeading text="GEP Search tab" />
        <UnorderedList
          items={[
            "Find classes that fulfill General Education Program requirements.",
            "Interface mirrors the other tabs; UX polish is on the roadmap."
          ]}
        />

        {/* ===== GENERAL NOTES ===== */}
        <SectionHeading text="General notes" />
        <UnorderedList
          items={[
            "The extension is still in active development and lightly tested.",
            "Feedback and bug reports are very welcome!"
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
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Sub-components                               */
/* -------------------------------------------------------------------------- */

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
