import { Button as BaseButton } from '@base-ui/react/button';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Button variant types
 * - primary: Main action button with filled background
 * - secondary: Secondary action with border
 * - tertiary: Text-only button, often used for less prominent actions
 * - danger: Destructive action button
 */
type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';

/**
 * Button size types
 * - desktop: Larger padding and text for desktop layouts
 * - mobile: Compact padding for mobile layouts
 */
type ButtonSize = 'desktop' | 'mobile';

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  /** The visual style variant of the button */
  variant?: ButtonVariant;
  /** The size of the button */
  size?: ButtonSize;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Icon to display on the left side of the button text */
  leftIcon?: ReactNode;
  /** Icon to display on the right side of the button text */
  rightIcon?: ReactNode;
  /** Whether the button only contains an icon (no text) */
  iconOnly?: boolean;
  /** Button content */
  children?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-indigo-700 text-white',
    'hover:bg-indigo-800',
    'active:bg-indigo-800',
    'disabled:bg-neutral-200 disabled:text-neutral-500'
  ),
  secondary: cn(
    'bg-white text-neutral-700 border border-neutral-200',
    'hover:border-neutral-300 hover:bg-neutral-50',
    'active:bg-neutral-100',
    'disabled:bg-neutral-50 disabled:text-neutral-400 disabled:border-neutral-200'
  ),
  tertiary: cn(
    'bg-transparent text-indigo-700',
    'hover:bg-indigo-50',
    'active:bg-indigo-100',
    'disabled:text-neutral-400 disabled:bg-transparent'
  ),
  danger: cn(
    'bg-rose-50 text-red-700',
    'hover:bg-rose-100',
    'active:bg-rose-100',
    'disabled:bg-neutral-50 disabled:text-neutral-400'
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  desktop: 'px-4 py-2 text-sm gap-2',
  mobile: 'px-3 py-2 text-xs gap-1.5',
};

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  desktop: 'p-1',
  mobile: 'p-0.5',
};

const iconOnlyStyles = cn(
  'bg-transparent border-none',
  'text-neutral-500',
  'hover:text-neutral-700',
  'active:text-neutral-800',
  'disabled:text-neutral-300'
);

/**
 * Button - Reusable button component with multiple variants and states
 *
 * @param {ButtonProps} props - Component props
 * @param {ButtonVariant} props.variant - Visual style (primary, secondary, tertiary, danger)
 * @param {ButtonSize} props.size - Size variant (desktop, mobile)
 * @param {boolean} props.loading - Shows loading spinner when true
 * @param {ReactNode} props.leftIcon - Icon displayed before text
 * @param {ReactNode} props.rightIcon - Icon displayed after text
 * @param {boolean} props.iconOnly - Renders as icon-only button
 * @param {ReactNode} props.children - Button content
 *
 * @example
 * // Primary button
 * <Button variant="primary">Save</Button>
 *
 * @example
 * // Button with icon
 * <Button leftIcon={<PlusIcon />}>Add item</Button>
 *
 * @example
 * // Loading button
 * <Button loading>Saving...</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'desktop',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      children,
      className,
      type = 'button',
      ...props
    },
    ref
  ): ReactNode => {
    const isDisabled = disabled || loading;

    return (
      <BaseButton
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-medium rounded-lg',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed',
          // Reserve a 1px border on every non-iconOnly variant so bordered
          // variants (secondary/danger) are not 2px taller than borderless
          // ones (primary/tertiary). Colored borders below override the color
          // via tailwind-merge (AL-0009).
          !iconOnly && 'border border-transparent',
          // Variant styles (skip for iconOnly)
          iconOnly ? iconOnlyStyles : variantStyles[variant],
          // Size styles
          iconOnly ? iconOnlySizeStyles[size] : sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {iconOnly ? (
              <span className="shrink-0" aria-hidden="true">
                {children}
              </span>
            ) : (
              children
            )}
            {rightIcon && (
              <span className="shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </BaseButton>
    );
  }
);

Button.displayName = 'Button';
