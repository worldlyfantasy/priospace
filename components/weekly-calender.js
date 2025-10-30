"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WeeklyCalendar({ selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  useEffect(() => {
    setCurrentMonth(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );
  }, [selectedDate]);

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const monthMatrix = useMemo(() => {
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    const totalDays = endOfMonth.getDate();
    const startOffset = (startOfMonth.getDay() + 6) % 7; // Convert Sunday (0) to index 6 for Monday start

    const days = [];

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      );
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) =>
      new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) =>
      new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isToday = (date) => {
    const today = new Date();
    return date?.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date?.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 flex items-center justify-center"
          onClick={handlePreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
          {monthLabel}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 flex items-center justify-center"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-[10px] sm:text-xs font-semibold text-center text-gray-500 dark:text-gray-400">
        {daysOfWeek.map((day) => (
          <div key={day} className="uppercase">
            {day}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {monthMatrix.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {week.map((date, dayIndex) => {
              if (!date) {
                return <div key={`${weekIndex}-${dayIndex}`} className="h-12 sm:h-14" />;
              }

              const selected = isSelected(date);
              const today = isToday(date);

              const baseClasses =
                "h-12 sm:h-14 flex flex-col items-center justify-center rounded-lg font-bold transition-colors border border-transparent text-gray-600 dark:text-gray-300";

              const stateClasses = selected
                ? "border-primary/60 bg-primary/10 text-gray-900 dark:text-gray-100"
                : "hover:bg-primary/5 dark:hover:bg-primary/5";

              const todayClasses = today
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "";

              return (
                <motion.button
                  key={date.toISOString()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onDateSelect(date)}
                  className={`${baseClasses} ${stateClasses} ${todayClasses}`}
                >
                  <span className="text-sm sm:text-base font-extrabold">
                    {date.getDate()}
                  </span>
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
