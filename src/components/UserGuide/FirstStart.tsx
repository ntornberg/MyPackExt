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
  FormControlLabel,
  Box,
  Divider
} from "@mui/material";

const LS_KEY = "firstStartDismissed2";

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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Welcome to MyPackExt! 🎓
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
          Your enhanced NC State course planning companion
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ maxWidth: 700, px: 3 }}>
        {/* ===== IMPORTANT NOTICE ===== */}
        <Box sx={{ mb: 3, p: 2, bgcolor: "warning.light", borderRadius: 1 }}>
          <SectionHeading text="⚠️ Important Authentication Notice (Emergency Patch)" />
          <UnorderedList
            items={[
              "Due to university policy, gradient data cannot be hosted directly on our servers.",
              "The extension will open a new tab to MyPack Portal where you'll need to log in manually.",
              "Once authenticated, the extension will automatically search for courses and serve them to you instantly.",
              "Some features may be limited due to gradient request restrictions, but core functionality remains intact.",
            ]}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ===== COURSE SEARCH TAB ===== */}
        <SectionHeading text="📚 Course Search" />
        <UnorderedList
          items={[
            "Search courses by subject code, and course number",
            "View real-time enrollment data, waitlist information, and seat availability",
            "Access instructor ratings from RateMyProfessor integration",
            "See grade distribution data to help inform your course selection",   
          ]}
        />

      

      

        {/* ===== FEATURES & TIPS ===== */}
        <SectionHeading text="💡 Key Features & Tips" />
        <UnorderedList
          items={[
            "All data is updated in real-time from official university sources",
            "The extension works seamlessly with the existing MyPack Portal interface",
          ]}
        />

        {/* ===== SUPPORT & FEEDBACK ===== */}
        <SectionHeading text="🤝 Support & Development" />
        <UnorderedList
          items={[
            "This extension is actively developed and regularly updated",
            "Your feedback and bug reports help improve the experience for everyone",
            "Feature requests are welcome and considered for future releases",
          ]}
        />

        <Box sx={{ mt: 3, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontStyle: "italic", textAlign: "center" }}>
            Ready to enhance your course planning experience? Click "Get Started" to begin! 🚀
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={dontShowAgain}
              onChange={(_, val) => setDontShowAgain(val)}
            />
          }
          label="Don't show this guide again"
        />
        <Button variant="contained" onClick={handleClose} autoFocus size="large">
          Get Started!
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
    <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600, color: "primary.main" }}>
      {text}
    </Typography>
  );
}

function UnorderedList({ items }: { items: string[] }) {
  return (
    <List dense sx={{ pl: 2 }}>
      {items.map((item, idx) => (
        <ListItem key={idx} sx={{ display: "list-item", py: 0.5, pl: 0 }}>
          <ListItemText
            primary={
              <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                • {item}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
