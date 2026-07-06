import { useState } from "react";

import { getExtensionOverlayPortalContainer } from "@/utils/dom";

/**
 * Returns the portal mount node (`#extension-portal-root` in the overlay shadow
 * tree, or the light-DOM host on staging). Matches `getExtensionOverlayPortalContainer()`.
 */
export function useOverlayPortalContainer(): HTMLElement | null {
  const [container] = useState(() =>
    typeof document !== "undefined"
      ? getExtensionOverlayPortalContainer() ?? null
      : null,
  );

  return container;
}
