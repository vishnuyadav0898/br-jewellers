import { useState } from "react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { useSession } from "../../../shared/hooks/useSession";
import { notify } from "../../../shared/utils/notify";
import { getValidationErrors, passwordSchema } from "../../../shared/utils/validation";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";

export function ChangePasswordPage() {
  const { changePassword } = useSession();
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Settings"
          title="Update Password"
          description="Operational credentials stay inside the admin area so security controls never leak into the storefront shell."
        />
      </AdminPanel>

      <AdminPanel>
        <h2 className="font-display text-3xl text-[#1d130f]">Change Password</h2>
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
  );
}
