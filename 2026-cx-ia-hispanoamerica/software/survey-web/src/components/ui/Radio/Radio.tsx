import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

export interface RadioGroupProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseRadioGroup>, 'render'> {
  className?: string;
}

/**
 * RadioGroup - Container providing shared selection state for Radio options.
 * Controlled via `value` + `onValueChange`; uncontrolled via `defaultValue`.
 *
 * @example
 * <RadioGroup value={severity} onValueChange={setSeverity}>
 *   <Radio value="high" label="Alta" leading={<SeverityDot severity="high" />} />
 *   <Radio value="medium" label="Media" leading={<SeverityDot severity="medium" />} />
 *   <Radio value="low" label="Baja" leading={<SeverityDot severity="low" />} />
 * </RadioGroup>
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, ...props }, ref): ReactNode => (
    <BaseRadioGroup
      ref={ref}
      className={cn('flex flex-col gap-3', className)}
      {...props}
    />
  )
);

RadioGroup.displayName = 'RadioGroup';

export interface RadioProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseRadio.Root>, 'render'> {
  /** Label text displayed next to the radio. Omit for a bare control. */
  label?: ReactNode;
  /** Helper text displayed below the label */
  helper?: string;
  /** Optional element rendered before the label (e.g. a colored severity dot) */
  leading?: ReactNode;
  /** Additional className for the wrapper */
  className?: string;
}

/**
 * Radio - A single radio option. Borderless by design (control + label only),
 * matching the "Severidad" picker spec. Wrapped in a `<label>` so the text
 * selects it.
 */
export const Radio = forwardRef<HTMLButtonElement, RadioProps>(
  ({ label, helper, leading, className, ...props }, ref): ReactNode => {
    const labelId = useId();
    const control = (
      <BaseRadio.Root
        aria-labelledby={label !== undefined ? labelId : undefined}
        ref={ref}
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border bg-white',
          'border-neutral-300 transition-colors duration-150',
          'data-[checked]:border-indigo-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'cursor-pointer'
        )}
        {...props}
      >
        <BaseRadio.Indicator className="size-2.5 rounded-full bg-indigo-700" />
      </BaseRadio.Root>
    );

    if (label === undefined) {
      return <div className={className}>{control}</div>;
    }

    return (
      <label className={cn('flex cursor-pointer items-start gap-2', className)}>
        {control}
        <span className="flex flex-col gap-0.5">
          <span id={labelId} className="flex items-center gap-2 text-sm font-normal text-neutral-900">
            {leading}
            {label}
          </span>
          {helper && (
            <span className="text-xs font-normal text-neutral-500">{helper}</span>
          )}
        </span>
      </label>
    );
  }
);

Radio.displayName = 'Radio';
