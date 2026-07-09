import React from "react";
import { cn } from "../utils/cn";

export function DiamondRating({
  rating = 0,
  max = 5,
  interactive = false,
  onChange = () => {},
  size = "md", // sm, md, lg
  className,
}) {
  const [hoverRating, setHoverRating] = React.useState(0);

  const displayRating = hoverRating || rating;

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };

  // SVG for a diamond shape
  const DiamondIcon = ({ filled }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        sizeClasses[size],
        "transition-colors duration-200",
        filled ? "fill-[#d3a347] text-[#d3a347]" : "fill-transparent text-stone-300"
      )}
    >
      <path d="M12 2L2 12l10 10 10-10L12 2z" />
    </svg>
  );

  return (
    <div
      className={cn("flex items-center gap-1", interactive && "cursor-pointer", className)}
      onMouseLeave={() => interactive && setHoverRating(0)}
    >
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        return (
          <div
            key={i}
            className={cn(
              "relative",
              interactive && "hover:scale-110 transition-transform"
            )}
            onClick={() => interactive && onChange(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
          >
            <DiamondIcon filled={starValue <= displayRating} />
            
            {/* For fractional ratings (non-interactive) */}
            {!interactive && starValue > displayRating && starValue - 1 < displayRating && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${(displayRating % 1) * 100}%` }}
              >
                <DiamondIcon filled={true} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
