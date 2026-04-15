import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../index.css";

import { PlannerStagingApp } from "./PlannerStagingApp";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Planner staging root container was not found.");
}

createRoot(container).render(
  <StrictMode>
    <PlannerStagingApp />
  </StrictMode>,
);
