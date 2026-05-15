import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminTimeline } from "../../components/AdminTimeline";
import { ordersService } from "../../services/ordersService";

export function OrderTrackingPage() {
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const trackingQuery = useQuery({
    queryKey: queryKeys.adminOrders("tracking"),
    queryFn: ordersService.getTrackingOrders,
  });
  const trackingOrders = trackingQuery.data || [];

  const selectedOrder =
    trackingOrders.find((order) => order.id === selectedOrderId) || trackingOrders[0];

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Orders"
          title="Order tracking"
          description="Timeline UI is isolated from list management so future shipment integrations can slot into one place."
        />
      </AdminPanel>

      <AdminDataState query={trackingQuery} loadingLabel="Loading tracking timeline...">
        <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
          <AdminPanel>
            {trackingOrders.length ? (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">Select order</span>
                <select
                  value={selectedOrder?.id || ""}
                  onChange={(event) => setSelectedOrderId(event.target.value)}
                  className="w-full rounded-3xl border border-[#dcc8a1] bg-white px-4 py-3 text-sm"
                >
                  {trackingOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.orderNumber} • {order.customerName}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="rounded-[22px] border border-dashed border-[#dec99f] bg-[#fffaf1] px-4 py-6 text-sm text-stone-600">
                No orders available for tracking right now.
              </div>
            )}
          </AdminPanel>

          <AdminPanel>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
              Tracking timeline
            </div>
            {selectedOrder ? (
              <>
                <h2 className="mt-2 font-display text-3xl text-[#1d130f]">
                  {selectedOrder.orderNumber}
                </h2>
                <p className="mt-2 text-sm text-stone-600">{selectedOrder.customerName}</p>
                <div className="mt-5">
                  <AdminTimeline steps={selectedOrder.timeline || []} />
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-[22px] border border-dashed border-[#dec99f] bg-[#fffaf1] px-4 py-6 text-sm text-stone-600">
                Select an order to inspect its timeline.
              </div>
            )}
          </AdminPanel>
        </div>
      </AdminDataState>
    </div>
  );
}
