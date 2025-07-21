"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Pause,
  Square,
  Coffee,
  CheckCircle,
  Plus,
  Minus,
  Timer,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountdownTimer } from "@/components/countdown-timer";

export function TimerModal({
  tasks,
  onClose,
  onUpdateTaskTime,
  onUpdateTaskFocusTime,
  onToggleTask,
}) {
  const [selectedTask, setSelectedTask] = useState("");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [preset, setPreset] = useState("25");
  const [workPreset, setWorkPreset] = useState("25"); // Store the work preset separately
  const [isBreak, setIsBreak] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [lastFocusUpdate, setLastFocusUpdate] = useState(Date.now());
  const [overtimeSeconds, setOvertimeSeconds] = useState(0); // Track overtime

  const presets = [
    { value: "5", label: "5 min", seconds: 5 * 60 },
    { value: "10", label: "10 min", seconds: 10 * 60 },
    { value: "25", label: "25 min", seconds: 25 * 60 },
    { value: "50", label: "50 min", seconds: 50 * 60 },
  ];

  // Corrected Code

  // Main countdown timer effect
  useEffect(() => {
    // This interval only runs when the timer should be active AND has time remaining.
    if (isRunning && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      // The cleanup function clears the interval when the component re-renders
      // or when the dependencies change.
      return () => clearInterval(interval);
    }
  }, [isRunning, timeLeft]); // Add timeLeft as a dependency

  // Overtime counter effect
  useEffect(() => {
    // This interval ONLY runs when the timer is active but has run out of time.
    if (isRunning && timeLeft === 0) {
      const overtimeInterval = setInterval(() => {
        setOvertimeSeconds((prev) => prev + 1);
      }, 1000);

      // The cleanup function for the overtime interval.
      return () => clearInterval(overtimeInterval);
    }
  }, [isRunning, timeLeft]); // Also depends on isRunning and timeLeft

  // Focus time tracking effect - updates every 10 seconds
  useEffect(() => {
    let focusInterval;
    if (isRunning && !isBreak && selectedTask) {
      focusInterval = setInterval(() => {
        const now = Date.now();
        const timeDiff = Math.floor((now - lastFocusUpdate) / 1000);
        if (timeDiff >= 10) {
          onUpdateTaskFocusTime(selectedTask, 10);
          setLastFocusUpdate(now);
        }
      }, 10000); // Check every 10 seconds
    }
    return () => clearInterval(focusInterval);
  }, [
    isRunning,
    isBreak,
    selectedTask,
    onUpdateTaskFocusTime,
    lastFocusUpdate,
  ]);

  // Reset focus tracking when starting/stopping
  useEffect(() => {
    if (isRunning && !isBreak && selectedTask) {
      setLastFocusUpdate(Date.now());
    }
  }, [isRunning, isBreak, selectedTask]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePresetChange = (value) => {
    setPreset(value);
    setWorkPreset(value); // Save the work preset when user changes it
    const presetData = presets.find((p) => p.value === value);
    if (presetData) {
      setTimeLeft(presetData.seconds);
      setIsRunning(false);
      setSessionStartTime(presetData.seconds);
      setOvertimeSeconds(0); // Reset overtime
    }
  };

  const adjustTime = (minutes) => {
    const newTime = Math.max(60, timeLeft + minutes * 60); // Cap at 60 seconds (1 minute)
    setTimeLeft(newTime);
    // Update session start time if we're adjusting while running
    if (isRunning) {
      setSessionStartTime((prev) => prev + minutes * 60);
    } else {
      setSessionStartTime(newTime);
    }
    // Reset overtime when adjusting time
    if (newTime > 0) {
      setOvertimeSeconds(0);
    }
  };

  const handleStart = () => {
    if (!isRunning && timeLeft > 0) {
      setSessionStartTime(timeLeft);
      setOvertimeSeconds(0); // Reset overtime when starting fresh
    }
    setIsRunning(!isRunning);
  };

  const handleFinishTask = () => {
    if (selectedTask && !isBreak) {
      // Calculate total time spent including overtime
      const baseTimeSpent = Math.ceil((sessionStartTime - timeLeft) / 60);
      const overtimeMinutes = Math.ceil(overtimeSeconds / 60);
      const totalTimeSpent = baseTimeSpent + overtimeMinutes;

      // Update task time if any time was spent
      if (totalTimeSpent > 0) {
        onUpdateTaskTime(selectedTask, totalTimeSpent);
      }

      // Add any remaining focus time (less than 10 seconds)
      if (isRunning) {
        const now = Date.now();
        const remainingFocusTime = Math.floor((now - lastFocusUpdate) / 1000);
        if (remainingFocusTime > 0) {
          onUpdateTaskFocusTime(selectedTask, remainingFocusTime);
        }
      }

      // Mark the task as complete
      onToggleTask(selectedTask);
    }
    onClose();
  };

  const handleBreak = () => {
    setIsBreak(true);
    setTimeLeft(5 * 60); // 5 minute break
    setSessionStartTime(5 * 60);
    setOvertimeSeconds(0); // Reset overtime
    setIsRunning(true); // Auto-start break timer
    setPreset("5");
  };

  const handleBackToWork = () => {
    setIsBreak(false);
    const selectedPreset =
      presets.find((p) => p.value === workPreset) || presets[2];
    setTimeLeft(selectedPreset.seconds);
    setSessionStartTime(selectedPreset.seconds);
    setOvertimeSeconds(0); // Reset overtime
    setIsRunning(true); // Auto-start work timer
    setPreset(selectedPreset.value);
  };

  const handleAbandon = () => {
    setIsRunning(false);
    setOvertimeSeconds(0); // Reset overtime
    const presetData = presets.find((p) => p.value === preset);
    if (presetData) {
      setTimeLeft(presetData.seconds);
      setSessionStartTime(presetData.seconds);
    }
  };

  // Filter to show all incomplete tasks and habits
  const incompleteItems = tasks.filter((item) => !item.completed);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.15 },
    },
  };

  const modalVariants = {
    hidden: {
      y: "100%",
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.4,
      },
    },
    exit: {
      y: "100%",
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        variants={modalVariants}
        className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border-t border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <motion.div
          className="flex justify-center pt-4 pb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="w-12 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full cursor-pointer"
            onClick={onClose}
          />
        </motion.div>

        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-70px)]">
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{
                  delay: 0.25,
                  type: "spring",
                  stiffness: 300,
                }}
                className="p-2.5 bg-primary/10 rounded-xl"
              >
                <Timer className="h-5 w-5 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-wide">
                {isBreak ? "Break Time" : "Focus Timer"}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Task Selection - Only show during work sessions */}
            {!isBreak && (
              <motion.div variants={itemVariants} className="space-y-3">
                <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  {!isRunning
                    ? "Focus on task"
                    : `Focusing on ${
                        incompleteItems.find((item) => item.id === selectedTask)
                          ?.title
                      }`}
                </label>
                {!isRunning &&
                  (incompleteItems.length > 0 ? (
                    <Select
                      value={selectedTask}
                      onValueChange={setSelectedTask}
                      disabled={isRunning}
                    >
                      <SelectTrigger className="border-2 border-gray-300 focus:border-primary/70 font-extrabold dark:border-gray-600 dark:focus:border-primary/80 dark:bg-gray-800 dark:text-gray-100 rounded-xl py-3">
                        <SelectValue placeholder="Select a task or habit" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                        {incompleteItems.map((item) => (
                          <SelectItem
                            key={item.id}
                            value={item.id}
                            className="rounded-lg dark:hover:bg-gray-700 dark:text-gray-100"
                          >
                            <div className="flex items-center gap-2 font-extrabold">
                              {item.title}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="p-6 bg-gray-50 dark:bg-gray-800/80 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-center"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                        className="text-4xl mb-3"
                      >
                        🎉
                      </motion.div>
                      <p className="font-extrabold text-lg text-gray-900 dark:text-gray-100">
                        You are done for today!
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Great job completing all your tasks and habits.
                      </p>
                    </motion.div>
                  ))}

                {incompleteItems.length > 0 &&
                  (isBreak || selectedTask) &&
                  !isBreak &&
                  isRunning && (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Button
                        onClick={handleFinishTask}
                        disabled={!selectedTask}
                        className={`w-full rounded-xl font-extrabold py-4 text-lg shadow-lg bg-primary hover:bg-primary/70 text-white`}
                        variant="default"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Mark Complete
                      </Button>
                    </motion.div>
                  )}
              </motion.div>
            )}

            {/* Show timer sections only if there are tasks to complete OR during break OR task is selected */}
            {incompleteItems.length > 0 && (isBreak || selectedTask) && (
              <>
                {/* Timer Display */}
                <motion.div
                  variants={itemVariants}
                  className="text-center space-y-4"
                >
                  <div className="relative inline-block">
                    <div className="flex items-center justify-center">
                      {/* Minus Button */}
                      <motion.div
                        className="mr-6"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustTime(-5)}
                          className="border-2 border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80 rounded-xl font-extrabold w-12 h-12 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </motion.div>

                      {/* Timer */}
                      <div className="mx-4">
                        {timeLeft === 0 ? (
                          // Show overtime counter
                          <>
                            <motion.div
                              className="text-7xl font-extrabold text-red-500 mb-2"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              +{formatTime(overtimeSeconds)}
                            </motion.div>
                            <div className="text-lg text-red-400 uppercase tracking-wider font-bold">
                              Overtime
                            </div>
                          </>
                        ) : (
                          // Show regular countdown
                          <CountdownTimer
                            value={timeLeft}
                            fontSize={84}
                            textColor={
                              isBreak ? "#10b981" : "hsl(var(--primary))"
                            }
                            fontWeight="800"
                          />
                        )}
                      </div>

                      {/* Plus Button */}
                      <motion.div
                        className="ml-6"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustTime(5)}
                          className="border-2 border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80 rounded-xl font-extrabold w-12 h-12 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>

                  {/* Session Status */}
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="flex justify-center"
                  >
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-extrabold uppercase tracking-wider shadow-lg ${
                        timeLeft === 0
                          ? "bg-primary/10 text-primary border-2 border-primary/30"
                          : isBreak
                          ? "bg-primary/10 text-primary border-2 border-primary/30"
                          : "bg-primary/10 text-primary border-2 border-primary/30"
                      }`}
                    >
                      {timeLeft === 0
                        ? "⏰ Overtime Mode"
                        : isBreak
                        ? "🧘 Break Time"
                        : "🎯 Focus Time"}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Preset Selection - Only show during work sessions */}
                {!isBreak && (
                  <motion.div variants={itemVariants} className="space-y-3">
                    <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Quick Presets
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {presets.map((p) => (
                        <motion.div
                          key={p.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant={preset === p.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePresetChange(p.value)}
                            className={`w-full font-extrabold rounded-xl py-3 ${
                              preset === p.value
                                ? "shadow-lg"
                                : "border-2 border-gray-300 dark:border-gray-600 hover:border-primary/70 dark:hover:border-primary/80"
                            }`}
                            disabled={isRunning}
                          >
                            {p.value}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Control Buttons - Music Player Style */}
                <motion.div variants={itemVariants} className="space-y-4">
                  {/* Music Player Controls */}
                  <div className="flex justify-center items-center gap-8">
                    {/* Stop/Reset Button */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant="outline"
                        onClick={handleAbandon}
                        className="w-14 h-14 p-0 rounded-full font-extrabold border-2 border-gray-300 hover:border-primary/70 dark:border-gray-600 dark:hover:border-primary/80 dark:text-gray-100"
                      >
                        <Square className="h-6 w-6" />
                      </Button>
                    </motion.div>

                    {/* Play/Pause Button */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        onClick={handleStart}
                        className="w-16 h-16 p-0 rounded-full font-extrabold text-lg shadow-lg"
                        disabled={!isBreak && !selectedTask && timeLeft > 0}
                      >
                        {isRunning ? (
                          <Pause className="h-7 w-7" />
                        ) : (
                          <Play className="h-7 w-7" />
                        )}
                      </Button>
                    </motion.div>

                    {/* Break Button */}
                    {!isBreak && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant="outline"
                          onClick={handleBreak}
                          className="w-14 h-14 p-0 rounded-full font-extrabold border-2 border-gray-300 hover:border-primary/70 dark:border-gray-600 dark:hover:border-primary/80 dark:text-gray-100"
                        >
                          <Coffee className="h-6 w-6" />
                        </Button>
                      </motion.div>
                    )}

                    {/* Back to Work Button (during break) */}
                    {isBreak && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant="outline"
                          onClick={handleBackToWork}
                          className="w-14 h-14 p-0 rounded-full border-2 border-gray-300 hover:border-primary/70 dark:border-gray-600 dark:hover:border-primary/80 dark:text-gray-100"
                        >
                          <Briefcase className="h-6 w-6" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
