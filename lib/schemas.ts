import { z } from "zod";

const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const RESOLUTION_OPTIONS = [
  "1080x1350",
  "1920x1080",
  "1080x1080",
  "custom",
] as const;
export type ResolutionOption = (typeof RESOLUTION_OPTIONS)[number];

export const STARTING_VALUE_TYPES = ["indexed", "raw"] as const;
export type StartingValueType = (typeof STARTING_VALUE_TYPES)[number];

export const orderFormSchema = z
  .object({
    chart_title: z.string().min(1, "Chart title is required").max(200),
    series_to_compare: z.string().min(1, "Series to compare is required"),
    date_range: z.string().min(1, "Date range is required"),
    starting_value_type: z.enum(STARTING_VALUE_TYPES),
    starting_value: z.string().min(1, "Starting value is required"),
    intended_resolution: z.enum(RESOLUTION_OPTIONS),
    custom_resolution: z.string().optional(),
    brand_colors: z.string().min(1, "At least one brand color (hex) is required"),
    background_color_hex: z.string().regex(HEX_REGEX, "Valid hex required (e.g. #ffffff)"),
    // Use z.any() + refinements so we don't reference File at build time (File is not defined in Node 18)
    logo_file: z
      .any()
      .refine((f) => f != null && typeof f === "object" && "size" in f && (f as { size: number }).size > 0, "Logo file is required")
      .refine(
        (f) =>
          f != null &&
          typeof f === "object" &&
          "type" in f &&
          ["image/png", "image/jpeg", "image/svg+xml", "image/webp"].includes((f as { type: string }).type),
        "Logo must be PNG, JPEG, SVG, or WebP"
      ),
    notes: z.string().optional(),
    agree_to_terms: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the terms" }),
    }),
  })
  .refine(
    (data) => {
      if (data.intended_resolution !== "custom") return true;
      return (
        typeof data.custom_resolution === "string" &&
        data.custom_resolution.trim().length > 0
      );
    },
    { message: "Custom resolution is required when resolution is custom", path: ["custom_resolution"] }
  );

export type OrderFormData = z.infer<typeof orderFormSchema>;

export function parseBrandColors(input: string): string[] {
  return input
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => HEX_REGEX.test(s));
}

// —— Brand campaign inquiry (/brands) ——

/** Budget bands. "under_2k" is kept for filtering, not for acceptance. */
export const BUDGET_OPTIONS = [
  { value: "under_2k", label: "Under $2,000" },
  { value: "2k_5k", label: "$2,000–$5,000" },
  { value: "5k_10k", label: "$5,000–$10,000" },
  { value: "10k_25k", label: "$10,000–$25,000" },
  { value: "25k_plus", label: "$25,000+" },
] as const;

export type BudgetValue = (typeof BUDGET_OPTIONS)[number]["value"];

const BUDGET_VALUES = BUDGET_OPTIONS.map((o) => o.value) as [BudgetValue, ...BudgetValue[]];

export const YES_NO = ["yes", "no"] as const;
export type YesNo = (typeof YES_NO)[number];

export function budgetLabel(value: string): string {
  return BUDGET_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export const brandInquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  company: z.string().trim().min(1, "Company is required").max(200),
  work_email: z.string().trim().min(1, "Work email is required").email("Enter a valid email").max(200),
  company_website: z
    .string()
    .trim()
    .min(1, "Company website is required")
    .max(300)
    .refine((v) => {
      try {
        const url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
        return url.hostname.includes(".");
      } catch {
        return false;
      }
    }, "Enter a valid website (e.g. company.com)"),
  product_or_service: z.string().trim().min(1, "Product or service is required").max(2000),
  campaign_objective: z.string().trim().min(1, "Campaign objective is required").max(2000),
  budget: z.enum(BUDGET_VALUES, {
    errorMap: () => ({ message: "Select an estimated budget" }),
  }),
  launch_date: z
    .string()
    .trim()
    .min(1, "Desired launch date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date (YYYY-MM-DD)"),
  deliverables: z.string().trim().min(1, "Requested deliverables are required").max(2000),
  paid_ads_required: z.enum(YES_NO, {
    errorMap: () => ({ message: "Select yes or no" }),
  }),
  category_exclusivity_required: z.enum(YES_NO, {
    errorMap: () => ({ message: "Select yes or no" }),
  }),
  additional_info: z.string().trim().max(4000).optional(),
});

export type BrandInquiryData = z.infer<typeof brandInquirySchema>;
