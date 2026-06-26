import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../shared/components/Button";
import { Input } from "../../shared/components/Input";
import { ContactPageSkeleton } from "../../shared/components/Skeleton";
import { notify } from "../../shared/utils/notify";
import { contactSchema, getValidationErrors } from "../../shared/utils/validation";
import { formatDate } from "../../shared/utils/formatters";
import { storefrontService } from "../services/storefrontService";
import { useSEO } from "../../shared/hooks/useSEO";

export function ContactPage() {
  useSEO({
    title: "Contact Us",
    description: "Get in touch with BR Jewellers customer support. Find our location, phone number, and email or send us a message directly.",
    keywords: "contact BR Jewellers, customer service, support email, store address",
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const contactQuery = useQuery({
    queryKey: ["content-page", "contact"],
    queryFn: () => storefrontService.getContentPage("contact"),
  });

  const clearError = (field) =>
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));

  if (contactQuery.isLoading) {
    return <ContactPageSkeleton />;
  }

  const page = contactQuery.data || {};
  const title = page.title || "Get in touch";
  const body = page.body || "";
  const updatedAt = page.updatedAt || new Date().toISOString();

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-4 rounded-[34px] border border-[#dfccab] bg-[#17100d] p-6 text-[#f8efdc] shadow-[0_18px_60px_rgba(32,21,15,0.25)]">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d5a957]">Contact us</p>
        <h1 className="font-display text-5xl leading-tight">{title}</h1>
        {body && (
          <div
            className="prose prose-invert max-w-none prose-p:text-sm prose-p:leading-7 prose-p:text-[#ebddc2]"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        )}
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm text-[#ebddc2]">
          Last updated on {formatDate(updatedAt)}.
        </div>
      </section>

      <section className="rounded-[34px] border border-[#dfccab] bg-white/90 p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
        <h2 className="font-display text-4xl text-[#1a120e]">Send us a message</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          This demo form is wired to a mock submit flow so you can validate the storefront UX without a live backend.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const parsed = contactSchema.safeParse(form);

            if (!parsed.success) {
              setErrors(getValidationErrors(parsed.error));
              return;
            }

            setErrors({});
            notify.success("Mock contact request submitted.", {
              title: "Message received",
            });
            setForm({ name: "", email: "", message: "" });
          }}
        >
          <Input
            label="Name"
            required
            error={errors.name}
            value={form.name}
            onChange={(event) => {
              clearError("name");
              setForm((current) => ({ ...current, name: event.target.value }));
            }}
          />
          <Input
            label="Email"
            type="email"
            required
            error={errors.email}
            value={form.email}
            onChange={(event) => {
              clearError("email");
              setForm((current) => ({ ...current, email: event.target.value }));
            }}
          />
          <Input
            as="textarea"
            label="Message"
            required
            error={errors.message}
            value={form.message}
            onChange={(event) => {
              clearError("message");
              setForm((current) => ({ ...current, message: event.target.value }));
            }}
            placeholder="Tell us what you need help with."
          />
          <Button type="submit">Send message</Button>
        </form>
      </section>
    </div>
  );
}
