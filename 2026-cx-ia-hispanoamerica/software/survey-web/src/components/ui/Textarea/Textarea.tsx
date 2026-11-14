import { Field } from '@base-ui/react/field';
import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'children'
> {
  /** Label text displayed above the textarea */
  label?: string;
  /** Helper text displayed below the textarea */
  helper?: string;
  /** Whether to show character counter */
  showCounter?: boolean;
  /** Whether the field is in error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Additional className for the container */
  className?: string;
}

/**
 * Textarea - Multi-line text input component
 *
 * Uses Base UI Field with custom textarea styling.
 * Supports label, helper text, character counter, and error states.
 *
 * @param {TextareaProps} props - Component props
 * @param {string} props.label - Label text
 * @param {string} props.helper - Helper text below label
 * @param {boolean} props.showCounter - Whether to show character counter
 * @param {boolean} props.error - Whether field is in error state
 * @param {string} props.errorMessage - Error message to display
 *
 * @example
 * // Basic textarea
 * <Textarea label="Description" placeholder="Enter description..." />
 *
 * @example
 * // With counter
 * <Textarea
 *   label="Bio"
 *   showCounter
 *   maxLength={160}
 *   value={bio}
 *   onChange={(e) => setBio(e.target.value)}
 * />
 *
 * @example
 * // With error
 * <Textarea
 *   label="Message"
 *   error
 *   errorMessage="Message is required"
 * />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helper,
      showCounter = false,
      error = false,
      errorMessage,
      className,
      disabled = false,
      maxLength,
      value,
      rows = 4,
      ...props
    },
    ref
  ): ReactNode => {
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <Field.Root className={cn('flex flex-col gap-2', className)}>
        {label && (
          <Field.Label className="text-sm font-medium text-neutral-900">
            {label}
          </Field.Label>
        )}

        <textarea
          ref={ref}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          rows={rows}
          className={cn(
            // Base styles
            'w-full',
            'px-3 py-3',
            'text-base text-neutral-900',
            'placeholder:text-neutral-400',
            'rounded-lg',
            'border',
            'resize-none',
            'transition-colors duration-150',
            // Match Input/TextField: focus shows only a border-color change, no
            // ring (the app-wide field pattern is ring-less) (UI-0013).
            'focus:outline-none',
            // Default state
            !error && 'border-neutral-200 bg-white',
            !error && 'focus:border-indigo-700',
            // Error state
            error && 'border-red-600 bg-white',
            error && 'focus:border-red-600',
            // Disabled state
            'disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed'
          )}
          {...props}
        />

        {/* Supporting row: helper/error + counter */}
        {(helper || errorMessage || showCounter) && (
          <div className="flex items-center justify-between px-0">
            <div>
              {error && errorMessage ? (
                <span className="text-xs text-red-600">{errorMessage}</span>
              ) : helper ? (
                <Field.Description className="text-xs text-neutral-500">
                  {helper}
                </Field.Description>
              ) : null}
            </div>

            {showCounter && maxLength && (
              <span className="text-xs text-neutral-400">
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
      </Field.Root>
    );
  }
);

Textarea.displayName = 'Textarea';
