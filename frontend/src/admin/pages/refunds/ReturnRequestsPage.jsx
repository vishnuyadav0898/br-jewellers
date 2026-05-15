import { useState } from "react";
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
import { AdminPanel } from "../../components/AdminPanel";
import { AdminStatusBadge } from "../../components/AdminStatusBadge";
import { refundsService } from "../../services/refundsService";

export function ReturnRequestsPage() {
  const queryClient = useQueryClient();
  const { formatFromInr, language } = useMoney();
  const [activeRequest, setActiveRequest] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const requestsQuery = useQuery({
    queryKey: queryKeys.adminRefunds("all"),
    queryFn: () => refundsService.getRequests("all"),
  });
  const requests = requestsQuery.data || [];

  const resolveRequest = async (status) => {
    try {
      await refundsService.resolveRequest(activeRequest.id, status, adminNote);
      notify.success(`Request ${status.toLowerCase()}.`, {
        title: "Refund request updated",
      });
      setActiveRequest(null);
      setAdminNote("");
      queryClient.invalidateQueries({ queryKey: queryKeys.adminRefunds("all") });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminRefunds("status") });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    } catch (error) {
      notify.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Refunds & Returns"
          title="Return requests"
          description="Approve or reject return tickets while keeping a visible audit note in mock data for future backend parity."
        />
      </AdminPanel>

      <AdminDataState
        query={requestsQuery}
        loadingLabel="Loading return requests..."
        empty={!requests.length}
        emptyTitle="No return requests"
        emptyDescription="Mock refund requests will appear here when an order is marked for return."
      >
        <div className="grid gap-4">
          {requests.map((request) => (
            <AdminPanel key={request.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                    {request.orderNumber}
                  </div>
                  <h2 className="mt-2 font-display text-3xl text-[#1d130f]">{request.reason}</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {request.customerName} • {formatDate(request.requestedAt, language)} •{" "}
                    {formatFromInr(request.refundAmount)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <AdminStatusBadge value={request.status} />
                  <Button tone="secondary" size="sm" onClick={() => setActiveRequest(request)}>
                    Review
                  </Button>
                </div>
              </div>
              <div className="mt-4 rounded-[20px] bg-[#fff9ef] px-4 py-3 text-sm text-stone-600">
                Admin note: <span className="font-semibold text-[#1d130f]">{request.adminNote || "Awaiting review"}</span>
              </div>
            </AdminPanel>
          ))}
        </div>
      </AdminDataState>

      <Modal open={Boolean(activeRequest)} onClose={() => setActiveRequest(null)} title="Resolve return request">
        <div className="space-y-4">
          <p className="text-sm leading-6 text-stone-600">
            Approve or reject the request and store a note that future backend workflows can preserve.
          </p>
          <Input label="Admin note" as="textarea" value={adminNote} onChange={(event) => setAdminNote(event.target.value)} />
          <div className="flex justify-end gap-3">
            <Button tone="danger" onClick={() => resolveRequest("Rejected")}>
              Reject
            </Button>
            <Button onClick={() => resolveRequest("Approved")}>Approve</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
