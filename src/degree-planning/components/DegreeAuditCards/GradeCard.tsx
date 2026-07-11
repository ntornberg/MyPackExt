import { useAutoSize } from "../../../hooks/useAutoSize";
import type { GradeData } from "../../../types/api";
import { GradeDistributionChart } from "../../../ui-system/components/shared/GradeDistributionChart";

export function GradeCard({
  data,
  className,
}: {
  data: GradeData;
  className?: string;
}) {
  const {
    a_average,
    b_average,
    c_average,
    d_average,
    f_average,
    class_avg_min,
    class_avg_max,
  } = data;

  const [wrapRef, { w, h }] = useAutoSize(140, 0.62);
  const total = a_average + b_average + c_average + d_average + f_average;
  if (!total) return null;

  const chartSize = Math.max(96, Math.min(w, h, 160));

  return (
    <div
      ref={wrapRef}
      className={["mpp-degree-card", className].filter(Boolean).join(" ")}
    >
      <h4 className="mpp-degree-card-title">Grades</h4>

      <div className="mpp-grade-chart-wrap">
        <GradeDistributionChart data={data} size={chartSize} />
      </div>

      <h4 className="mpp-grade-card-average">
        Avg{" "}
        <strong>
          {class_avg_min}% - {class_avg_max}%
        </strong>
      </h4>
    </div>
  );
}
