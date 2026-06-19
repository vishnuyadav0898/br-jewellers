import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "../../shared/components/Button";
import { Input } from "../../shared/components/Input";
import { Loader } from "../../shared/components/Loader";
import { useLocale } from "../../shared/localization";
import { useSession } from "../../shared/hooks/useSession";
import { storefrontService } from "../services/storefrontService";
import { catalogService } from "../../shared/services/catalogService";
import { ProductCard } from "../components/ProductCard";


export function ProductsPage() {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [search, setSearch] = useState("");
  
  // Dynamic Sticky Height Check
  const [isTall, setIsTall] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const checkHeight = () => {
      if (sidebarRef.current) {
        const height = sidebarRef.current.offsetHeight;
        setIsTall(height > window.innerHeight - 140);
      }
    };

    checkHeight();

    const observer = new MutationObserver(checkHeight);
    if (sidebarRef.current) {
      observer.observe(sidebarRef.current, { childList: true, subtree: true });
    }

    window.addEventListener("resize", checkHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkHeight);
    };
  }, []);
  
  // Drawer states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedPurities, setSelectedPurities] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const toggleCheckbox = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const categoriesQuery = useQuery({
    queryKey: ["user-categories"],
    queryFn: catalogService.getCategories,
  });

  const activeFilters = {
    category: selectedCategories.join(","),
    material: selectedMaterials.join(","),
    purity: selectedPurities.join(","),
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
  };

  const productsQuery = useQuery({
    queryKey: ["products", search, activeFilters],
    queryFn: () => storefrontService.getProducts(search, activeFilters),
  });

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedMaterials.length > 0 ||
    selectedPurities.length > 0 ||
    minPrice ||
    maxPrice;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9e6c24]">Category</h3>
        <div className="flex flex-col gap-2">
          {(categoriesQuery.data || []).map((cat) => (
            <label key={cat.id || cat.name} className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer hover:text-gold-700 transition">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.name)}
                onChange={() => toggleCheckbox(selectedCategories, setSelectedCategories, cat.name)}
                className="rounded border-gold-300 text-gold-600 focus:ring-gold-500"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* Materials */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9e6c24]">Material</h3>
        <div className="flex flex-col gap-2">
          {["Gold", "Silver", "Platinum", "Rose Gold", "White Gold"].map((mat) => (
            <label key={mat} className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer hover:text-gold-700 transition">
              <input
                type="checkbox"
                checked={selectedMaterials.includes(mat)}
                onChange={() => toggleCheckbox(selectedMaterials, setSelectedMaterials, mat)}
                className="rounded border-gold-300 text-gold-600 focus:ring-gold-500"
              />
              {mat}
            </label>
          ))}
        </div>
      </div>

      {/* Purities */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9e6c24]">Purity</h3>
        <div className="flex flex-col gap-2">
          {["24K", "22K", "18K", "14K"].map((pur) => (
            <label key={pur} className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer hover:text-gold-700 transition">
              <input
                type="checkbox"
                checked={selectedPurities.includes(pur)}
                onChange={() => toggleCheckbox(selectedPurities, setSelectedPurities, pur)}
                className="rounded border-gold-300 text-gold-600 focus:ring-gold-500"
              />
              {pur}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9e6c24]">Price Range (INR)</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
          <Input
            placeholder="Max"
            type="number"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative">
      <section className="rounded-[34px] border border-[#dfccab] bg-white/85 p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9e6c24]">
          {t("products.eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-5xl text-[#1a120e]">{t("products.title")}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{t("products.subtitle")}</p>
        <div className="mt-5 flex gap-3 max-w-xl">
          <div className="flex-1">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("products.search")} />
          </div>
          <Button onClick={() => setIsFilterOpen(true)} tone="secondary" className="flex lg:hidden items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-white">
                !
              </span>
            )}
          </Button>
        </div>
      </section>


      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Desktop Persistent Sidebar */}
        <aside
          ref={sidebarRef}
          className={`hidden lg:block sticky z-20 h-fit rounded-[34px] border border-[#dfccab] bg-white/85 p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)] space-y-6 ${
            isTall ? "bottom-6 self-end" : "top-28 self-start"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gold-100 pb-4">
            <h2 className="font-display text-2xl text-[#1a120e] flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-gold-700" />
              Filters
            </h2>
            {hasActiveFilters && (
              <button
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedMaterials([]);
                  setSelectedPurities([]);
                  setMinPrice("");
                  setMaxPrice("");
                }}
              >
                Clear All
              </button>
            )}
          </div>
          <FilterContent />
        </aside>

        {/* Products Grid */}
        <div>
          {productsQuery.isLoading ? (
            <Loader label={t("common.loading")} />
          ) : productsQuery.data?.length === 0 ? (
            <div className="rounded-[34px] border border-[#dfccab] bg-white/85 p-12 text-center shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
              <h3 className="font-display text-2xl text-stone-700">No products found</h3>
              <p className="mt-2 text-stone-500">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {(productsQuery.data || []).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdded={() => queryClient.invalidateQueries({ queryKey: ["cart"] })}
                  onFavoriteChanged={() => queryClient.invalidateQueries({ queryKey: ["products", search, activeFilters] })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drawer Overlay for Mobile */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      {/* Slide-out Left Drawer for Mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col border-r border-[#dfccab] bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isFilterOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gold-100 pb-4">
          <h2 className="font-display text-2xl text-[#1a120e] flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-gold-700" />
            Filters
          </h2>
          <button
            onClick={() => setIsFilterOpen(false)}
            className="rounded-full p-2 text-stone-500 hover:bg-gold-50 hover:text-gold-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <FilterContent />
        </div>

        <div className="border-t border-[#dfccab] pt-4 flex gap-2">
          <Button
            className="flex-1"
            tone="secondary"
            onClick={() => {
              setSelectedCategories([]);
              setSelectedMaterials([]);
              setSelectedPurities([]);
              setMinPrice("");
              setMaxPrice("");
            }}
          >
            Clear All
          </Button>
          <Button className="flex-1" onClick={() => setIsFilterOpen(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
