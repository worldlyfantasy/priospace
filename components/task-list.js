"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Check,
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react";
import { formatFocusTime } from "@/utils/time";

export function TaskList({
  tasks,
  customTags,
  onToggleTask,
  onDeleteTask,
  onTaskClick,
  onAddSubtask,
}) {
  const [holdingTask, setHoldingTask] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  // Use simple object instead of Set for better state management
  const [expandedTasks, setExpandedTasks] = useState({});

  // Audio refs for sound effects
  const holdAudioRef = useRef(null);
  const completeAudioRef = useRef(null);

  // Initialize audio elements
  if (typeof window !== "undefined") {
    if (!holdAudioRef.current) {
      holdAudioRef.current = new Audio("/music/hold.mp3");
      holdAudioRef.current.volume = 0.5;
    }
    if (!completeAudioRef.current) {
      completeAudioRef.current = new Audio("/music/complete.mp3");
      completeAudioRef.current.volume = 0.3;
    }
  }

  const playHoldSound = () => {
    if (holdAudioRef.current) {
      holdAudioRef.current.currentTime = 0;
      holdAudioRef.current
        .play()
        .catch((e) => console.log("Hold sound play failed:", e));
    }
  };

  const stopHoldSound = () => {
    if (holdAudioRef.current) {
      holdAudioRef.current.pause();
      holdAudioRef.current.currentTime = 0;
    }
  };

  const playCompleteSound = () => {
    if (completeAudioRef.current) {
      completeAudioRef.current.currentTime = 0;
      completeAudioRef.current
        .play()
        .catch((e) => console.log("Complete sound play failed:", e));
    }
  };

  const handleMouseDown = (taskId, event) => {
    event.preventDefault();
    event.stopPropagation();
    const task = findTaskById(taskId);
    if (task?.completed) return;

    setHoldingTask(taskId);
    playHoldSound();

    let progress = 0;
    let holdCompleted = false;
    let animationFrameId;

    const animateProgress = () => {
      progress += 2;
      setHoldProgress(progress);
      if (progress >= 100) {
        cancelAnimationFrame(animationFrameId);
        holdCompleted = true;
        stopHoldSound();
        playCompleteSound();
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
      stopHoldSound();
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

  const toggleExpanded = (taskId, event) => {
    event.stopPropagation();
    event.preventDefault();

    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleAddSubtask = (taskId, event) => {
    event.stopPropagation();
    onAddSubtask(taskId);
  };

  const findTaskById = (taskId) => {
    for (const task of tasks) {
      if (task.id === taskId) return task;
      if (task.subtasks) {
        for (const subtask of task.subtasks) {
          if (subtask.id === taskId) return subtask;
        }
      }
    }
    return null;
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

  // Calculate total time including subtasks
  const getTotalTime = (task) => {
    const subtaskTime = (task.subtasks || []).reduce(
      (sum, subtask) => sum + (subtask.timeSpent || 0),
      0
    );
    return (task.timeSpent || 0) + subtaskTime;
  };

  const getTotalFocusTime = (task) => {
    const subtaskFocusTime = (task.subtasks || []).reduce(
      (sum, subtask) => sum + (subtask.focusTime || 0),
      0
    );
    return (task.focusTime || 0) + subtaskFocusTime;
  };

  // Filter main tasks
  const mainTasks = tasks.filter((task) => !task.parentTaskId);
  const regularTasks = mainTasks.filter((task) => !task.isHabit);
  const habitTasks = mainTasks.filter((task) => task.isHabit);

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
    <div className="h-full overflow-y-auto hide-scroll overflow-x-hidden p-4 px-0">
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
              <RotateCcw className="h-4 w-4" /> Habits
            </motion.div>
            <motion.div
              className=""
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
                  onToggleExpanded={toggleExpanded}
                  onAddSubtask={handleAddSubtask}
                  formatTime={formatTime}
                  getTagInfo={getTagInfo}
                  getTotalTime={getTotalTime}
                  getTotalFocusTime={getTotalFocusTime}
                  isHabit={true}
                  variants={taskVariants}
                  isLastTask={task.id === habitTasks[habitTasks.length - 1].id}
                  isExpanded={expandedTasks[task.id] || false}
                  expandedTasks={expandedTasks}
                  level={0}
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
              className=""
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {regularTasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  holdingTask={holdingTask}
                  holdProgress={holdProgress}
                  onMouseDown={handleMouseDown}
                  onTaskClick={handleTaskClick}
                  onToggleExpanded={toggleExpanded}
                  onAddSubtask={handleAddSubtask}
                  formatTime={formatTime}
                  getTagInfo={getTagInfo}
                  getTotalTime={getTotalTime}
                  getTotalFocusTime={getTotalFocusTime}
                  isHabit={false}
                  variants={taskVariants}
                  isLastTask={index === regularTasks.length - 1}
                  isExpanded={expandedTasks[task.id] || false}
                  expandedTasks={expandedTasks}
                  level={0}
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
  onToggleExpanded,
  onAddSubtask,
  formatTime,
  getTagInfo,
  getTotalTime,
  getTotalFocusTime,
  isHabit,
  variants,
  isLastTask,
  isExpanded,
  expandedTasks,
  level = 0,
  isSubtask = false,
}) {
  const tagInfo = getTagInfo(task.tag);
  const subtasks = task.subtasks || [];
  const hasSubtasks = subtasks.length > 0;
  const completedSubtasks = hasSubtasks
    ? subtasks.filter((st) => st && st.completed).length
    : 0;

  // Use individual task time for subtasks, total time for main tasks
  const displayTimeSpent = isSubtask ? task.timeSpent || 0 : getTotalTime(task);
  const displayFocusTime = isSubtask
    ? task.focusTime || 0
    : getTotalFocusTime(task);

  const paddingLeft = level * 20;

  return (
    <>
      <motion.div
        variants={variants}
        layout
        className={`group relative border-t border-dashed cursor-pointer select-none overflow-hidden ${
          task.completed
            ? ""
            : "border-primary/50 dark:border-primary-700 hover:bg-primary/5"
        } 
        ${isLastTask && (!hasSubtasks || !isExpanded) ? "border-b" : ""}`}
        style={{ paddingLeft: `${paddingLeft}px` }}
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

        <div className="flex items-center justify-between relative z-10 p-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Expand/Collapse button for main tasks with subtasks */}
            {hasSubtasks && !isSubtask && (
              <motion.button
                onClick={(e) => onToggleExpanded(task.id, e)}
                className="flex-shrink-0 p-1.5 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <ChevronRight className="h-4 w-4 text-primary dark:text-primary" />
                </motion.div>
              </motion.button>
            )}

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

                {/* Subtask progress indicator */}
                {hasSubtasks && !isSubtask && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      completedSubtasks === subtasks.length
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        : "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary"
                    }`}
                  >
                    {completedSubtasks}/{subtasks.length}
                  </motion.div>
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

              {(displayTimeSpent > 0 || displayFocusTime > 0) && (
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {displayTimeSpent > 0 && (
                    <div className="flex items-center gap-1 font-extrabold opacity-80">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(displayTimeSpent)}</span>
                    </div>
                  )}
                  {displayFocusTime > 0 && (
                    <div className="flex items-center gap-1 font-extrabold opacity-80">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-blue-600 dark:text-blue-400">
                        {formatFocusTime(displayFocusTime)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Add Subtask Button - only for main tasks, not habits */}
          {!isHabit && !isSubtask && (
            <motion.button
              onClick={(e) => onAddSubtask(task.id, e)}
              className="flex-shrink-0 p-2 opacity-0 group-hover:opacity-100 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-all duration-200 mr-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Add subtask"
            >
              <Plus className="h-4 w-4 text-primary dark:text-primary" />
            </motion.button>
          )}

          {/* Completion Animation */}
          {task.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center z-20"
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
        </div>
      </motion.div>

      {/* Render subtasks immediately without any animation */}
      {hasSubtasks && isExpanded && (
        <div>
          {subtasks.map((subtask, subIndex) => (
            <TaskItem
              key={subtask.id}
              task={subtask}
              holdingTask={holdingTask}
              holdProgress={holdProgress}
              onMouseDown={onMouseDown}
              onTaskClick={onTaskClick}
              onToggleExpanded={onToggleExpanded}
              onAddSubtask={onAddSubtask}
              formatTime={formatTime}
              getTagInfo={getTagInfo}
              getTotalTime={getTotalTime}
              getTotalFocusTime={getTotalFocusTime}
              isHabit={false}
              variants={variants}
              isLastTask={subIndex === subtasks.length - 1 && isLastTask}
              isExpanded={false}
              expandedTasks={expandedTasks}
              level={level + 1}
              isSubtask={true}
            />
          ))}
        </div>
      )}
    </>
  );
}
