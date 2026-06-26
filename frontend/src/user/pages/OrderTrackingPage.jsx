import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { routes } from "../../config/routes";
import { EmptyState } from "../../shared/components/EmptyState";
import { OrdersPageSkeleton } from "../../shared/components/Skeleton";
import { useMoney } from "../../shared/hooks/useMoney";
import { useSession } from "../../shared/hooks/useSession";
import { formatDate, formatDateTime } from "../../shared/utils/formatters";
import { storefrontService } from "../services/storefrontService";
import { useSEO } from "../../shared/hooks/useSEO";

export function OrderTrackingPage() {
  const { orderId } = useParams();
  useSEO({
    title: `Track Order #${orderId || ""}`,
    description: "Track shipment shipping details and timeline for your order at BR Jewellers.",
    keywords: "track order, shipping status, order delivery, BR Jewellers tracking",
  });
  const { user } = useSession();
  const { formatFromInr, language } = useMoney();
  const trackingQuery = useQuery({
    queryKey: ["tracking", orderId, user?.id],
    queryFn: () => storefrontService.getOrderById(orderId, user.id),
    enabled: Boolean(user?.id),
  });

  if (trackingQuery.isLoading) {
    return <OrdersPageSkeleton />;
  }

  if (trackingQuery.isError || !trackingQuery.data) {
    return (
      <EmptyState
        title="Order not found"
        description="We couldn't locate that order in the current customer account."
      />
    );
  }

  const order = trackingQuery.data;

  return (
    <div className="space-y-6">
      <div className="text-sm text-stone-500">
        <Link to={routes.appOrders} className="transition hover:text-[#8a5d18]">
          Orders
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#1a120e]">{order.orderNumber}</span>
      </div>

      <section className="grid gap-6 rounded-[36px] border border-[#dfccab] bg-white/90 p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)] lg:grid-cols-[1fr_0.82fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9e6c24]">Order tracking</p>
          <h1 className="mt-2 font-display text-5xl text-[#1a120e]">{order.orderNumber}</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Current status: <span className="font-semibold text-[#1a120e]">{order.status}</span>
          </p>

          <div className="mt-8 space-y-6">
            {order.timeline.map((step, index) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`h-4 w-4 rounded-full ${step.completed ? "bg-[#1a120e]" : "bg-stone-300"}`} />
                  {index < order.timeline.length - 1 ? (
                    <div className={`mt-2 h-20 w-px ${step.completed ? "bg-[#1a120e]" : "bg-stone-300"}`} />
                  ) : null}
                </div>
                <div className="pb-6">
                  <p className="text-lg font-semibold text-[#1a120e]">{step.label}</p>
                  <p className="text-sm text-stone-500">
                    {step.timestamp ? formatDateTime(step.timestamp, language) : "Pending update"}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">{step.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4 rounded-[32px] bg-[#17100d] p-6 text-[#f8efdc]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d5a957]">Delivery snapshot</p>
            <h2 className="mt-2 font-display text-4xl">Shipment details</h2>
          </div>

          <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-[#ebddc2]">
            <div className="flex items-center justify-between gap-3">
              <span>Placed on</span>
              <span>{formatDate(order.createdAt, language)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Payment</span>
              <span>{order.paymentStatus}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Total</span>
              <span>{formatFromInr(order.total)}</span>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm leading-6 text-[#ebddc2]">
            <div className="font-semibold text-[#f8efdc]">{order.shippingAddress.name}</div>
            <div className="mt-2">
              {order.shippingAddress.line1}, {order.shippingAddress.city}
            </div>
            <div>
              {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold text-[#f8efdc]">Items</div>
            <div className="mt-3 space-y-3">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.productId}`} className="flex items-center gap-3 text-sm text-[#ebddc2]">
                  <img src={item.image} alt={item.name} width="48" height="56" className="h-14 w-12 rounded-[14px] object-cover" loading="lazy" decoding="async" />
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-[#f8efdc]">{item.name}</div>
                    <div>Qty {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
