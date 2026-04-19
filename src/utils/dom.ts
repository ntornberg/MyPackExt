import { AppLogger } from "./logger";

/**
 * Creates a shadow DOM host element with a container div inside.
 *
 * @param {string} id The ID to assign to the host element
 * @returns {{ host: HTMLDivElement, container: HTMLDivElement }} Host and container elements
 */
export function createShadowHost(id: string): {
  host: HTMLDivElement;
  container: HTMLDivElement;
} {
  const host = document.createElement("div");
  host.id = id;

  const shadow = host.attachShadow({ mode: "open" });
  const container = document.createElement("div");
  shadow.appendChild(container);

  return { host, container };
}

/**
 * Ensures that an extension cell exists in the given row, creating one if necessary.
 *
 * @param {HTMLTableRowElement} row The table row where the cell should be added
 * @returns {HTMLTableCellElement} The extension cell
 */
export function ensureExtensionCell(
  row: HTMLTableRowElement,
): HTMLTableCellElement {
  let cell = row.querySelector<HTMLTableCellElement>(
    "td.mypack-extension-cell",
  );
  if (cell) {
    cell.innerHTML = "";
    return cell;
  }

  cell = row.ownerDocument!.createElement("td");
  cell.className = "mypack-extension-cell";
  cell.colSpan = row.cells.length;
  Object.assign(cell.style, {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    gap: ".5rem",
    padding: ".25rem",
    whiteSpace: "normal",
    verticalAlign: "top",
  });

  row.appendChild(cell);
  return cell;
}

/**
 * Waits for the schedule table ('#scheduleTable') within the MyPack iframe.
 *
 * @returns {Promise<Element>} Resolves with the '#scheduleTable' element
 */
