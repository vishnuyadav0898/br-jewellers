import { forwardRef } from "react";
import { cn } from "../utils/cn";

const tones = {
  primary: "bg-[#0f0b09] text-[#f8edd1] hover:bg-[#231813]",
  secondary: "bg-white text-[#20140f] ring-1 ring-[#dbc8a2] hover:bg-[#fff7e6]",
  accent: "bg-[#d3a347] text-[#120d0b] hover:bg-[#e2ba63]",
  danger: "bg-[#9f2f2f] text-white hover:bg-[#872828]",
  ghost: "bg-transparent text-[#20140f] hover:bg-[#f4ead3]",
};

const sizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "p-0 text-sm",
};

export const Button = forwardRef(
  ({ as: Component = "button", className, tone = "primary", size = "md", loading = false, children, ...props }, ref) => {
    const isButton = Component === "button";
    const disabled = loading || props.disabled;

    return (
      <Component
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
          tones[tone],
          sizes[size],
          className
        )}
        {...props}
        {...(isButton ? { disabled } : { "aria-disabled": disabled || undefined })}
      >
        {loading ? "Please wait..." : children}
      </Component>
    );
  }
);

Button.displayName = "Button";
