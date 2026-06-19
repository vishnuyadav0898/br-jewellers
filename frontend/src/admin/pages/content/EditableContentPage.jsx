import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { formatDateTime } from "../../../shared/utils/formatters";
import { useAppStore } from "../../../shared/store/useAppStore";
import { hasPermission } from "../../../shared/utils/auth";
import { notify } from "../../../shared/utils/notify";
import { getValidationErrors, pageContentSchema, z } from "../../../shared/utils/validation";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { contentService } from "../../services/contentService";
import { RichTextEditor } from "../../components/RichTextEditor";

const aboutSchema = z.object({
  title: z.string().trim().min(2, "Page title must be at least 2 characters."),
  description: z.string().trim().min(2, "Description must be at least 2 characters."),
  craftTitle: z.string().trim().min(2, "Craft title must be at least 2 characters."),
  craftDescription: z.string().trim().min(2, "Craft description must be at least 2 characters."),
  coverImage: z.string().trim().min(5, "Cover image URL must be at least 5 characters."),
  body: z.string().trim().min(10, "Body content must be at least 10 characters."),
});

export function EditableContentPage({ page, title, description }) {
  const queryClient = useQueryClient();
  const language = useAppStore((state) => state.language);
  const user = useAppStore((state) => state.user);
  const canEdit = hasPermission(user, "Content", "Update");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  const pageQuery = useQuery({
    queryKey: queryKeys.adminContentPage(page.toLowerCase()),
    queryFn: () => contentService.getPageContent(page),
  });
  
  const pageKey = page.toLowerCase();
  const isAbout = pageKey === "about";

  const [bodyText, setBodyText] = useState("");

  useEffect(() => {
    if (pageQuery.data) {
      setBodyText(pageQuery.data.body || "");
    }
  }, [pageQuery.data]);

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader eyebrow="Content Management" title={title} description={description} />
      </AdminPanel>

      <AdminDataState query={pageQuery} loadingLabel={`Loading ${page.toLowerCase()} content...`}>
        {(pageData) => {
          const contentPage = pageData || {};

          const defaultDescription = contentPage.description || (isAbout ? "Learn the brand story, craftsmanship point of view, and the service approach behind the storefront." : "");
          const defaultCraftTitle = contentPage.craftTitle || (isAbout ? "Modern Indian styling" : "");
          const defaultCraftDescription = contentPage.craftDescription || (isAbout ? "Statement bridal pieces and everyday signatures are designed to feel elevated without becoming impractical." : "");
          const defaultCoverImage = contentPage.coverImage || (isAbout ? "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200" : "");

          return (
            <AdminPanel>
              <form
                key={contentPage.updatedAt || page}
                className="space-y-6"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!canEdit) return;
                  const formData = new FormData(event.currentTarget);
                  setSaving(true);
                  try {
                    const schema = isAbout ? aboutSchema : pageContentSchema;
                    const payload = {
                      title: formData.get("title"),
                      body: bodyText,
                      ...(isAbout ? {
                        description: formData.get("description"),
                        craftTitle: formData.get("craftTitle"),
                        craftDescription: formData.get("craftDescription"),
                        coverImage: formData.get("coverImage"),
                      } : {}),
                    };

                    const parsed = schema.safeParse(payload);

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
                {!canEdit && (
                  <div className="rounded-[20px] bg-rose-50 border border-rose-100 p-4 text-sm text-rose-800">
                    <strong>Read-Only Mode:</strong> You do not have permission to modify website content.
                  </div>
                )}
                
                <Input
                  name="title"
                  label="Page title"
                  required
                  disabled={!canEdit}
                  error={errors.title}
                  defaultValue={contentPage.title}
                  onChange={() =>
                    setErrors((current) => (current.title ? { ...current, title: undefined } : current))
                  }
                />

                {isAbout && (
                  <>
                    <Input
                      name="description"
                      label="Hero description"
                      as="textarea"
                      required
                      disabled={!canEdit}
                      error={errors.description}
                      defaultValue={defaultDescription}
                      onChange={() =>
                        setErrors((current) => (current.description ? { ...current, description: undefined } : current))
                      }
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        name="craftTitle"
                        label="Craft focus title"
                        required
                        disabled={!canEdit}
                        error={errors.craftTitle}
                        defaultValue={defaultCraftTitle}
                        onChange={() =>
                          setErrors((current) => (current.craftTitle ? { ...current, craftTitle: undefined } : current))
                        }
                      />
                      <Input
                        name="coverImage"
                        label="Cover image URL"
                        required
                        disabled={!canEdit}
                        error={errors.coverImage}
                        defaultValue={defaultCoverImage}
                        onChange={() =>
                          setErrors((current) => (current.coverImage ? { ...current, coverImage: undefined } : current))
                        }
                      />
                    </div>

                    <Input
                      name="craftDescription"
                      label="Craft focus description"
                      as="textarea"
                      required
                      disabled={!canEdit}
                      error={errors.craftDescription}
                      defaultValue={defaultCraftDescription}
                      onChange={() =>
                        setErrors((current) => (current.craftDescription ? { ...current, craftDescription: undefined } : current))
                      }
                    />
                  </>
                )}

                <RichTextEditor
                  label="Body content"
                  error={errors.body}
                  value={bodyText}
                  onChange={(val) => {
                    setErrors((current) => (current.body ? { ...current, body: undefined } : current));
                    setBodyText(val);
                  }}
                  disabled={!canEdit}
                  helperText={canEdit ? "Build rich styled story paragraphs and layout components for the About section." : "Viewing content in Read-Only mode."}
                />

                <div className="rounded-[20px] bg-[#fff9ef] px-4 py-3 text-sm text-stone-600">
                  Last updated {formatDateTime(contentPage.updatedAt, language)}
                </div>

                {canEdit && (
                  <div className="flex justify-end">
                    <Button type="submit" loading={saving}>
                      Save changes
                    </Button>
                  </div>
                )}
              </form>
            </AdminPanel>
          );
        }}
      </AdminDataState>
    </div>
  );
}
