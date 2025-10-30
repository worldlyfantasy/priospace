"use client";

import { useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";
import { Sun, Moon } from "lucide-react";

function AnimatedWeekday({ dayIndex, fontSize, textColor }) {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const height = fontSize * 1.2;

  const animatedIndex = useSpring(dayIndex, { stiffness: 300, damping: 30 });

  useEffect(() => {
    animatedIndex.set(dayIndex);
  }, [animatedIndex, dayIndex]);

  return (
    <div
      className="relative overflow-hidden inline-block"
      style={{
        height: height,
        width: fontSize * 2.2,
        fontSize: fontSize,
        color: textColor,
        fontWeight: "800",
      }}
    >
      {weekdays.map((day, index) => (
        <motion.div
          key={day}
          className="absolute flex items-center justify-start font-extrabold"
          style={{
            y: useSpring((index - dayIndex) * height, {
              stiffness: 300,
              damping: 30,
            }),
          }}
          animate={{
            y: (index - dayIndex) * height,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {day}
        </motion.div>
      ))}
    </div>
  );
}

function AnimatedDigit({ value, fontSize, textColor }) {
  const animatedValue = useSpring(value, { stiffness: 300, damping: 30 });

  useEffect(() => {
    animatedValue.set(value);
  }, [animatedValue, value]);

  return (
    <div
      className="relative overflow-hidden inline-block"
      style={{
        height: fontSize * 1.2,
        width: fontSize * 0.55,
        fontSize: fontSize,
        color: textColor,
        fontWeight: "800",
      }}
    >
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
        <motion.div
          key={digit}
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            y: (digit - (value % 10)) * fontSize * 1.2,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {digit}
        </motion.div>
      ))}
    </div>
  );
}

export function AnimatedNumber({ value, fontSize, textColor }) {
  const formattedValue = value.toString().padStart(2, "0");
  const digits = formattedValue.split("").map(Number);

  return (
    <div className="flex">
      {digits.map((digit, index) => (
        <AnimatedDigit
          key={`${digits.length}-${index}`}
          value={digit}
          fontSize={fontSize}
          textColor={textColor}
        />
      ))}
    </div>
  );
}

export function DayNightCycle({ selectedDate }) {
  const [isDay, setIsDay] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsDay(hour >= 6 && hour < 18);
  }, []);

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get the day index (0 for Sunday, 1 for Monday, etc.) from the date
  const dayIndex = selectedDate.getDay();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="text-4xl font-extrabold flex items-center">
          <AnimatedWeekday dayIndex={dayIndex} fontSize={32} />
        </div>
        {isToday(selectedDate) && (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-primary/10 shadow-sm shadow-primary/10">
            {isDay ? (
              <Sun className="h-5 w-5 text-primary" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
