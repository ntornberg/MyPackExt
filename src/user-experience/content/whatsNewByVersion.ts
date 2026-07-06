export type WhatsNewSection = {
  title: string;
  items: string[];
};

export type WhatsNewRelease = {
  title: string;
  subtitle: string;
  sections: WhatsNewSection[];
};

export const whatsNewByVersion: Record<string, WhatsNewRelease> = {
  "3.8.5": {
    title: "Search and planner cleanup",
    subtitle:
      "This release focuses on clearer search controls, better calendar behavior, and support for the latest term data.",
    sections: [
      {
        title: "Search tabs",
        items: [
          "Added support for 2026 terms.",
          "Course Search, GEP Search, and Plan Search now share the same button and input treatment.",
          "Default term selection now follows the available term list instead of relying on stale hardcoded options.",
        ],
      },
      {
        title: "Schedule preview",
        items: [
          "Improved overlap handling in the mini-calendar preview.",
          "Schedule data now refreshes more reliably when the planner updates.",
          "Course detail rendering was tightened to avoid unnecessary refreshes.",
        ],
      },
      {
        title: "Extension polish",
        items: [
          "Updated dialog spacing and table styling to make results easier to scan.",
          "Adjusted light and dark mode presentation so the planner UI feels less inconsistent across pages.",
          "Updated extension metadata and release plumbing for this version.",
        ],
      },
    ],
  },
};
