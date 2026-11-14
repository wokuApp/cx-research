import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { Check } from 'lucide-react';
import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseCheckbox.Root>, 'render'> {
  /** Label text displayed next to the checkbox */
  label?: ReactNode;
  /** Helper text displayed below the label */
  helper?: string;
  /** Additional className for the wrapper */
  className?: string;
}

/**
 * Checkbox - Base UI checkbox with optional label and helper text.
 *
 * Box: size-5 rounded border. OFF: white + neutral border. ON: indigo-700 fill
 * with a white check. Wrapped in a `<label>` so the text toggles it.
 *
 * @example
 * <Checkbox label="Crear si la IA detecta sentimiento negativo" />
 *
 * @example
 * <Checkbox
 *   label="Crear si el cliente es detractor"
 *   helper="NPS entre 0 y 6"
 *   checked={value}
 *   onCheckedChange={setValue}
 * />
 */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ label, helper, className, ...props }, ref): ReactNode => {
    const labelId = useId();
    const box = (
      <BaseCheckbox.Root
        aria-labelledby={label !== undefined ? labelId : undefined}
        ref={ref}
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded border bg-white',
          'border-neutral-300 transition-colors duration-150',
          'data-[checked]:border-indigo-700 data-[checked]:bg-indigo-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'cursor-pointer'
        )}
        {...props}
      >
        <BaseCheckbox.Indicator className="flex text-white">
          <Check className="size-3.5" strokeWidth={3} />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
    );

    if (label === undefined) {
      return <div className={className}>{box}</div>;
    }

    return (
      <label className={cn('flex cursor-pointer items-start gap-2', className)}>
        {box}
        <span className="flex flex-col gap-0.5">
          <span id={labelId} className="text-sm font-normal text-neutral-900">{label}</span>
          {helper && (
            <span className="text-xs font-normal text-neutral-500">{helper}</span>
          )}
        </span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
