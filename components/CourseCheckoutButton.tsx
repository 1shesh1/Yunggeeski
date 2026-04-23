"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CourseTierId } from "@/lib/course";

interface CourseCheckoutButtonProps {
  tierId: CourseTierId;
  /** Optional prefill for Stripe Checkout and mock purchase record. */
  customerEmail?: string;
  children: React.ReactNode;
  className?: string;
}

export function CourseCheckoutButton({ tierId, customerEmail, children, className }: CourseCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create-course-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: tierId,
          ...(customerEmail?.trim() ? { customerEmail: customerEmail.trim() } : {}),
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
      console.error(err);
      alert(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button className={className} onClick={handleClick} disabled={loading}>
      {loading ? "Redirecting…" : children}
    </Button>
  );
}
