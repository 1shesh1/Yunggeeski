"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Plus, Info } from "lucide-react";
import { getTierById, formatPrice } from "@/lib/pricing";
import type { TierId } from "@/lib/pricing";
import type { AddOnId } from "@/lib/pricing";
import { AddOnSelectorSection } from "@/components/AddOnSelectorSection";
import { ColorSwatch, getDefaultSeriesColor } from "@/components/ColorSwatch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UNIT_OPTIONS, CURRENCIES } from "@/lib/constants";
import type { UnitOption } from "@/lib/constants";

const VALID_TIERS: TierId[] = ["basic", "standard", "premium"];
const MAX_SERIES = 5;

interface SeriesEntry {
  value: string;
  color: string;
  imageUrl: string;
}

function getInitialSeries(): SeriesEntry[] {
  return [{ value: "", color: getDefaultSeriesColor(0), imageUrl: "" }];
}

function validateForm(
  tierId: TierId,
  data: {
    email: string;
    chartTitle: string;
    series: SeriesEntry[];
    dateStart: string;
    dateEnd: string;
    units: UnitOption | "";
    currencyCode: string;
  }
): string | null {
  const { email, chartTitle, series, dateStart, dateEnd, units, currencyCode } = data;
  const hasSeries = series.some((s) => s.value.trim() !== "");

  if (tierId === "basic") {
    if (!email.trim()) return "Email is required.";
    if (!chartTitle.trim()) return "Chart title is required.";
    if (!hasSeries) return "At least one series to compare is required.";
    if (!dateStart) return "Start date is required.";
    if (!dateEnd) return "End date is required.";
    if (!units) return "Units are required.";
    if (units === "currency" && !currencyCode) return "Currency is required when units are Currency.";
  }

  if (tierId === "standard") {
    if (!email.trim()) return "Email is required.";
    if (!hasSeries) return "At least one series to compare is required.";
    if (!dateStart) return "Start date is required.";
    if (!dateEnd) return "End date is required.";
    if (!units) return "Units are required.";
    if (units === "currency" && !currencyCode) return "Currency is required when units are Currency.";
  }

  return null;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const tierParam = typeof params.tier === "string" ? params.tier : "";
  const tierId = VALID_TIERS.includes(tierParam as TierId) ? (tierParam as TierId) : null;
  const tier = tierId ? getTierById(tierId) : null;

  const [email, setEmail] = useState("");
  const [chartTitle, setChartTitle] = useState("");
  const [series, setSeries] = useState<SeriesEntry[]>(getInitialSeries);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [units, setUnits] = useState<UnitOption | "">("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPlacement, setLogoPlacement] = useState("");
  const [addons, setAddons] = useState<AddOnId[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUrlHelpOpen, setLogoUrlHelpOpen] = useState(false);
  const [premiumInputMode, setPremiumInputMode] = useState<"detailed" | "concept">("detailed");
  const [conceptDescription, setConceptDescription] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  const isStandardOrPremium = tierId === "standard" || tierId === "premium";
  const isPremiumConceptOnly = tierId === "premium" && premiumInputMode === "concept";

  const addSeries = () => {
    if (series.length >= MAX_SERIES) return;
    setSeries((prev) => [
      ...prev,
      { value: "", color: getDefaultSeriesColor(prev.length), imageUrl: "" },
    ]);
  };

  const updateSeries = (index: number, updates: Partial<SeriesEntry>) => {
    setSeries((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...updates } : s))
    );
  };

  const removeSeries = (index: number) => {
    if (series.length <= 1) return;
    setSeries((prev) => prev.filter((_, i) => i !== index));
  };

  if (!tierId || !tier) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Invalid package. Choose one from the home page.</p>
        <Link href="/" className="mt-4 inline-block text-primary underline">
          Back to home
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm(tierId, {
      email,
      chartTitle,
      series,
      dateStart,
      dateEnd,
      units,
      currencyCode,
    });
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const formData: Record<string, unknown> = {
        chart_title: chartTitle.trim() || undefined,
        series: series.map((s) => ({ value: s.value.trim(), color: s.color, image_url: s.imageUrl.trim() || undefined })),
        date_start: dateStart || undefined,
        date_end: dateEnd || undefined,
        units: units || undefined,
        currency_code: units === "currency" ? currencyCode || undefined : undefined,
        background_color: isStandardOrPremium ? backgroundColor : undefined,
        logo_url: isStandardOrPremium ? logoUrl.trim() || undefined : undefined,
        logo_placement: isStandardOrPremium ? logoPlacement.trim() || undefined : undefined,
        concept_description: isPremiumConceptOnly ? conceptDescription.trim() || undefined : undefined,
        order_notes: orderNotes.trim() || undefined,
      };
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: tierId,
          addonIds: addons,
          customerEmail: email.trim(),
          formData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No redirect URL returned");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to packages
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tier.name}</CardTitle>
          <CardDescription>{tier.description}</CardDescription>
          <p className="text-2xl font-bold">{formatPrice(tier.price)}</p>
          <p className="text-sm text-muted-foreground">
            Delivery: {tier.deliveryDays} · {tier.revisions} revision{tier.revisions !== 1 ? "s" : ""} included
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="checkout-email">
                Email {tierId === "premium" ? "" : "*"}
              </Label>
              <Input
                id="checkout-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            {tierId === "premium" && (
              <div className="rounded-lg border border-border p-4 space-y-3">
                <Label className="text-base">How would you like to describe your project?</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="premium-mode"
                      checked={premiumInputMode === "detailed"}
                      onChange={() => setPremiumInputMode("detailed")}
                      className="rounded-full border-input"
                    />
                    <span className="text-sm">Fill out the full questionnaire</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="premium-mode"
                      checked={premiumInputMode === "concept"}
                      onChange={() => setPremiumInputMode("concept")}
                      className="rounded-full border-input"
                    />
                    <span className="text-sm">Describe your concept in your own words</span>
                  </label>
                </div>
              </div>
            )}

            {isPremiumConceptOnly ? (
              <div>
                <Label htmlFor="concept-description">Describe your concept</Label>
                <textarea
                  id="concept-description"
                  rows={6}
                  placeholder="Tell us about the chart or narrative you have in mind: topic, data sources, audience, style preferences, or anything else that helps us understand what you want..."
                  value={conceptDescription}
                  onChange={(e) => setConceptDescription(e.target.value)}
                  className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[120px]"
                />
              </div>
            ) : (
              <>
            <div>
              <Label htmlFor="checkout-chart-title">
                Chart title {tierId === "basic" ? "*" : ""}
              </Label>
              <Input
                id="checkout-chart-title"
                type="text"
                placeholder="e.g. S&P 500 vs Treasury Yields"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="mb-2 block">
                Series to compare {tierId === "premium" ? "" : "*"}
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Add up to {MAX_SERIES} series (e.g. ticker symbols or data series names).
              </p>
              <div className="space-y-3">
                {series.map((entry, index) => (
                  <div key={index} className="flex flex-wrap items-start gap-2 rounded-lg border p-3">
                    <div className="flex-1 min-w-[180px]">
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder={`Series ${index + 1}`}
                          value={entry.value}
                          onChange={(e) => updateSeries(index, { value: e.target.value })}
                          className="mb-2 flex-1"
                        />
                        {series.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => removeSeries(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      {isStandardOrPremium && (
                        <Input
                          type="url"
                          placeholder="Image URL for this series (optional)"
                          value={entry.imageUrl}
                          onChange={(e) => updateSeries(index, { imageUrl: e.target.value })}
                          className="mt-2"
                        />
                      )}
                    </div>
                    <ColorSwatch
                      value={entry.color}
                      onChange={(color) => updateSeries(index, { color })}
                      aria-label={`Color for series ${index + 1}`}
                    />
                  </div>
                ))}
                {series.length < MAX_SERIES && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSeries}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add series
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">
                Date range {tierId === "premium" ? "" : "*"}
              </Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[140px]">
                  <Label htmlFor="date-start" className="text-xs text-muted-foreground">
                    Start date
                  </Label>
                  <Input
                    id="date-start"
                    type="date"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <Label htmlFor="date-end" className="text-xs text-muted-foreground">
                    End date
                  </Label>
                  <Input
                    id="date-end"
                    type="date"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">
                Units {tierId === "premium" ? "" : "*"}
              </Label>
              <div className="flex flex-wrap items-start gap-3">
                <div className="w-full max-w-xs">
                  <Select
                    value={units || undefined}
                    onValueChange={(v) => setUnits((v || "") as UnitOption | "")}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Select units" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {units && (
                  <p className="text-sm text-muted-foreground flex-1 min-w-[200px] mt-1">
                    {units === "simple_percent" &&
                      "Each period’s return is shown as a percentage change from the previous period (e.g. +2%, -1.5%)."}
                    {units === "compounded_percent" &&
                      "Returns are shown as cumulative growth from the start date (e.g. 100 at start; 105 after one period = 5% compounded)."}
                    {units === "currency" &&
                      "Values are displayed in the selected currency (e.g. $1,000 or €500)."}
                  </p>
                )}
              </div>
              {units === "currency" && (
                <div className="mt-3">
                  <Label htmlFor="currency" className="text-xs text-muted-foreground">
                    Currency
                  </Label>
                  <Select value={currencyCode || undefined} onValueChange={setCurrencyCode}>
                    <SelectTrigger id="currency" className="mt-1 w-full max-w-xs">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code} – {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {isStandardOrPremium && (
              <>
                <div>
                  <Label className="mb-2 block">Background color</Label>
                  <ColorSwatch
                    value={backgroundColor}
                    onChange={setBackgroundColor}
                    aria-label="Background color"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Label htmlFor="logo-url">Logo image URL</Label>
                    <button
                      type="button"
                      onClick={() => setLogoUrlHelpOpen((o) => !o)}
                      className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded"
                      aria-label="How to get an image URL"
                      title="How to get an image URL"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                  {logoUrlHelpOpen && (
                    <p className="text-sm text-muted-foreground mb-2 p-3 rounded-md bg-muted/50 border border-border">
                      Upload your logo to an image host (e.g. Imgur, Dropbox, or your website). Then right-click the image and choose &quot;Copy image address&quot; or copy the URL from your browser. Paste that link here. It should end in .png, .jpg, or similar.
                    </p>
                  )}
                  <Input
                    id="logo-url"
                    type="url"
                    placeholder="https://..."
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="logo-placement">Logo placement</Label>
                  <Input
                    id="logo-placement"
                    type="text"
                    placeholder="e.g. Top right, bottom center"
                    value={logoPlacement}
                    onChange={(e) => setLogoPlacement(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </>
            )}
              </>
            )}

            <div>
              <Label htmlFor="order-notes">Order notes</Label>
              <p className="text-sm text-muted-foreground mb-1">Optional. Any extra instructions or context for your order.</p>
              <textarea
                id="order-notes"
                rows={3}
                placeholder="e.g. Preferred style, reference links..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
              />
            </div>

            <AddOnSelectorSection selected={addons} onChange={setAddons} tierId={tierId} />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Redirecting…" : "Proceed to payment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
