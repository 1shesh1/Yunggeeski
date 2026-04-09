import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/pricing";

interface StatusCardProps {
  order: Order;
}

export function StatusCard({ order }: StatusCardProps) {
  const statusLabel =
    order.order_status === "awaiting_form"
      ? "Awaiting your details"
      : order.order_status === "in_production"
        ? "In production"
        : order.order_status === "fulfilled"
          ? "Fulfilled"
          : order.order_status;
  const isFulfilled = order.order_status === "fulfilled";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order status</CardTitle>
        <CardDescription>Order ID: {order.id}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>
          <span className="font-medium">Status:</span> {statusLabel}
        </p>
        {isFulfilled && (
          <p className="text-primary font-medium">Check your email for fulfillment and delivery details.</p>
        )}
        <p>
          <span className="font-medium">Tier:</span> {order.tier}
        </p>
        <p>
          <span className="font-medium">Amount:</span> {formatPrice(order.amount_total)}
        </p>
        {order.customer_email && (
          <p>
            <span className="font-medium">Email:</span> {order.customer_email}
          </p>
        )}
        {order.scope_locked && !isFulfilled && (
          <p className="text-sm text-muted-foreground">Scope locked. We’re working on your chart.</p>
        )}
      </CardContent>
    </Card>
  );
}
