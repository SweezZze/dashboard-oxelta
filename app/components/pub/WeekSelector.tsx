"use client";

import { Card } from "@/components/ui/card";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Value } from "react-calendar/dist/cjs/shared/types.js";

type Props = {
  selectedWeek: number | null;
  onWeekSelect: (date: Date) => void;
  tileClassName: (props: { date: Date; view: string }) => string;
};

export const WeekSelector = ({
  selectedWeek,
  onWeekSelect,
  tileClassName,
}: Props) => {
  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className="p-6">
        <h2 className="mb-6 text-xl font-semibold tracking-tight text-card-foreground">
          Select Week
        </h2>
        <Calendar
          onChange={(value: Value) => onWeekSelect(value as Date)}
          className="w-full border-none rounded-lg bg-card text-card-foreground dark:bg-card dark:text-card-foreground"
          tileClassName={({ date, view }) => {
            const baseClasses = "hover:bg-primary/20 transition-colors";
            const customClass = tileClassName({ date, view });
            return `${baseClasses} ${customClass}`;
          }}
        />
      </div>
    </Card>
  );
};
