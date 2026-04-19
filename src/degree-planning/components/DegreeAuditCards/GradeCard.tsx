import { pieArcLabelClasses, PieChart } from "@mui/x-charts/PieChart";
import React from "react";

import { useAutoSize } from "../../../hooks/useAutoSize";
import type { GradeData } from "../../../types/api.ts";

export const GradeCard: React.FC<GradeData> = (props) => {
  const {
    a_average,
    b_average,
    c_average,
    d_average,
    f_average,
    class_avg_min,
    class_avg_max,
  } = props;

  const [wrapRef, { w, h }] = useAutoSize(140, 0.62);
  const total = a_average + b_average + c_average + d_average + f_average;
  if (!total) return null;

  const colors = ["#2ecc71", "#a3e635", "#facc15", "#f97316", "#ef4444"];
  const chartWidth = Math.min(w, 320);
  const chartHeight = Math.min(h, 180);

  return (
    <div
      ref={wrapRef}
      style={{
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        padding: ".375rem .5rem .5rem",
        boxSizing: "border-box",
        background: "#fff",
        boxShadow: "0 1px 4px rgba(15, 23, 42, 0.16)",
        borderRadius: 6,
        border: "1px solid rgba(148, 163, 184, 0.28)",
        fontSize: 12,
      }}
    >
      <h4
        style={{
          margin: "0 0 .125rem",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".02em",
          textAlign: "center",
        }}
      >
        Grades
      </h4>

      <PieChart
        width={chartWidth}
        height={chartHeight}
        hideLegend
        series={[
          {
            outerRadius: "90%",
            arcLabelRadius: "80%",
            paddingAngle: 0,
            arcLabel: ({ id, value }) =>
              `${id}: ${((value / total) * 100).toFixed(0)}%`,
            arcLabelMinAngle: 15,
            data: [
              { id: "A", value: a_average, label: "A", color: colors[0] },
              { id: "B", value: b_average, label: "B", color: colors[1] },
              { id: "C", value: c_average, label: "C", color: colors[2] },
              { id: "D", value: d_average, label: "D", color: colors[3] },
              { id: "F", value: f_average, label: "F", color: colors[4] },
            ],
          },
        ]}
        sx={{ [`& .${pieArcLabelClasses.root}`]: { fontWeight: "bold" } }}
      />

      <h4
        style={{
          color: "#64748b",
          margin: ".125rem 0 0",
          textAlign: "center",
          fontSize: 11,
          fontWeight: 600,
          lineHeight: 1.2,
        }}
      >
        Avg{" "}
        <strong>
          {class_avg_min}% – {class_avg_max}%
        </strong>
      </h4>
    </div>
  );
};
