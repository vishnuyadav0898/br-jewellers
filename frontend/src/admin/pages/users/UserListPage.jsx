import { useDeferredValue, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { Modal } from "../../../shared/components/Modal";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { createAdminUserSchema, adminUserSchema, getValidationErrors } from "../../../shared/utils/validation";
import { notify } from "../../../shared/utils/notify";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPagination } from "../../components/AdminPagination";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminStatusBadge } from "../../components/AdminStatusBadge";
import { AdminTable } from "../../components/AdminTable";
import { usersService } from "../../services/usersService";

const pageSize = 8;
const defaultForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

export function UserListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("customer");
  const [activeUser, setActiveUser] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const usersQuery = useQuery({
    queryKey: [...queryKeys.adminUsers, role],
    queryFn: () => usersService.getUsers(role),
  });

  const filteredUsers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return usersQuery.data || [];

    return (usersQuery.data || []).filter((user) =>
      [user.name, user.email, user.phone, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [deferredSearch, usersQuery.data]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const rows = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const isCreate = activeUser?.id === "new";

  const refreshUsers = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
    queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const openCreate = () => {
    setActiveUser({ id: "new" });
    setForm(defaultForm);
    setErrors({});
  };

  const openEdit = (user) => {
    setActiveUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
    });
    setErrors({});
  };

  const closeModal = () => {
    setActiveUser(null);
    setForm(defaultForm);
    setErrors({});
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setDeleting(true);

    try {
      await usersService.deleteUser(deletingUser.id);
      notify.success("User deleted.", {
        title: "User removed",
      });
      refreshUsers();
      setDeletingUser(null);
    } catch (error) {
      notify.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const schema = isCreate ? createAdminUserSchema : adminUserSchema;
      const parsed = schema.safeParse(form);

      if (!parsed.success) {
        setErrors(getValidationErrors(parsed.error));
        return;
      }

      setErrors({});

      if (isCreate) {
        await usersService.createAdmin(parsed.data);
        notify.success("Admin user created.", {
          title: "User management updated",
        });
        setRole("admin");
      } else {
        await usersService.updateUser(activeUser.id, parsed.data);
        notify.success("User updated.", {
          title: "User management updated",
        });
      }

      refreshUsers();
      closeModal();
    } catch (error) {
      notify.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Users"
          title="User management"
          description="Manage customers and admin users directly on the live database catalog."
          actions={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create admin
            </Button>
          }
        />
        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_minmax(0,420px)_auto] lg:items-center">
          <div className="flex w-full rounded-full border border-gold-100 bg-gold-50 p-1">
            {[
              ["customer", "Customers"],
              ["admin", "Admins"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setRole(value);
                  setPage(1);
                }}
                className={`flex-1 text-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                  role === value ? "bg-espresso text-gold-50" : "text-espresso hover:bg-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, phone, or role"
          />
          <div className="inline-flex items-center gap-2 text-sm text-stone-500">
            <Search className="h-4 w-4 text-gold-700" />
            {filteredUsers.length} user{filteredUsers.length === 1 ? "" : "s"}
          </div>
        </div>
      </AdminPanel>

      <AdminDataState query={usersQuery} loadingLabel="Loading users...">
        <div className="space-y-4">
          <AdminPanel className="p-0">
            <AdminTable
              columns={[
                {
                  key: "name",
                  header: "Name",
                  render: (row) => (
                    <div className="flex items-center gap-3">
                      <img src={row.avatar} alt={row.name} className="h-11 w-11 rounded-full bg-gold-50" />
                      <span className="font-semibold text-espresso">{row.name}</span>
                    </div>
                  ),
                },
                { key: "email", header: "Email" },
                { key: "phone", header: "Phone" },
                {
                  key: "role",
                  header: "Role",
                  render: (row) => <AdminStatusBadge value={row.role === "admin" ? "Admin" : "Customer"} />,
                },
                role === "admin" && {
                  key: "actions",
                  header: "Actions",
                  render: (row) => (
                    <div className="flex flex-wrap gap-2">
                      <Button tone="secondary" size="sm" onClick={() => openEdit(row)} title="Edit user" aria-label="Edit user">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button tone="danger" size="sm" onClick={() => setDeletingUser(row)} title="Delete user" aria-label="Delete user">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ),
                },
              ].filter(Boolean)}
              rows={rows}
              emptyMessage="No users matched this view."
            />
          </AdminPanel>
          <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </AdminDataState>

      <Modal open={Boolean(activeUser)} onClose={closeModal} title={isCreate ? "Create admin user" : "Edit user"}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Name"
            required
            error={errors.name}
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
          <Input
            label="Email"
            type="email"
            required
            error={errors.email}
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
          <Input
            label="Phone"
            type="tel"
            error={errors.phone}
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
          <Input
            label={isCreate ? "Password" : "New password"}
            type="password"
            required={isCreate}
            helperText={isCreate ? "Minimum 8 characters." : "Leave blank to keep the current password."}
            error={errors.password}
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" tone="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {isCreate ? "Create admin" : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(deletingUser)} onClose={() => setDeletingUser(null)} title="Confirm deletion" className="max-w-md w-full">
        <div className="flex flex-col gap-4 w-full">
          <p className="text-sm text-stone-600 w-full">
            Are you sure you want to delete <span className="font-semibold text-espresso">{deletingUser?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex w-full gap-3 mt-2">
            <Button type="button" tone="secondary" className="flex-1 w-full" disabled={deleting} onClick={() => setDeletingUser(null)}>
              Cancel
            </Button>
            <Button type="button" tone="danger" className="flex-1 w-full" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
