import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

export function Modal({ open, title, onClose, children, className }) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#110d0a]/50 px-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={cn("w-full max-w-xl rounded-[32px] border border-[#e2d0ae] bg-[#fffaf2] p-6 shadow-[0_26px_80px_rgba(29,17,10,0.24)]", className)}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title ? <h2 className="font-display text-3xl text-[#1b120f]">{title}</h2> : null}
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f7ead0] text-[#20140f]"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
