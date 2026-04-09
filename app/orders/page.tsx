"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/pricing";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function tierLabel(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function statusLabel(orderStatus: string): string {
  if (orderStatus === "awaiting_form") return "Awaiting your details";
  if (orderStatus === "in_production") return "In production";
  if (orderStatus === "fulfilled") return "Fulfilled";
  return orderStatus;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function OrdersPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      setError("Enter your email address.");
      return;
    }
    setError(null);
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/orders/by-email?email=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (!res.ok) {
        setOrders([]);
        setError(data.error ?? "Could not load orders.");
        return;
      }
      setOrders(data.orders ?? []);
    } catch {
      setOrders([]);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block">
        ← Back
      </Link>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Your orders</h1>
      <p className="text-muted-foreground mb-8">
        Enter the email address you used at checkout to view current and past orders.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <div>
          <Label htmlFor="orders-email">Email address</Label>
          <Input
            id="orders-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 max-w-md"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Loading…" : "View orders"}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {searched && orders !== null && (
        <>
          {orders.length === 0 ? (
            <p className="text-muted-foreground">No orders found for this email.</p>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li key={order.id}>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        {tierLabel(order.tier)} · {formatPrice(order.amount_total)}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(order.created_at)} · {statusLabel(order.order_status)}
                        {order.order_status === "fulfilled" && (
                          <span className="block mt-1 text-primary font-medium">
                            Check your email for fulfillment and delivery details.
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={
                            order.stripe_session_id
                              ? `/order/success?session_id=${encodeURIComponent(order.stripe_session_id)}`
                              : "#"
                          }
                        >
                          View order status
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
