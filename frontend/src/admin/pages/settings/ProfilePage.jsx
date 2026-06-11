import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { useSession } from "../../../shared/hooks/useSession";
import { notify } from "../../../shared/utils/notify";
import { getValidationErrors, profileSchema } from "../../../shared/utils/validation";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { settingsService } from "../../services/settingsService";

export function ProfilePage() {
  const { user, updateProfile } = useSession();
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const settingsQuery = useQuery({
    queryKey: queryKeys.adminSettings,
    queryFn: () => settingsService.getAdminProfile(user.id),
    enabled: Boolean(user?.id),
  });

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Settings"
          title="Admin Profile"
          description="Operational profile details stay inside the admin area so profile controls never leak into the storefront shell."
        />
      </AdminPanel>

      <AdminDataState query={settingsQuery} loadingLabel="Loading admin profile...">
        {(settingsData) => {
          const settings = settingsData || {};

          return (
            <AdminPanel>
              <h2 className="font-display text-3xl text-[#1d130f]">Profile Details</h2>
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
          );
        }}
      </AdminDataState>
    </div>
  );
}
