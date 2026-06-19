import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Power, Trash2, Calendar, Percent, Tag } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { Modal } from "../../../shared/components/Modal";
import { notify } from "../../../shared/utils/notify";
import { PermissionGuard } from "../../../shared/components/PermissionGuard";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminStatusBadge } from "../../components/AdminStatusBadge";
import { AdminTable } from "../../components/AdminTable";
import { couponsService } from "../../services/couponsService";

const defaultForm = {
  name: "",
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  fixedDiscountValueINR: 0,
  fixedDiscountValueUSD: 0,
  maxDiscountINR: 0,
  maxDiscountUSD: 0,
  minOrderAmountINR: 0,
  minOrderAmountUSD: 0,
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  isActive: true,
  applicableMaterials: "",
  applicableCategories: "",
  usageLimit: "",
  usagePerUser: 1,
};

export function CouponListPage() {
  const queryClient = useQueryClient();
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingCoupon, setDeletingCoupon] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const couponsQuery = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: couponsService.listCoupons,
  });

  const refreshCoupons = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
  };

  const openCreate = () => {
    setActiveCoupon({ id: "new" });
    setForm(defaultForm);
    setErrors({});
  };

  const openEdit = (coupon) => {
    setActiveCoupon(coupon);
    setForm({
      name: coupon.name || "",
      code: coupon.code || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue ?? 10,
      fixedDiscountValueINR: coupon.fixedDiscountValue?.INR ?? 0,
      fixedDiscountValueUSD: coupon.fixedDiscountValue?.USD ?? 0,
      maxDiscountINR: coupon.maxDiscount?.INR ?? 0,
      maxDiscountUSD: coupon.maxDiscount?.USD ?? 0,
      minOrderAmountINR: coupon.minOrderAmount?.INR ?? 0,
      minOrderAmountUSD: coupon.minOrderAmount?.USD ?? 0,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      isActive: coupon.isActive !== false,
      applicableMaterials: coupon.applicableMaterials?.join(", ") || "",
      applicableCategories: coupon.applicableCategories?.join(", ") || "",
      usageLimit: coupon.usageLimit ?? "",
      usagePerUser: coupon.usagePerUser ?? 1,
    });
    setErrors({});
  };

  const handleToggleActive = async (coupon) => {
    const cid = coupon.id || coupon._id;
    setTogglingId(cid);
    try {
      await couponsService.updateCoupon(cid, { isActive: !coupon.isActive });
      notify.success(`Coupon ${!coupon.isActive ? "activated" : "deactivated"} successfully.`);
      refreshCoupons();
    } catch (err) {
      notify.error(err.message || "Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingCoupon) return;
    const cid = deletingCoupon.id || deletingCoupon._id;
    setDeleting(true);
    try {
      await couponsService.deleteCoupon(cid);
      notify.success("Coupon deleted successfully.");
      setDeletingCoupon(null);
      refreshCoupons();
    } catch (err) {
      notify.error(err.message || "Failed to delete coupon.");
    } finally {
      setDeleting(false);
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.code.trim()) nextErrors.code = "Code is required.";
    if (form.discountType === "percentage") {
      const val = Number(form.discountValue);
      if (isNaN(val) || val <= 0 || val > 100) {
        nextErrors.discountValue = "Discount percentage must be between 1 and 100.";
      }
    } else {
      if (Number(form.fixedDiscountValueINR) <= 0 || Number(form.fixedDiscountValueUSD) <= 0) {
        nextErrors.fixedDiscountValue = "Fixed discount values must be positive numbers.";
      }
    }
    if (!form.startDate) nextErrors.startDate = "Start date is required.";
    if (!form.endDate) nextErrors.endDate = "End date is required.";
    if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate)) {
      nextErrors.endDate = "End date cannot be earlier than start date.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        discountType: form.discountType,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        isActive: form.isActive,
        usagePerUser: Number(form.usagePerUser) || 1,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        minOrderAmount: {
          INR: Number(form.minOrderAmountINR) || 0,
          USD: Number(form.minOrderAmountUSD) || 0,
        },
        applicableMaterials: form.applicableMaterials
          ? form.applicableMaterials.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
          : [],
        applicableCategories: form.applicableCategories
          ? form.applicableCategories.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };

      if (form.discountType === "percentage") {
        payload.discountValue = Number(form.discountValue);
        payload.maxDiscount = {
          INR: Number(form.maxDiscountINR) || 0,
          USD: Number(form.maxDiscountUSD) || 0,
        };
      } else {
        payload.fixedDiscountValue = {
          INR: Number(form.fixedDiscountValueINR) || 0,
          USD: Number(form.fixedDiscountValueUSD) || 0,
        };
      }

      if (activeCoupon.id === "new") {
        await couponsService.createCoupon(payload);
        notify.success("Coupon created successfully.");
      } else {
        await couponsService.updateCoupon(activeCoupon.id, payload);
        notify.success("Coupon updated successfully.");
      }

      setActiveCoupon(null);
      refreshCoupons();
    } catch (err) {
      notify.error(err.message || "Failed to save coupon.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "code",
      header: "Code",
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#fff7ea] px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-[#9f6d22] ring-1 ring-[#e9c97b]">
              {row.code}
            </span>
          </div>
          <div className="mt-1 text-xs text-stone-500 font-semibold">{row.name}</div>
        </div>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      render: (row) => {
        if (row.discountType === "percentage") {
          return (
            <div>
              <span className="font-semibold text-stone-800">{row.discountValue}% Off</span>
              {row.maxDiscount?.INR > 0 && (
                <div className="text-[11px] text-stone-500">Cap: ₹{row.maxDiscount.INR}</div>
              )}
            </div>
          );
        }
        return (
          <div>
            <span className="font-semibold text-stone-800">Fixed Value</span>
            <div className="text-[11px] text-stone-500">
              ₹{row.fixedDiscountValue?.INR} / ${row.fixedDiscountValue?.USD}
            </div>
          </div>
        );
      },
    },
    {
      key: "validity",
      header: "Validity",
      render: (row) => (
        <div className="space-y-0.5 text-xs text-stone-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-stone-400" />
            <span>From: {new Date(row.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-stone-400" />
            <span>To: {new Date(row.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      ),
    },
    {
      key: "usage",
      header: "Usage Count",
      render: (row) => (
        <div className="text-xs text-stone-600 space-y-0.5">
          <div>Used: <span className="font-semibold text-stone-800">{row.totalUsedCount}</span></div>
          {row.usageLimit && (
            <div>Limit: <span className="font-semibold text-stone-800">{row.usageLimit}</span></div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <AdminStatusBadge
          status={row.isActive ? "active" : "disabled"}
          customLabels={{ active: "Active", disabled: "Inactive" }}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => {
        const cid = row.id || row._id;
        return (
          <div className="flex items-center gap-2">
            <PermissionGuard module="Coupon" action="Update">
              <Button
                tone="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() => openEdit(row)}
                title="Edit Coupon"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                tone="secondary"
                size="icon"
                className="h-8 w-8"
                loading={togglingId === cid}
                onClick={() => handleToggleActive(row)}
                title={row.isActive ? "Deactivate" : "Activate"}
              >
                <Power className="h-3.5 w-3.5" />
              </Button>
            </PermissionGuard>
            <PermissionGuard module="Coupon" action="Delete">
              <Button
                tone="secondary"
                size="icon"
                className="h-8 w-8 border-rose-200 hover:bg-rose-50 text-rose-600"
                onClick={() => setDeletingCoupon(row)}
                title="Delete Coupon"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </PermissionGuard>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promo Code Engine"
        title="Coupon Codes"
        description="Manage active percentage discount coupons, fixed amount coupons, and restriction rules."
        actions={
          <PermissionGuard module="Coupon" action="Add">
            <Button tone="accent" onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Coupon</span>
            </Button>
          </PermissionGuard>
        }
      />

      <AdminPanel>
        <AdminDataState query={couponsQuery}>
          {(data) => (
            <AdminTable
              columns={columns}
              rows={data}
              keyField="id"
              emptyMessage="No discount coupon codes found. Click Create Coupon to add one."
            />
          )}
        </AdminDataState>
      </AdminPanel>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deletingCoupon)}
        title="Delete Coupon"
        onClose={() => setDeletingCoupon(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Are you sure you want to delete coupon code{" "}
            <span className="font-semibold text-stone-900">
              {deletingCoupon?.code}
            </span>
            ? This action will permanently remove the coupon and all user assignments.
          </p>
          <div className="flex justify-end gap-3">
            <Button tone="secondary" onClick={() => setDeletingCoupon(null)}>
              Cancel
            </Button>
            <Button tone="danger" loading={deleting} onClick={handleDelete}>
              Delete Coupon
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create / Edit Modal */}
      <Modal
        open={Boolean(activeCoupon)}
        title={activeCoupon?.id === "new" ? "Create Coupon" : "Edit Coupon"}
        onClose={() => setActiveCoupon(null)}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[75vh]">
          <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Coupon Code *"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. BRGOLD10"
                required
                disabled={activeCoupon?.id !== "new"}
                error={errors.code}
              />
              <Input
                label="Coupon Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Festive Discount 10%"
                required
                error={errors.name}
              />
            </div>

            <Input
              label="Description"
              as="textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe restrictions or promotion details..."
              rows={2}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">Discount Type *</span>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  className="w-full rounded-3xl border border-[#dcc8a1] bg-white px-4 py-3 text-sm text-stone-900 transition focus:border-[#d3a347] focus:ring-2 focus:ring-[#f4e4bd]"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (INR & USD)</option>
                </select>
              </label>

              {form.discountType === "percentage" ? (
                <Input
                  label="Percentage Value (%) *"
                  type="number"
                  min={1}
                  max={100}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  required
                  error={errors.discountValue}
                />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Amount (INR) *"
                    type="number"
                    min={0}
                    value={form.fixedDiscountValueINR}
                    onChange={(e) => setForm({ ...form, fixedDiscountValueINR: e.target.value })}
                    required
                  />
                  <Input
                    label="Amount (USD) *"
                    type="number"
                    min={0}
                    value={form.fixedDiscountValueUSD}
                    onChange={(e) => setForm({ ...form, fixedDiscountValueUSD: e.target.value })}
                    required
                  />
                </div>
              )}
            </div>

            {form.discountType === "percentage" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Max Discount Cap (INR)"
                  type="number"
                  min={0}
                  value={form.maxDiscountINR}
                  onChange={(e) => setForm({ ...form, maxDiscountINR: e.target.value })}
                  helperText="Leave 0 for no limit"
                />
                <Input
                  label="Max Discount Cap (USD)"
                  type="number"
                  min={0}
                  value={form.maxDiscountUSD}
                  onChange={(e) => setForm({ ...form, maxDiscountUSD: e.target.value })}
                  helperText="Leave 0 for no limit"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Minimum Order Value (INR)"
                type="number"
                min={0}
                value={form.minOrderAmountINR}
                onChange={(e) => setForm({ ...form, minOrderAmountINR: e.target.value })}
              />
              <Input
                label="Minimum Order Value (USD)"
                type="number"
                min={0}
                value={form.minOrderAmountUSD}
                onChange={(e) => setForm({ ...form, minOrderAmountUSD: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date *"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
                error={errors.startDate}
              />
              <Input
                label="End Date *"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
                error={errors.endDate}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Usage Limit"
                type="number"
                min={1}
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                placeholder="Total times usable globally"
              />
              <Input
                label="Usage Limit Per User"
                type="number"
                min={1}
                value={form.usagePerUser}
                onChange={(e) => setForm({ ...form, usagePerUser: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Applicable Materials"
                value={form.applicableMaterials}
                onChange={(e) => setForm({ ...form, applicableMaterials: e.target.value })}
                placeholder="e.g. gold, diamond (comma separated)"
              />
              <Input
                label="Applicable Categories"
                value={form.applicableCategories}
                onChange={(e) => setForm({ ...form, applicableCategories: e.target.value })}
                placeholder="e.g. Rings, Necklaces (comma separated)"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-stone-300 text-[#d3a347] focus:ring-[#f4e4bd]"
              />
              <label htmlFor="isActive" className="text-sm font-semibold text-stone-700">
                Active and ready to use
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#dfccab] shrink-0">
            <Button tone="secondary" type="button" onClick={() => setActiveCoupon(null)}>
              Cancel
            </Button>
            <Button tone="accent" type="submit" loading={saving}>
              {activeCoupon?.id === "new" ? "Create Coupon" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
