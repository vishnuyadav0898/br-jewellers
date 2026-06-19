import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, CheckCircle2, Package } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { routes } from "../../config/routes";
import { EmptyState } from "../../shared/components/EmptyState";
import { Input } from "../../shared/components/Input";
import { Loader } from "../../shared/components/Loader";
import { Button } from "../../shared/components/Button";
import { Modal } from "../../shared/components/Modal";
import { useMoney } from "../../shared/hooks/useMoney";
import { useLocale } from "../../shared/localization";
import { useSession } from "../../shared/hooks/useSession";
import { useAppStore } from "../../shared/store/useAppStore";
import { notify } from "../../shared/utils/notify";
import { storefrontService } from "../services/storefrontService";
import { Skeleton, CartItemSkeleton } from "../../shared/components/Skeleton";


export function CartPage() {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useSession();
  const { formatFromInr } = useMoney();
  const cartCouponCode = useAppStore((state) => state.cartCouponCode);
  const setCartCouponCode = useAppStore((state) => state.setCartCouponCode);
  const [inputCode, setInputCode] = useState(cartCouponCode);

  // Checkout and Address states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Track per-item loading for quantity buttons
  const [itemLoadingMap, setItemLoadingMap] = useState({});

  // Track order placed success state
  const [orderPlaced, setOrderPlaced] = useState(null); // { orderNumber, total }

  const [newAddress, setNewAddress] = useState({
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

  const cartQuery = useQuery({
    queryKey: ["cart", user?.id, cartCouponCode],
    queryFn: () => storefrontService.getCart(user.id, cartCouponCode),
    enabled: Boolean(user?.id),
  });

  const setItemLoading = (itemId, loading) => {
    setItemLoadingMap((prev) => ({ ...prev, [itemId]: loading }));
  };

  const handleUpdateQuantity = async (item, delta) => {
    const nextQty = item.quantity + delta;
    setItemLoading(item.id, true);
    try {
      await storefrontService.updateCartQuantity(user.id, item.id, nextQty);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (err) {
      notify.error(err.message || "Failed to update quantity");
    } finally {
      setItemLoading(item.id, false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setItemLoading(itemId, true);
    try {
      await storefrontService.removeCartItem(user.id, itemId);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      notify.success("Item removed from cart");
    } catch (err) {
      notify.error(err.message || "Failed to remove item");
    } finally {
      setItemLoading(itemId, false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await storefrontService.getAddresses(user.id);
      setAddresses(res);
      if (res.length > 0) {
        const defaultAddr = res.find((a) => a.isDefault) || res[0];
        setSelectedAddressId(defaultAddr._id || defaultAddr.id);
        setIsAddingAddress(false);
      } else {
        setIsAddingAddress(true);
      }
    } catch (e) {
      console.error(e);
      setIsAddingAddress(true);
    }
  };

  const handleProceedToCheckout = async () => {
    setIsCheckoutOpen(true);
    await fetchAddresses();
  };

  const validateAddressForm = () => {
    const errors = {};
    if (!newAddress.fullName.trim()) errors.fullName = "Full name is required";
    if (!newAddress.phone.trim()) {
      errors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(newAddress.phone.trim())) {
      errors.phone = "Phone must be a valid 10-digit number";
    }
    if (!newAddress.line1.trim()) errors.line1 = "Address line 1 is required";
    if (!newAddress.city.trim()) errors.city = "City is required";
    if (!newAddress.state.trim()) errors.state = "State is required";
    if (!newAddress.zip.trim()) errors.zip = "Pincode is required";

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!validateAddressForm()) return;

    try {
      setIsPlacingOrder(true);
      await storefrontService.createAddress(user.id, newAddress);
      notify.success("Address saved successfully");
      setIsAddingAddress(false);

      // Re-fetch addresses and select the new one
      const res = await storefrontService.getAddresses(user.id);
      setAddresses(res);
      const found =
        res.find((a) => a.line1 === newAddress.line1 && a.fullName === newAddress.fullName) ||
        res[res.length - 1];
      if (found) {
        setSelectedAddressId(found._id || found.id);
      }
    } catch (err) {
      notify.error(err.message || "Failed to add address");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      notify.error("Please select or add a shipping address");
      return;
    }

    try {
      setIsPlacingOrder(true);
      const response = await storefrontService.createOrder(user.id, {
        addressId: selectedAddressId,
      });

      const orderNumber =
        response?.orderNumber ||
        response?.data?.orderNumber ||
        `ORD-${Date.now().toString().slice(-6)}`;
      const orderTotal = cartQuery.data?.total || 0;

      notify.success("Your order was placed successfully!", {
        title: "Order Placed",
        iconKey: "order",
      });

      setIsCheckoutOpen(false);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      // Show the order placed success screen
      setOrderPlaced({ orderNumber, total: orderTotal });
    } catch (err) {
      notify.error(err.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartQuery.isLoading) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4 rounded-[34px] border border-[#dfccab] bg-white/85 p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9e6c24]">
              {t("cart.eyebrow")}
            </p>
            <h1 className="mt-2 font-display text-5xl text-[#1a120e]">{t("cart.title")}</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">{t("cart.subtitle")}</p>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <CartItemSkeleton key={index} />
            ))}
          </div>
        </section>

        <aside className="space-y-4 rounded-[34px] border border-[#dfccab] bg-[#17100d] p-6 text-[#f8efdc] shadow-[0_18px_60px_rgba(32,21,15,0.25)]">
          <Skeleton className="h-6 w-32 bg-stone-700/60" />
          <Skeleton className="h-10 w-48 bg-stone-700/60" />
          <div className="flex gap-2">
            <Skeleton className="h-12 flex-1 rounded-xl bg-stone-700/60" />
            <Skeleton className="h-12 w-20 rounded-xl bg-stone-700/60" />
          </div>
          <div className="space-y-3 rounded-[28px] border border-white/10 bg-white/5 p-5">
            <Skeleton className="h-4 w-full bg-stone-700/60" />
            <Skeleton className="h-4 w-5/6 bg-stone-700/60" />
            <Skeleton className="h-4 w-2/3 bg-stone-700/60" />
          </div>
          <Skeleton className="h-12 w-full rounded-full bg-stone-700/60" />
        </aside>
      </div>
    );
  }

  // ── Order Placed Success Screen ──────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="relative mx-auto mb-8">
          {/* Animated ring */}
          <span className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-60" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-emerald-50 border-4 border-emerald-200 shadow-[0_8px_32px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="h-14 w-14 text-emerald-500" strokeWidth={1.5} />
          </div>
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9e6c24] mb-3">
          Order Confirmed
        </p>
        <h1 className="font-display text-5xl text-[#1a120e] mb-3">
          Thank You!
        </h1>
        <p className="text-stone-500 text-base leading-7 max-w-md mb-2">
          Your order <span className="font-semibold text-[#1a120e]">{orderPlaced.orderNumber}</span> has been placed successfully.
        </p>
        <p className="text-stone-500 text-sm mb-8">
          Total paid:{" "}
          <span className="font-semibold text-[#8a5d18]">{formatFromInr(orderPlaced.total)}</span>
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to={routes.appOrders}
            className="inline-flex items-center gap-2 rounded-full bg-[#1a120e] px-6 py-3 text-sm font-semibold text-[#f8ebca] transition hover:bg-[#2d1f16]"
          >
            <Package className="h-4 w-4" />
            View My Orders
          </Link>
          <Link
            to={routes.appProducts}
            className="inline-flex items-center gap-2 rounded-full border border-[#ddc8a3] bg-white px-6 py-3 text-sm font-semibold text-[#1a120e] transition hover:bg-[#fff7ea]"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!cartQuery.data?.items?.length) {
    return <EmptyState title={t("cart.emptyTitle")} description={t("cart.emptyDescription")} />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-4 rounded-[34px] border border-[#dfccab] bg-white/85 p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9e6c24]">
            {t("cart.eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-5xl text-[#1a120e]">{t("cart.title")}</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">{t("cart.subtitle")}</p>
        </div>

        {cartQuery.data.items.map((item) => {
          const isLoading = Boolean(itemLoadingMap[item.id]);
          return (
            <article
              key={item.id}
              className={`flex gap-4 rounded-[28px] border border-[#eadcc0] bg-[#fff8ec] p-4 transition-opacity ${isLoading ? "opacity-60 pointer-events-none" : ""}`}
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-28 w-24 rounded-[22px] object-cover bg-[#f5ead2]"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="flex flex-1 flex-col justify-between gap-3">
                <div>
                  <h2 className="font-display text-3xl text-[#1a120e]">{item.name}</h2>
                  <p className="text-sm text-stone-500">
                    {[item.selectedColor, item.selectedSize].filter(
                      (v) => v && v !== "Default" && v !== "Standard"
                    ).join(" / ") || item.sku || "Default variant"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Quantity Controls */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#dcc8a1] bg-white px-2 py-2">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={isLoading}
                      className="rounded-full bg-[#f6eacc] p-2 transition hover:bg-[#f0ddb0] disabled:opacity-50"
                      onClick={() => handleUpdateQuantity(item, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={isLoading}
                      className="rounded-full bg-[#f6eacc] p-2 transition hover:bg-[#f0ddb0] disabled:opacity-50"
                      onClick={() => handleUpdateQuantity(item, +1)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold text-[#1a120e]">
                      {formatFromInr(item.price * item.quantity)}
                    </div>
                    <button
                      type="button"
                      aria-label="Remove item"
                      disabled={isLoading}
                      className="rounded-full bg-[#fff0ef] p-3 text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <aside className="space-y-4 rounded-[34px] border border-[#dfccab] bg-[#17100d] p-6 text-[#f8efdc] shadow-[0_18px_60px_rgba(32,21,15,0.25)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d5a957]">
            {t("cart.couponsEyebrow")}
          </p>
          <h2 className="mt-2 font-display text-4xl">{t("cart.couponsTitle")}</h2>
        </div>
        <div className="flex gap-2">
          <Input
            className="bg-white text-[#1a120e]"
            value={inputCode}
            onChange={(event) => setInputCode(event.target.value.toUpperCase())}
            placeholder={t("cart.couponPlaceholder")}
          />
          <Button
            tone="accent"
            onClick={async () => {
              try {
                const coupon = await storefrontService.applyCoupon(inputCode);
                setCartCouponCode(coupon.code);
                queryClient.invalidateQueries({ queryKey: ["cart"] });
                notify.success(t("cart.couponApplied", { code: coupon.code }), {
                  title: t("cart.couponAppliedTitle"),
                  iconKey: "sparkle",
                });
              } catch (error) {
                notify.error(error.message);
              }
            }}
          >
            {t("common.apply")}
          </Button>
        </div>

        <div className="space-y-3 rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between text-sm">
            <span>{t("cart.summary.subtotal")}</span>
            <span>{formatFromInr(cartQuery.data.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>{t("cart.summary.discount")}</span>
            <span>-{formatFromInr(cartQuery.data.discount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>{t("cart.summary.shipping")}</span>
            <span>{formatFromInr(cartQuery.data.shipping)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold">
            <span>{t("cart.summary.total")}</span>
            <span>{formatFromInr(cartQuery.data.total)}</span>
          </div>
          {cartQuery.data.coupon ? (
            <div className="rounded-2xl bg-[#f4d994] px-4 py-3 text-sm text-[#18110d]">
              {cartQuery.data.coupon.discountType === "fixed" ? (
                <span>
                  Coupon <strong>{cartQuery.data.coupon.code}</strong> is active for a flat discount of {formatFromInr(cartQuery.data.discount)}.
                </span>
              ) : (
                t("cart.summary.activeCoupon", {
                  code: cartQuery.data.coupon.code,
                  discount: cartQuery.data.coupon.discountPercent,
                })
              )}
            </div>
          ) : null}
        </div>

        <Button
          onClick={handleProceedToCheckout}
          className="w-full text-lg py-3 mt-4"
          tone="accent"
        >
          Proceed to Checkout
        </Button>
      </aside>

      <Modal open={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="Checkout Details">
        {isAddingAddress ? (
          <form onSubmit={handleAddAddress} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <h3 className="font-semibold text-stone-700">Add Shipping Address</h3>

            <Input
              label="Full Name"
              required
              value={newAddress.fullName}
              error={addressErrors.fullName}
              onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
              placeholder="e.g. John Doe"
            />

            <Input
              label="Phone Number"
              required
              value={newAddress.phone}
              error={addressErrors.phone}
              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
              placeholder="10-digit mobile number"
            />

            <Input
              label="Address Line 1"
              required
              value={newAddress.line1}
              error={addressErrors.line1}
              onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
              placeholder="Street address, P.O. box"
            />

            <Input
              label="Address Line 2 (Optional)"
              value={newAddress.line2}
              onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
              placeholder="Apartment, suite, unit, building"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                required
                value={newAddress.city}
                error={addressErrors.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                placeholder="City"
              />
              <Input
                label="State"
                required
                value={newAddress.state}
                error={addressErrors.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                placeholder="State"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="ZIP / Pincode"
                required
                value={newAddress.zip}
                error={addressErrors.zip}
                onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                placeholder="ZIP / Pincode"
              />
              <Input
                label="Country"
                required
                value={newAddress.country}
                onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                placeholder="Country"
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="rounded border-[#dfccab] text-[#8a5d18] focus:ring-[#8a5d18]"
                />
                Set as default address
              </label>
            </div>

            <div className="flex gap-3 pt-3">
              <Button type="submit" disabled={isPlacingOrder} className="flex-1">
                {isPlacingOrder ? "Saving..." : "Save Address"}
              </Button>
              {addresses.length > 0 && (
                <Button type="button" tone="secondary" onClick={() => setIsAddingAddress(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-stone-700">Select Shipping Address</h3>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(true)}
                  className="text-sm font-semibold text-[#8a5d18] hover:underline"
                >
                  + Add New Address
                </button>
              </div>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                {addresses.map((addr) => (
                  <label
                    key={addr._id || addr.id}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                      selectedAddressId === (addr._id || addr.id)
                        ? "border-[#8a5d18] bg-[#fffcf6]"
                        : "border-stone-200 bg-white hover:bg-stone-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedAddress"
                      value={addr._id || addr.id}
                      checked={selectedAddressId === (addr._id || addr.id)}
                      onChange={() => setSelectedAddressId(addr._id || addr.id)}
                      className="mt-1 text-[#8a5d18] focus:ring-[#8a5d18]"
                    />
                    <div className="text-sm">
                      <div className="font-semibold text-stone-900">
                        {addr.fullName}{" "}
                        <span className="text-xs font-normal text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full ml-2">
                          {addr.label || "Home"}
                        </span>
                      </div>
                      <div className="text-stone-600 mt-1">{addr.line1}</div>
                      {addr.line2 && <div className="text-stone-600">{addr.line2}</div>}
                      <div className="text-stone-600">
                        {addr.city}, {addr.state} - {addr.zip}
                      </div>
                      <div className="text-stone-500 mt-1 font-mono text-xs">{addr.phone}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-stone-200 pt-4 space-y-4">
              <div className="flex justify-between text-lg font-bold text-stone-900">
                <span>Total Amount:</span>
                <span>{formatFromInr(cartQuery.data.total)}</span>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !selectedAddressId}
                className="w-full text-lg py-3"
              >
                {isPlacingOrder ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
