"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  orderFormSchema,
  type OrderFormData,
  RESOLUTION_OPTIONS,
  STARTING_VALUE_TYPES,
} from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useState } from "react";

interface OrderFormProps {
  orderId: string;
  sessionId: string;
  onSubmit: (data: OrderFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function OrderForm({
  orderId,
  sessionId,
  onSubmit,
  isSubmitting = false,
  submitError = null,
}: OrderFormProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      starting_value_type: "indexed",
      intended_resolution: "1080x1350",
      agree_to_terms: false as unknown as true,
    },
  });

  const intendedResolution = watch("intended_resolution");
  const startingValueType = watch("starting_value_type");
  const agreeToTerms = watch("agree_to_terms");

  const handleFormSubmit = async (data: OrderFormData) => {
    const payload: OrderFormData = { ...data, logo_file: logoFile ?? data.logo_file! };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-xl">
      <div>
        <Label htmlFor="chart_title">Chart title *</Label>
        <Input
          id="chart_title"
          {...register("chart_title")}
          placeholder="e.g. S&P 500 vs Treasury Yields"
          className="mt-1"
        />
        {errors.chart_title && (
          <p className="text-sm text-destructive mt-1">{String(errors.chart_title.message ?? "")}</p>
        )}
      </div>

      <div>
        <Label htmlFor="series_to_compare">Series to compare *</Label>
        <textarea
          id="series_to_compare"
          {...register("series_to_compare")}
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="List each series (e.g. ticker symbols or data series names)"
        />
        {errors.series_to_compare && (
          <p className="text-sm text-destructive mt-1">{String(errors.series_to_compare.message ?? "")}</p>
        )}
      </div>

      <div>
        <Label htmlFor="date_range">Date range *</Label>
        <Input
          id="date_range"
          {...register("date_range")}
          placeholder="e.g. 2020-01-01 to 2024-12-31"
          className="mt-1"
        />
        {errors.date_range && <p className="text-sm text-destructive mt-1">{String(errors.date_range.message ?? "")}</p>}
      </div>

      <div>
        <Label>Starting value type *</Label>
        <Select
          value={startingValueType}
          onValueChange={(v) => setValue("starting_value_type", v as "indexed" | "raw")}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {STARTING_VALUE_TYPES.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.starting_value_type && (
          <p className="text-sm text-destructive mt-1">{String(errors.starting_value_type.message ?? "")}</p>
        )}
      </div>

      <div>
        <Label htmlFor="starting_value">Starting value *</Label>
        <Input
          id="starting_value"
          {...register("starting_value")}
          placeholder="e.g. 100 or 1.0"
          className="mt-1"
        />
        {errors.starting_value && (
          <p className="text-sm text-destructive mt-1">{String(errors.starting_value.message ?? "")}</p>
        )}
      </div>

      <div>
        <Label>Intended resolution *</Label>
        <Select
          value={intendedResolution}
          onValueChange={(v) => setValue("intended_resolution", v as (typeof RESOLUTION_OPTIONS)[number])}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {RESOLUTION_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.intended_resolution && (
          <p className="text-sm text-destructive mt-1">{String(errors.intended_resolution.message ?? "")}</p>
        )}
      </div>

      {intendedResolution === "custom" && (
        <div>
          <Label htmlFor="custom_resolution">Custom resolution *</Label>
          <Input
            id="custom_resolution"
            {...register("custom_resolution")}
            placeholder="e.g. 1200x800"
            className="mt-1"
          />
          {errors.custom_resolution && (
            <p className="text-sm text-destructive mt-1">{errors.custom_resolution.message}</p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="brand_colors">Brand colors (hex, space or comma separated) *</Label>
        <Input
          id="brand_colors"
          {...register("brand_colors")}
          placeholder="#1a1a2e #16213e #0f3460"
          className="mt-1"
        />
        {errors.brand_colors && (
          <p className="text-sm text-destructive mt-1">{String(errors.brand_colors.message ?? "")}</p>
        )}
      </div>

      <div>
        <Label htmlFor="background_color_hex">Background color (hex) *</Label>
        <Input
          id="background_color_hex"
          {...register("background_color_hex")}
          placeholder="#ffffff"
          className="mt-1"
        />
        {errors.background_color_hex && (
          <p className="text-sm text-destructive mt-1">{errors.background_color_hex.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="logo_file">Logo file * (PNG, JPEG, SVG, or WebP)</Label>
        <Input
          id="logo_file"
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="mt-1"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setLogoFile(file);
              setValue("logo_file", file, { shouldValidate: true });
            }
          }}
        />
        {errors.logo_file && (
          <p className="text-sm text-destructive mt-1">{String(errors.logo_file.message ?? "")}</p>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <textarea
          id="notes"
          {...register("notes")}
          rows={2}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Any additional instructions"
        />
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="agree_to_terms"
          checked={agreeToTerms}
          onCheckedChange={(checked) => setValue("agree_to_terms", (checked === true) as true, { shouldValidate: true })}
        />
        <Label htmlFor="agree_to_terms" className="cursor-pointer text-sm leading-tight">
          I agree to the <Link href="/terms" className="underline">Terms of Service</Link>. Scope will be locked upon
          submission and revisions are limited per my selected tier. *
        </Label>
      </div>
      {errors.agree_to_terms && (
        <p className="text-sm text-destructive">{String(errors.agree_to_terms.message ?? "")}</p>
      )}

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit order details"}
      </Button>
    </form>
  );
}
