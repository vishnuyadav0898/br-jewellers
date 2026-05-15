import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { formatDateTime } from "../../../shared/utils/formatters";
import { useAppStore } from "../../../shared/store/useAppStore";
import { notify } from "../../../shared/utils/notify";
import { getValidationErrors, pageContentSchema } from "../../../shared/utils/validation";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { contentService } from "../../services/contentService";

export function EditableContentPage({ page, title, description }) {
  const queryClient = useQueryClient();
  const language = useAppStore((state) => state.language);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const pageQuery = useQuery({
    queryKey: queryKeys.adminContentPage(page.toLowerCase()),
    queryFn: () => contentService.getPageContent(page),
  });
  const pageKey = page.toLowerCase();

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader eyebrow="Content Management" title={title} description={description} />
      </AdminPanel>

      <AdminDataState query={pageQuery} loadingLabel={`Loading ${page.toLowerCase()} content...`}>
        {(pageData) => {
          const contentPage = pageData || {};

          return (
            <AdminPanel>
              <form
                key={contentPage.updatedAt || page}
                className="space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  setSaving(true);
                  try {
                    const parsed = pageContentSchema.safeParse({
                      title: formData.get("title"),
                      body: formData.get("body"),
                    });

                    if (!parsed.success) {
                      setErrors(getValidationErrors(parsed.error));
                      return;
                    }

                    setErrors({});
                    await contentService.updatePageContent(contentPage.id, {
                      page,
                      ...parsed.data,
                    });
                    notify.success(`${page} page updated.`, {
                      title: "Content saved",
                    });
                    queryClient.invalidateQueries({ queryKey: queryKeys.adminContentPage(pageKey) });
                    queryClient.invalidateQueries({ queryKey: queryKeys.contentPage(pageKey) });
                  } catch (error) {
                    notify.error(error.message);
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <Input
                  name="title"
                  label="Page title"
                  required
                  error={errors.title}
                  defaultValue={contentPage.title}
                  onChange={() =>
                    setErrors((current) => (current.title ? { ...current, title: undefined } : current))
                  }
                />
                <Input
                  name="body"
                  label="Body content"
                  as="textarea"
                  className="min-h-72"
                  helperText="Basic rich-text friendly HTML content for demo editing."
                  required
                  error={errors.body}
                  defaultValue={contentPage.body}
                  onChange={() =>
                    setErrors((current) => (current.body ? { ...current, body: undefined } : current))
                  }
                />
                <div className="rounded-[20px] bg-[#fff9ef] px-4 py-3 text-sm text-stone-600">
                  Last updated {formatDateTime(contentPage.updatedAt, language)}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" loading={saving}>
                    Save changes
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
