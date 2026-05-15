import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { useMoney } from "../../../shared/hooks/useMoney";
import { formatDate } from "../../../shared/utils/formatters";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminStatusBadge } from "../../components/AdminStatusBadge";
import { ordersService } from "../../services/ordersService";

export function PendingOrdersPage() {
  const { formatFromInr, language } = useMoney();
  const ordersQuery = useQuery({
    queryKey: queryKeys.adminOrders("pending"),
    queryFn: () => ordersService.getOrders("pending"),
  });
  const orders = ordersQuery.data || [];

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Orders"
          title="Pending orders"
          description="Focused operational list for orders that still need fulfilment, dispatch, or delivery attention."
        />
      </AdminPanel>

      <AdminDataState
        query={ordersQuery}
        loadingLabel="Loading pending orders..."
        empty={!orders.length}
        emptyTitle="No pending orders"
        emptyDescription="All current demo orders have been delivered."
      >
        <div className="grid gap-4">
          {orders.map((order) => (
            <AdminPanel key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                    {order.orderNumber}
                  </div>
                  <h2 className="mt-2 font-display text-3xl text-[#1d130f]">{order.customerName}</h2>
                  <p className="mt-2 text-sm text-stone-600">
                    Created {formatDate(order.createdAt, language)} • Total {formatFromInr(order.total)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <AdminStatusBadge value={order.status} />
                  <AdminStatusBadge value={order.paymentStatus} />
                </div>
              </div>
            </AdminPanel>
          ))}
        </div>
      </AdminDataState>
    </div>
  );
}
