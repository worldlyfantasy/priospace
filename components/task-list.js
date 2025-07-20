"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Check, Clock, RefreshCcw } from "lucide-react";
import { formatFocusTime } from "@/utils/time"; // Assuming this utility exists

export function TaskList({
  tasks,
  customTags,
  onToggleTask,
  onDeleteTask, // onDeleteTask is not used in the current render logic
  onTaskClick,
}) {
  const [holdingTask, setHoldingTask] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);

  const handleMouseDown = (taskId, event) => {
    event.preventDefault();
    const task = tasks.find((t) => t.id === taskId);
    if (task?.completed) return;

    setHoldingTask(taskId);
    let progress = 0;
    let holdCompleted = false;
    let animationFrameId;

    const animateProgress = () => {
      progress += 2;
      setHoldProgress(progress);
      if (progress >= 100) {
        cancelAnimationFrame(animationFrameId);
        holdCompleted = true;
        onToggleTask(taskId);
        setHoldingTask(null);
        setHoldProgress(0);
      } else {
        animationFrameId = requestAnimationFrame(animateProgress);
      }
    };

    animationFrameId = requestAnimationFrame(animateProgress);

    const cleanup = () => {
      cancelAnimationFrame(animationFrameId);
      setHoldingTask(null);
      setHoldProgress(0);
      event.target.holdCompleted = holdCompleted;
    };

    const handleMouseUp = () => {
      cleanup();
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp);
  };

  const handleTaskClick = (task, event) => {
    if (holdingTask) return;
    const holdCompleted = event.target.holdCompleted;
    if (holdCompleted) {
      event.target.holdCompleted = false;
      return;
    }
    onTaskClick(task);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTagInfo = (tagId) => {
    return customTags.find((tag) => tag.id === tagId);
  };

  const regularTasks = tasks.filter((task) => !task.isHabit);
  const habitTasks = tasks.filter((task) => task.isHabit);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.15,
      },
    },
  };

  const taskVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: -30,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  // Header animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden p-4 px-0">
      <AnimatePresence>
        {/* Habits Section */}
        {habitTasks.length > 0 && (
          <motion.div
            key="habits-section"
            className="mb-6 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="text-sm text-primary font-extrabold uppercase tracking-wide mb-3 flex items-center gap-2"
              variants={headerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <RefreshCcw className="h-4 w-4" /> Habits
            </motion.div>
            <motion.div
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {habitTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  holdingTask={holdingTask}
                  holdProgress={holdProgress}
                  onMouseDown={handleMouseDown}
                  onTaskClick={handleTaskClick}
                  formatTime={formatTime}
                  getTagInfo={getTagInfo}
                  isHabit={true}
                  variants={taskVariants}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Regular Tasks Section */}
        {regularTasks.length > 0 && (
          <motion.div
            key="tasks-section"
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="text-sm text-primary font-extrabold uppercase tracking-wide mb-3 flex items-center gap-2"
              variants={headerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Calendar className="h-4 w-4" /> Tasks
            </motion.div>
            <motion.div
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {regularTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  holdingTask={holdingTask}
                  holdProgress={holdProgress}
                  onMouseDown={handleMouseDown}
                  onTaskClick={handleTaskClick}
                  formatTime={formatTime}
                  getTagInfo={getTagInfo}
                  isHabit={false}
                  variants={taskVariants}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {tasks.length === 0 && (
          <motion.div
            key="no-tasks-message"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12 text-primary/60 font-bold"
          >
            <p>No tasks yet. Add one to get started!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskItem({
  task,
  holdingTask,
  holdProgress,
  onMouseDown,
  onTaskClick,
  formatTime,
  getTagInfo,
  isHabit,
  variants,
}) {
  const tagInfo = getTagInfo(task.tag);

  return (
    <motion.div
      variants={variants}
      layout
      className={`relative p-4 border-y border-dashed cursor-pointer select-none overflow-hidden ${
        task.completed
          ? ""
          : isHabit
          ? " dark:bg-gray-800 border-primary/50 dark:border-gray-700 hover:bg-primary/5"
          : " dark:bg-gray-800 border-primary/50 dark:border-gray-700 hover:bg-primary/5"
      }`}
      onMouseDown={(e) => onMouseDown(task.id, e)}
      onTouchStart={(e) => onMouseDown(task.id, e)}
      onClick={(e) => onTaskClick(task, e)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Hold Progress Bar */}
      {holdingTask === task.id && (
        <motion.div
          className="absolute inset-0 bg-primary/20"
          initial={{ width: 0 }}
          animate={{ width: `${holdProgress}%` }}
          transition={{ duration: 0.1 }}
          layout
        />
      )}

      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {tagInfo && (
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tagInfo.color }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">
                  {tagInfo.name}
                </span>
              </div>
            )}
          </div>

          <motion.span
            animate={{
              scale: holdingTask === task.id ? 0.98 : 1,
              opacity: task.completed ? 0.7 : 1,
            }}
            className={`block font-extrabold text-lg ${
              task.completed
                ? "line-through text-gray-600 dark:text-gray-100"
                : "text-gray-600 dark:text-gray-100"
            }`}
          >
            {task.title}
          </motion.span>

          {(task.timeSpent > 0 || task.focusTime > 0) && (
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
              {task.timeSpent > 0 && (
                <div className="flex items-center gap-1 font-extrabold opacity-80">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(task.timeSpent)}</span>
                </div>
              )}
              {task.focusTime > 0 && (
                <div className="flex items-center gap-1 font-extrabold opacity-80">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-blue-600 dark:text-blue-400">
                    {formatFocusTime(task.focusTime)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Completion Animation */}
      {task.completed && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-5 top-7 w-6 h-6 bg-primary rounded-full flex items-center justify-center z-20"
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-background"
          >
            <Check className="h-3 w-3" />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
