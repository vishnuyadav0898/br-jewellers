import { useMemo, useState } from "react";
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
import { PermissionGuard } from "../../../shared/components/PermissionGuard";
import { ordersService } from "../../services/ordersService";
import { useDebounce } from "../../../shared/hooks/useDebounce";

const pageSize = 6;

export function AllOrdersPage() {
  const queryClient = useQueryClient();
  const { formatFromInr, language } = useMoney();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const deferredSearch = useDebounce(search, 300);
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
        <div className="mt-5 flex justify-end">
          <div className="w-full max-w-md">
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by order number or customer"
            />
          </div>
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
                  render: (row) => <AdminStatusBadge value={row.status} />,
                },
                {
                  key: "paymentStatus",
                  header: "Payment",
                  render: (row) => <AdminStatusBadge value={row.paymentStatus} />,
                },
                {
                  key: "actions",
                  header: "Actions",
                  render: (row) => (
                    <div className="flex items-center gap-2">
                      <Button tone="secondary" size="sm" onClick={() => setSelectedOrder(row)}>
                        View details
                      </Button>
                      <PermissionGuard module="Order" action="Update">
                        <Button tone="primary" size="sm" onClick={() => setUpdatingOrder(row)}>
                          Update status
                        </Button>
                      </PermissionGuard>
                    </div>
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

            {/* Status Info (Read-only) */}
            <div className="grid gap-4 md:grid-cols-2 rounded-[22px] border border-[#eadcc0] bg-[#fffaf1] p-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                  Order Status
                </span>
                <div className="mt-2 flex">
                  <AdminStatusBadge value={selectedOrder.status} />
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                  Payment Status
                </span>
                <div className="mt-2 flex">
                  <AdminStatusBadge value={selectedOrder.paymentStatus} />
                </div>
              </div>
            </div>
 
            <div className="space-y-3">
              {selectedOrder.items.map((item) => (
                <article key={`${selectedOrder.id}-${item.productId}`} className="flex gap-4 rounded-[22px] border border-[#eadcc0] bg-[#fffaf1] p-4">
                  <img src={item.image} alt={item.name} width="80" height="80" className="h-20 w-20 rounded-[16px] object-cover" loading="lazy" />
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

      {/* Update Status Modal */}
      <Modal
        open={Boolean(updatingOrder)}
        onClose={() => setUpdatingOrder(null)}
        title={`Update status: ${updatingOrder?.orderNumber}`}
        className="max-w-md w-full"
      >
        {updatingOrder ? (
          <div className="space-y-5">
            <div className="grid gap-4 rounded-[22px] border border-[#eadcc0] bg-[#fffaf1] p-5">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#1d130f]">
                Order Status
                <select
                  value={updatingOrder.status}
                  onChange={async (event) => {
                    const nextStatus = event.target.value;
                    await updateOrder(updatingOrder.id, { status: nextStatus }, "Order status updated.");
                    setUpdatingOrder((prev) => ({ ...prev, status: nextStatus }));
                    // Also sync with selectedOrder if it is currently open
                    setSelectedOrder((prev) => (prev && prev.id === updatingOrder.id ? { ...prev, status: nextStatus } : prev));
                  }}
                  className="rounded-full border border-[#dcc8a1] bg-white px-3 py-2.5 text-sm font-normal focus:border-gold-500 focus:outline-none"
                >
                  {["Pending", "Ordered", "Processing", "Shipped", "Delivered"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-[#1d130f]">
                Payment Status
                <select
                  value={updatingOrder.paymentStatus}
                  onChange={async (event) => {
                    const nextPayment = event.target.value;
                    await updateOrder(updatingOrder.id, { paymentStatus: nextPayment }, "Payment status updated.");
                    setUpdatingOrder((prev) => ({ ...prev, paymentStatus: nextPayment }));
                    // Also sync with selectedOrder if it is currently open
                    setSelectedOrder((prev) => (prev && prev.id === updatingOrder.id ? { ...prev, paymentStatus: nextPayment } : prev));
                  }}
                  className="rounded-full border border-[#dcc8a1] bg-white px-3 py-2.5 text-sm font-normal focus:border-gold-500 focus:outline-none"
                >
                  {["Paid", "Unpaid", "Failed"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex w-full gap-3 mt-4">
              <Button type="button" tone="secondary" className="w-full" onClick={() => setUpdatingOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
