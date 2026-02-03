'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/lib/types';
import { toggleComplete } from '@/lib/api';
import CategoryBadge from './CategoryBadge';
import PriorityBadge from './PriorityBadge';
import DueDateBadge from './DueDateBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckIcon,
  PencilSquareIcon,
  TrashIcon,
  ClockIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { cn} from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onToggle: (updatedTask: Task) => void;
  onDelete: (taskId: number) => void;
  onEdit: (task: Task) => void;
}

export default function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);

    try {
      const updatedTask = await toggleComplete(task.id);
      onToggle(updatedTask);
      toast.success(updatedTask.completed ? 'Task completed!' : 'Task reopened');
    } catch (err) {
      toast.error('Failed to toggle task');
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      onDelete(task.id);
    } catch (err) {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="group"
      >
        <Card className={cn(
          "p-4 transition-all duration-200 border-l-4",
          task.completed
            ? "bg-muted/40 border-l-green-500/50 opacity-75"
            : "bg-card border-l-primary hover:shadow-lg hover:border-l-primary/80"
        )}>
          <div className="flex items-start gap-4">
            {/* Checkbox */}
            <button
              onClick={handleToggle}
              disabled={isToggling}
              className={cn(
                "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                task.completed
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-muted-foreground/30 hover:border-primary text-transparent"
              )}
            >
              <CheckIcon className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className={cn(
                  "font-semibold text-base leading-none transition-colors",
                  task.completed ? "text-muted-foreground line-through decoration-muted-foreground/50" : "text-foreground"
                )}>
                  {task.title}
                </h3>

                {/* Actions (visible on hover or focus) */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                    onClick={() => onEdit(task)}
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {task.description && (
                <p className={cn(
                  "text-sm line-clamp-2",
                  task.completed ? "text-muted-foreground/80" : "text-muted-foreground"
                )}>
                  {task.description}
                </p>
              )}

              {/* Meta & Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex flex-wrap gap-2">
                  {task.priority && <PriorityBadge priority={task.priority} />}
                  {task.category && <CategoryBadge category={task.category} />}
                  {task.due_date && <DueDateBadge dueDate={task.due_date} completed={task.completed} />}
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm"
            >
              <Card className="p-6 space-y-4 shadow-2xl border-destructive/20">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 rounded-full bg-destructive/10 text-destructive">
                    <TrashIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold">Delete Task</h3>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete <span className="font-medium text-foreground">&quot;{task.title}&quot;</span>? This action cannot be undone.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : "Delete"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
