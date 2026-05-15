import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { Modal } from "../../../shared/components/Modal";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { notify } from "../../../shared/utils/notify";
import { categorySchema, getValidationErrors } from "../../../shared/utils/validation";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminStatusBadge } from "../../components/AdminStatusBadge";
import { AdminTable } from "../../components/AdminTable";
import { catalogService } from "../../services/catalogService";

const defaultForm = {
  name: "",
  description: "",
  featured: false,
};

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
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
      name: category.name,
      description: category.description,
      featured: Boolean(category.featured),
    });
    setErrors({});
  };

  const closeModal = () => {
    setActiveCategory(null);
    setForm(defaultForm);
    setErrors({});
  };

  const columns = [
    { key: "name", header: "Category" },
    { key: "description", header: "Description" },
    { key: "productCount", header: "Products" },
    {
      key: "featured",
      header: "Status",
      render: (row) => <AdminStatusBadge value={row.featured ? "Featured" : "Standard"} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button tone="secondary" size="sm" onClick={() => openEdit(row)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            tone="danger"
            size="sm"
            onClick={async () => {
              try {
                await catalogService.deleteCategory(row.id);
                notify.success("Category deleted.", {
                  title: "Category removed",
                });
                refreshCategories();
              } catch (error) {
                notify.error(error.message);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Products"
          title="Categories"
          description="Category CRUD stays separate from products so catalogue taxonomy can scale independently later."
          actions={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add category
            </Button>
          }
        />
      </AdminPanel>

      <AdminDataState query={categoriesQuery} loadingLabel="Loading categories...">
        <AdminPanel>
          <AdminTable columns={columns} rows={categoriesQuery.data} emptyMessage="No categories available." />
        </AdminPanel>
      </AdminDataState>

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
                notify.success("Category created.", {
                  title: "New category added",
                });
              } else {
                await catalogService.updateCategory(activeCategory.id, parsed.data);
                notify.success("Category updated.", {
                  title: "Category changes saved",
                });
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
          <label className="flex items-center gap-3 rounded-3xl border border-[#dcc8a1] bg-[#fffaf1] px-4 py-3 text-sm font-medium text-stone-700">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
            />
            Featured category
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
    </div>
  );
}
