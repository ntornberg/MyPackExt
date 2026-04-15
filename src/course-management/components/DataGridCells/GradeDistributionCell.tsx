import { PieChart } from "@mui/x-charts/PieChart";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { GradeData } from "../../../types/api.ts";
import type { ModifiedSection } from "../../types/Section";

/**
 * Renders a button that opens a dialog with grade distribution pie chart for a section.
 * Returns null when no grade data available.
 *
 * @param {ModifiedSection} params Section containing `grade_distribution`
 * @returns {JSX.Element | null} Trigger button and dialog, or null
 */
export const GradeDistributionCell = (params: ModifiedSection) => {
  const [open, setOpen] = useState(false);
  const gradeData = params.grade_distribution;

  if (!gradeData) {
    return (
      <span className="inline-block whitespace-nowrap text-[0.72rem] leading-[1.1] italic text-muted-foreground">
        No grade info
      </span>
    );
  }

  const {
    a_average,
    b_average,
    c_average,
    d_average,
    f_average,
    course_name,
    instructor_name,
  } = gradeData as GradeData;

  const total = a_average + b_average + c_average + d_average + f_average;

  const pieData = [
    { id: 0, value: (a_average / total) * 100, label: "A", color: "#4caf50" },
    { id: 1, value: (b_average / total) * 100, label: "B", color: "#8bc34a" },
    { id: 2, value: (c_average / total) * 100, label: "C", color: "#ffeb3b" },
    { id: 3, value: (d_average / total) * 100, label: "D", color: "#ff9800" },
    { id: 4, value: (f_average / total) * 100, label: "F", color: "#f44336" },
  ];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="min-w-[96px] whitespace-nowrap px-[1.25] py-[0.35] text-xs leading-[1.05]"
      >
        View Grades
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Grade Distribution for {course_name}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Instructor: {instructor_name}
            </p>
          </DialogHeader>

          <div className="h-[300px] w-full">
            <PieChart
              series={[
                {
                  data: pieData,
                  highlightScope: { fade: "global", highlight: "item" },
                  arcLabel: (item) => `${item.value.toFixed(1)}%`,
                },
              ]}
              height={300}
              margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
              slotProps={{
                legend: {
                  position: { vertical: "bottom", horizontal: "center" },
                },
              }}
            />
          </div>

          <div className="mt-2">
            <p className="text-center text-sm font-medium">Grade Breakdown</p>
            <div className="mt-1 flex justify-around">
              {pieData.map((grade) => (
                <div key={grade.id} className="text-center">
                  <p className="font-bold" style={{ color: grade.color }}>
                    {grade.label}
                  </p>
                  <p className="text-sm">{grade.value.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
