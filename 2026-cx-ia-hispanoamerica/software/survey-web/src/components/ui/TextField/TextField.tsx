import { Field } from '@base-ui/react/field';
import { Input as BaseInput } from '@base-ui/react/input';
import { forwardRef, type ReactNode, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * TextField size types
 * - desktop: Larger height for desktop layouts
 * - mobile: Compact height for mobile layouts
 */
type TextFieldSize = 'desktop' | 'mobile';

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  /** Label text for the field */
  label?: string;
  /** Helper text displayed below the input */
  helper?: string;
  /** Error message displayed when field has error */
  errorMessage?: string;
  /** Whether to show character counter */
  showCounter?: boolean;
  /** Maximum character count for counter */
  maxLength?: number;
  /** Current character count (if not provided, uses value length) */
  currentLength?: number;
  /** The size of the input */
  size?: TextFieldSize;
  /** Whether the input has an error */
  error?: boolean;
}

const sizeStyles: Record<
  TextFieldSize,
  { wrapper: string; input: string; label: string }
> = {
  desktop: {
    wrapper: 'h-12 px-4',
    input: 'text-base leading-6',
    label: 'text-sm',
  },
  mobile: {
    wrapper: 'h-10 px-3',
    // 16px (text-base): below 16px iOS Safari auto-zooms on focus. Only the
    // native input needs it; the label can stay compact.
    input: 'text-base leading-5',
    label: 'text-xs',
  },
};

/**
 * TextField - Input component with label, helper text, and character counter
 *
 * Uses Base UI Field and Input with custom styling.
 *
 * @param {TextFieldProps} props - Component props
 * @param {string} props.label - Label text
 * @param {string} props.helper - Helper text below input
 * @param {string} props.errorMessage - Error message to display
 * @param {boolean} props.showCounter - Show character counter
 * @param {number} props.maxLength - Max characters for counter
 * @param {TextFieldSize} props.size - Size variant (desktop, mobile)
 * @param {boolean} props.error - Shows error state styling
 *
 * @example
 * // Basic usage
 * <TextField label="Name" placeholder="Enter name" />
 *
 * @example
 * // With counter
 * <TextField
 *   label="Description"
 *   showCounter
 *   maxLength={140}
 *   value={value}
 *   onChange={handleChange}
 * />
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      helper,
      errorMessage,
      showCounter = false,
      maxLength,
      currentLength,
      size = 'desktop',
      error = false,
      disabled = false,
      value,
      className,
      id,
      ...props
    },
    ref
  ): ReactNode => {
    const styles = sizeStyles[size];
    const hasError = error || !!errorMessage;

    // Calculate current length for counter
    const charCount =
      currentLength ?? (typeof value === 'string' ? value.length : 0);

    const getBorderColor = (): string => {
      if (hasError) return 'border-red-600 focus-within:border-red-600';
      return 'border-neutral-200 focus-within:border-indigo-700';
    };

    return (
      <Field.Root className={cn('flex flex-col gap-2 w-full', className)}>
        {label && (
          <Field.Label
            className={cn(
              'font-medium text-neutral-900 leading-5',
              styles.label
            )}
          >
            {label}
          </Field.Label>
        )}

        <div className="flex flex-col gap-1">
          <div
            className={cn(
              'flex items-center w-full',
              'bg-white border rounded-lg',
              'transition-colors duration-150',
              getBorderColor(),
              disabled && 'bg-neutral-50 cursor-not-allowed',
              styles.wrapper
            )}
          >
            <BaseInput
              ref={ref}
              id={id}
              disabled={disabled}
              value={value}
              maxLength={maxLength}
              className={cn(
                'flex-1 min-w-0',
                'bg-transparent border-none outline-none',
                'text-neutral-900 placeholder:text-neutral-400',
                'disabled:cursor-not-allowed disabled:text-neutral-500',
                styles.input
              )}
              {...props}
            />
          </div>

          {/* Supporting row: helper text and counter */}
          {(helper || showCounter || errorMessage) && (
            <div className="flex items-center justify-between text-xs">
              {/* Left side: helper or error message */}
              <span
                className={cn(
                  'leading-4',
                  hasError ? 'text-red-600' : 'text-neutral-400'
                )}
              >
                {errorMessage || helper || ''}
              </span>

              {/* Right side: counter */}
              {showCounter && maxLength && (
                <span className="text-neutral-400 leading-4">
                  {charCount}/{maxLength}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Hidden error for accessibility */}
        {hasError && errorMessage && (
          <Field.Error className="sr-only">{errorMessage}</Field.Error>
        )}
      </Field.Root>
    );
  }
);

TextField.displayName = 'TextField';
