"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

/** Optional fields — if any fails validation, the details panel opens so the error is visible. */
const DETAIL_FIELDS = [
  "company_website",
  "product_or_service",
  "budget",
  "launch_date",
  "deliverables",
  "paid_ads_required",
  "category_exclusivity_required",
  "additional_info",
] as const;

/**
 * The short inquiry: name, company, email, and a sentence or two about the
 * idea. Campaign specifics sit behind an optional disclosure so a prospect
 * arriving from cold outreach isn't faced with a questionnaire.
 */
export function BrandInquiryForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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
      router.push("/thanks");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const onInvalid = (errs: typeof errors) => {
    if (DETAIL_FIELDS.some((f) => errs[f])) setShowDetails(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" {...register("name")} autoComplete="name" className="mt-1.5" />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="company">Company or organization *</Label>
          <Input id="company" {...register("company")} autoComplete="organization" className="mt-1.5" />
          <FieldError message={errors.company?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="work_email">Email *</Label>
        <Input
          id="work_email"
          type="email"
          inputMode="email"
          {...register("work_email")}
          autoComplete="email"
          placeholder="you@company.com"
          className="mt-1.5"
        />
        <FieldError message={errors.work_email?.message} />
      </div>

      <div>
        <Label htmlFor="collaboration">What would you like to work on together? *</Label>
        <textarea
          id="collaboration"
          {...register("collaboration")}
          rows={4}
          className={`mt-1.5 ${textareaClass}`}
          placeholder="A sentence or two is plenty — e.g. a sponsored chart for our app, or a monthly series for our own Instagram."
        />
        <FieldError message={errors.collaboration?.message} />
      </div>

      <div className="rounded-xl border border-border/70">
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          aria-expanded={showDetails}
          aria-controls="inquiry-details"
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>
            Add campaign details <span className="font-normal">(optional)</span>
          </span>
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 transition-transform", showDetails && "rotate-180")}
            aria-hidden
          />
        </button>

        <div id="inquiry-details" hidden={!showDetails} className="border-t border-border/70 px-4 pb-5 pt-4">
          <p className="mb-4 text-xs text-muted-foreground">
            Already planning a campaign? Share what you know — anything you skip can be covered later.
          </p>
          <div className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="company_website">Company website</Label>
                <Input
                  id="company_website"
                  {...register("company_website")}
                  placeholder="company.com"
                  className="mt-1.5"
                />
                <FieldError message={errors.company_website?.message} />
              </div>
              <div>
                <Label htmlFor="budget">Estimated budget</Label>
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
            </div>

            <div>
              <Label htmlFor="product_or_service">Product or service</Label>
              <textarea
                id="product_or_service"
                {...register("product_or_service")}
                rows={2}
                className={`mt-1.5 ${textareaClass}`}
                placeholder="What are you promoting?"
              />
              <FieldError message={errors.product_or_service?.message} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="launch_date">Desired launch date</Label>
                <Input id="launch_date" type="date" {...register("launch_date")} className="mt-1.5" />
                <FieldError message={errors.launch_date?.message} />
              </div>
              <div>
                <Label htmlFor="deliverables">Deliverables</Label>
                <Input
                  id="deliverables"
                  {...register("deliverables")}
                  placeholder="e.g. three sponsored charts"
                  className="mt-1.5"
                />
                <FieldError message={errors.deliverables?.message} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="paid_ads_required">Paid advertising usage?</Label>
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
                <Label htmlFor="category_exclusivity_required">Category exclusivity?</Label>
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
              <Label htmlFor="additional_info">Anything else</Label>
              <textarea
                id="additional_info"
                {...register("additional_info")}
                rows={2}
                className={`mt-1.5 ${textareaClass}`}
              />
              <FieldError message={errors.additional_info?.message} />
            </div>
          </div>
        </div>
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Sending…" : "Send inquiry"}
        {!isSubmitting && <ArrowRight className="h-4 w-4" />}
      </Button>
    </form>
  );
}
