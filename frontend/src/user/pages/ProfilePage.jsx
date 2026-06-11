import { ProfileForm } from "../../shared/components/ProfileForm";

export function ProfilePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ProfileForm roleLabel="Customer profile" />
    </div>
  );
}

