import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import NewReleasesRoundedIcon from "@mui/icons-material/NewReleasesRounded";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { logEvent } from "../../../analytics/ga4";
import { whatsNewByVersion } from "../../content/whatsNewByVersion";

const LS_KEY = "mypack.whatsNewSeenVersion";
const CONTACT_EMAIL = "nicktornberg12@gmail.com";

type WhatsNewDialogProps = {
  onResolved?: () => void;
};

/**
 * Shows versioned release notes once per extension version.
 */
export default function WhatsNewDialog({ onResolved }: WhatsNewDialogProps) {
  const [open, setOpen] = useState(false);

  const currentVersion = useMemo(() => {
    try {
      return chrome.runtime.getManifest().version;
    } catch {
      return "";
    }
  }, []);
  const release = currentVersion
    ? whatsNewByVersion[currentVersion]
    : undefined;
  const resolvedRef = useRef(false);

  const resolve = useCallback(() => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    onResolved?.();
  }, [onResolved]);

  useEffect(() => {
    if (!release) {
      resolve();
      return;
    }

    const seenVersion = localStorage.getItem(LS_KEY);
    if (seenVersion === currentVersion) {
      resolve();
      return;
    }

    setOpen(true);
  }, [currentVersion, release, resolve]);

  const handleClose = useCallback(() => {
    if (currentVersion) {
      localStorage.setItem(LS_KEY, currentVersion);
    }
    setOpen(false);
    void logEvent("whats_new_dismissed", {
      version: currentVersion,
    });
    resolve();
  }, [currentVersion, resolve]);

  if (!release) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 8,
          },
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,
            py: 2.25,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack spacing={0.75}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <NewReleasesRoundedIcon color="primary" fontSize="small" />
                <Typography variant="overline" sx={{ letterSpacing: 0.8 }}>
                  What's New
                </Typography>
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {release.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {release.subtitle}
              </Typography>
            </Stack>
            <Chip
              size="small"
              label={`v${currentVersion}`}
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Stack spacing={2}>
          {release.sections.map((section, index) => (
            <Box key={section.title}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 0.75, fontWeight: 700 }}
              >
                {section.title}
              </Typography>
              <Stack component="ul" sx={{ pl: 2.5, mb: 0, mt: 0, gap: 0.75 }}>
                {section.items.map((item) => (
                  <Typography
                    component="li"
                    variant="body2"
                    color="text.secondary"
                    key={item}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
              {index < release.sections.length - 1 ? (
                <Divider sx={{ mt: 1.75 }} />
              ) : null}
            </Box>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{ px: 3, pb: 2.5, pt: 0.5, justifyContent: "space-between" }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
        >
          <MailOutlineRoundedIcon sx={{ fontSize: 16 }} />
          <Link
            href={`mailto:${CONTACT_EMAIL}?subject=MyPack%20Plus%20Question`}
            underline="hover"
            color="inherit"
          >
            {CONTACT_EMAIL}
          </Link>
        </Typography>
        <Button variant="contained" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
