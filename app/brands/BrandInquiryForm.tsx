"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import {
  brandInquirySchema,
  type BrandInquiryData,
  type BudgetValue,
  type YesNo,
  BUDGET_OPTIONS,
} from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const textareaClass =
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-destructive">{message}</p>;
}

export function BrandInquiryForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BrandInquiryData>({
    resolver: zodResolver(brandInquirySchema),
  });

  const budget = watch("budget");
  const paidAds = watch("paid_ads_required");
  const exclusivity = watch("category_exclusivity_required");

  async function onSubmit(data: BrandInquiryData) {
    setSubmitError(null);
    try {
      const res = await fetch("/api/brands/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body.error === "string" ? body.error : "Submission failed");
      }
      router.push("/brands/thanks");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" {...register("name")} autoComplete="name" className="mt-1.5" />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="company">Company *</Label>
          <Input id="company" {...register("company")} autoComplete="organization" className="mt-1.5" />
          <FieldError message={errors.company?.message} />
        </div>
        <div>
          <Label htmlFor="work_email">Work email *</Label>
          <Input
            id="work_email"
            type="email"
            {...register("work_email")}
            autoComplete="email"
            placeholder="you@company.com"
            className="mt-1.5"
          />
          <FieldError message={errors.work_email?.message} />
        </div>
        <div>
          <Label htmlFor="company_website">Company website *</Label>
          <Input
            id="company_website"
            {...register("company_website")}
            placeholder="company.com"
            className="mt-1.5"
          />
          <FieldError message={errors.company_website?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="product_or_service">Product or service *</Label>
        <textarea
          id="product_or_service"
          {...register("product_or_service")}
          rows={3}
          className={`mt-1.5 ${textareaClass}`}
          placeholder="What are you promoting?"
        />
        <FieldError message={errors.product_or_service?.message} />
      </div>

      <div>
        <Label htmlFor="campaign_objective">Campaign objective *</Label>
        <textarea
          id="campaign_objective"
          {...register("campaign_objective")}
          rows={3}
          className={`mt-1.5 ${textareaClass}`}
          placeholder="e.g. sign-ups, awareness, app installs"
        />
        <FieldError message={errors.campaign_objective?.message} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="budget">Estimated budget *</Label>
          <Select
            value={budget ?? ""}
            onValueChange={(v) => setValue("budget", v as BudgetValue, { shouldValidate: true })}
          >
            <SelectTrigger id="budget" className="mt-1.5">
              <SelectValue placeholder="Select a range" />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.budget?.message} />
        </div>
        <div>
          <Label htmlFor="launch_date">Desired launch date *</Label>
          <Input id="launch_date" type="date" {...register("launch_date")} className="mt-1.5" />
          <FieldError message={errors.launch_date?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="deliverables">Requested deliverables *</Label>
        <textarea
          id="deliverables"
          {...register("deliverables")}
          rows={2}
          className={`mt-1.5 ${textareaClass}`}
          placeholder="e.g. one sponsored chart, a three-video campaign"
        />
        <FieldError message={errors.deliverables?.message} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="paid_ads_required">Paid advertising usage required? *</Label>
          <Select
            value={paidAds ?? ""}
            onValueChange={(v) => setValue("paid_ads_required", v as YesNo, { shouldValidate: true })}
          >
            <SelectTrigger id="paid_ads_required" className="mt-1.5">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
          <FieldError message={errors.paid_ads_required?.message} />
        </div>
        <div>
          <Label htmlFor="category_exclusivity_required">Category exclusivity required? *</Label>
          <Select
            value={exclusivity ?? ""}
            onValueChange={(v) =>
              setValue("category_exclusivity_required", v as YesNo, { shouldValidate: true })
            }
          >
            <SelectTrigger id="category_exclusivity_required" className="mt-1.5">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
          <FieldError message={errors.category_exclusivity_required?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="additional_info">Additional information</Label>
        <textarea
          id="additional_info"
          {...register("additional_info")}
          rows={3}
          className={`mt-1.5 ${textareaClass}`}
          placeholder="Anything else we should know (optional)"
        />
        <FieldError message={errors.additional_info?.message} />
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Submitting…" : "Submit campaign request"}
        {!isSubmitting && <ArrowRight className="h-4 w-4" />}
      </Button>
      <p className="text-xs text-muted-foreground">
        Requests are reviewed based on brand fit, audience relevance, budget, and production
        availability.
      </p>
    </form>
  );
}
