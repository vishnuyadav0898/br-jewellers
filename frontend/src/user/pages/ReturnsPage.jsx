import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "../../shared/components/EmptyState";
import { OrdersPageSkeleton } from "../../shared/components/Skeleton";
import { useMoney } from "../../shared/hooks/useMoney";
import { useLocale } from "../../shared/localization";
import { useSession } from "../../shared/hooks/useSession";
import { formatDate, getStatusTone } from "../../shared/utils/formatters";
import { storefrontService } from "../services/storefrontService";
import { useSEO } from "../../shared/hooks/useSEO";

export function ReturnsPage() {
  useSEO({
    title: "My Returns",
    description: "Manage and monitor your refund and return requests for BR Jewellers purchases.",
    keywords: "my returns, refund status, jewellery returns, customer returns",
  });
  const { t } = useLocale();
  const { user } = useSession();
  const { formatFromInr, language } = useMoney();
  const refundQuery = useQuery({
    queryKey: ["refund-requests", user?.id],
    queryFn: () => storefrontService.getRefundRequests(user.id),
    enabled: Boolean(user?.id),
  });

  if (refundQuery.isLoading) {
    return <OrdersPageSkeleton />;
  }

  const refundData = refundQuery.data || [];

  if (!refundData.length) {
    return <EmptyState title={t("returns.emptyTitle")} description={t("returns.emptyDescription")} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-[#dfccab] bg-white/85 p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9e6c24]">
          {t("returns.eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-5xl text-[#1a120e]">{t("returns.title")}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">{t("returns.subtitle")}</p>
      </section>

      <div className="grid gap-4">
        {refundData.map((request) => (
          <article key={request.id} className="rounded-[30px] border border-[#dfccab] bg-white p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9e6c24]">{request.orderNumber}</div>
                <h2 className="mt-2 font-display text-3xl text-[#1a120e]">{request.reason}</h2>
                <p className="mt-1 text-sm text-stone-500">
                  {t("returns.requestedOn", { date: formatDate(request.requestedAt, language) })}
                </p>
              </div>
              <span className={`rounded-full px-4 py-2 text-xs font-semibold ${getStatusTone(request.status)}`}>{request.status}</span>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-stone-600 md:grid-cols-3">
              <div>{t("returns.refundAmount")} <span className="font-semibold text-[#1a120e]">{formatFromInr(request.refundAmount)}</span></div>
              <div>{t("returns.adminNote")} <span className="font-semibold text-[#1a120e]">{request.adminNote || t("returns.awaitingReview")}</span></div>
              <div>{t("returns.statusDescription")}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
