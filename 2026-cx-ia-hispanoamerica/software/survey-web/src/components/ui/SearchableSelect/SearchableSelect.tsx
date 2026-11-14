import { Autocomplete } from '@base-ui/react/autocomplete';
import { Check, ChevronDown, Search } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { SelectOption } from '@/components/ui/Select';
import { filterOptions } from './filterOptions';

export interface SearchableSelectProps {
  /** Currently selected value (controlled) */
  value: string | null;
  /** Callback when a new value is chosen */
  onValueChange: (value: string) => void;
  /** Options to render in the dropdown */
  options: SelectOption[];
  /** Placeholder shown in the input when no value is selected */
  placeholder?: string;
  /** Placeholder shown while the popup is open and the input is cleared */
  searchPlaceholder?: string;
  /** Text shown when the query matches no option */
  emptyText?: string;
  /** Accessible label for the input */
  ariaLabel?: string;
  /** Whether the control is disabled */
  disabled?: boolean;
  /** Additional className for the input shell */
  className?: string;
}

/**
 * SearchableSelect - Single-choice dropdown with live text filtering.
 *
 * Same contract as the shared `Select` ({ value, onValueChange, options }) but
 * the trigger is a search input: typing filters the options in place. Use it
 * instead of `Select` whenever the option list can grow long (instrument
 * pickers, scope selectors). Built on Base UI Autocomplete; filtering is local
 * (no debounce) and mirrors the wokus home search.
 */
export const SearchableSelect = ({
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  ariaLabel,
  disabled = false,
  className,
}: SearchableSelectProps): ReactNode => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? '';

  // The input is the single source of truth (no `open ? query : label`
  // switch, which dropped the first keystroke). Keep `query` in sync with the
  // selected label whenever the selection changes from the outside.
  useEffect(() => {
    setQuery(selectedLabel);
  }, [selectedLabel]);

  // Show every option until the user actually edits the field; only then
  // filter. This keeps the full list visible right after focusing a field
  // that already has a selection.
  const isFiltering = query !== selectedLabel;
  const filtered = isFiltering ? filterOptions(options, query) : options;

  const handleSelect = (option: SelectOption): void => {
    onValueChange(option.value);
    setQuery(option.label);
    setOpen(false);
  };

  const placeholderText =
    open && !value ? (searchPlaceholder ?? placeholder) : placeholder;

  return (
    <Autocomplete.Root
      mode="none"
      items={filtered}
      value={query}
      onValueChange={setQuery}
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
    >
      <div
        className={cn(
          'relative flex items-center gap-2',
          'rounded-lg border border-neutral-200 bg-white px-3 py-2.5',
          'focus-within:ring-2 focus-within:ring-indigo-500',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <Search
          className="size-4 shrink-0 text-neutral-400"
          aria-hidden="true"
        />
        <Autocomplete.Input
          ref={inputRef}
          placeholder={placeholderText}
          aria-label={ariaLabel ?? placeholder}
          onFocus={() => inputRef.current?.select()}
          className={cn(
            // 16px on phones so iOS Safari does not auto-zoom on focus; keeps
            // the 14px look from sm up where zoom is not a concern.
            'w-full bg-transparent text-base sm:text-sm text-neutral-900',
            'placeholder:text-neutral-400 focus:outline-none'
          )}
        />
        <ChevronDown
          className="size-4 shrink-0 text-neutral-500"
          aria-hidden="true"
        />
      </div>

      <Autocomplete.Portal>
        <Autocomplete.Positioner
          sideOffset={4}
          className="z-50"
          collisionPadding={16}
        >
          <Autocomplete.Popup
            className={cn(
              'max-h-[300px] w-(--anchor-width) overflow-auto p-2',
              'rounded-lg border border-neutral-200 bg-white shadow-md'
            )}
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-neutral-500">
                {emptyText ?? 'Sin resultados'}
              </p>
            ) : (
              <Autocomplete.List>
                {filtered.map((option) => (
                  <Autocomplete.Item
                    key={option.value}
                    value={option}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      'flex items-center justify-between gap-2',
                      'rounded-lg px-3 py-2 text-sm text-neutral-900',
                      'cursor-pointer outline-none transition-colors duration-150',
                      'data-highlighted:bg-neutral-100'
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {option.value === value && (
                      <Check
                        className="size-4 shrink-0 text-indigo-600"
                        aria-hidden="true"
                      />
                    )}
                  </Autocomplete.Item>
                ))}
              </Autocomplete.List>
            )}
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
};
