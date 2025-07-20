"use client";

import { useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";
import { Sun, Moon } from "lucide-react";

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

  return (
    <div className="flex items-center gap-3">
      <div>
        <div className="flex items-center gap-2">
          <div className="text-4xl font-extrabold">
            {selectedDate.toLocaleDateString("en-US", { weekday: "short" })}
          </div>
          {isToday(selectedDate) &&
            (isDay ? (
              <Sun className="h-7 w-7 text-yellow-500" />
            ) : (
              <Moon className="h-7 w-7 text-blue-500" />
            ))}
        </div>
      </div>
    </div>
  );
}
