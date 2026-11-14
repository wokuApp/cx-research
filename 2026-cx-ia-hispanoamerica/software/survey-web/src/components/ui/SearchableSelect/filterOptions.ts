import type { SelectOption } from '@/components/ui/Select';

/**
 * Case-insensitive substring filter over option labels. Empty query returns
 * every option. Kept in its own file so it can be unit-tested without driving
 * the Base UI popup (and so the component file only exports a component).
 */
export const filterOptions = (
  options: SelectOption[],
  query: string
): SelectOption[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return options;
  return options.filter((option) =>
    option.label.toLowerCase().includes(normalized)
  );
};
