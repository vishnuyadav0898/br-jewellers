import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { useSession } from "../../../shared/hooks/useSession";
import { notify } from "../../../shared/utils/notify";
import { getValidationErrors, passwordSchema, profileSchema } from "../../../shared/utils/validation";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { settingsService } from "../../services/settingsService";

export function SettingsPage() {
  const { user, updateProfile, changePassword } = useSession();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const settingsQuery = useQuery({
    queryKey: queryKeys.adminSettings,
    queryFn: () => settingsService.getAdminProfile(user.id),
    enabled: Boolean(user?.id),
  });

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [window.location.hash]);

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Settings"
          title="Admin settings"
          description="Operational settings stay inside the admin area so profile and environment controls never leak into the storefront shell."
        />
      </AdminPanel>

      <AdminDataState query={settingsQuery} loadingLabel="Loading admin settings...">
        {(settingsData) => {
          const settings = settingsData || {};

          return (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <AdminPanel id="profile-section">
                <h2 className="font-display text-3xl text-[#1d130f]">Profile</h2>
                <form
                  className="mt-5 space-y-4"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    setSavingProfile(true);
                    try {
                      const parsed = profileSchema.safeParse({
                        name: formData.get("name"),
                        email: formData.get("email"),
                        phone: formData.get("phone"),
                        address: formData.get("address"),
                        avatar: settings.avatar || "",
                      });

                      if (!parsed.success) {
                        setProfileErrors(getValidationErrors(parsed.error));
                        return;
                      }

                      setProfileErrors({});
                      await updateProfile({
                        name: parsed.data.name,
                        email: parsed.data.email,
                        phone: parsed.data.phone,
                        address: parsed.data.address,
                      });
                      notify.success("Admin profile updated.", {
                        title: "Admin profile saved",
                      });
                    } catch (error) {
                      notify.error(error.message);
                    } finally {
                      setSavingProfile(false);
                    }
                  }}
                >
                  <Input
                    name="name"
                    label="Name"
                    required
                    error={profileErrors.name}
                    defaultValue={settings.name}
                    onChange={() =>
                      setProfileErrors((current) => (current.name ? { ...current, name: undefined } : current))
                    }
                  />
                  <Input
                    name="email"
                    type="email"
                    label="Email"
                    required
                    error={profileErrors.email}
                    defaultValue={settings.email}
                    onChange={() =>
                      setProfileErrors((current) => (current.email ? { ...current, email: undefined } : current))
                    }
                  />
                  <Input
                    name="phone"
                    type="tel"
                    label="Phone"
                    required
                    error={profileErrors.phone}
                    defaultValue={settings.phone}
                    onChange={() =>
                      setProfileErrors((current) => (current.phone ? { ...current, phone: undefined } : current))
                    }
                  />
                  <Input
                    name="address"
                    label="Address"
                    required
                    error={profileErrors.address}
                    defaultValue={settings.address}
                    onChange={() =>
                      setProfileErrors((current) => (current.address ? { ...current, address: undefined } : current))
                    }
                  />
                  <div className="flex justify-end">
                    <Button type="submit" loading={savingProfile}>
                      Save profile
                    </Button>
                  </div>
                </form>
              </AdminPanel>

              <div className="space-y-6">
                <AdminPanel id="password-section">
                  <h2 className="font-display text-3xl text-[#1d130f]">Password</h2>
                  <form
                    className="mt-5 space-y-4"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      const formData = new FormData(event.currentTarget);
                      setSavingPassword(true);
                      try {
                        const parsed = passwordSchema.safeParse({
                          oldPassword: formData.get("oldPassword"),
                          newPassword: formData.get("newPassword"),
                          confirmPassword: formData.get("confirmPassword"),
                        });

                        if (!parsed.success) {
                          setPasswordErrors(getValidationErrors(parsed.error));
                          return;
                        }

                        setPasswordErrors({});
                        await changePassword({
                          ...parsed.data,
                        });
                        notify.success("Password updated.", {
                          title: "Admin password changed",
                          iconKey: "security",
                        });
                        event.currentTarget.reset();
                      } catch (error) {
                        notify.error(error.message, { iconKey: "security" });
                      } finally {
                        setSavingPassword(false);
                      }
                    }}
                  >
                    <Input
                      name="oldPassword"
                      type="password"
                      label="Current password"
                      required
                      error={passwordErrors.oldPassword}
                      onChange={() =>
                        setPasswordErrors((current) =>
                          current.oldPassword ? { ...current, oldPassword: undefined } : current
                        )
                      }
                    />
                    <Input
                      name="newPassword"
                      type="password"
                      label="New password"
                      required
                      error={passwordErrors.newPassword}
                      onChange={() =>
                        setPasswordErrors((current) =>
                          current.newPassword ? { ...current, newPassword: undefined } : current
                        )
                      }
                    />
                    <Input
                      name="confirmPassword"
                      type="password"
                      label="Confirm password"
                      required
                      error={passwordErrors.confirmPassword}
                      onChange={() =>
                        setPasswordErrors((current) =>
                          current.confirmPassword ? { ...current, confirmPassword: undefined } : current
                        )
                      }
                    />
                    <div className="flex justify-end">
                      <Button type="submit" loading={savingPassword}>
                        Update password
                      </Button>
                    </div>
                  </form>
                </AdminPanel>
              </div>
            </div>
          );
        }}
      </AdminDataState>
    </div>
  );
}
