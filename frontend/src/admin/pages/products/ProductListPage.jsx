import { useDeferredValue, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye, EyeOff, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { routes } from "../../../config/routes";
import { palette } from "../../../config/palette";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { Modal } from "../../../shared/components/Modal";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { PermissionGuard } from "../../../shared/components/PermissionGuard";
import { useMoney } from "../../../shared/hooks/useMoney";
import { notify } from "../../../shared/utils/notify";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPagination } from "../../components/AdminPagination";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminStatusBadge } from "../../components/AdminStatusBadge";
import { AdminTable } from "../../components/AdminTable";
import { catalogService } from "../../services/catalogService";

const pageSize = 8;

export function ProductListPage() {
  const { formatFromInr } = useMoney();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(true); // "active" | "inactive" | "all"
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusProduct, setStatusProduct] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedPurity, setSelectedPurity] = useState("");

  const deferredSearch = useDeferredValue(search);

  const categoriesQuery = useQuery({
    queryKey: queryKeys.adminCategories,
    queryFn: catalogService.getCategories,
  });

  const productsQuery = useQuery({
    queryKey: [
      ...queryKeys.adminProducts(deferredSearch, page),
      statusFilter,
      selectedCategory,
      selectedMaterial,
      selectedPurity,
    ],
    queryFn: () =>
      catalogService.getProducts(deferredSearch, {
        isActive: statusFilter,
        category: selectedCategory || undefined,
        material: selectedMaterial || undefined,
        purity: selectedPurity || undefined,
      }),
  });

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    try {
      await catalogService.deleteProduct(deletingProduct.backendId || deletingProduct.id);
      notify.success("Product deleted.", {
        title: "Product removed",
      });
      
      // Update cache directly to avoid refetching list
      queryClient.setQueriesData({ queryKey: ["admin", "products"] }, (oldProducts) => {
        if (!oldProducts) return oldProducts;
        return oldProducts.filter((p) => p.id !== deletingProduct.id && p.backendId !== deletingProduct.id);
      });
      
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      setDeletingProduct(null);
    } catch (error) {
      notify.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusProduct) return;
    setStatusLoading(true);
    try {
      const nextActive = statusProduct.isActive === false ? true : false;
      await catalogService.updateProductStatus(statusProduct.backendId || statusProduct.id, nextActive);
      notify.success(
        nextActive ? "Product activated successfully." : "Product deactivated successfully.",
        {
          title: "Status updated",
        }
      );
      
      // Update cache directly to avoid refetching list
      queryClient.setQueriesData({ queryKey: ["admin", "products"] }, (oldProducts, query) => {
        if (!oldProducts) return oldProducts;
        const statusFilterVal = query?.queryKey?.[4];
        
        return oldProducts
          .map((p) => {
            if (p.id === statusProduct.id || p.backendId === statusProduct.id) {
              return { ...p, isActive: nextActive };
            }
            return p;
          })
          .filter((p) => {
            if (statusFilterVal === true) return p.isActive === true;
            if (statusFilterVal === false) return p.isActive === false;
            return true;
          });
      });
      
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      setStatusProduct(null);
    } catch (error) {
      notify.error(error.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const filteredProducts = productsQuery.data || [];

  const paginated = useMemo(() => {
    const rows = filteredProducts;
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    const safePage = Math.min(page, totalPages);

    return {
      rows: rows.slice((safePage - 1) * pageSize, safePage * pageSize),
      totalPages,
      totalRows: rows.length,
    };
  }, [page, filteredProducts]);

  const columns = [
    {
      key: "product",
      header: "Product",
      render: (row) => (
        <div className="flex min-w-[260px] items-center gap-3">
          <img
            src={row.coverImage || row.images?.[0]}
            alt={row.name}
            className="h-14 w-14 rounded-lg border border-gold-100 bg-gold-50 object-cover"
          />
          <div>
            <Link
              to={routes.adminProductDetails(row.backendId || row.id)}
              className={`font-semibold ${palette.text.strong} hover:text-gold-700`}
            >
              {row.name}
            </Link>
            <div className="mt-1 text-xs text-stone-500">{row.category || "Unassigned"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "gemstone",
      header: "Gemstone",
      render: (row) => <span className="text-sm text-stone-700">{row.gemstone || row.badge || "Gold"}</span>,
    },
    {
      key: "price",
      header: "Price range",
      render: (row) => (
        <div>
          <div className={`font-semibold ${palette.text.strong}`}>{formatFromInr(row.price)}</div>
          <div className="text-xs text-stone-500">Max {formatFromInr(row.originalPrice || row.price)}</div>
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      render: (row) => (
        <div className="space-y-1">
          <div className={`font-semibold ${palette.text.strong}`}>{row.stock}</div>
          <AdminStatusBadge value={row.stock > 10 ? "Active" : row.stock > 0 ? "Low" : "Draft"} />
        </div>
      ),
    },
    {
      key: "media",
      header: "Media",
      render: (row) => <span className="text-sm text-stone-600">{row.images?.length || 0} image(s)</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <PermissionGuard module="Product" action="Update">
            <Button
              type="button"
              tone="secondary"
              size="sm"
              onClick={() => setStatusProduct(row)}
              title={row.isActive ? "Deactivate Product" : "Activate Product"}
              aria-label={row.isActive ? "Deactivate Product" : "Activate Product"}
            >
              {row.isActive ? (
                <Eye className="h-4 w-4 text-emerald-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-stone-400" />
              )}
            </Button>
            <Button
              as={Link}
              to={routes.adminProductEdit(row.id)}
              tone="secondary"
              size="sm"
              title="Edit Product"
              aria-label="Edit Product"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard module="Product" action="Delete">
            <Button
              type="button"
              tone="danger"
              size="sm"
              onClick={() => setDeletingProduct(row)}
              title="Delete Product"
              aria-label="Delete Product"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Products"
          title="Product list"
          description="View and manage the complete product catalog, configure display parameters, and set pricing rules."
          actions={
            <div className="flex gap-2">
              <PermissionGuard module="Product" action="Add">
                <Button as={Link} to={routes.adminBulkUpload} tone="secondary">
                  Bulk upload
                </Button>
                <Button as={Link} to={routes.adminProductCreate}>
                  <Plus className="h-4 w-4" />
                  Add product
                </Button>
              </PermissionGuard>
            </div>
          }
        />
        <div className="mt-5 flex flex-col gap-3">
          {/* Row 1: Search + Status tabs */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by product name, category, gemstone, or tag"
              />
            </div>
            <div className="flex gap-1 rounded-3xl bg-[#f5e9d4]/40 p-1">
              {[
                [true, "Active"],
                [false, "Inactive"],
                ["", "All"],
              ].map(([val, label]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setStatusFilter(val);
                    setPage(1);
                  }}
                  className={`rounded-3xl px-4 py-2 text-xs font-semibold transition ${
                    statusFilter === val
                      ? "bg-gold-500 text-white shadow-md shadow-gold-100"
                      : "text-stone-600 hover:bg-gold-50 hover:text-gold-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Dropdowns + count + clear */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            <select
              value={selectedCategory}
              className="w-full rounded-3xl border border-gold-100 bg-white px-3 py-2 text-xs text-stone-900 focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
              onChange={(event) => { setSelectedCategory(event.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              {(categoriesQuery.data || []).map((cat) => (
                <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            <select
              value={selectedMaterial}
              className="w-full rounded-3xl border border-gold-100 bg-white px-3 py-2 text-xs text-stone-900 focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
              onChange={(event) => { setSelectedMaterial(event.target.value); setPage(1); }}
            >
              <option value="">All Materials</option>
              {["Gold", "Silver", "Platinum", "Rose Gold", "White Gold"].map((mat) => (
                <option key={mat} value={mat}>{mat}</option>
              ))}
            </select>

            <select
              value={selectedPurity}
              className="w-full rounded-3xl border border-gold-100 bg-white px-3 py-2 text-xs text-stone-900 focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
              onChange={(event) => { setSelectedPurity(event.target.value); setPage(1); }}
            >
              <option value="">All Purities</option>
              {["24K", "22K", "18K", "14K"].map((pur) => (
                <option key={pur} value={pur}>{pur}</option>
              ))}
            </select>
          </div>

          {(selectedCategory || selectedMaterial || selectedPurity) && (
            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
                onClick={() => { setSelectedCategory(""); setSelectedMaterial(""); setSelectedPurity(""); setPage(1); }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </AdminPanel>

      <AdminDataState query={productsQuery} loadingLabel="Loading product catalogue...">
        <div className="space-y-4">
          <AdminPanel className="p-0">
            <AdminTable
              columns={columns}
              rows={paginated.rows}
              emptyMessage="No products matched this search."
            />
          </AdminPanel>
          <AdminPagination page={page} totalPages={paginated.totalPages} onChange={setPage} />
        </div>
      </AdminDataState>

      <Modal
        open={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        title="Confirm deletion"
        className="max-w-md w-full"
      >
        <div className="flex flex-col gap-4 w-full">
          <p className="text-sm text-stone-600 w-full">
            Are you sure you want to delete <span className="font-semibold text-espresso">{deletingProduct?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex w-full gap-3 mt-2">
            <Button type="button" tone="secondary" className="flex-1 w-full" disabled={deleting} onClick={() => setDeletingProduct(null)}>
              Cancel
            </Button>
            <Button type="button" tone="danger" className="flex-1 w-full" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(statusProduct)}
        onClose={() => setStatusProduct(null)}
        title={statusProduct?.isActive ? "Deactivate product" : "Activate product"}
        className="max-w-md w-full"
      >
        <div className="flex flex-col gap-4 w-full">
          <p className="text-sm text-stone-600 w-full">
            Are you sure you want to {statusProduct?.isActive ? "deactivate" : "activate"}{" "}
            <span className="font-semibold text-espresso">{statusProduct?.name}</span>?
          </p>
          <div className="flex w-full gap-3 mt-2">
            <Button
              type="button"
              tone="secondary"
              className="flex-1 w-full"
              disabled={statusLoading}
              onClick={() => setStatusProduct(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              tone={statusProduct?.isActive ? "danger" : "primary"}
              className="flex-1 w-full"
              loading={statusLoading}
              onClick={handleToggleStatus}
            >
              {statusProduct?.isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
