import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { useMoney } from "../../../shared/hooks/useMoney";
import { formatDate } from "../../../shared/utils/formatters";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminStatusBadge } from "../../components/AdminStatusBadge";
import { refundsService } from "../../services/refundsService";

export function RefundStatusPage() {
  const { formatFromInr, language } = useMoney();
  const refundsQuery = useQuery({
    queryKey: queryKeys.adminRefunds("status"),
    queryFn: () => refundsService.getRequests("all"),
  });
  const refunds = refundsQuery.data || [];

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Refunds & Returns"
          title="Refund status"
          description="A status-only view for support and operations teams who need resolution visibility without editing the queue."
        />
      </AdminPanel>

      <AdminDataState
        query={refundsQuery}
        loadingLabel="Loading refund statuses..."
        empty={!refunds.length}
        emptyTitle="No refund updates"
        emptyDescription="All resolved and pending refund status updates will appear here."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {refunds.map((request) => (
            <AdminPanel key={request.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[#1d130f]">{request.orderNumber}</div>
                  <div className="text-sm text-stone-500">{request.customerName}</div>
                </div>
                <AdminStatusBadge value={request.status} />
              </div>
              <div className="mt-4 space-y-2 text-sm text-stone-600">
                <div>Refund amount: {formatFromInr(request.refundAmount)}</div>
                <div>Requested on: {formatDate(request.requestedAt, language)}</div>
                <div>Resolved on: {request.resolvedAt ? formatDate(request.resolvedAt, language) : "Pending"}</div>
                <div>Admin note: {request.adminNote || "No note saved yet."}</div>
              </div>
            </AdminPanel>
          ))}
        </div>
      </AdminDataState>
    </div>
  );
}
