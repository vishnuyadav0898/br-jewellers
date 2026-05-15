import { useEffect, useState } from "react";
import { Camera, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { useSession } from "../hooks/useSession";
import { useLocale } from "../localization";
import { compressImage } from "../utils/imageCompression";
import { Button } from "./Button";
import { Input } from "./Input";
import { getValidationErrors, passwordSchema, profileSchema } from "../utils/validation";

export function ProfileWorkspace({ roleLabel }) {
  const { t } = useLocale();
  const { user, updateProfile, changePassword, isBusy } = useSession();
  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => authService.getProfile(user.id),
    enabled: Boolean(user?.id),
  });
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    if (!profileQuery.data) return;

    setProfileForm({
      name: profileQuery.data.name || "",
      email: profileQuery.data.email || "",
      phone: profileQuery.data.phone || "",
      address: profileQuery.data.address || "",
      avatar: profileQuery.data.avatar || "",
    });
  }, [profileQuery.data]);

  const clearProfileError = (field) =>
    setProfileErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  const clearPasswordError = (field) =>
    setPasswordErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[32px] border border-[#e3d3b0] bg-white/90 p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9d6d26]">{roleLabel}</p>
            <h1 className="mt-2 font-display text-4xl text-[#1a120e]">{t("profile.title")}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{t("profile.subtitle")}</p>
          </div>
          <div className="rounded-full bg-[#f8edd5] px-4 py-2 text-xs font-semibold text-[#7f5719]">
            {user?.role === "admin" ? t("common.admin") : t("common.customer")}
          </div>
        </div>

        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const parsed = profileSchema.safeParse(profileForm);

            if (!parsed.success) {
              setProfileErrors(getValidationErrors(parsed.error));
              return;
            }

            setProfileErrors({});
            await updateProfile(parsed.data);
          }}
        >
          <div className="md:col-span-2 flex items-center gap-4 rounded-[28px] bg-[#f9f1df] p-4">
            {profileForm.avatar ? (
              <img src={profileForm.avatar} alt={profileForm.name} className="h-20 w-20 rounded-3xl object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#19110d] text-xl font-semibold text-[#f6e8c8]">
                {profileForm.name?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#20140f] ring-1 ring-[#dbc8a2]">
                <Camera className="h-4 w-4" />
                {t("profile.uploadImage")}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const compressed = await compressImage(file, { maxWidth: 720, maxHeight: 720, quality: 0.8 });
                    setProfileForm((current) => ({ ...current, avatar: compressed.preview }));
                  }}
                />
              </label>
              <p className="mt-2 text-xs text-stone-500">{t("profile.imageHint")}</p>
            </div>
          </div>

          <Input
            label={t("profile.fields.name")}
            required
            error={profileErrors.name}
            value={profileForm.name}
            onChange={(event) => {
              clearProfileError("name");
              setProfileForm((current) => ({ ...current, name: event.target.value }));
            }}
          />
          <Input
            label={t("profile.fields.email")}
            type="email"
            required
            error={profileErrors.email}
            value={profileForm.email}
            onChange={(event) => {
              clearProfileError("email");
              setProfileForm((current) => ({ ...current, email: event.target.value }));
            }}
          />
          <Input
            label={t("profile.fields.phone")}
            type="tel"
            required
            error={profileErrors.phone}
            value={profileForm.phone}
            onChange={(event) => {
              clearProfileError("phone");
              setProfileForm((current) => ({ ...current, phone: event.target.value }));
            }}
          />
          <Input
            label={t("profile.fields.address")}
            required
            error={profileErrors.address}
            value={profileForm.address}
            onChange={(event) => {
              clearProfileError("address");
              setProfileForm((current) => ({ ...current, address: event.target.value }));
            }}
          />

          <div className="md:col-span-2">
            <Button type="submit" loading={isBusy}>
              {t("common.save")}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-[32px] border border-[#e3d3b0] bg-[#fff7eb] p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#f0dbaf] p-3 text-[#8a5d18]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-3xl text-[#1a120e]">{t("common.changePassword")}</h2>
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
            setPasswordForm({
              oldPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
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
    </div>
  );
}
