import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { routes } from "../../../config/routes";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { useMoney } from "../../../shared/hooks/useMoney";
import { formatDate } from "../../../shared/utils/formatters";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminStatusBadge } from "../../components/AdminStatusBadge";
import { PermissionGuard } from "../../../shared/components/PermissionGuard";
import { Button } from "../../../shared/components/Button";
import { notify } from "../../../shared/utils/notify";
import { usersService } from "../../services/usersService";

export function UserDetailsPage() {
  const { userId } = useParams();
  const queryClient = useQueryClient();
  const { formatFromInr, language } = useMoney();

  const userQuery = useQuery({
    queryKey: queryKeys.adminUserDetails(userId),
    queryFn: () => usersService.getUserDetails(userId),
    enabled: Boolean(userId),
  });

  const user = userQuery.data;
  const orders = user?.orders || [];
  const refunds = user?.refunds || [];

  const allPermissionsQuery = useQuery({
    queryKey: ["admin", "permissions", "list"],
    queryFn: () => usersService.getAllPermissions(),
    enabled: Boolean(user && user.role === "admin"),
  });

  const userPermissionsQuery = useQuery({
    queryKey: ["admin", "permissions", "user", userId],
    queryFn: () => usersService.getUserPermissions(userId),
    enabled: Boolean(user && user.role === "admin"),
  });

  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    if (userPermissionsQuery.data) {
      setSelectedPermissions(userPermissionsQuery.data);
    }
  }, [userPermissionsQuery.data]);

  const handleToggleAction = (moduleName, actionName) => {
    setSelectedPermissions((current) => {
      const existingModule = current.find((p) => p.module === moduleName);
      if (!existingModule) {
        return [...current, { module: moduleName, actions: [actionName] }];
      }

      let updatedActions;
      if (existingModule.actions.includes(actionName)) {
        updatedActions = existingModule.actions.filter((a) => a !== actionName);
      } else {
        updatedActions = [...existingModule.actions, actionName];
      }

      if (updatedActions.length === 0) {
        return current.filter((p) => p.module !== moduleName);
      }

      return current.map((p) =>
        p.module === moduleName ? { ...p, actions: updatedActions } : p
      );
    });
  };

  const isActionChecked = (moduleName, actionName) => {
    const moduleEntry = selectedPermissions.find((p) => p.module === moduleName);
    return moduleEntry ? moduleEntry.actions.includes(actionName) : false;
  };

  const assignMutation = useMutation({
    mutationFn: (perms) => usersService.assignUserPermissions(userId, perms),
    onSuccess: () => {
      notify.success("Permissions updated successfully.");
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUserDetails(userId) });
      queryClient.invalidateQueries({ queryKey: ["admin", "permissions", "user", userId] });
    },
    onError: (err) => {
      notify.error(err.message || "Failed to update permissions.");
    },
  });

  const handleSavePermissions = () => {
    assignMutation.mutate(selectedPermissions);
  };

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
          <AdminPanel className={user?.role === "admin" ? "xl:col-span-2" : ""}>
            <div className="flex items-center gap-4">
              <img src={user?.avatar} alt={user?.name} className="h-20 w-20 rounded-full" />
              <div>
                <h2 className="font-display text-4xl text-[#1d130f]">{user?.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-stone-600">{user?.email}</p>
                  <AdminStatusBadge value={user?.role === "admin" ? "Admin" : "Customer"} />
                </div>
                <p className="text-sm text-stone-600 mt-0.5">{user?.phone}</p>
              </div>
            </div>

            <div className={`mt-5 grid gap-4 ${user?.role !== "admin" ? "md:grid-cols-2" : ""}`}>
              {user?.role !== "admin" && (
                <div className="rounded-[22px] bg-[#fff9ef] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                    Lifetime spend
                  </div>
                  <div className="mt-2 font-display text-3xl text-[#1d130f]">
                    {formatFromInr(user?.totalSpend || 0)}
                  </div>
                </div>
              )}
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

          {user?.role !== "admin" && (
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
          )}

          {user?.role === "admin" && (
            <PermissionGuard module="Permission" action="View">
              <AdminPanel className="xl:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">Security</div>
                <h2 className="mt-2 font-display text-3xl text-[#1d130f]">Administrator Permissions</h2>
                <p className="mt-1 text-sm text-stone-500">Assign granular functional module permissions for this administrator account.</p>

                {allPermissionsQuery.isLoading || userPermissionsQuery.isLoading ? (
                  <div className="py-6 text-center text-sm text-stone-500">Loading permission database...</div>
                ) : (
                  <div className="mt-6 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {allPermissionsQuery.data?.map((perm) => (
                        <div key={perm.name} className="rounded-[22px] border border-[#eadcc0] bg-[#fffaf1] p-5 shadow-sm">
                          <div className="font-semibold text-[#1d130f] border-b border-[#ebdcc2] pb-2 mb-3">
                            {perm.name}
                          </div>
                          <div className="space-y-2">
                            {perm.actions.map((action) => {
                              const checked = isActionChecked(perm.name, action);
                              return (
                                <label key={action} className="flex items-center gap-3 text-sm text-stone-700 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleToggleAction(perm.name, action)}
                                    className="rounded border-[#dec99f] text-[#8a5d18] focus:ring-[#8a5d18] h-4 w-4"
                                  />
                                  <span>{action}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <PermissionGuard module="Permission" action="Assign">
                      <div className="flex justify-end pt-2">
                        <Button onClick={handleSavePermissions} loading={assignMutation.isPending}>
                          Save Permissions
                        </Button>
                      </div>
                    </PermissionGuard>
                  </div>
                )}
              </AdminPanel>
            </PermissionGuard>
          )}

          {user?.role !== "admin" && (
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
          )}
        </div>
      </AdminDataState>
    </div>
  );
}
