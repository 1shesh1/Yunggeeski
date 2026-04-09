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
