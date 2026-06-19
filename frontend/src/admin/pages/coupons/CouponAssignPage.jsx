import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, User, Ticket } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Modal } from "../../../shared/components/Modal";
import { notify } from "../../../shared/utils/notify";
import { PermissionGuard } from "../../../shared/components/PermissionGuard";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminTable } from "../../components/AdminTable";
import { couponsService } from "../../services/couponsService";
import { usersService } from "../../services/usersService";

export function CouponAssignPage() {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const assignmentsQuery = useQuery({
    queryKey: ["admin", "coupon-assignments"],
    queryFn: () => couponsService.getAssignedCoupons(),
  });

  const couponsQuery = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: couponsService.listCoupons,
    enabled: openModal,
  });

  const usersQuery = useQuery({
    queryKey: ["admin", "users-dropdown"],
    queryFn: () => usersService.getUsers("customer", false),
    enabled: openModal,
  });

  const refreshAssignments = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "coupon-assignments"] });
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedCoupon || !selectedUser) {
      notify.error("Please select both a coupon and a user.");
      return;
    }

    setSaving(true);
    try {
      await couponsService.assignCoupon(selectedCoupon, selectedUser);
      notify.success("Coupon assigned successfully.");
      setOpenModal(false);
      setSelectedCoupon("");
      setSelectedUser("");
      refreshAssignments();
    } catch (err) {
      notify.error(err.message || "Failed to assign coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAssignment = async () => {
    if (!deletingAssignment) return;
    setDeleting(true);
    try {
      await couponsService.removeAssignedCoupon(deletingAssignment._id || deletingAssignment.id);
      notify.success("Coupon assignment removed successfully.");
      setDeletingAssignment(null);
      refreshAssignments();
    } catch (err) {
      notify.error(err.message || "Failed to remove assignment.");
    } finally {
      setDeleting(false);
    }
  };

  const activeCoupons = couponsQuery.data?.filter((c) => c.isActive) || [];
  const usersList = usersQuery.data || [];

  const columns = [
    {
      key: "coupon",
      header: "Coupon Code",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Ticket className="h-4 w-4 text-stone-400" />
          <div>
            <span className="rounded bg-[#fff7ea] px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-[#9f6d22] ring-1 ring-[#e9c97b]">
              {row.coupon?.code || "UNKNOWN"}
            </span>
            <div className="mt-0.5 text-xs text-stone-500 font-medium">{row.coupon?.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: "user",
      header: "Assigned To",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <User className="h-4 w-4 text-stone-400" />
          <div>
            <div className="text-sm font-semibold text-stone-800">{row.user?.name || "Deleted User"}</div>
            <div className="text-xs text-stone-500">{row.user?.email || "N/A"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "assignedAt",
      header: "Assigned Date",
      render: (row) => (
        <span className="text-xs text-stone-600">
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : "N/A"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <PermissionGuard module="Coupon" action="Assign">
          <Button
            tone="secondary"
            size="icon"
            className="h-8 w-8 border-rose-200 hover:bg-rose-50 text-rose-600"
            onClick={() => setDeletingAssignment(row)}
            title="Remove Assignment"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </PermissionGuard>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Targeted Marketing"
        title="Coupon Assignments"
        description="Assign custom coupon codes to specific customer accounts or revoke access."
        actions={
          <PermissionGuard module="Coupon" action="Assign">
            <Button tone="accent" onClick={() => setOpenModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Assign Coupon</span>
            </Button>
          </PermissionGuard>
        }
      />

      <AdminPanel>
        <AdminDataState query={assignmentsQuery}>
          {(data) => (
            <AdminTable
              columns={columns}
              rows={data}
              keyField="_id"
              emptyMessage="No targeted coupon assignments found. Click Assign Coupon to link a coupon to a customer."
            />
          )}
        </AdminDataState>
      </AdminPanel>

      {/* Delete Assignment Modal */}
      <Modal
        open={Boolean(deletingAssignment)}
        title="Remove Assignment"
        onClose={() => setDeletingAssignment(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Are you sure you want to remove the assignment of{" "}
            <span className="font-semibold text-stone-900">
              {deletingAssignment?.coupon?.code}
            </span>{" "}
            from user{" "}
            <span className="font-semibold text-stone-900">
              {deletingAssignment?.user?.name} ({deletingAssignment?.user?.email})
            </span>
            ? This customer will no longer be eligible to use this targeted coupon.
          </p>
          <div className="flex justify-end gap-3">
            <Button tone="secondary" onClick={() => setDeletingAssignment(null)}>
              Cancel
            </Button>
            <Button tone="danger" loading={deleting} onClick={handleRemoveAssignment}>
              Remove
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal
        open={openModal}
        title="Assign Coupon to User"
        onClose={() => setOpenModal(false)}
      >
        <form onSubmit={handleAssign} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Select Coupon *</span>
            <select
              value={selectedCoupon}
              onChange={(e) => setSelectedCoupon(e.target.value)}
              className="w-full rounded-3xl border border-[#dcc8a1] bg-white px-4 py-3 text-sm text-stone-900 transition focus:border-[#d3a347] focus:ring-2 focus:ring-[#f4e4bd]"
              required
            >
              <option value="">-- Select an active coupon --</option>
              {activeCoupons.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name} ({c.discountType === "percentage" ? `${c.discountValue}%` : "Fixed Amount"})
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Select Customer *</span>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full rounded-3xl border border-[#dcc8a1] bg-white px-4 py-3 text-sm text-stone-900 transition focus:border-[#d3a347] focus:ring-2 focus:ring-[#f4e4bd]"
              required
            >
              <option value="">-- Select a customer --</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
            <Button tone="secondary" type="button" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
            <Button tone="accent" type="submit" loading={saving}>
              Assign Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
