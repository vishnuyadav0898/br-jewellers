import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { useMoney } from "../../../shared/hooks/useMoney";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminStatCard } from "../../components/AdminStatCard";
import { analyticsService } from "../../services/analyticsService";

const chartColors = ["#d3a347", "#8a5d18", "#e7c98a", "#5f4320", "#b6853d"];

export function AnalyticsOverviewPage() {
  const { formatFromInr } = useMoney();
  const analyticsQuery = useQuery({
    queryKey: queryKeys.adminAnalytics,
    queryFn: analyticsService.getSummary,
  });

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Analytics"
          title="Analytics overview"
          description="Mock behavioural metrics help shape the admin architecture now, while leaving room for real event streams later."
        />
      </AdminPanel>

      <AdminDataState query={analyticsQuery} loadingLabel="Loading analytics...">
        {(analyticsData) => {
          const analytics = analyticsData || {
            revenue: 0,
            orders: 0,
            refunds: 0,
            featuredProducts: 0,
            mostViewed: [],
            categoryBreakdown: [],
            topSelling: [],
            mostLiked: [],
            mostFavorited: [],
          };

          return (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <AdminStatCard label="Revenue" value={formatFromInr(analytics.revenue)} />
                <AdminStatCard label="Orders" value={analytics.orders} />
                <AdminStatCard label="Refunds" value={analytics.refunds} />
                <AdminStatCard label="Featured products" value={analytics.featuredProducts} />
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <AdminPanel>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                    Product signals
                  </div>
                  <h2 className="mt-2 font-display text-3xl text-[#1d130f]">View, like, and favourite trends</h2>
                  <div className="mt-5 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.mostViewed}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eadcc0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#d3a347" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </AdminPanel>

                <AdminPanel>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                    Popular categories
                  </div>
                  <h2 className="mt-2 font-display text-3xl text-[#1d130f]">Category mix</h2>
                  <div className="mt-5 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.categoryBreakdown}
                          dataKey="productCount"
                          nameKey="name"
                          outerRadius={110}
                          innerRadius={60}
                        >
                          {analytics.categoryBreakdown.map((entry, index) => (
                            <Cell key={entry.id} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </AdminPanel>
              </div>

              <div className="grid gap-6 xl:grid-cols-3">
                {[
                  { title: "Most purchased", rows: analytics.topSelling },
                  { title: "Most liked", rows: analytics.mostLiked },
                  { title: "Most favourited", rows: analytics.mostFavorited },
                ].map((group) => (
                  <AdminPanel key={group.title}>
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                      Ranking
                    </div>
                    <h2 className="mt-2 font-display text-3xl text-[#1d130f]">{group.title}</h2>
                    <div className="mt-5 space-y-3">
                      {group.rows.map((row) => (
                        <div
                          key={row.id}
                          className="flex items-center justify-between rounded-[20px] border border-[#eadcc0] bg-[#fffaf1] px-4 py-3"
                        >
                          <div className="text-sm font-semibold text-[#1d130f]">{row.name}</div>
                          <div className="text-sm text-stone-600">{row.count ?? row.soldCount}</div>
                        </div>
                      ))}
                    </div>
                  </AdminPanel>
                ))}
              </div>
            </div>
          );
        }}
      </AdminDataState>
    </div>
  );
}
