"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/pricing";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ORDER_STATUS_OPTIONS = [
  { value: "awaiting_form", label: "Awaiting form" },
  { value: "in_production", label: "In production" },
  { value: "fulfilled", label: "Fulfilled" },
] as const;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function statusLabel(orderStatus: string): string {
  if (orderStatus === "awaiting_form") return "Awaiting form";
  if (orderStatus === "in_production") return "In production";
  if (orderStatus === "fulfilled") return "Fulfilled";
  return orderStatus;
}

function tierLabel(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/admin/orders", { credentials: "include" });
    if (res.status === 401) {
      setAuthed(false);
      setOrders(null);
      return;
    }
    if (!res.ok) {
      setAuthed(false);
      setOrders(null);
      return;
    }
    const data = await res.json();
    setAuthed(true);
    setOrders(data.orders ?? []);
  }, []);

  useEffect(() => {
    fetch("/api/admin/orders", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          setAuthed(false);
          setOrders(null);
          return;
        }
        return res.json().then((data) => {
          setAuthed(true);
          setOrders(data.orders ?? []);
        });
      })
      .catch(() => {
        setAuthed(false);
        setOrders(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order_status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Status update failed:", data.error);
        return;
      }
      await fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error ?? "Invalid");
        setLoginLoading(false);
        return;
      }
      setPassword("");
      await fetchOrders();
    } catch {
      setLoginError("Something went wrong");
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (authed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-lg">Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loginLoading}
                />
              </div>
              {loginError && <p className="text-sm text-destructive">{loginError}</p>}
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? "Checking…" : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      {orders === null || orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {tierLabel(order.tier)} · {formatPrice(order.amount_total)}
                  </span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatDate(order.created_at)}
                  {order.customer_email && (
                    <>
                      {" · "}
                      {order.customer_email}
                    </>
                  )}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Select
                      value={order.order_status}
                      onValueChange={(v) => handleStatusChange(order.id, v)}
                      disabled={updatingId === order.id}
                    >
                      <SelectTrigger className="w-[160px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={
                        order.stripe_session_id
                          ? `/order/success?session_id=${encodeURIComponent(order.stripe_session_id)}`
                          : "#"
                      }
                    >
                      View as customer
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    {expandedId === order.id ? "Hide details" : "Show details"}
                  </Button>
                </div>
                {expandedId === order.id && (
                  <div className="rounded-md border border-border bg-muted/30 p-4 text-sm space-y-2 overflow-x-auto">
                    {order.form_data && Object.keys(order.form_data).length > 0 && (
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Form data</p>
                        <pre className="whitespace-pre-wrap break-words text-xs">
                          {JSON.stringify(order.form_data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {order.resolution && (
                      <p>
                        <span className="font-medium text-muted-foreground">Resolution:</span>{" "}
                        {order.resolution}
                      </p>
                    )}
                    {order.logo_url && (
                      <p>
                        <span className="font-medium text-muted-foreground">Logo URL:</span>{" "}
                        <a href={order.logo_url} target="_blank" rel="noopener noreferrer" className="underline break-all">
                          {order.logo_url}
                        </a>
                      </p>
                    )}
                    {order.delivery_png_url && (
                      <p>
                        <span className="font-medium text-muted-foreground">Delivery PNG:</span>{" "}
                        <a href={order.delivery_png_url} target="_blank" rel="noopener noreferrer" className="underline break-all">
                          {order.delivery_png_url}
                        </a>
                      </p>
                    )}
                    {order.delivery_csv_url && (
                      <p>
                        <span className="font-medium text-muted-foreground">Delivery CSV:</span>{" "}
                        <a href={order.delivery_csv_url} target="_blank" rel="noopener noreferrer" className="underline break-all">
                          {order.delivery_csv_url}
                        </a>
                      </p>
                    )}
                    {!order.form_data?.chart_title && !order.resolution && !order.logo_url && !order.delivery_png_url && !order.delivery_csv_url && (
                      <p className="text-muted-foreground">No additional details.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
