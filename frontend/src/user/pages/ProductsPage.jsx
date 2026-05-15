import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "../../shared/components/Input";
import { Loader } from "../../shared/components/Loader";
import { useLocale } from "../../shared/localization";
import { useSession } from "../../shared/hooks/useSession";
import { storefrontService } from "../services/storefrontService";
import { ProductCard } from "../components/ProductCard";

export function ProductsPage() {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [search, setSearch] = useState("");
  const productsQuery = useQuery({
    queryKey: ["products", search, user?.id],
    queryFn: () => storefrontService.getProducts(search, user?.id),
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-[#dfccab] bg-white/85 p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9e6c24]">
          {t("products.eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-5xl text-[#1a120e]">{t("products.title")}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{t("products.subtitle")}</p>
        <div className="mt-5 max-w-xl">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("products.search")} />
        </div>
      </section>

      {productsQuery.isLoading ? (
        <Loader label={t("common.loading")} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {productsQuery.data.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdded={() => queryClient.invalidateQueries({ queryKey: ["cart"] })}
              onFavoriteChanged={() => queryClient.invalidateQueries({ queryKey: ["products", search, user?.id] })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
