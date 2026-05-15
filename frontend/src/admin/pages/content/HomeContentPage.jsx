import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { notify } from "../../../shared/utils/notify";
import { getValidationErrors, homeContentSchema } from "../../../shared/utils/validation";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { contentService } from "../../services/contentService";

export function HomeContentPage() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const homeQuery = useQuery({
    queryKey: queryKeys.adminHomeContent,
    queryFn: contentService.getHomeContent,
  });
  const homeContent = homeQuery.data || {};

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Content Management"
          title="Home content"
          description="Editable homepage copy is stored independently from layout code so future CMS or backend APIs can replace only this data layer."
        />
      </AdminPanel>

      <AdminDataState query={homeQuery} loadingLabel="Loading home page content...">
        <AdminPanel>
          <form
            key={homeContent.heroBadge || "home-content-form"}
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              setSaving(true);
              try {
                const parsed = homeContentSchema.safeParse({
                  heroBadge: formData.get("heroBadge"),
                  heroEyebrow: formData.get("heroEyebrow"),
                  featuredTitle: formData.get("featuredTitle"),
                  categoriesTitle: formData.get("categoriesTitle"),
                  categoriesSubtitle: formData.get("categoriesSubtitle"),
                  recentlyViewedTitle: formData.get("recentlyViewedTitle"),
                });

                if (!parsed.success) {
                  setErrors(getValidationErrors(parsed.error));
                  return;
                }

                setErrors({});
                await contentService.updateHomeContent({
                  ...parsed.data,
                });
                notify.success("Home content updated.", {
                  title: "Homepage content saved",
                });
                queryClient.invalidateQueries({ queryKey: queryKeys.adminHomeContent });
                queryClient.invalidateQueries({ queryKey: queryKeys.adminBanners });
                queryClient.invalidateQueries({ queryKey: queryKeys.home });
              } catch (error) {
                notify.error(error.message);
              } finally {
                setSaving(false);
              }
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                name="heroBadge"
                label="Hero badge"
                required
                error={errors.heroBadge}
                defaultValue={homeContent.heroBadge}
                onChange={() =>
                  setErrors((current) => (current.heroBadge ? { ...current, heroBadge: undefined } : current))
                }
              />
              <Input
                name="heroEyebrow"
                label="Hero eyebrow"
                required
                error={errors.heroEyebrow}
                defaultValue={homeContent.heroEyebrow}
                onChange={() =>
                  setErrors((current) => (current.heroEyebrow ? { ...current, heroEyebrow: undefined } : current))
                }
              />
              <Input
                name="featuredTitle"
                label="Featured title"
                required
                error={errors.featuredTitle}
                defaultValue={homeContent.featuredTitle}
                onChange={() =>
                  setErrors((current) => (current.featuredTitle ? { ...current, featuredTitle: undefined } : current))
                }
              />
              <Input
                name="categoriesTitle"
                label="Categories title"
                required
                error={errors.categoriesTitle}
                defaultValue={homeContent.categoriesTitle}
                onChange={() =>
                  setErrors((current) => (current.categoriesTitle ? { ...current, categoriesTitle: undefined } : current))
                }
              />
            </div>
            <Input
              name="categoriesSubtitle"
              label="Categories subtitle"
              as="textarea"
              required
              error={errors.categoriesSubtitle}
              defaultValue={homeContent.categoriesSubtitle}
              onChange={() =>
                setErrors((current) => (current.categoriesSubtitle ? { ...current, categoriesSubtitle: undefined } : current))
              }
            />
            <Input
              name="recentlyViewedTitle"
              label="Recently viewed title"
              required
              error={errors.recentlyViewedTitle}
              defaultValue={homeContent.recentlyViewedTitle}
              onChange={() =>
                setErrors((current) => (current.recentlyViewedTitle ? { ...current, recentlyViewedTitle: undefined } : current))
              }
            />
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </AdminPanel>
      </AdminDataState>
    </div>
  );
}
