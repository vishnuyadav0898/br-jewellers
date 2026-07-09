import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

export function TagInput({ label, required, values = [], placeholder, error, onChange }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (indexToRemove) => {
    onChange(values.filter((_, index) => index !== indexToRemove));
  };

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-stone-700">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      <div className="space-y-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-3xl border bg-white px-4 py-3 text-sm text-stone-900 transition focus:outline-none focus:border-[#d3a347] focus:ring-2 focus:ring-[#f4e4bd]",
            error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-[#dcc8a1]"
          )}
        />
        {values.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {values.map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-1 rounded-full bg-[#f4e4bd] px-3 py-1 text-sm text-stone-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="rounded-full p-0.5 hover:bg-stone-200 focus:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
      <span className="text-xs text-stone-500">Press enter or comma to add a tag</span>
    </label>
  );
}
