import { Select as BaseSelect } from '@base-ui/react/select';
import { ChevronDown } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  /** Non-selectable option (e.g. an integration that is not connected). */
  disabled?: boolean;
  /** Optional secondary line under the label (e.g. disambiguating copy). */
  description?: string;
}

/** A labelled group of options; an empty `label` renders no header. */
export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

/**
 * Select size types, mirroring Input/TextField so the two line up in a row.
 * - desktop: fixed `h-12` (matches the default Input)
 * - mobile: fixed `h-10` (matches the `mobile` Input)
 */
export type SelectSize = 'desktop' | 'mobile';

export interface SelectProps {
  /** Currently selected value (controlled) */
  value: string | null;
  /** Callback when a new value is chosen */
  onValueChange: (value: string) => void;
  /** Options to render in the dropdown (flat). Ignored when `groups` is set. */
  options?: SelectOption[];
  /**
   * Optional grouped options: non-selectable headers with separators between
   * groups. When set, it replaces the flat `options` list in the popup (the
   * flattened options still resolve the trigger value).
   */
  groups?: SelectOptionGroup[];
  /** Prefix shown inside the trigger before the value, as "label: value" */
  label?: string;
  /** Placeholder shown when no value is selected */
  placeholder?: string;
  /** Accessible label for the trigger (defaults to `label`) */
  ariaLabel?: string;
  /** Size variant; matches Input/TextField heights (default desktop) */
  size?: SelectSize;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Additional className for the trigger pill */
  className?: string;
  /** Additional className for the popup */
  popupClassName?: string;
}

/** Fixed-height trigger styles per size, aligned with Input/TextField. */
const triggerSizeStyles: Record<SelectSize, string> = {
  desktop: 'h-12 px-4',
  mobile: 'h-10 px-3',
};

/**
 * Select - Shared dropdown built on Base UI Select.
 *
 * Renders a "pill" trigger ("label: value" + ChevronDown) and a popup list,
 * styled to match the rest of the admin (see Statistics YearSelector). Use it
 * for filter pills, scope pickers and any single-choice dropdown.
 *
 * @example
 * <Select
 *   label="Severidad"
 *   value={severity}
 *   onValueChange={setSeverity}
 *   options={[{ value: 'all', label: 'Todas' }, { value: 'high', label: 'Alta' }]}
 * />
 */
export const Select = ({
  value,
  onValueChange,
  options,
  groups,
  label,
  placeholder,
  ariaLabel,
  size = 'desktop',
  disabled = false,
  className,
  popupClassName,
}: SelectProps): ReactNode => {
  const handleValueChange = (next: string | null): void => {
    if (next !== null) onValueChange(next);
  };

  // Base UI resolves the trigger value from `items`, so it needs the full flat
  // list even when the popup renders grouped.
  const flatOptions = groups
    ? groups.flatMap((group) => group.options)
    : (options ?? []);

  const renderItem = (option: SelectOption): ReactNode => (
    <BaseSelect.Item
      key={option.value}
      value={option.value}
      disabled={option.disabled}
      className={cn(
        'flex flex-col items-start',
        'rounded-lg px-3 py-2',
        // 44px-tall options on touch devices (WCAG target size); compact on
        // pointer devices.
        'pointer-coarse:min-h-11',
        'text-sm font-medium text-neutral-900',
        'cursor-pointer outline-none transition-colors duration-150',
        'data-highlighted:bg-neutral-100',
        'data-selected:bg-indigo-50',
        'data-disabled:cursor-not-allowed data-disabled:text-neutral-400'
      )}
    >
      <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
      {option.description && (
        <span className="text-xs font-normal text-neutral-500">
          {option.description}
        </span>
      )}
    </BaseSelect.Item>
  );

  return (
    <BaseSelect.Root
      items={flatOptions}
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <BaseSelect.Trigger
        aria-label={ariaLabel ?? label}
        className={cn(
          'flex items-center gap-2',
          'rounded-lg border border-neutral-200',
          triggerSizeStyles[size],
          'bg-white text-sm font-medium text-neutral-900',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'cursor-pointer',
          className
        )}
      >
        {label && (
          <span className="shrink-0 text-neutral-500">{label}:</span>
        )}
        {/* min-w-0 + truncate: the value keeps a single line and clips a long
            option (e.g. a 60-char tracker name) with an ellipsis instead of
            wrapping and doubling the trigger height (UI-0019). */}
        <BaseSelect.Value
          placeholder={placeholder}
          className="min-w-0 truncate text-left"
        />
        <BaseSelect.Icon className="ml-auto shrink-0">
          <ChevronDown className="size-4 text-neutral-500" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>

      <BaseSelect.Portal>
        <BaseSelect.Positioner
          className="z-50"
          sideOffset={4}
          alignItemWithTrigger={false}
          collisionAvoidance={{ side: 'flip', align: 'shift' }}
          collisionPadding={16}
        >
          <BaseSelect.Popup
            className={cn(
              'min-w-[var(--anchor-width)] max-w-72 p-2',
              'rounded-lg border border-neutral-200 bg-white shadow-md',
              popupClassName
            )}
          >
            <BaseSelect.List>
              {groups
                ? groups.map((group, index) => (
                    <BaseSelect.Group key={group.label || `group-${index}`}>
                      {index > 0 && (
                        <div
                          role="separator"
                          className="my-1 h-px bg-neutral-100"
                        />
                      )}
                      {group.label && (
                        <BaseSelect.GroupLabel className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                          {group.label}
                        </BaseSelect.GroupLabel>
                      )}
                      {group.options.map(renderItem)}
                    </BaseSelect.Group>
                  ))
                : (options ?? []).map(renderItem)}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
};

Select.displayName = 'Select';
