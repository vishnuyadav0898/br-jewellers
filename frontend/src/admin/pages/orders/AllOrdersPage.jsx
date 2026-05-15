import { useDeferredValue, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { Modal } from "../../../shared/components/Modal";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { useMoney } from "../../../shared/hooks/useMoney";
import { formatDate } from "../../../shared/utils/formatters";
import { notify } from "../../../shared/utils/notify";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPagination } from "../../components/AdminPagination";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminStatusBadge } from "../../components/AdminStatusBadge";
import { AdminTable } from "../../components/AdminTable";
import { ordersService } from "../../services/ordersService";

const pageSize = 6;

export function AllOrdersPage() {
  const queryClient = useQueryClient();
  const { formatFromInr, language } = useMoney();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const deferredSearch = useDeferredValue(search);
  const ordersQuery = useQuery({
    queryKey: queryKeys.adminOrders("all"),
    queryFn: () => ordersService.getOrders("all"),
  });

  const filteredOrders = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return ordersQuery.data || [];

    return (ordersQuery.data || []).filter((order) =>
      [order.orderNumber, order.customerName, order.customerEmail]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [deferredSearch, ordersQuery.data]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const rows = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const updateOrder = async (orderId, payload, successMessage) => {
    try {
      await ordersService.updateOrder(orderId, payload);
      notify.success(successMessage, {
        title: "Order updated",
        iconKey: "order",
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders("all") });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders("pending") });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders("tracking") });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    } catch (error) {
      notify.error(error.message, { iconKey: "order" });
    }
  };

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Orders"
          title="All orders"
          description="Order management is split from tracking so status updates and operational review stay clear and scalable."
        />
        <div className="mt-5 max-w-md">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by order number or customer"
          />
        </div>
      </AdminPanel>

      <AdminDataState query={ordersQuery} loadingLabel="Loading orders...">
        <div className="space-y-4">
          <AdminPanel>
            <AdminTable
              columns={[
                {
                  key: "orderNumber",
                  header: "Order",
                  render: (row) => (
                    <div>
                      <div className="font-semibold text-[#1d130f]">{row.orderNumber}</div>
                      <div className="text-xs text-stone-500">{formatDate(row.createdAt, language)}</div>
                    </div>
                  ),
                },
                {
                  key: "customer",
                  header: "Customer",
                  render: (row) => (
                    <div>
                      <div className="font-semibold text-[#1d130f]">{row.customerName}</div>
                      <div className="text-xs text-stone-500">{row.customerEmail}</div>
                    </div>
                  ),
                },
                {
                  key: "total",
                  header: "Total",
                  render: (row) => formatFromInr(row.total),
                },
                {
                  key: "status",
                  header: "Order status",
                  render: (row) => (
                    <select
                      value={row.status}
                      onChange={(event) =>
                        updateOrder(row.id, { status: event.target.value }, "Order status updated.")
                      }
                      className="rounded-full border border-[#dcc8a1] bg-white px-3 py-2 text-sm"
                    >
                      {["Pending", "Ordered", "Processing", "Shipped", "Delivered"].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ),
                },
                {
                  key: "paymentStatus",
                  header: "Payment",
                  render: (row) => (
                    <select
                      value={row.paymentStatus}
                      onChange={(event) =>
                        updateOrder(
                          row.id,
                          { paymentStatus: event.target.value },
                          "Payment status updated."
                        )
                      }
                      className="rounded-full border border-[#dcc8a1] bg-white px-3 py-2 text-sm"
                    >
                      {["Paid", "Unpaid", "Failed"].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ),
                },
                {
                  key: "actions",
                  header: "Details",
                  render: (row) => (
                    <Button tone="secondary" size="sm" onClick={() => setSelectedOrder(row)}>
                      View details
                    </Button>
                  ),
                },
              ]}
              rows={rows}
              emptyMessage="No orders found for this search."
            />
          </AdminPanel>
          <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </AdminDataState>

      <Modal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder?.orderNumber || "Order details"}
        className="max-w-3xl"
      >
        {selectedOrder ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[22px] bg-[#fff9ef] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                  Customer
                </div>
                <div className="mt-2 text-sm leading-6 text-stone-600">
                  {selectedOrder.customerName}
                  <br />
                  {selectedOrder.customerEmail}
                </div>
              </div>
              <div className="rounded-[22px] bg-[#fff9ef] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                  Shipping address
                </div>
                <div className="mt-2 text-sm leading-6 text-stone-600">
                  {selectedOrder.shippingAddress?.name}
                  <br />
                  {selectedOrder.shippingAddress?.line1}
                  <br />
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{" "}
                  {selectedOrder.shippingAddress?.pincode}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {selectedOrder.items.map((item) => (
                <article key={`${selectedOrder.id}-${item.productId}`} className="flex gap-4 rounded-[22px] border border-[#eadcc0] bg-[#fffaf1] p-4">
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-[16px] object-cover" />
                  <div className="flex-1">
                    <div className="font-semibold text-[#1d130f]">{item.name}</div>
                    <div className="mt-1 text-sm text-stone-500">
                      Qty {item.quantity} • {formatFromInr(item.price)}
                    </div>
                  </div>
                  <AdminStatusBadge value={selectedOrder.status} />
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
