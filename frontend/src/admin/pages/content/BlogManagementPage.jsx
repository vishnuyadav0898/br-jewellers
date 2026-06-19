import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { Modal } from "../../../shared/components/Modal";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { formatDate } from "../../../shared/utils/formatters";
import { useAppStore } from "../../../shared/store/useAppStore";
import { notify } from "../../../shared/utils/notify";
import { blogSchema, getValidationErrors } from "../../../shared/utils/validation";
import { PermissionGuard } from "../../../shared/components/PermissionGuard";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { blogsService } from "../../services/blogsService";

const defaultForm = {
  title: "",
  excerpt: "",
  author: "",
  readTime: "",
  coverImage: "",
  content: "",
};

export function BlogManagementPage() {
  const queryClient = useQueryClient();
  const language = useAppStore((state) => state.language);
  const [activeBlog, setActiveBlog] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const blogsQuery = useQuery({
    queryKey: queryKeys.adminBlogs,
    queryFn: blogsService.getBlogs,
  });
  const blogs = blogsQuery.data || [];

  const closeModal = () => {
    setActiveBlog(null);
    setForm(defaultForm);
    setErrors({});
  };

  const openCreate = () => {
    setActiveBlog({ id: "new" });
    setForm(defaultForm);
    setErrors({});
  };

  const openEdit = (blog) => {
    setActiveBlog(blog);
    setForm({
      title: blog.title,
      excerpt: blog.excerpt,
      author: blog.author,
      readTime: blog.readTime,
      coverImage: blog.coverImage,
      content: Array.isArray(blog.content) ? blog.content.join("\n\n") : String(blog.content || ""),
    });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Content Management"
          title="Blog management"
          description="CRUD blog management is kept in the admin content layer so editorial workflows stay separate from storefront rendering."
          actions={
            <PermissionGuard module="Blog" action="Add">
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Create blog
              </Button>
            </PermissionGuard>
          }
        />
      </AdminPanel>

      <AdminDataState
        query={blogsQuery}
        loadingLabel="Loading blogs..."
        empty={!blogs.length}
        emptyTitle="No blogs yet"
        emptyDescription="Mock editorial posts will appear here, or you can create a new one from this screen."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {blogs.map((blog) => (
            <AdminPanel key={blog.id}>
              <img src={blog.coverImage} alt={blog.title} className="h-48 w-full rounded-[22px] object-cover" />
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                  {blog.author} • {formatDate(blog.publishedAt, language)}
                </div>
                <h3 className="mt-2 font-display text-3xl text-[#1d130f]">{blog.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{blog.excerpt}</p>
                <div className="mt-4 flex gap-2">
                  <PermissionGuard module="Blog" action="Update">
                    <Button tone="secondary" size="sm" onClick={() => openEdit(blog)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard module="Blog" action="Delete">
                    <Button
                      tone="danger"
                      size="sm"
                      onClick={async () => {
                        try {
                          await blogsService.deleteBlog(blog.id);
                          notify.success("Blog deleted.", {
                            title: "Blog removed",
                          });
                          queryClient.invalidateQueries({ queryKey: queryKeys.adminBlogs });
                        } catch (error) {
                          notify.error(error.message);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </PermissionGuard>
                </div>
              </div>
            </AdminPanel>
          ))}
        </div>
      </AdminDataState>

      <Modal
        open={Boolean(activeBlog)}
        onClose={closeModal}
        title={activeBlog?.id === "new" ? "Create blog" : "Edit blog"}
        className="max-w-3xl"
      >
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            try {
              const parsed = blogSchema.safeParse(form);

              if (!parsed.success) {
                setErrors(getValidationErrors(parsed.error));
                return;
              }

              setErrors({});
              if (activeBlog?.id === "new") {
                await blogsService.createBlog(parsed.data);
                notify.success("Blog created.", {
                  title: "Blog published to demo content",
                });
              } else {
                await blogsService.updateBlog(activeBlog.id, parsed.data);
                notify.success("Blog updated.", {
                  title: "Blog changes saved",
                });
              }
              queryClient.invalidateQueries({ queryKey: queryKeys.adminBlogs });
              closeModal();
            } catch (error) {
              notify.error(error.message);
            } finally {
              setSaving(false);
            }
          }}
        >
          <Input
            label="Title"
            required
            error={errors.title}
            value={form.title}
            onChange={(event) => {
              setErrors((current) => (current.title ? { ...current, title: undefined } : current));
              setForm((current) => ({ ...current, title: event.target.value }));
            }}
          />
          <Input
            label="Excerpt"
            as="textarea"
            required
            error={errors.excerpt}
            value={form.excerpt}
            onChange={(event) => {
              setErrors((current) => (current.excerpt ? { ...current, excerpt: undefined } : current));
              setForm((current) => ({ ...current, excerpt: event.target.value }));
            }}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Author" value={form.author} onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))} />
            <Input label="Read time" value={form.readTime} onChange={(event) => setForm((current) => ({ ...current, readTime: event.target.value }))} />
          </div>
          <Input
            label="Cover image URL / data URI"
            as="textarea"
            required
            error={errors.coverImage}
            value={form.coverImage}
            onChange={(event) => {
              setErrors((current) => (current.coverImage ? { ...current, coverImage: undefined } : current));
              setForm((current) => ({ ...current, coverImage: event.target.value }));
            }}
          />
          <Input
            label="Content"
            as="textarea"
            className="min-h-72"
            helperText="Separate paragraphs with a blank line."
            required
            error={errors.content}
            value={form.content}
            onChange={(event) => {
              setErrors((current) => (current.content ? { ...current, content: undefined } : current));
              setForm((current) => ({ ...current, content: event.target.value }));
            }}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" tone="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save blog
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