export function waitForScheduleTable(): Promise<Element> {
  AppLogger.info("Waiting for schedule table (#scheduleTable)...");
  return new Promise((resolve) => {
    const findTable = (): Element | null => {
      const iframe = document.querySelector<HTMLIFrameElement>(
        '[id$="divPSPAGECONTAINER"] iframe',
      )?.contentDocument;
      return iframe ? iframe.querySelector("#scheduleTable") : null;
    };

    const existingTable = findTable();
    if (existingTable) {
      AppLogger.info("Schedule table found immediately.");
      return resolve(existingTable);
    }

    const observer = new MutationObserver(() => {
      const table = findTable();
      if (table) {
        AppLogger.info("Schedule table found by MutationObserver.");
        observer.disconnect();
        resolve(table);
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}
const SHADOW_THEME_STYLE_ATTR = "data-mpp-shadow-theme";
const HOST_RESET_STYLE_ID = "mpp-extension-overlay-host-reset";

/**
 * PeopleSoft sets typography on `body` / wrappers; the shadow host inherits that
 * computed style and passes font-size / line-height / family into the shadow tree.
 * This unlayered document rule resets the **host element only** so in-shadow
 * Tailwind tokens (`rem`, `font-sans`) match staging. It does not pierce shadow
 * (selectors cannot); it only fixes inheritance at the boundary.
 */
function ensureExtensionOverlayHostReset(): void {
  if (typeof document === "undefined") {
    return;
  }
  if (document.getElementById(HOST_RESET_STYLE_ID)) {
    return;
  }
  const el = document.createElement("style");
  el.id = HOST_RESET_STYLE_ID;
  el.textContent = `
#extension-overlay-root {
  font-size: 16px !important;
  line-height: 1.5 !important;
  font-family: "Geist Variable", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
  letter-spacing: normal !important;
  text-transform: none !important;
  text-align: left !important;
  -webkit-font-smoothing: antialiased;
}
`.trim();
  document.head.appendChild(el);
}

/**
 * Rewrites compiled overlay CSS for use inside `ShadowRoot`: theme blocks target
 * `:host` instead of `#extension-overlay-root`.
 */
export function extensionCssForShadowRoot(compiledCss: string): string {
  let css = compiledCss;
  // Longer selectors first — naive `#id` → `:host` would produce invalid `:host[data-…]`.
  css = css.replace(
    /#extension-overlay-root\[data-mpp-theme="light"\]/g,
    ':host([data-mpp-theme="light"])',
  );
  css = css.replace(
    /#extension-overlay-root\[data-mpp-theme="dark"\]/g,
    ':host([data-mpp-theme="dark"])',
  );
  css = css.replace(/#extension-overlay-root/g, ":host");
  return css;
}

/**
 * Inlined Vite CSS uses `url(/assets/...)` which resolves against the MyPack page
 * origin (404). Rewrite to `chrome-extension://…/assets/…` so @font-face and
 * images load from the extension package.
 */
export function rewriteCssAssetUrlsForExtension(css: string): string {
  if (
    typeof chrome === "undefined" ||
    typeof chrome.runtime?.getURL !== "function"
  ) {
    return css;
  }

  return css.replace(
    /url\(\s*(["']?)([^"')]+)\1\s*\)/gi,
    (match, _quote: string, rawPath: string) => {
      const path = rawPath.trim();
      if (
        path.startsWith("data:") ||
        path.startsWith("chrome-extension:") ||
        path.startsWith("blob:") ||
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("#")
      ) {
        return match;
      }
      const normalized = path.replace(/^\.\//, "").replace(/^\//, "");
      if (!normalized.startsWith("assets/")) {
        return match;
      }
      return `url("${chrome.runtime.getURL(normalized)}")`;
    },
  );
}

function applySlideOutDrawerChrome(drawer: HTMLDivElement) {
  // Compact, non-intrusive launcher pinned to the bottom-right corner of the
  // viewport. Previously this was a full-height 300px-wide column that covered
  // the right edge of the MyPack UI.
  drawer.style.position = "fixed";
  drawer.style.bottom = "20px";
  drawer.style.right = "20px";
  drawer.style.top = "auto";
  drawer.style.left = "auto";
  drawer.style.width = "auto";
  drawer.style.height = "auto";
  drawer.style.transition = "opacity 0.2s ease, transform 0.2s ease";
  drawer.style.zIndex = "1001";
  drawer.style.pointerEvents = "auto";
}

/**
 * Radix portals and theme tokens: prefer `#extension-portal-root` inside the
 * overlay shadow tree when present; otherwise the light-DOM host (staging).
 */
export function getExtensionOverlayPortalContainer(): HTMLElement | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }
  const host = document.getElementById("extension-overlay-root");
  if (!host) {
    return undefined;
  }
  const shadow = host.shadowRoot;
  if (shadow) {
    return shadow.getElementById("extension-portal-root") ?? host;
  }
  return host;
}

/**
 * Creates `#extension-overlay-root` on the document, attaches an open shadow root,
 * injects extension CSS, and returns `#slide-out-drawer-container` inside the shadow
 * tree for `createRoot`. Host page CSS cannot pierce the shadow boundary, so
 * Tailwind + ordering (see `attachExtensionShadowTailwindStyleOrderObserver`) so
 * in-shadow UI is not overridden by unlayered Emotion/MUI or host-page rules.
 */
export function ensureOverlayContainer(shadowCss: string): HTMLDivElement {
  ensureExtensionOverlayHostReset();

  let host = document.getElementById("extension-overlay-root");

  if (!host) {
    host = document.createElement("div");
    host.id = "extension-overlay-root";
    host.style.position = "fixed";
    host.style.top = "0";
    host.style.left = "0";
    host.style.width = "100%";
    host.style.height = "100%";
    host.style.zIndex = "1000";
    host.style.pointerEvents = "none";
    document.body.appendChild(host);
  }

  let shadow = host.shadowRoot;

  if (!shadow) {
    shadow = host.attachShadow({ mode: "open" });

    const styleEl = document.createElement("style");
    styleEl.setAttribute(SHADOW_THEME_STYLE_ATTR, "");
    styleEl.textContent = shadowCss;
    shadow.appendChild(styleEl);

    let drawer = host.querySelector<HTMLDivElement>(
      "#slide-out-drawer-container",
    );
    if (!drawer) {
      drawer = document.createElement("div");
      drawer.id = "slide-out-drawer-container";
      drawer.className = "mypack-shell";
    }
    applySlideOutDrawerChrome(drawer);
    shadow.appendChild(drawer);

    const portalRoot = document.createElement("div");
    portalRoot.id = "extension-portal-root";
    portalRoot.className = "mypack-shell";
    portalRoot.style.pointerEvents = "auto";
    shadow.appendChild(portalRoot);
  } else {
    const styleEl =
      shadow.querySelector<HTMLStyleElement>(
        `style[${SHADOW_THEME_STYLE_ATTR}]`,
      ) ?? (() => {
        const el = document.createElement("style");
        el.setAttribute(SHADOW_THEME_STYLE_ATTR, "");
        shadow.insertBefore(el, shadow.firstChild);
        return el;
      })();
    styleEl.textContent = shadowCss;

    if (!shadow.getElementById("extension-portal-root")) {
      const portalRoot = document.createElement("div");
      portalRoot.id = "extension-portal-root";
      portalRoot.className = "mypack-shell";
      portalRoot.style.pointerEvents = "auto";
      shadow.appendChild(portalRoot);
    }
  }

  const drawer = shadow.getElementById(
    "slide-out-drawer-container",
  ) as HTMLDivElement | null;
  if (!drawer) {
    throw new Error(
      "ensureOverlayContainer: slide-out-drawer-container missing inside shadow root.",
    );
  }
  return drawer;
}

/**
 * Emotion/MUI inject `<style>` nodes into the shadow root. If any sheet is inserted
 * after our compiled Tailwind `<style>`, unlayered rules can win at equal
 * specificity. Keep the Tailwind sheet as the last child of the shadow root so it
 * wins in the cascade; re-apply when new children are added.
 */
export function attachExtensionShadowTailwindStyleOrderObserver(
  shadowRoot: ShadowRoot,
): () => void {
  const moveTailwindStyleLast = () => {
    const el = shadowRoot.querySelector<HTMLStyleElement>(
      `style[${SHADOW_THEME_STYLE_ATTR}]`,
    );
    if (!el) {
      return;
    }
    if (shadowRoot.lastElementChild === el) {
      return;
    }
    shadowRoot.appendChild(el);
  };

  moveTailwindStyleLast();
  const observer = new MutationObserver(moveTailwindStyleLast);
  observer.observe(shadowRoot, { childList: true });
  return () => observer.disconnect();
}

/**
 * Waits for the planner/cart table ('#classSearchTable') within the enroll wizard container in an iframe.
 *
 * @returns {Promise<Element>} Resolves with the '#classSearchTable' element
 */
export function waitForCart(): Promise<Element> {
  AppLogger.info("Waiting for planner/cart table (#classSearchTable)...");
  return new Promise((resolve) => {
    const findTable = (): Element | null => {
      const iframe = document.querySelector<HTMLIFrameElement>(
        '[id$="divPSPAGECONTAINER"] iframe',
      )?.contentDocument;
      if (!iframe) return null;
      const plannerParent = iframe.querySelector("#enroll-wizard-container");
      if (!plannerParent) return null;
      return plannerParent.querySelector("#classSearchTable");
    };

    const existingTable = findTable();
    if (existingTable) {
      AppLogger.info("Planner/cart table found immediately.");
      return resolve(existingTable);
    }

    const observer = new MutationObserver(() => {
      const table = findTable();
      if (table) {
        AppLogger.info("Planner/cart table found by MutationObserver.");
        observer.disconnect();
        resolve(table);
      }
    });

    // Determine the most appropriate node to observe.
    // Start with document.documentElement as a fallback.
    let targetNodeToObserve: Node = document.documentElement;
    const initialIframe = document.querySelector<HTMLIFrameElement>(
      '[id$="divPSPAGECONTAINER"] iframe',
    );
    if (initialIframe?.contentDocument) {
      const plannerParent = initialIframe.contentDocument.querySelector(
        "#enroll-wizard-container",
      );
      if (plannerParent) {
        targetNodeToObserve = plannerParent; // Observe #enroll-wizard-container if available
      } else {
        targetNodeToObserve = initialIframe.contentDocument; // Observe iframe document if #enroll-wizard-container is not
      }
    }
    observer.observe(targetNodeToObserve, { childList: true, subtree: true });
  });
}

/**
 * Waits for a minimum number of rows to appear in a given table's tbody.
 *
 * @param {HTMLTableElement} table The table element to observe
 * @param {number} [minRows=2] The minimum number of rows to wait for
 * @returns {Promise<NodeListOf<HTMLTableRowElement>>} Resolves with the NodeList of rows
 */
export function waitForRows(
  table: HTMLTableElement,
  minRows = 2,
): Promise<NodeListOf<HTMLTableRowElement>> {
  return new Promise((resolve, reject) => {
    const tbody = table.querySelector("tbody");
    if (!tbody) {
      AppLogger.warn("waitForRows: Table has no tbody element.", table);
      return reject(new Error("Table does not have a tbody element."));
    }

    let observer: MutationObserver | null = null;
    const checkRows = () => {
      const rows = tbody.querySelectorAll("tr");
      if (rows.length >= minRows) {
        if (observer) observer.disconnect();
        resolve(rows);
        return true;
      }
      return false;
    };

    if (checkRows()) return; // Check immediately

    observer = new MutationObserver(checkRows);
    observer.observe(tbody, { childList: true });
  });
}
