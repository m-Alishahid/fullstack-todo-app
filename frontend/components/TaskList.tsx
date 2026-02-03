'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/lib/types';
import TaskItem from './TaskItem';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CATEGORIES, CATEGORY_COLORS, PRIORITIES, PRIORITY_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  FunnelIcon,
  XMarkIcon,
  InboxIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

interface TaskListProps {
  tasks: Task[];
  searchQuery?: string;
  onTaskUpdate: (updatedTask: Task) => void;
  onTaskDelete: (taskId: number) => void;
  onTaskEdit: (task: Task) => void;
  isLoading?: boolean;
  error?: string | null;
}

type FilterType = 'all' | 'active' | 'completed';

export default function TaskList({
  tasks,
  searchQuery,
  onTaskUpdate,
  onTaskDelete,
  onTaskEdit,
  isLoading = false,
  error = null,
}: TaskListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Search
    if (searchQuery?.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      );
    }

    // Category
    if (categoryFilter) {
      result = result.filter(t => t.category === categoryFilter);
    }

    // Priority
    if (priorityFilter) {
      result = result.filter(t => t.priority === priorityFilter);
    }

    // Status
    if (filter === 'active') result = result.filter(t => !t.completed);
    if (filter === 'completed') result = result.filter(t => t.completed);

    // Sort
    return result.sort((a, b) => {
      // Overdue first
      const now = new Date();
      const aOverdie = !a.completed && a.due_date && new Date(a.due_date) < now;
      const bOverdue = !b.completed && b.due_date && new Date(b.due_date) < now;
      if (aOverdie && !bOverdue) return -1;
      if (!aOverdie && bOverdue) return 1;

      // Priority
      const pOrder = { high: 0, medium: 1, low: 2 };
      const aP = pOrder[a.priority as keyof typeof pOrder] ?? 1;
      const bP = pOrder[b.priority as keyof typeof pOrder] ?? 1;
      if (aP !== bP) return aP - bP;

      // Due date
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date) return -1;
      if (b.due_date) return 1;

      // Created At (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [tasks, filter, searchQuery, categoryFilter, priorityFilter]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="h-24 animate-pulse bg-muted/50" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-destructive/50 bg-destructive/5 text-center">
        <h3 className="text-lg font-semibold text-destructive">Failed to load tasks</h3>
        <p className="text-muted-foreground">{error}</p>
      </Card>
    );
  }

  const taskCounts = {
    all: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  };

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-1 rounded-lg border-none sm:border">
        <div className="flex p-1 bg-muted/50 rounded-lg w-full sm:w-auto">
          {(['all', 'active', 'completed'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                "flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                filter === type
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              <span className="ml-2 text-xs opacity-60">
                {taskCounts[type]}
              </span>
            </button>
          ))}
        </div>

        {/* Additional Filters Toggle could go here if we want to hide/show them */}
      </div>

      {/* Advanced Filters */}
      {(tasks.some(t => t.category) || tasks.some(t => t.priority)) && (
        <div className="flex flex-wrap gap-2 items-center text-sm">
          <span className="text-muted-foreground mr-2 flex items-center gap-1">
            <FunnelIcon className="w-4 h-4" /> Filter by:
          </span>

          {tasks.some(t => t.priority) && (
            <div className="flex flex-wrap gap-1">
              {PRIORITIES.map(pri => {
                const isActive = priorityFilter === pri.value;
                return (
                  <button
                    key={pri.value}
                    onClick={() => setPriorityFilter(isActive ? null : pri.value)}
                    className={cn(
                      "px-2 py-1 rounded-full border text-xs flex items-center gap-1 transition-colors",
                      isActive ? "bg-primary/10 border-primary text-primary" : "border-transparent bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    {pri.icon} {pri.label}
                  </button>
                )
              })}
            </div>
          )}

          <div className="w-px h-4 bg-border mx-1" />

          {tasks.some(t => t.category) && (
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map(cat => {
                const isActive = categoryFilter === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategoryFilter(isActive ? null : cat.value)}
                    className={cn(
                      "px-2 py-1 rounded-full border text-xs flex items-center gap-1 transition-colors",
                      isActive ? "bg-primary/10 border-primary text-primary" : "border-transparent bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    {cat.icon} {cat.label}
                  </button>
                )
              })}
            </div>
          )}

          {(categoryFilter || priorityFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setCategoryFilter(null); setPriorityFilter(null); }}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <XMarkIcon className="w-3 h-3 mr-1" /> Clear
            </Button>
          )}
        </div>
      )}

      {/* List */}
      <div className="space-y-4 min-h-[300px]">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onTaskUpdate}
                onDelete={onTaskDelete}
                onEdit={onTaskEdit}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                {filter === 'completed' ? (
                  <ClipboardDocumentCheckIcon className="w-12 h-12 text-muted-foreground/50" />
                ) : (
                  <InboxIcon className="w-12 h-12 text-muted-foreground/50" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-muted-foreground">No tasks found</h3>
              <p className="text-sm text-muted-foreground/60 max-w-sm mt-1">
                {searchQuery
                  ? `No matches for "${searchQuery}"`
                  : filter === 'completed'
                    ? "You haven't completed any tasks yet."
                    : "You have no tasks in this view."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
