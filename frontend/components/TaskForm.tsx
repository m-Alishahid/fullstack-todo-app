'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import CategorySelector from './CategorySelector';
import PrioritySelector from './PrioritySelector';
import DatePicker from './DatePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface TaskFormProps {
  onSubmit: (title: string, description: string, category?: string | null, priority?: string, dueDate?: Date | null) => Promise<void>;
  initialTitle?: string;
  initialDescription?: string;
  initialCategory?: string | null;
  initialPriority?: string | null;
  initialDueDate?: string | null;
  submitLabel?: string;
  onCancel?: () => void;
}

interface FormData {
  title: string;
  description: string;
}

interface ValidationErrors {
  title?: string;
  description?: string;
}

export default function TaskForm({
  onSubmit,
  initialTitle = '',
  initialDescription = '',
  initialCategory = null,
  initialPriority = null,
  initialDueDate = null,
  submitLabel = 'Create Task',
  onCancel,
}: TaskFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: initialTitle,
    description: initialDescription,
  });

  const [category, setCategory] = useState<string | null>(initialCategory);
  const [priority, setPriority] = useState<string>(initialPriority || 'medium');
  const [dueDate, setDueDate] = useState<Date | null>(
    initialDueDate ? new Date(initialDueDate) : null
  );

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [error, setError] = useState<string>('');

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      errors.title = 'Title must not exceed 200 characters';
    }
    if (formData.description.length > 1000) {
      errors.description = 'Description must not exceed 1000 characters';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData.title.trim(), formData.description.trim(), category, priority, dueDate);
      if (!initialTitle && !initialDescription) {
        setFormData({ title: '', description: '' });
        setCategory(null);
        setPriority('medium');
        setDueDate(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="What needs to be done?"
            disabled={loading}
            className={cn(validationErrors.title && "border-destructive focus-visible:ring-destructive")}
          />
          {validationErrors.title && (
            <p className="text-xs text-destructive font-medium">{validationErrors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add details..."
            rows={3}
            disabled={loading}
            className={cn("resize-none", validationErrors.description && "border-destructive focus-visible:ring-destructive")}
          />
          {validationErrors.description && (
            <p className="text-xs text-destructive font-medium">{validationErrors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* We keep existing components but wrap them to align with Label style if possible, 
               or just let them be self-contained as they handle their own labels in the current code */}
          <div className="space-y-2">
            <PrioritySelector value={priority} onChange={setPriority} />
          </div>
          <div className="space-y-2">
            <CategorySelector value={category} onChange={setCategory} />
          </div>
        </div>

        <div className="space-y-2">
          <DatePicker value={dueDate} onChange={setDueDate} />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading} className="min-w-[120px]">
          {loading ? (
            <>
              <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
