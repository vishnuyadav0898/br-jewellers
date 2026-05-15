import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Package, RefreshCcw, ShoppingCart } from "lucide-react";
import { routes } from "../../../config/routes";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { useMoney } from "../../../shared/hooks/useMoney";
import { useLocale } from "../../../shared/localization";
import { formatDate } from "../../../shared/utils/formatters";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminStatCard } from "../../components/AdminStatCard";
import { AdminStatusBadge } from "../../components/AdminStatusBadge";
import { dashboardService } from "../../services/dashboardService";

const emptyOverview = {
  stats: {
    revenue: 0,
    products: 0,
    users: 0,
    pendingOrders: 0,
    pendingRefunds: 0,
  },
  recentOrders: [],
  pendingRefunds: [],
  lowStockProducts: [],
};

export function DashboardPage() {
  const { formatFromInr, language } = useMoney();
  const { t } = useLocale();
  const overviewQuery = useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: dashboardService.getOverview,
  });
  const overview = {
    ...emptyOverview,
    ...overviewQuery.data,
    stats: {
      ...emptyOverview.stats,
      ...overviewQuery.data?.stats,
    },
    recentOrders: overviewQuery.data?.recentOrders ?? emptyOverview.recentOrders,
    pendingRefunds: overviewQuery.data?.pendingRefunds ?? emptyOverview.pendingRefunds,
    lowStockProducts: overviewQuery.data?.lowStockProducts ?? emptyOverview.lowStockProducts,
  };

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow={t("admin.dashboard.eyebrow")}
          title={t("admin.dashboard.title")}
          description={t("admin.dashboard.description")}
        />
      </AdminPanel>

      <AdminDataState query={overviewQuery} loadingLabel={t("admin.dashboard.loading")}>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <AdminStatCard
              label={t("admin.dashboard.stats.revenue")}
              value={formatFromInr(overview.stats.revenue)}
              helper={t("admin.dashboard.helpers.revenue")}
            />
            <AdminStatCard
              label={t("admin.dashboard.stats.products")}
              value={overview.stats.products}
              helper={t("admin.dashboard.helpers.products")}
            />
            <AdminStatCard
              label={t("admin.dashboard.stats.users")}
              value={overview.stats.users}
              helper={t("admin.dashboard.helpers.users")}
            />
            <AdminStatCard
              label={t("admin.dashboard.stats.pendingOrders")}
              value={overview.stats.pendingOrders}
              helper={t("admin.dashboard.helpers.pendingOrders")}
            />
            <AdminStatCard
              label={t("admin.dashboard.stats.pendingRefunds")}
              value={overview.stats.pendingRefunds}
              helper={t("admin.dashboard.helpers.pendingRefunds")}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <AdminPanel>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                    {t("admin.dashboard.recentOrdersEyebrow")}
                  </div>
                  <h2 className="mt-2 font-display text-3xl text-[#1d130f]">
                    {t("admin.dashboard.recentOrdersTitle")}
                  </h2>
                </div>
                <Link to={routes.adminOrdersAll} className="text-sm font-semibold text-[#8a5d18]">
                  {t("admin.dashboard.viewAll")} <ArrowRight className="ml-1 inline h-4 w-4" />
                </Link>
              </div>

              <div className="mt-5 space-y-4">
                {overview.recentOrders.map((order) => (
                  <article
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#eadcc0] bg-[#fff9ef] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-[#f3e2bd] p-3 text-[#8a5d18]">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#1d130f]">{order.orderNumber}</div>
                        <div className="text-sm text-stone-500">
                          {formatDate(order.createdAt, language)} •{" "}
                          {t("admin.dashboard.itemCount", { count: order.items.length })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-[#1d130f]">
                        {formatFromInr(order.total)}
                      </div>
                      <AdminStatusBadge value={order.status} />
                    </div>
                  </article>
                ))}
              </div>
            </AdminPanel>

            <div className="space-y-6">
              <AdminPanel>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                      {t("admin.dashboard.refundAttentionEyebrow")}
                    </div>
                    <h2 className="mt-2 font-display text-3xl text-[#1d130f]">
                      {t("admin.dashboard.refundAttentionTitle")}
                    </h2>
                  </div>
                  <Link to={routes.adminRefundRequests} className="text-sm font-semibold text-[#8a5d18]">
                    {t("admin.dashboard.openQueue")}
                  </Link>
                </div>

                <div className="mt-5 space-y-4">
                  {overview.pendingRefunds.length ? (
                    overview.pendingRefunds.map((request) => (
                      <article
                        key={request.id}
                        className="rounded-[22px] border border-[#eadcc0] bg-[#fff8eb] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-[#1d130f]">
                            {request.orderNumber}
                          </div>
                          <AdminStatusBadge value={request.status} />
                        </div>
                        <p className="mt-2 text-sm text-stone-600">{request.reason}</p>
                        <p className="mt-2 text-sm text-stone-500">
                          {t("admin.dashboard.refundAmount", {
                            amount: formatFromInr(request.refundAmount),
                          })}
                        </p>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-[#dec99f] bg-[#fffaf1] px-4 py-6 text-sm text-stone-600">
                      {t("admin.dashboard.noPendingRefunds")}
                    </div>
                  )}
                </div>
              </AdminPanel>

              <AdminPanel>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                  {t("admin.dashboard.lowStockEyebrow")}
                </div>
                <h2 className="mt-2 font-display text-3xl text-[#1d130f]">
                  {t("admin.dashboard.lowStockTitle")}
                </h2>
                <div className="mt-5 space-y-3">
                  {overview.lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-3 rounded-[20px] border border-[#eadcc0] bg-[#fffaf1] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-[#f3e2bd] p-3 text-[#8a5d18]">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#1d130f]">{product.name}</div>
                          <div className="text-sm text-stone-500">{product.category}</div>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0ef] px-3 py-2 text-sm font-semibold text-rose-700">
                        <AlertCircle className="h-4 w-4" />
                        {t("admin.dashboard.stockLeft", { count: product.stock })}
                      </div>
                    </div>
                  ))}
                </div>
              </AdminPanel>
            </div>
          </div>
        </div>
      </AdminDataState>
    </div>
  );
}
