import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/Button";
import { routes } from "../../config/routes";
import { EmptyState } from "../../shared/components/EmptyState";
import { Loader } from "../../shared/components/Loader";
import { Modal } from "../../shared/components/Modal";
import { Input } from "../../shared/components/Input";
import { useMoney } from "../../shared/hooks/useMoney";
import { useLocale } from "../../shared/localization";
import { useSession } from "../../shared/hooks/useSession";
import { notify } from "../../shared/utils/notify";
import { getValidationErrors, returnRequestSchema } from "../../shared/utils/validation";
import { formatDate, getStatusTone } from "../../shared/utils/formatters";
import { storefrontService } from "../services/storefrontService";

export function OrdersPage() {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { formatFromInr, language } = useMoney();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});
  const ordersQuery = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: () => storefrontService.getOrders(user.id),
    enabled: Boolean(user?.id),
  });
  const refundQuery = useQuery({
    queryKey: ["refund-requests", user?.id],
    queryFn: () => storefrontService.getRefundRequests(user.id),
    enabled: Boolean(user?.id),
  });

  if (ordersQuery.isLoading || refundQuery.isLoading) {
    return <Loader label={t("common.loading")} />;
  }

  const orders = ordersQuery.data || [];
  const refunds = refundQuery.data || [];

  if (!orders.length) {
    return <EmptyState title={t("orders.emptyTitle")} description={t("orders.emptyDescription")} />;
  }

  const refundMap = new Map(refunds.map((entry) => [entry.orderId, entry]));

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-[#dfccab] bg-white/85 p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9e6c24]">
          {t("orders.eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-5xl text-[#1a120e]">{t("orders.title")}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">{t("orders.subtitle")}</p>
      </section>

      <div className="grid gap-5">
        {orders.map((order) => {
          const refundRequest = refundMap.get(order.id);

          return (
            <article key={order.id} className="rounded-[32px] border border-[#dfccab] bg-white p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9e6c24]">{order.orderNumber}</div>
                  <h2 className="mt-2 font-display text-3xl text-[#1a120e]">{order.items[0]?.name}</h2>
                  <p className="mt-1 text-sm text-stone-500">{formatDate(order.createdAt, language)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-4 py-2 text-xs font-semibold ${getStatusTone(order.status)}`}>{order.status}</span>
                  {refundRequest ? (
                  <span className={`rounded-full px-4 py-2 text-xs font-semibold ${getStatusTone(refundRequest.status)}`}>
                      {t("orders.refundStatus", { status: refundRequest.status })}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm leading-6 text-stone-600">
                  {t("orders.total")} <span className="font-semibold text-[#1a120e]">{formatFromInr(order.total)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={routes.appOrderTracking(order.id)}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-transparent px-5 text-sm font-semibold text-[#20140f] transition duration-200 hover:bg-[#f4ead3]"
                  >
                    {t("common.trackOrder")}
                  </Link>
                  {!refundRequest ? (
                    <Button tone="secondary" onClick={() => setSelectedOrder(order)}>
                      {t("orders.requestReturn")}
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Modal open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} title={t("orders.returnModalTitle")}>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const parsed = returnRequestSchema.safeParse({ reason });

            if (!parsed.success) {
              setErrors(getValidationErrors(parsed.error));
              return;
            }

            try {
              setErrors({});
              await storefrontService.requestReturn(user.id, { orderId: selectedOrder.id, reason: parsed.data.reason });
              notify.success(t("orders.returnSubmitted"), {
                title: t("orders.returnSubmittedTitle"),
                iconKey: "order",
              });
              setSelectedOrder(null);
              setReason("");
              queryClient.invalidateQueries({ queryKey: ["orders"] });
              queryClient.invalidateQueries({ queryKey: ["refund-requests"] });
            } catch (error) {
              notify.error(error.message, { iconKey: "order" });
            }
          }}
        >
          <Input
            label={t("orders.returnReason")}
            as="textarea"
            required
            error={errors.reason}
            value={reason}
            onChange={(event) => {
              setErrors((current) => (current.reason ? { ...current, reason: undefined } : current));
              setReason(event.target.value);
            }}
            placeholder={t("orders.returnReasonPlaceholder")}
          />
          <Button type="submit">{t("orders.submitReturn")}</Button>
        </form>
      </Modal>
    </div>
  );
}
