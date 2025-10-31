"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyCalendar({ selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(
    () =>
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      )
  );
  const [transitionDirection, setTransitionDirection] = useState(0);

  useEffect(() => {
    const desired = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );

    setCurrentMonth((prev) => {
      const sameMonth =
        prev.getFullYear() === desired.getFullYear() &&
        prev.getMonth() === desired.getMonth();

      if (sameMonth) {
        return prev;
      }

      const direction =
        desired.getTime() > prev.getTime() ? 1 : -1;
      setTransitionDirection(direction);

      return desired;
    });
  }, [selectedDate]);

  const calendarDays = useMemo(() => {
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

    const startOffset = (startOfMonth.getDay() + 6) % 7;
    const daysInMonth = endOfMonth.getDate();
    const days = [];

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      );
    }

    const totalCells = Math.ceil(days.length / 7) * 7;
    while (days.length < totalCells) {
      days.push(null);
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  }, [currentMonth]);

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const goToPreviousMonth = () => {
    setTransitionDirection(-1);
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setTransitionDirection(1);
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;

  const monthVariants = {
    enter: (direction) => ({
      x: direction * 48,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.28, ease: "easeOut" },
    },
    exit: (direction) => ({
      x: direction * -48,
      opacity: 0,
      transition: { duration: 0.2, ease: "easeIn" },
    }),
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex sm:h-[26rem]">
        <Button
          variant="outline"
          size="sm"
          className="absolute left-0 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary/60 bg-primary/5 hover:bg-primary/15 dark:hover:bg-primary/20 text-primary shadow-sm shadow-primary/10 sm:flex"
          onClick={goToPreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 flex flex-col px-2 sm:px-12">
          <div className="flex items-center justify-center sm:justify-between mb-2 px-1">
            <div className="text-sm font-extrabold text-gray-600 dark:text-gray-200 uppercase tracking-wide text-center sm:text-left">
              {monthLabel}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-start">
            <div className="grid grid-cols-7 gap-1 px-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {weekDays.map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="mt-3 relative overflow-hidden rounded-3xl min-h-[22rem]">
              <AnimatePresence
                initial={false}
                mode="wait"
                custom={transitionDirection}
              >
                <motion.div
                  key={monthKey}
                  custom={transitionDirection}
                  variants={monthVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 grid grid-cols-7 gap-2 p-4 justify-items-center"
                >
                  {calendarDays.map((week, weekIndex) =>
                    week.map((date, dayIndex) => {
                      if (!date) {
                        return (
                          <div
                            key={`empty-${weekIndex}-${dayIndex}`}
                            className="h-14 w-14"
                          />
                        );
                      }

                      const selected = isSelected(date);
                      const today = isToday(date);

                      let classes =
                        "flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 font-extrabold text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary";

                      if (selected) {
                        classes +=
                          " border-2 border-primary/80 bg-primary/15 text-primary shadow-sm shadow-primary/20";
                      } else if (today) {
                        classes += " border-2 border-primary/60 text-primary";
                      }

                      return (
                        <motion.button
                          key={date.toISOString()}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => onDateSelect(new Date(date))}
                          className={classes}
                        >
                          <span className="text-sm">{date.getDate()}</span>
                        </motion.button>
                      );
                    })
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="absolute right-0 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary/60 bg-primary/5 hover:bg-primary/15 dark:hover:bg-primary/20 text-primary shadow-sm shadow-primary/10 sm:flex"
          onClick={goToNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="items-center justify-center gap-10 h-full sm:hidden flex">
        <Button
          variant="outline"
          size="sm"
          className="w-9 h-9 rounded-full border border-primary/60 bg-primary/5 hover:bg-primary/15 dark:hover:bg-primary/20 text-primary"
          onClick={goToPreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-9 h-9 rounded-full border border-primary/60 bg-primary/5 hover:bg-primary/15 dark:hover:bg-primary/20 text-primary"
          onClick={goToNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
