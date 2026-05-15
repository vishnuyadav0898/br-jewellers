import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { routes } from "../../../config/routes";
import { Input } from "../../../shared/components/Input";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { useMoney } from "../../../shared/hooks/useMoney";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPagination } from "../../components/AdminPagination";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminTable } from "../../components/AdminTable";
import { usersService } from "../../services/usersService";

const pageSize = 6;

export function UserListPage() {
  const { formatFromInr } = useMoney();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(search);
  const usersQuery = useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: usersService.getUsers,
  });

  const filteredUsers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return usersQuery.data || [];

    return (usersQuery.data || []).filter((user) =>
      [user.name, user.email, user.phone].filter(Boolean).some((value) => value.toLowerCase().includes(query))
    );
  }, [deferredSearch, usersQuery.data]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const rows = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Users"
          title="User list"
          description="This section is intentionally view-only so the admin panel can inspect customer state without mutating account ownership data."
        />
        <div className="mt-5 max-w-md">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search customers"
          />
        </div>
      </AdminPanel>

      <AdminDataState query={usersQuery} loadingLabel="Loading users...">
        <div className="space-y-4">
          <AdminPanel>
            <AdminTable
              columns={[
                {
                  key: "user",
                  header: "Customer",
                  render: (row) => (
                    <div className="flex items-center gap-3">
                      <img src={row.avatar} alt={row.name} className="h-11 w-11 rounded-full" />
                      <div>
                        <div className="font-semibold text-[#1a120e]">{row.name}</div>
                        <div className="text-xs text-stone-500">{row.email}</div>
                      </div>
                    </div>
                  ),
                },
                { key: "phone", header: "Phone" },
                { key: "totalOrders", header: "Orders" },
                {
                  key: "totalSpend",
                  header: "Lifetime spend",
                  render: (row) => formatFromInr(row.totalSpend),
                },
                { key: "returnRequests", header: "Returns" },
                {
                  key: "actions",
                  header: "Details",
                  render: (row) => (
                    <Link
                      to={row.id ? routes.adminUserDetails(row.id) : routes.adminUsersList}
                      className="text-sm font-semibold text-[#8a5d18]"
                    >
                      View profile
                    </Link>
                  ),
                },
              ]}
              rows={rows}
            />
          </AdminPanel>
          <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </AdminDataState>
    </div>
  );
}
