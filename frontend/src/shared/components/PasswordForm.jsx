import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useSession } from "../hooks/useSession";
import { useLocale } from "../localization";
import { Button } from "./Button";
import { Input } from "./Input";
import { getValidationErrors, passwordSchema } from "../utils/validation";

export function PasswordForm() {
  const { t } = useLocale();
  const { changePassword, isBusy } = useSession();
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const clearPasswordError = (field) =>
    setPasswordErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));

  return (
    <section className="rounded-[32px] border border-[#e3d3b0] bg-[#fff7eb] p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-[#f0dbaf] p-3 text-[#8a5d18]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-[#1a120e]">{t("common.changePassword")}</h1>
          <p className="text-sm text-stone-600">{t("profile.securitySubtitle")}</p>
        </div>
      </div>

      <form
        className="mt-6 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const parsed = passwordSchema.safeParse(passwordForm);
          if (!parsed.success) {
            setPasswordErrors(getValidationErrors(parsed.error));
            return;
          }
          setPasswordErrors({});
          await changePassword(parsed.data);
          setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        }}
      >
        <Input
          label={t("profile.oldPassword")}
          type="password"
          required
          error={passwordErrors.oldPassword}
          value={passwordForm.oldPassword}
          onChange={(event) => {
            clearPasswordError("oldPassword");
            setPasswordForm((current) => ({ ...current, oldPassword: event.target.value }));
          }}
        />
        <Input
          label={t("profile.newPassword")}
          type="password"
          required
          error={passwordErrors.newPassword}
          value={passwordForm.newPassword}
          onChange={(event) => {
            clearPasswordError("newPassword");
            setPasswordForm((current) => ({ ...current, newPassword: event.target.value }));
          }}
        />
        <Input
          label={t("profile.confirmPassword")}
          type="password"
          required
          error={passwordErrors.confirmPassword}
          value={passwordForm.confirmPassword}
          onChange={(event) => {
            clearPasswordError("confirmPassword");
            setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }));
          }}
        />
        <Button type="submit" tone="secondary" loading={isBusy}>
          {t("common.changePassword")}
        </Button>
      </form>
    </section>
  );
}
