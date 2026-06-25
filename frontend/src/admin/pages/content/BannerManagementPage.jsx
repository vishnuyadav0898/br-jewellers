import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { Modal } from "../../../shared/components/Modal";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { notify } from "../../../shared/utils/notify";
import { bannerSchema, getValidationErrors } from "../../../shared/utils/validation";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { contentService } from "../../services/contentService";

const defaultForm = {
  tag: "",
  title: "",
  subtitle: "",
  cta: "",
  href: "",
  image: "",
};

export function BannerManagementPage() {
  const queryClient = useQueryClient();
  const [activeBanner, setActiveBanner] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const bannersQuery = useQuery({
    queryKey: queryKeys.adminBanners,
    queryFn: contentService.getBanners,
  });
  const banners = bannersQuery.data || [];

  const closeModal = () => {
    setActiveBanner(null);
    setForm(defaultForm);
    setErrors({});
  };

  const openCreate = () => {
    setActiveBanner({ id: "new" });
    setForm(defaultForm);
    setErrors({});
  };

  const openEdit = (banner) => {
    setActiveBanner(banner);
    setForm({
      tag: banner.tag || "",
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      cta: banner.cta || "",
      href: banner.href || "",
      image: banner.image || "",
    });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Content Management"
          title="Banner management"
          description="Manage hero and promotional banners from data instead of component code."
          actions={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add banner
            </Button>
          }
        />
      </AdminPanel>

      <AdminDataState
        query={bannersQuery}
        loadingLabel="Loading banners..."
        empty={!banners.length}
        emptyTitle="No banners yet"
        emptyDescription="Create a banner to populate the home page carousel with promotional content."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {banners.map((banner) => (
            <AdminPanel key={banner.id} className="flex h-full flex-col">
              <img src={banner.image} alt={banner.title} width="400" height="176" className="h-44 w-full rounded-[22px] object-cover" loading="lazy" />
              <div className="mt-4 flex flex-1 flex-col">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">{banner.tag}</div>
                <h3 className="mt-2 font-display text-3xl text-[#1d130f]">{banner.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{banner.subtitle}</p>
                <div className="mt-4 flex gap-2">
                  <Button tone="secondary" size="sm" onClick={() => openEdit(banner)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    tone="danger"
                    size="sm"
                    onClick={async () => {
                      try {
                        await contentService.deleteBanner(banner.id);
                        notify.success("Banner deleted.", {
                          title: "Banner removed",
                        });
                        queryClient.invalidateQueries({ queryKey: queryKeys.adminBanners });
                        queryClient.invalidateQueries({ queryKey: queryKeys.adminHomeContent });
                        queryClient.invalidateQueries({ queryKey: queryKeys.home });
                      } catch (error) {
                        notify.error(error.message);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </AdminPanel>
          ))}
        </div>
      </AdminDataState>

      <Modal
        open={Boolean(activeBanner)}
        onClose={closeModal}
        title={activeBanner?.id === "new" ? "Create banner" : "Edit banner"}
        className="max-w-2xl"
      >
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            try {
              const parsed = bannerSchema.safeParse(form);

              if (!parsed.success) {
                setErrors(getValidationErrors(parsed.error));
                return;
              }

              setErrors({});
              if (activeBanner?.id === "new") {
                await contentService.createBanner(parsed.data);
                notify.success("Banner created.", {
                  title: "Banner saved",
                });
              } else {
                await contentService.updateBanner(activeBanner.id, parsed.data);
                notify.success("Banner updated.", {
                  title: "Banner changes saved",
                });
              }
              queryClient.invalidateQueries({ queryKey: queryKeys.adminBanners });
              queryClient.invalidateQueries({ queryKey: queryKeys.adminHomeContent });
              queryClient.invalidateQueries({ queryKey: queryKeys.home });
              closeModal();
            } catch (error) {
              notify.error(error.message);
            } finally {
              setSaving(false);
            }
          }}
        >
          <Input label="Tag" value={form.tag} onChange={(event) => setForm((current) => ({ ...current, tag: event.target.value }))} />
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
            label="Subtitle"
            as="textarea"
            required
            error={errors.subtitle}
            value={form.subtitle}
            onChange={(event) => {
              setErrors((current) => (current.subtitle ? { ...current, subtitle: undefined } : current));
              setForm((current) => ({ ...current, subtitle: event.target.value }));
            }}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="CTA label" value={form.cta} onChange={(event) => setForm((current) => ({ ...current, cta: event.target.value }))} />
            <Input label="CTA href" value={form.href} onChange={(event) => setForm((current) => ({ ...current, href: event.target.value }))} />
          </div>
          <Input
            label="Image URL / data URI"
            as="textarea"
            required
            error={errors.image}
            value={form.image}
            onChange={(event) => {
              setErrors((current) => (current.image ? { ...current, image: undefined } : current));
              setForm((current) => ({ ...current, image: event.target.value }));
            }}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" tone="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save banner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
