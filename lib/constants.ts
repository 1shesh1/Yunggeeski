export const UNIT_OPTIONS = [
  { value: "simple_percent", label: "Simple percent" },
  { value: "compounded_percent", label: "Compounded percent" },
  { value: "currency", label: "Currency" },
] as const;

export type UnitOption = (typeof UNIT_OPTIONS)[number]["value"];

export const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "INR", name: "Indian Rupee" },
  { code: "MXN", name: "Mexican Peso" },
] as const;
