"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Tag,
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#a85520", // brown
  "#6366f1", // indigo
];

export function AddTaskModal({
  onClose,
  onAddTask,
  customTags,
  onAddCustomTag,
  selectedDate, // Current selected date from parent
}) {
  const [taskTitle, setTaskTitle] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [taskDate, setTaskDate] = useState(selectedDate || new Date());
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(
    () =>
      new Date(
        (selectedDate || new Date()).getFullYear(),
        (selectedDate || new Date()).getMonth(),
        1
      )
  );
  const datePickerRef = useRef(null);

  // Update taskDate when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setTaskDate(selectedDate);
    }
  }, [selectedDate]);

  // Arrow key navigation for categories
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();

        if (customTags.length === 0) return;

        const currentIndex = customTags.findIndex(
          (tag) => tag.id === selectedTag
        );
        let newIndex;

        if (e.key === "ArrowDown") {
          if (currentIndex === -1) {
            // No selection, select first tag
            newIndex = 0;
          } else if (currentIndex === customTags.length - 1) {
            // At last tag, clear selection
            setSelectedTag("");
            return;
          } else {
            // Go to next tag
            newIndex = currentIndex + 1;
          }
        } else {
          // ArrowUp
          if (currentIndex === -1) {
            // No selection, select last tag
            newIndex = customTags.length - 1;
          } else if (currentIndex === 0) {
            // At first tag, clear selection
            setSelectedTag("");
            return;
          } else {
            // Go to previous tag
            newIndex = currentIndex - 1;
          }
        }

        setSelectedTag(customTags[newIndex].id);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [customTags, selectedTag]);

  const handleSubmit = () => {
    if (taskTitle.trim()) {
      onAddTask(taskTitle.trim(), selectedTag || undefined, taskDate);
      onClose();
    }
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTagId = onAddCustomTag(newTagName.trim(), selectedColor);
      setSelectedTag(newTagId);
      setNewTagName("");
      setShowAddTag(false);
    }
  };

  // Get quick date options
  const getQuickDateOptions = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      { label: "Today", date: today },
      { label: "Tomorrow", date: tomorrow },
      { label: "Next Week", date: nextWeek },
    ];
  };

  const quickDateOptions = getQuickDateOptions();
  const formattedTaskDate = taskDate.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });

  useEffect(() => {
    setPickerMonth(
      new Date(taskDate.getFullYear(), taskDate.getMonth(), 1)
    );
  }, [taskDate]);

  useEffect(() => {
    if (!isDatePickerOpen) return;

    const handleOutsideClick = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setIsDatePickerOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDatePickerOpen]);

  const pickerMonthLabel = pickerMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const pickerWeeks = useMemo(() => {
    const startOfMonth = new Date(
      pickerMonth.getFullYear(),
      pickerMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      pickerMonth.getFullYear(),
      pickerMonth.getMonth() + 1,
      0
    );

    const startOffset = (startOfMonth.getDay() + 6) % 7;
    const days = [];

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    for (let day = 1; day <= endOfMonth.getDate(); day++) {
      days.push(
        new Date(
          pickerMonth.getFullYear(),
          pickerMonth.getMonth(),
          day
        )
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
  }, [pickerMonth]);

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const isSameDay = (dateA, dateB) =>
    dateA?.toDateString() === dateB?.toDateString();

  const isToday = (date) =>
    date?.toDateString() === new Date().toDateString();

  const handleDaySelect = (date) => {
    setTaskDate(new Date(date));
    setIsDatePickerOpen(false);
  };

  const goToPickerPreviousMonth = () => {
    setPickerMonth(
      new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1)
    );
  };

  const goToPickerNextMonth = () => {
    setPickerMonth(
      new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1)
    );
  };

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
      y: "-100%",
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
      y: "-100%",
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

  const tagFormVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const colorButtonVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
    },
    hover: {
      scale: 1.1,
      transition: { duration: 0.1 },
    },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-10 pb-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        variants={modalVariants}
        className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg min-h-[620px] sm:min-h-[720px] max-h-[96vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700"
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

        <div className="px-6 pb-8 overflow-y-auto max-h-[calc(96vh-80px)]">
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
                <Plus className="h-5 w-5 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-wide">
                Create New
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl p-2 dark:text-white"
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
            {/* Task Title */}
            <motion.div variants={itemVariants} className="space-y-1">
              <Input
                placeholder="What needs to be done?"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !showAddTag && handleSubmit()
                }
                autoFocus
                className="border-0 bg-transparent md:text-2xl h-10 font-extrabold px-0 py-2 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </motion.div>

            {/* Date Selection */}
            <motion.div variants={itemVariants} className="space-y-3">
              <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </label>

              {/* Quick Date Options */}
              <div className="flex gap-2 flex-wrap">
                {quickDateOptions.map((option) => (
                  <motion.button
                    key={option.label}
                    onClick={() => {
                      setTaskDate(new Date(option.date));
                      setIsDatePickerOpen(false);
                    }}
                    className={`px-4 py-2 text-sm font-bold rounded-full border-2 transition-all duration-200 ${
                      taskDate.toDateString() === option.date.toDateString()
                        ? "border-primary bg-primary/15 text-primary shadow-sm shadow-primary/15"
                        : "border-gray-300 text-gray-600 hover:border-primary/60 hover:bg-primary/10 dark:border-gray-600 dark:text-gray-100 dark:hover:border-primary/70 dark:hover:bg-primary/15"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>

              {/* Date Picker */}
              <div className="relative" ref={datePickerRef}>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen((open) => !open)}
                  className="flex w-full items-center justify-between gap-4 rounded-xl border-2 border-gray-300 px-4 py-3 font-extrabold text-gray-700 transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-primary/80 dark:hover:text-primary"
                >
                  <span className="text-left">{formattedTaskDate}</span>
                  <Calendar className="h-5 w-5 text-primary" />
                </button>

                <AnimatePresence>
                  {isDatePickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="mt-4 rounded-2xl border border-primary/20 bg-white p-4 shadow-xl dark:border-primary/40 dark:bg-gray-900"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={goToPickerPreviousMonth}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 text-primary transition hover:bg-primary/15 dark:border-primary/50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="text-sm font-extrabold uppercase tracking-wide text-gray-700 dark:text-gray-100">
                          {pickerMonthLabel}
                        </div>
                        <button
                          type="button"
                          onClick={goToPickerNextMonth}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 text-primary transition hover:bg-primary/15 dark:border-primary/50"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {weekDays.map((day) => (
                          <div key={day}>{day}</div>
                        ))}
                      </div>

                      <div className="mt-2 grid grid-cols-7 gap-2">
                        {pickerWeeks.map((week, weekIndex) =>
                          week.map((date, dayIndex) => {
                            if (!date) {
                              return (
                                <div
                                  key={`empty-${weekIndex}-${dayIndex}`}
                                  className="h-10"
                                />
                              );
                            }

                            const selected = isSameDay(date, taskDate);
                            const today = isToday(date);

                            let classes =
                              "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-colors duration-150 text-gray-600 dark:text-gray-200 hover:bg-primary/10 hover:text-primary";

                            if (selected) {
                              classes +=
                                " border-2 border-primary bg-primary/15 text-primary shadow-sm";
                            } else if (today) {
                              classes += " border border-primary/60 text-primary";
                            }

                            return (
                              <button
                                key={date.toISOString()}
                                type="button"
                                onClick={() => handleDaySelect(date)}
                                className={classes}
                              >
                                {date.getDate()}
                              </button>
                            );
                          })
                        )}
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleDaySelect(new Date())}
                          className="border-2 border-primary text-primary hover:bg-primary/10 dark:border-primary/80 dark:text-primary dark:hover:bg-primary/15"
                        >
                          Today
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Category Selection */}
            <motion.div variants={itemVariants} className="space-y-3">
              <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category
              </label>

              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="border-2 border-gray-300 focus:border-primary/70 font-extrabold dark:border-gray-600 dark:focus:border-primary/80 dark:bg-gray-800 dark:text-gray-100 rounded-xl py-3">
                  <SelectValue placeholder="Choose a category (optional)" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  {customTags.map((tag) => (
                    <SelectItem
                      key={tag.id}
                      value={tag.id}
                      className="rounded-lg hover:bg-primary/10 focus:bg-primary/10 dark:hover:bg-primary/15 dark:text-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                          whileHover={{ scale: 1.2 }}
                        />
                        <span className=" font-extrabold">{tag.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  variant="outline"
                  onClick={() => setShowAddTag(!showAddTag)}
                  className="w-full border-2 border-gray-300 font-extrabold text-gray-700 hover:text-primary hover:border-primary hover:bg-primary/10 dark:border-gray-600 dark:text-gray-100 dark:hover:text-primary dark:hover:border-primary/80 dark:hover:bg-primary/15 rounded-xl py-3 transition-colors"
                >
                  <motion.div
                    animate={{ rotate: showAddTag ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus className="h-4 w-4" />
                  </motion.div>
                  {showAddTag ? "Cancel" : "Create New Category"}
                </Button>
              </motion.div>
            </motion.div>

            {/* Add New Category Form */}
            <AnimatePresence>
              {showAddTag && (
                <motion.div
                  variants={tagFormVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4 p-5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/80"
                >
                  <motion.div variants={itemVariants}>
                    <Input
                      placeholder="Category name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      className="border-2 border-gray-300 font-extrabold focus:border-primary/70 dark:border-gray-600 dark:focus:border-primary/80 dark:text-gray-100 rounded-xl bg-white dark:bg-gray-700 py-3"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-4">
                    <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Choose Color
                    </label>
                    <motion.div
                      className="flex gap-3 flex-wrap justify-center"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.04,
                          },
                        },
                      }}
                    >
                      {PRESET_COLORS.map((color, index) => (
                        <motion.button
                          key={color}
                          variants={colorButtonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => setSelectedColor(color)}
                          className={`w-11 h-11 rounded-full border-3 transition-all duration-200 relative overflow-hidden ${
                            selectedColor === color
                              ? "border-gray-900 dark:border-gray-100 shadow-lg ring-2 ring-primary/50"
                              : "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: color }}
                          custom={index}
                        >
                          {selectedColor === color && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-full h-full rounded-full flex items-center justify-center bg-black/20 dark:bg-white/20 backdrop-blur-sm"
                            >
                              <Check className="h-4 w-4 text-white drop-shadow-sm" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Button
                        onClick={handleAddTag}
                        className="w-full rounded-xl font-extrabold py-3"
                        disabled={!newTagName.trim()}
                      >
                        Create Category
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex gap-3 pt-4">
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  onClick={handleSubmit}
                  className="w-full rounded-xl font-extrabold text-lg py-6 shadow-lg"
                  disabled={!taskTitle.trim()}
                >
                  <motion.div
                    animate={taskTitle.trim() ? { scale: [1, 1.05, 1] } : {}}
                    transition={{
                      duration: 0.4,
                      repeat: taskTitle.trim() ? Infinity : 0,
                      repeatDelay: 2,
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Add Task
                  </motion.div>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-6 py-6 rounded-xl font-bold border-2 border-gray-300 text-gray-700 hover:text-primary hover:border-primary hover:bg-primary/10 dark:border-gray-600 dark:text-gray-100 dark:hover:text-primary dark:hover:border-primary/80 dark:hover:bg-primary/15 transition-colors"
                >
                  Cancel
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
