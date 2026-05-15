import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
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
import { financeService } from "../../services/financeService";

export function FinanceReportsPage() {
  const { formatFromInr } = useMoney();
  const financeQuery = useQuery({
    queryKey: queryKeys.adminFinance,
    queryFn: financeService.getOverview,
  });

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Analytics"
          title="Finance reports"
          description="Revenue metrics and sales trends are grouped under analytics, but separated into their own page for cleaner operational scanning."
        />
      </AdminPanel>

      <AdminDataState query={financeQuery} loadingLabel="Loading finance overview...">
        {(financeData) => {
          const finance = financeData || {
            revenue: 0,
            paidRevenue: 0,
            orders: 0,
            averageOrderValue: 0,
            monthlySales: [],
          };

          return (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <AdminStatCard label="Revenue" value={formatFromInr(finance.revenue)} />
                <AdminStatCard label="Paid revenue" value={formatFromInr(finance.paidRevenue)} />
                <AdminStatCard label="Orders count" value={finance.orders} />
                <AdminStatCard
                  label="Average order value"
                  value={formatFromInr(finance.averageOrderValue)}
                />
              </div>

              <AdminPanel>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                  Monthly sales
                </div>
                <h2 className="mt-2 font-display text-3xl text-[#1d130f]">Revenue trend</h2>
                <div className="mt-5 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={finance.monthlySales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eadcc0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#d3a347" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </AdminPanel>
            </div>
          );
        }}
      </AdminDataState>
    </div>
  );
}
