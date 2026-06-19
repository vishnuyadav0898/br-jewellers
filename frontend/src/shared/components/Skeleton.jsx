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
