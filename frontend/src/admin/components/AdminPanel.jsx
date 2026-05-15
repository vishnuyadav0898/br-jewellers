import { cn } from "../../shared/utils/cn";

export function AdminPanel({ className, children }) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-[#e6d7b9] bg-white p-6 shadow-[0_18px_48px_rgba(46,29,17,0.08)]",
        className
      )}
    >
      {children}
    </section>
  );
}
