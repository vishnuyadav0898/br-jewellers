import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { routes } from "../../../config/routes";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { useMoney } from "../../../shared/hooks/useMoney";
import { formatDate } from "../../../shared/utils/formatters";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminStatusBadge } from "../../components/AdminStatusBadge";
import { usersService } from "../../services/usersService";

export function UserDetailsPage() {
  const { userId } = useParams();
  const { formatFromInr, language } = useMoney();
  const userQuery = useQuery({
    queryKey: queryKeys.adminUserDetails(userId),
    queryFn: () => usersService.getUserDetails(userId),
    enabled: Boolean(userId),
  });
  const user = userQuery.data;
  const orders = user?.orders || [];
  const refunds = user?.refunds || [];

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Users"
          title="User details"
          description="A read-only customer workspace with order and refund history grouped into one view."
          actions={
            <Link to={routes.adminUsersList} className="text-sm font-semibold text-[#8a5d18]">
              Back to user list
            </Link>
          }
        />
      </AdminPanel>

      <AdminDataState query={userQuery} loadingLabel="Loading customer profile...">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <AdminPanel>
            <div className="flex items-center gap-4">
              <img src={user?.avatar} alt={user?.name} className="h-20 w-20 rounded-full" />
              <div>
                <h2 className="font-display text-4xl text-[#1d130f]">{user?.name}</h2>
                <p className="text-sm text-stone-600">{user?.email}</p>
                <p className="text-sm text-stone-600">{user?.phone}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[22px] bg-[#fff9ef] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                  Lifetime spend
                </div>
                <div className="mt-2 font-display text-3xl text-[#1d130f]">
                  {formatFromInr(user?.totalSpend || 0)}
                </div>
              </div>
              <div className="rounded-[22px] bg-[#fff9ef] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                  Address
                </div>
                <div className="mt-2 text-sm leading-6 text-stone-600">
                  {user?.address || user?.addresses?.[0]?.line1 || "No address saved"}
                </div>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">Orders</div>
            <h2 className="mt-2 font-display text-3xl text-[#1d130f]">Recent order history</h2>
            <div className="mt-5 space-y-4">
              {orders.length ? (
                orders.map((order) => (
                  <article key={order.id} className="rounded-[22px] border border-[#eadcc0] bg-[#fffaf1] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[#1d130f]">{order.orderNumber}</div>
                        <div className="text-sm text-stone-500">{formatDate(order.createdAt, language)}</div>
                      </div>
                      <AdminStatusBadge value={order.status} />
                    </div>
                    <div className="mt-3 text-sm text-stone-600">
                      Total {formatFromInr(order.total)} • {order.items.length} item(s)
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-[#dec99f] bg-[#fffaf1] px-4 py-6 text-sm text-stone-600">
                  No orders found for this user.
                </div>
              )}
            </div>
          </AdminPanel>

          <AdminPanel className="xl:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">Refunds</div>
            <h2 className="mt-2 font-display text-3xl text-[#1d130f]">Return request history</h2>
            <div className="mt-5 space-y-4">
              {refunds.length ? (
                refunds.map((refund) => (
                  <article key={refund.id} className="rounded-[22px] border border-[#eadcc0] bg-[#fffaf1] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-[#1d130f]">{refund.orderNumber}</div>
                      <AdminStatusBadge value={refund.status} />
                    </div>
                    <p className="mt-2 text-sm text-stone-600">{refund.reason}</p>
                  </article>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-[#dec99f] bg-[#fffaf1] px-4 py-6 text-sm text-stone-600">
                  No return requests for this user.
                </div>
              )}
            </div>
          </AdminPanel>
        </div>
      </AdminDataState>
    </div>
  );
}
