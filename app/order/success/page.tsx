"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useCallback } from "react";
import { StatusCard } from "@/components/StatusCard";
import type { Order } from "@/lib/types";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!sessionId) {
      setError("Missing session_id");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/orders/by-session?session_id=${encodeURIComponent(sessionId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load order");
      setOrder(data.order);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading your order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-destructive">{error ?? "Order not found."}</p>
        <a href="/" className="mt-4 inline-block text-primary underline">
          Return home
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Order status</h1>
      <StatusCard order={order} />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading your order…</p>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
