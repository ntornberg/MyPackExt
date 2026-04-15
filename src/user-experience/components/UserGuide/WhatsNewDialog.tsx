import { MailIcon, SparklesIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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

  const release = currentVersion ? whatsNewByVersion[currentVersion] : undefined;
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
    void logEvent("whats_new_dismissed", { version: currentVersion });
    resolve();
  }, [currentVersion, resolve]);

  if (!release) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg gap-0 overflow-hidden p-0"
      >
        {/* Header */}
        <div className="border-b border-border bg-muted/40 px-5 py-4">
          <DialogHeader className="gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary/80">
                <SparklesIcon className="size-3.5" />
                What's New
              </div>
              <Badge variant="secondary" className="font-mono text-[0.65rem]">
                v{currentVersion}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-bold">{release.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">{release.subtitle}</p>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">
            {release.sections.map((section, index) => (
              <div key={section.title}>
                <h3 className="mb-2 text-sm font-bold">{section.title}</h3>
                <ul className="flex flex-col gap-1.5 pl-4">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="list-disc text-sm text-muted-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                {index < release.sections.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex-row items-center justify-between rounded-none border-t border-border bg-muted/40 px-5 py-3">
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=MyPack%20Plus%20Question`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <MailIcon className="size-3.5" />
            {CONTACT_EMAIL}
          </a>
          <Button size="sm" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
