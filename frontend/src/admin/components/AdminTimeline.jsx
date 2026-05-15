import { AdminStatusBadge } from "./AdminStatusBadge";
import { formatDateTime } from "../../shared/utils/formatters";

export function AdminTimeline({ steps = [], language = "en" }) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.id || `${step.label}-${index}`} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`h-3.5 w-3.5 rounded-full ${
                step.completed ? "bg-[#1a120e]" : "bg-[#d7c7a5]"
              }`}
            />
            {index < steps.length - 1 ? (
              <div className="mt-2 h-12 w-px bg-[#e8dcc4]" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 rounded-[20px] border border-[#eee2c9] bg-[#fffaf1] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-[#1d130f]">{step.label}</p>
              <AdminStatusBadge value={step.completed ? "Completed" : "Pending"} />
            </div>
            <p className="mt-2 text-sm text-stone-500">
              {step.timestamp ? formatDateTime(step.timestamp, language) : "Awaiting update"}
            </p>
            {step.note ? <p className="mt-2 text-sm leading-6 text-stone-600">{step.note}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
