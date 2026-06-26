import { PasswordForm } from "../../shared/components/PasswordForm";
import { useSEO } from "../../shared/hooks/useSEO";

export function UserChangePasswordPage() {
  useSEO({
    title: "Change Password",
    description: "Update your customer account security password at BR Jewellers.",
    keywords: "change password, account security, password update",
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PasswordForm />
    </div>
  );
}
