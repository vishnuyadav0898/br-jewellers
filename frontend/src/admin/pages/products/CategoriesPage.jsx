import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Power, Search, Trash2 } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { Modal } from "../../../shared/components/Modal";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { notify } from "../../../shared/utils/notify";
import { categorySchema, getValidationErrors } from "../../../shared/utils/validation";
import { PermissionGuard } from "../../../shared/components/PermissionGuard";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminStatusBadge } from "../../components/AdminStatusBadge";
import { AdminTable } from "../../components/AdminTable";
import { catalogService } from "../../services/catalogService";

const defaultForm = {
  name: "",
  description: "",
  isActive: true,
};

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const categoriesQuery = useQuery({
    queryKey: queryKeys.adminCategories,
    queryFn: catalogService.getCategories,
  });

  const refreshCategories = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.adminCategories });
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
  };

  const openCreate = () => {
    setActiveCategory({ id: "new" });
    setForm(defaultForm);
    setErrors({});
  };

  const openEdit = (category) => {
    setActiveCategory(category);
    setForm({
      name: category.name || "",
      description: category.description || "",
      isActive: category.isActive !== false,
    });
    setErrors({});
  };

  const handleToggleStatus = async (category) => {
    setTogglingId(category.id);
    try {
      await catalogService.updateCategoryStatus(category.id, !category.isActive);
      notify.success(
        `Category marked as ${!category.isActive ? "Active" : "Inactive"}.`,
        { title: "Status updated" }
      );
      refreshCategories();
    } catch (error) {
      notify.error(error.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setDeleting(true);

    try {
      await catalogService.deleteCategory(deletingCategory.id);
      notify.success("Category deleted.", { title: "Category removed" });
      refreshCategories();
      setDeletingCategory(null);
    } catch (error) {
      notify.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const closeModal = () => {
    setActiveCategory(null);
    setForm(defaultForm);
    setErrors({});
  };

  const columns = [
    { key: "name", header: "Category" },
    { key: "description", header: "Description" },
    {
      key: "isActive",
      header: "Status",
      render: (row) => (
        <AdminStatusBadge value={row.isActive !== false ? "Active" : "Inactive"} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <PermissionGuard module="Category" action="Update">
            <Button
              type="button"
              tone="secondary"
              size="sm"
              onClick={() => openEdit(row)}
              title="Edit Category"
              aria-label="Edit Category"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              tone="secondary"
              size="sm"
              onClick={() => handleToggleStatus(row)}
              loading={togglingId === row.id}
              title={row.isActive !== false ? "Deactivate Category" : "Activate Category"}
              aria-label={row.isActive !== false ? "Deactivate Category" : "Activate Category"}
            >
              <Power className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard module="Category" action="Delete">
            <Button
              type="button"
              tone="danger"
              size="sm"
              onClick={() => setDeletingCategory(row)}
              title="Delete Category"
              aria-label="Delete Category"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  const filteredCategories = (categoriesQuery.data || []).filter((category) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return [category.name, category.description]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Products"
          title="Product categories"
          description="Manage product collections and taxonomy definitions to structure your catalog."
          actions={
            <PermissionGuard module="Category" action="Add">
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add category
              </Button>
            </PermissionGuard>
          }
        />
        <div className="mt-5 flex justify-end">
          <div className="w-full max-w-md">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories"
            />
          </div>
        </div>
      </AdminPanel>

      <AdminDataState query={categoriesQuery} loadingLabel="Loading categories...">
        <AdminPanel className="p-0">
          <AdminTable columns={columns} rows={filteredCategories} emptyMessage="No categories available." />
        </AdminPanel>
      </AdminDataState>

      {/* Create / Edit Modal */}
      <Modal
        open={Boolean(activeCategory)}
        onClose={closeModal}
        title={activeCategory?.id === "new" ? "Create category" : "Edit category"}
      >
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            try {
              const parsed = categorySchema.safeParse(form);

              if (!parsed.success) {
                setErrors(getValidationErrors(parsed.error));
                return;
              }

              setErrors({});
              if (activeCategory?.id === "new") {
                await catalogService.createCategory(parsed.data);
                notify.success("Category created.", { title: "New category added" });
              } else {
                await catalogService.updateCategory(activeCategory.id, parsed.data);
                notify.success("Category updated.", { title: "Category changes saved" });
              }
              refreshCategories();
              closeModal();
            } catch (error) {
              notify.error(error.message);
            } finally {
              setSaving(false);
            }
          }}
        >
          <Input
            label="Category name"
            required
            error={errors.name}
            value={form.name}
            onChange={(event) => {
              setErrors((current) => (current.name ? { ...current, name: undefined } : current));
              setForm((current) => ({ ...current, name: event.target.value }));
            }}
          />
          <Input
            label="Description"
            as="textarea"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
          <label className="flex items-center gap-3 rounded-3xl border border-[#dcc8a1] bg-[#fffaf1] px-4 py-3 text-sm font-medium text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
            />
            Active (visible to customers)
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" tone="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        title="Confirm deletion"
        className="max-w-md w-full"
      >
        <div className="flex flex-col gap-4 w-full">
          <p className="text-sm text-stone-600 w-full">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-espresso">{deletingCategory?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex w-full gap-3 mt-2">
            <Button
              type="button"
              tone="secondary"
              className="flex-1 w-full"
              disabled={deleting}
              onClick={() => setDeletingCategory(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              tone="danger"
              className="flex-1 w-full"
              loading={deleting}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
