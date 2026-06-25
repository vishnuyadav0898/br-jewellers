import { cn } from "../utils/cn";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-stone-200/80 dark:bg-stone-800", className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-[30px] border border-[#eadcc0]/50 bg-white p-4 space-y-4">
      {/* Product Image Skeleton */}
      <Skeleton className="h-64 w-full rounded-[22px]" />
      
      {/* Category Eyebrow Skeleton */}
      <Skeleton className="h-3 w-16" />
      
      {/* Title Skeleton */}
      <Skeleton className="h-6 w-3/4" />
      
      {/* Rating & Review count */}
      <div className="flex gap-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-8" />
      </div>

      {/* Pricing & Add to Cart */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 rounded-[28px] border border-[#eadcc0]/50 bg-[#fff8ec]/50 p-4">
      {/* Image Skeleton */}
      <Skeleton className="h-28 w-24 rounded-[22px] shrink-0" />
      
      <div className="flex flex-1 flex-col justify-between py-1">
        <div className="space-y-2">
          {/* Title */}
          <Skeleton className="h-6 w-1/2" />
          {/* Subtitle */}
          <Skeleton className="h-4 w-1/4" />
        </div>
        
        <div className="flex items-center justify-between pt-4">
          {/* Quantity selector */}
          <Skeleton className="h-10 w-24 rounded-full" />
          <div className="flex items-center gap-3">
            {/* Price */}
            <Skeleton className="h-6 w-16" />
            {/* Remove button */}
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeSnapshotSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero section */}
      <div className="grid gap-6 rounded-[36px] border border-[#e1cfab] bg-[#17100d] p-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <Skeleton className="h-4 w-32 bg-stone-700/80" />
          <Skeleton className="h-12 w-3/4 bg-stone-700/80" />
          <Skeleton className="h-6 w-5/6 bg-stone-700/80" />
          <Skeleton className="h-6 w-2/3 bg-stone-700/80" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-12 w-36 rounded-full bg-stone-700/80" />
            <Skeleton className="h-12 w-36 rounded-full bg-stone-700/80" />
          </div>
        </div>
        <div className="grid gap-4">
          <Skeleton className="h-28 w-full rounded-[28px] bg-stone-700/80" />
          <Skeleton className="h-28 w-full rounded-[28px] bg-stone-700/80" />
        </div>
      </div>

      {/* Banners section */}
      <div className="grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-[30px] border border-[#dfccab] bg-white p-5 space-y-4">
            <Skeleton className="h-48 w-full rounded-[20px]" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>

      {/* Featured Products */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Breadcrumbs */}
      <Skeleton className="h-4 w-48" />

      {/* Details Container */}
      <div className="grid gap-6 rounded-[28px] sm:rounded-[36px] border border-[#dfccab] bg-white p-4 sm:p-6 lg:grid-cols-[1fr_0.95fr]">
        {/* Left: Images */}
        <div className="flex flex-col-reverse gap-4 sm:grid sm:grid-cols-[88px_1fr]">
          <div className="flex flex-row sm:flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 sm:w-20 sm:h-20 rounded-[18px] shrink-0" />
            ))}
          </div>
          <Skeleton className="w-full h-[320px] sm:h-[500px] rounded-[28px]" />
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-36" />
          </div>

          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-16 w-full" />

          {/* Variants Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[24px] bg-[#fff7ea] p-4 space-y-3">
                <Skeleton className="h-4 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16 rounded-full" />
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-12 w-40 rounded-full" />
            <Skeleton className="h-12 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FavoritesPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-[34px] border border-[#dfccab] bg-white/85 p-6 space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function BlogsPageSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-3 w-36 mx-auto" />
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-5/6 mx-auto" />
      </div>

      {/* Featured Blog */}
      <div className="rounded-[36px] border border-[#e1cfab] bg-white overflow-hidden">
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="h-72 md:h-96 w-full" />
          <div className="flex flex-col justify-center p-8 lg:p-12 space-y-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-10 w-5/6" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid gap-4 md:gap-8 grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-[20px] md:rounded-[30px] border border-[#e1cfab] bg-white p-5 space-y-4">
            <Skeleton className="h-32 sm:h-56 w-full rounded-[15px]" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlogDetailsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10 animate-pulse">
      <Skeleton className="h-4 w-32" />
      
      <div className="space-y-4">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-14 w-5/6" />
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <Skeleton className="w-full h-[320px] sm:h-[480px] rounded-[24px]" />

      <div className="space-y-6 pt-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-11/12" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-full" />
      </div>
    </div>
  );
}

export function OrdersPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-[34px] border border-[#dfccab] bg-white/85 p-6 space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="grid gap-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-[32px] border border-[#dfccab] bg-white p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28 rounded-full" />
                <Skeleton className="h-10 w-28 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* Profile Form card */}
      <div className="rounded-[32px] border border-[#e3d3b0] bg-white p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        <div className="flex gap-4 p-4 rounded-[28px] bg-[#f9f1df]/50">
          <Skeleton className="h-20 w-20 rounded-3xl" />
          <div className="space-y-2 self-center">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>

      {/* Address Book card */}
      <div className="rounded-[32px] border border-[#e3d3b0] bg-white p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-12 w-32 rounded-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AboutPageSkeleton() {
  return (
    <div className="space-y-24 px-4 py-8 w-full animate-pulse">
      <div className="rounded-[40px] border border-[#dfccab]/50 bg-stone-50 p-10 md:p-16 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-3 w-32 mx-auto" />
        <Skeleton className="h-14 w-2/3 mx-auto" />
        <Skeleton className="h-6 w-full mx-auto" />
        <Skeleton className="h-6 w-5/6 mx-auto" />
      </div>

      <div className="rounded-[32px] border border-[#dfccab]/50 h-[300px] sm:h-[450px] max-w-7xl mx-auto">
        <Skeleton className="w-full h-full rounded-[32px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.25fr_0.75fr] gap-12 items-center bg-[#17100d] p-10 md:p-14 rounded-[32px] max-w-7xl mx-auto">
        <div className="space-y-6">
          <Skeleton className="h-3 w-28 bg-stone-700/80" />
          <Skeleton className="h-10 w-48 bg-stone-700/80" />
          <Skeleton className="h-32 w-full bg-stone-700/80" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="aspect-[3/4] rounded-[20px] bg-stone-700/80" />
          <Skeleton className="aspect-[3/4] rounded-[20px] bg-stone-700/80" />
        </div>
      </div>
    </div>
  );
}

export function ContactPageSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] animate-pulse">
      <div className="rounded-[34px] border border-[#dfccab] bg-[#17100d] p-6 space-y-4">
        <Skeleton className="h-3 w-24 bg-stone-700/80" />
        <Skeleton className="h-12 w-3/4 bg-stone-700/80" />
        <Skeleton className="h-24 w-full bg-stone-700/80" />
      </div>
      <div className="rounded-[34px] border border-[#dfccab] bg-white p-6 space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-3 pt-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-6 w-2/3" />
      <div className="space-y-4 pt-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
