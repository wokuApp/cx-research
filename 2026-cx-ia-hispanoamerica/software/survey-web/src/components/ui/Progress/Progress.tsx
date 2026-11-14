import { Progress as BaseProgress } from '@base-ui/react/progress';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps {
  /** Current progress value */
  value: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Accessible label for the progress bar */
  label?: string;
  /** Additional CSS classes for the root element */
  className?: string;
}

/**
 * Progress - Progress bar component using Base UI
 *
 * Displays a horizontal progress indicator with customizable value and max.
 * Track: h-3 rounded-full bg-neutral-50 with border.
 * Indicator: rounded-full bg-indigo-600.
 *
 * @example
 * <Progress value={60} />
 *
 * @example
 * <Progress value={1234} max={2000} label="Opinions collected" />
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, label, className }, ref): ReactNode => {
    const clampedValue = Math.min(Math.max(value, 0), max);

    return (
      <BaseProgress.Root
        ref={ref}
        value={clampedValue}
        max={max}
        aria-label={label}
        className={cn('w-full', className)}
      >
        <BaseProgress.Track
          className={cn(
            'h-3 w-full',
            'rounded-full',
            'bg-neutral-50',
            'border border-neutral-200',
            'overflow-hidden'
          )}
        >
          <BaseProgress.Indicator
            className={cn(
              'h-full',
              'rounded-full',
              'bg-indigo-600',
              'transition-[width] duration-300'
            )}
            style={{ width: `${(clampedValue / max) * 100}%` }}
          />
        </BaseProgress.Track>
      </BaseProgress.Root>
    );
  }
);

Progress.displayName = 'Progress';
