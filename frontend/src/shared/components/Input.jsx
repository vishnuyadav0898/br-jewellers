import { forwardRef } from "react";
import { cn } from "../utils/cn";

export const Input = forwardRef(
  ({ label, error, helperText, className, as = "input", ...props }, ref) => {
    const Component = as;
    const normalizedLabel =
      typeof label === "string" ? label.replace(/\s*\*+\s*$/, "").trim() : "";
    const supportsPlaceholder =
      (as === "input" || as === "textarea") &&
      !["checkbox", "radio", "file", "hidden"].includes(props.type);
    const placeholder =
      props.placeholder ??
      (supportsPlaceholder
        ? normalizedLabel
          ? `Enter ${normalizedLabel.toLowerCase()}`
          : "Type here"
        : undefined);

    return (
      <label className="block space-y-2">
        {label ? (
          <span className="text-sm font-medium text-stone-700">
            {label}
            {props.required ? <span className="ml-1 text-rose-500">*</span> : null}
          </span>
        ) : null}
        <Component
          ref={ref}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-required={props.required}
          className={cn(
            "w-full rounded-3xl border border-[#dcc8a1] bg-white px-4 py-3 text-sm text-stone-900 transition placeholder:text-stone-400 focus:border-[#d3a347] focus:ring-2 focus:ring-[#f4e4bd]",
            as === "textarea" && "min-h-28 resize-none",
            error && "border-rose-300 focus:border-rose-400 focus:ring-rose-100",
            className
          )}
          {...props}
        />
        {error ? <span className="text-xs text-rose-600">{error}</span> : null}
        {!error && helperText ? <span className="text-xs text-stone-500">{helperText}</span> : null}
      </label>
    );
  }
);

Input.displayName = "Input";
