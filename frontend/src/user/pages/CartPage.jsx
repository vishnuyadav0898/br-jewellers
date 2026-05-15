import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "../../shared/components/EmptyState";
import { Input } from "../../shared/components/Input";
import { Loader } from "../../shared/components/Loader";
import { Button } from "../../shared/components/Button";
import { useMoney } from "../../shared/hooks/useMoney";
import { useLocale } from "../../shared/localization";
import { useSession } from "../../shared/hooks/useSession";
import { useAppStore } from "../../shared/store/useAppStore";
import { notify } from "../../shared/utils/notify";
import { storefrontService } from "../services/storefrontService";

export function CartPage() {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { formatFromInr } = useMoney();
  const cartCouponCode = useAppStore((state) => state.cartCouponCode);
  const setCartCouponCode = useAppStore((state) => state.setCartCouponCode);
  const [inputCode, setInputCode] = useState(cartCouponCode);
  const cartQuery = useQuery({
    queryKey: ["cart", user?.id, cartCouponCode],
    queryFn: () => storefrontService.getCart(user.id, cartCouponCode),
    enabled: Boolean(user?.id),
  });

  if (cartQuery.isLoading) {
    return <Loader label={t("common.loading")} />;
  }

  if (!cartQuery.data.items.length) {
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

        {cartQuery.data.items.map((item) => (
          <article key={item.id} className="flex gap-4 rounded-[28px] border border-[#eadcc0] bg-[#fff8ec] p-4">
            <img src={item.image} alt={item.name} className="h-28 w-24 rounded-[22px] object-cover" />
            <div className="flex flex-1 flex-col justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl text-[#1a120e]">{item.name}</h2>
                <p className="text-sm text-stone-500">
                  {item.selectedColor} / {item.selectedSize}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#dcc8a1] bg-white px-2 py-2">
                  <button
                    type="button"
                    className="rounded-full bg-[#f6eacc] p-2"
                    onClick={async () => {
                      await storefrontService.updateCartQuantity(user.id, item.id, item.quantity - 1);
                      queryClient.invalidateQueries({ queryKey: ["cart"] });
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    className="rounded-full bg-[#f6eacc] p-2"
                    onClick={async () => {
                      await storefrontService.updateCartQuantity(user.id, item.id, item.quantity + 1);
                      queryClient.invalidateQueries({ queryKey: ["cart"] });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-semibold text-[#1a120e]">{formatFromInr(item.price * item.quantity)}</div>
                  <button
                    type="button"
                    className="rounded-full bg-[#fff0ef] p-3 text-rose-600"
                    onClick={async () => {
                      await storefrontService.removeCartItem(user.id, item.id);
                      queryClient.invalidateQueries({ queryKey: ["cart"] });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
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
              {t("cart.summary.activeCoupon", {
                code: cartQuery.data.coupon.code,
                discount: cartQuery.data.coupon.discountPercent,
              })}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
