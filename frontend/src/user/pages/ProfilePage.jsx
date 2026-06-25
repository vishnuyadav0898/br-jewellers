import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MapPin, Check } from "lucide-react";
import { Button } from "../../shared/components/Button";
import { Input } from "../../shared/components/Input";
import { Modal } from "../../shared/components/Modal";
import { ProfilePageSkeleton } from "../../shared/components/Skeleton";
import { useSession } from "../../shared/hooks/useSession";
import { storefrontService } from "../services/storefrontService";
import { notify } from "../../shared/utils/notify";
import { ProfileForm } from "../../shared/components/ProfileForm";
import { useSEO } from "../../shared/hooks/useSEO";

export function ProfilePage() {
  useSEO({
    title: "My Profile",
    description: "Manage your personal profile, saved shipping addresses, and security settings at BR Jewellers.",
    keywords: "my profile, shipping address, account settings, BR Jewellers",
  });
  const { user } = useSession();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // null means adding new address
  const [addressToDelete, setAddressToDelete] = useState(null); // null means no address to delete
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    label: "Home",
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState({});

  const addressesQuery = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: () => storefrontService.getAddresses(user.id),
    enabled: Boolean(user?.id),
  });

  const validateAddressForm = () => {
    const errors = {};
    if (!addressForm.fullName.trim()) errors.fullName = "Full name is required";
    if (!addressForm.phone.trim()) {
      errors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(addressForm.phone.trim())) {
      errors.phone = "Phone must be a valid 10-digit number";
    }
    if (!addressForm.line1.trim()) errors.line1 = "Address line 1 is required";
    if (!addressForm.city.trim()) errors.city = "City is required";
    if (!addressForm.state.trim()) errors.state = "State is required";
    if (!addressForm.zip.trim()) errors.zip = "Pincode is required";

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      zip: "",
      country: "India",
      label: "Home",
      isDefault: false,
    });
    setAddressErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (address) => {
    setEditingAddress(address);
    setAddressForm({
      fullName: address.fullName || "",
      phone: address.phone || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      zip: address.zip || "",
      country: address.country || "India",
      label: address.label || "Home",
      isDefault: address.isDefault || false,
    });
    setAddressErrors({});
    setIsModalOpen(true);
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    if (!validateAddressForm()) return;

    try {
      if (editingAddress) {
        await storefrontService.updateAddress(user.id, editingAddress._id || editingAddress.id, addressForm);
        notify.success("Address updated successfully");
      } else {
        await storefrontService.createAddress(user.id, addressForm);
        notify.success("Address added successfully");
      }
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
    } catch (err) {
      notify.error(err.message || "Operation failed");
    }
  };

  const handleDeleteAddress = (address) => {
    setAddressToDelete(address);
  };

  const handleSetDefault = async (address) => {
    try {
      await storefrontService.updateAddress(user.id, address._id || address.id, {
        ...address,
        isDefault: true,
      });
      notify.success("Default address updated");
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
    } catch (err) {
      notify.error(err.message || "Failed to set default");
    }
  };

  if (addressesQuery.isLoading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <ProfileForm roleLabel="Customer profile" />

      <section className="rounded-[32px] border border-[#e3d3b0] bg-white/90 p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl text-[#1a120e]">Address Book</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Manage your saved shipping addresses for faster checkout.
            </p>
          </div>
          <Button onClick={handleOpenAdd} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Address
          </Button>
        </div>

        {!addressesQuery.data || addressesQuery.data.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#eadcc0] rounded-[24px] bg-[#fffcf8]">
            <MapPin className="h-12 w-12 mx-auto text-[#d5a957]/50 mb-3" />
            <p className="text-stone-500 font-medium">No saved addresses yet.</p>
            <p className="text-xs text-stone-400 mt-1">Add an address to speed up checkout.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addressesQuery.data.map((addr) => (
              <div
                key={addr._id || addr.id}
                className={`flex flex-col justify-between p-5 rounded-2xl border transition ${
                  addr.isDefault
                    ? "border-[#8a5d18] bg-[#fffcf6] shadow-sm shadow-[#f8edd5]"
                    : "border-stone-200 bg-white hover:bg-stone-50"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-semibold text-stone-900 flex items-center gap-2 flex-wrap">
                      {addr.fullName}
                      <span className="text-xs font-normal text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full">
                        {addr.label || "Home"}
                      </span>
                    </div>
                    {addr.isDefault && (
                      <span className="text-[11px] font-semibold text-gold-700 bg-gold-50 border border-gold-200 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Check className="h-3 w-3" /> Default
                      </span>
                    )}
                  </div>
                  <div className="text-stone-600 mt-2 text-sm leading-relaxed">
                    {addr.line1}
                    {addr.line2 && `, ${addr.line2}`}
                  </div>
                  <div className="text-stone-600 text-sm">
                    {addr.city}, {addr.state} - {addr.zip}
                  </div>
                  <div className="text-stone-500 mt-2 font-mono text-xs">{addr.phone}</div>
                </div>

                <div className="border-t border-stone-100 mt-4 pt-3 flex items-center justify-between">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(addr)}
                      className="text-xs font-bold text-[#8a5d18] hover:text-[#734d12]"
                    >
                      Edit
                    </button>
                    <span className="text-stone-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800"
                    >
                      Delete
                    </button>
                  </div>

                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr)}
                      className="text-xs font-semibold text-stone-500 hover:text-stone-700"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAddress ? "Edit Address" : "Add Address"}>
        <form onSubmit={handleSubmitAddress} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          <Input
            label="Label (e.g. Home, Work)"
            value={addressForm.label}
            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
            placeholder="Home"
          />

          <Input
            label="Full Name"
            required
            value={addressForm.fullName}
            error={addressErrors.fullName}
            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
            placeholder="e.g. John Doe"
          />

          <Input
            label="Phone Number"
            required
            value={addressForm.phone}
            error={addressErrors.phone}
            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
            placeholder="10-digit mobile number"
          />

          <Input
            label="Address Line 1"
            required
            value={addressForm.line1}
            error={addressErrors.line1}
            onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
            placeholder="Street address, P.O. box"
          />

          <Input
            label="Address Line 2 (Optional)"
            value={addressForm.line2}
            onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
            placeholder="Apartment, suite, unit, building"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              required
              value={addressForm.city}
              error={addressErrors.city}
              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
              placeholder="City"
            />
            <Input
              label="State"
              required
              value={addressForm.state}
              error={addressErrors.state}
              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
              placeholder="State"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ZIP / Pincode"
              required
              value={addressForm.zip}
              error={addressErrors.zip}
              onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
              placeholder="ZIP / Pincode"
            />
            <Input
              label="Country"
              required
              value={addressForm.country}
              onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
              placeholder="Country"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                className="rounded border-[#dfccab] text-[#8a5d18] focus:ring-[#8a5d18]"
              />
              Set as default address
            </label>
          </div>

          <div className="flex gap-3 pt-3">
            <Button type="submit" className="flex-1">
              Save Address
            </Button>
            <Button type="button" tone="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(addressToDelete)} onClose={() => setAddressToDelete(null)} title="Delete Address" className="max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-stone-600 leading-relaxed">
            Are you sure you want to delete this address? This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              tone="danger"
              onClick={async () => {
                try {
                  await storefrontService.deleteAddress(user.id, addressToDelete._id || addressToDelete.id);
                  notify.success("Address deleted successfully");
                  queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
                } catch (err) {
                  notify.error(err.message || "Delete failed");
                } finally {
                  setAddressToDelete(null);
                }
              }}
              className="flex-1"
            >
              Delete
            </Button>
            <Button type="button" tone="secondary" onClick={() => setAddressToDelete(null)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
