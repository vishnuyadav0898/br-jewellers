import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { useAppStore } from "../../../shared/store/useAppStore";
import { hasPermission } from "../../../shared/utils/auth";
import { notify } from "../../../shared/utils/notify";
import { getValidationErrors, z } from "../../../shared/utils/validation";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { contentService } from "../../services/contentService";
import { RichTextEditor } from "../../components/RichTextEditor";
import { cn } from "../../../shared/utils/cn";
import { Pencil, Trash2, Plus, Check } from "lucide-react";

// Zod Validation Schema for structured About Us fields
const aboutDataSchema = z.object({
  title: z.string().trim().min(2, "Page title must be at least 2 characters."),
  body: z.string().trim().min(5, "Body content must be at least 5 characters."),
  founderName: z.string().trim().min(2, "Founder name is required."),
  founderTitle: z.string().trim().min(2, "Founder title is required."),
  founderDescription: z.string().trim().min(10, "Founder description must be at least 10 characters."),
  founderImage: z.string().trim().min(5, "Founder image URL is required."),
  founderOmImage: z.string().trim().min(5, "Founder workshop image URL is required."),
  storyTitle: z.string().trim().min(2, "Story title is required."),
  storyDescription: z.string().trim().min(10, "Story description must be at least 10 characters."),
  whatWeDoEyebrow: z.string().trim().min(2, "Eyebrow is required."),
  whatWeDoTitle: z.string().trim().min(2, "What we do title is required."),
  whatWeDoDescription: z.string().trim().min(10, "Description must be at least 10 characters."),
  whatWeDoImage: z.string().trim().min(5, "What we do image URL is required."),
  values: z.array(
    z.object({
      id: z.string(),
      title: z.string().trim().min(2, "Value title is required."),
      description: z.string().trim().min(5, "Value description is required."),
      image: z.string().trim().min(5, "Value image URL is required."),
    })
  ),
  timeline: z.array(
    z.object({
      id: z.string(),
      year: z.string().trim().min(2, "Year is required."),
      description: z.string().trim().min(5, "Milestone description is required."),
    })
  ),
});

export function AboutContentPage() {
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);
  const canEdit = hasPermission(user, "Content", "Update");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("intro");

  // Local ID states to track which value card or milestone is currently being edited in the form
  const [editingValueId, setEditingValueId] = useState(null);
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);

  const pageQuery = useQuery({
    queryKey: queryKeys.adminContentPage("about"),
    queryFn: () => contentService.getPageContent("about"),
  });

  // State fields
  const [titleText, setTitleText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [founderName, setFounderName] = useState("");
  const [founderTitle, setFounderTitle] = useState("");
  const [founderDescription, setFounderDescription] = useState("");
  const [founderImage, setFounderImage] = useState("");
  const [founderOmImage, setFounderOmImage] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyDescription, setStoryDescription] = useState("");
  const [whatWeDoEyebrow, setWhatWeDoEyebrow] = useState("");
  const [whatWeDoTitle, setWhatWeDoTitle] = useState("");
  const [whatWeDoDescription, setWhatWeDoDescription] = useState("");
  const [whatWeDoImage, setWhatWeDoImage] = useState("");
  const [valuesList, setValuesList] = useState([]);
  const [timelineList, setTimelineList] = useState([]);

  useEffect(() => {
    if (pageQuery.data) {
      const data = pageQuery.data || {};
      setTitleText(data.title || "About BR Jewellers");
      setBodyText(data.body || "");
      setFounderName(data.founderName || "");
      setFounderTitle(data.founderTitle || "ABOUT THE FOUNDER");
      setFounderDescription(data.founderDescription || "");
      setFounderImage(data.founderImage || "");
      setFounderOmImage(data.founderOmImage || "");
      setStoryTitle(data.storyTitle || "OUR STORY");
      setStoryDescription(data.storyDescription || "");
      setWhatWeDoEyebrow(data.whatWeDoEyebrow || "Introducing The Company");
      setWhatWeDoTitle(data.whatWeDoTitle || "WHAT WE DO");
      setWhatWeDoDescription(data.whatWeDoDescription || "");
      setWhatWeDoImage(data.whatWeDoImage || "");
      setValuesList(data.values || []);
      setTimelineList(data.timeline || []);
    }
  }, [pageQuery.data]);

  // Tab definition
  const tabs = [
    { id: "intro", label: "Intro & Video" },
    { id: "founder", label: "Founder Profile" },
    { id: "story", label: "Our Story" },
    { id: "whatwedo", label: "What We Do" },
    { id: "values", label: "Core Philosophy" },
    { id: "timeline", label: "Milestones Timeline" },
  ];

  // Check if a tab contains validation errors
  const hasTabErrors = (tabId) => {
    const errorKeys = Object.keys(errors);
    if (tabId === "intro") return errorKeys.some((k) => k === "title" || k === "body");
    if (tabId === "founder") return errorKeys.some((k) => k.startsWith("founder"));
    if (tabId === "story") return errorKeys.some((k) => k.startsWith("story"));
    if (tabId === "whatwedo") return errorKeys.some((k) => k.startsWith("whatWeDo"));
    if (tabId === "values") return errorKeys.some((k) => k.startsWith("values"));
    if (tabId === "timeline") return errorKeys.some((k) => k.startsWith("timeline"));
    return false;
  };

  // Values array actions
  const handleAddValue = () => {
    const newId = `val-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setValuesList((prev) => [
      ...prev,
      {
        id: newId,
        title: "New Core Value",
        description: "",
        image: "",
      },
    ]);
    setEditingValueId(newId); // open editing form immediately
  };

  const handleUpdateValue = (id, field, val) => {
    setValuesList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveValue = (id) => {
    setValuesList((prev) => prev.filter((item) => item.id !== id));
    if (editingValueId === id) setEditingValueId(null);
  };

  // Timeline array actions
  const handleAddMilestone = () => {
    const newId = `t-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setTimelineList((prev) => [
      ...prev,
      {
        id: newId,
        year: new Date().getFullYear().toString(),
        description: "",
      },
    ]);
    setEditingMilestoneId(newId); // open editing form immediately
  };

  const handleUpdateMilestone = (id, field, val) => {
    setTimelineList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveMilestone = (id) => {
    setTimelineList((prev) => prev.filter((item) => item.id !== id));
    if (editingMilestoneId === id) setEditingMilestoneId(null);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    try {
      const payload = {
        title: titleText,
        body: bodyText,
        founderName,
        founderTitle,
        founderDescription,
        founderImage,
        founderOmImage,
        storyTitle,
        storyDescription,
        whatWeDoEyebrow,
        whatWeDoTitle,
        whatWeDoDescription,
        whatWeDoImage,
        values: valuesList,
        timeline: timelineList,
      };

      const parsed = aboutDataSchema.safeParse(payload);
      if (!parsed.success) {
        setErrors(getValidationErrors(parsed.error));
        notify.error("Validation failed. Please verify fields in all tabs.");
        return;
      }

      setErrors({});
      const pageId = pageQuery.data?.id || "page-about";
      await contentService.updatePageContent(pageId, {
        page: "About",
        ...parsed.data,
      });

      notify.success("About Us page updated successfully.", {
        title: "Content saved",
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.adminContentPage("about") });
      queryClient.invalidateQueries({ queryKey: ["content-page", "about"] });
    } catch (error) {
      notify.error(error.message || "Failed to save content.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Content Management"
          title="About BR Jewellers"
          description="Manage corporate profiles, brand background, values, and chronological milestones displayed on the storefront About Us page."
        />
      </AdminPanel>

      <AdminDataState query={pageQuery} loadingLabel="Loading About Us content...">
        {(pageData) => (
          <AdminPanel>
            <form onSubmit={handleSave} className="space-y-6">
              {!canEdit && (
                <div className="rounded-[20px] bg-rose-50 border border-rose-100 p-4 text-sm text-rose-800">
                  <strong>Read-Only Mode:</strong> You do not have permission to modify content.
                </div>
              )}

              {/* Responsive Tabs navigation */}
              <div className="flex border-b border-stone-200 overflow-x-auto space-x-2 scrollbar-none pb-1">
                {tabs.map((tab) => {
                  const hasError = hasTabErrors(tab.id);
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "relative py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all rounded-t-xl",
                        activeTab === tab.id
                          ? "border-[#d3a347] text-[#d3a347] bg-stone-50"
                          : "border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50/50"
                      )}
                    >
                      {tab.label}
                      {hasError && (
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents */}
              <div className="pt-2 min-h-[300px]">
                {/* 1. Intro & Video */}
                {activeTab === "intro" && (
                  <div className="space-y-4 animate-fadeIn">
                    <Input
                      label="Page title"
                      required
                      disabled={!canEdit}
                      error={errors.title}
                      value={titleText}
                      onChange={(e) => {
                        setErrors((curr) => ({ ...curr, title: undefined }));
                        setTitleText(e.target.value);
                      }}
                    />

                    <RichTextEditor
                      label="Intro Description Paragraphs"
                      error={errors.body}
                      value={bodyText}
                      onChange={(val) => {
                        setErrors((curr) => ({ ...curr, body: undefined }));
                        setBodyText(val);
                      }}
                      disabled={!canEdit}
                      helperText="Specify the welcome text that will display right below the Page title on the frontend."
                    />
                  </div>
                )}

                {/* 2. Founder Profile */}
                {activeTab === "founder" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="Founder Name"
                        required
                        disabled={!canEdit}
                        error={errors.founderName}
                        value={founderName}
                        onChange={(e) => {
                          setErrors((curr) => ({ ...curr, founderName: undefined }));
                          setFounderName(e.target.value);
                        }}
                      />
                      <Input
                        label="Founder Section Title / Eyebrow"
                        required
                        disabled={!canEdit}
                        error={errors.founderTitle}
                        value={founderTitle}
                        onChange={(e) => {
                          setErrors((curr) => ({ ...curr, founderTitle: undefined }));
                          setFounderTitle(e.target.value);
                        }}
                      />
                    </div>

                    <Input
                      label="Founder Bio Description"
                      as="textarea"
                      required
                      disabled={!canEdit}
                      error={errors.founderDescription}
                      value={founderDescription}
                      onChange={(e) => {
                        setErrors((curr) => ({ ...curr, founderDescription: undefined }));
                        setFounderDescription(e.target.value);
                      }}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="Founder Headshot Image URL"
                        required
                        disabled={!canEdit}
                        error={errors.founderImage}
                        value={founderImage}
                        onChange={(e) => {
                          setErrors((curr) => ({ ...curr, founderImage: undefined }));
                          setFounderImage(e.target.value);
                        }}
                      />
                      <Input
                        label="Founder Workshop/Organic Image URL"
                        required
                        disabled={!canEdit}
                        error={errors.founderOmImage}
                        value={founderOmImage}
                        onChange={(e) => {
                          setErrors((curr) => ({ ...curr, founderOmImage: undefined }));
                          setFounderOmImage(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 3. Our Story */}
                {activeTab === "story" && (
                  <div className="space-y-4 animate-fadeIn">
                    <Input
                      label="Story Section Title"
                      required
                      disabled={!canEdit}
                      error={errors.storyTitle}
                      value={storyTitle}
                      onChange={(e) => {
                        setErrors((curr) => ({ ...curr, storyTitle: undefined }));
                        setStoryTitle(e.target.value);
                      }}
                    />
                    <Input
                      label="Story Section Description"
                      as="textarea"
                      required
                      disabled={!canEdit}
                      error={errors.storyDescription}
                      value={storyDescription}
                      onChange={(e) => {
                        setErrors((curr) => ({ ...curr, storyDescription: undefined }));
                        setStoryDescription(e.target.value);
                      }}
                      className="min-h-[160px]"
                    />
                  </div>
                )}

                {/* 4. What We Do */}
                {activeTab === "whatwedo" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="What We Do Eyebrow"
                        required
                        disabled={!canEdit}
                        error={errors.whatWeDoEyebrow}
                        value={whatWeDoEyebrow}
                        onChange={(e) => {
                          setErrors((curr) => ({ ...curr, whatWeDoEyebrow: undefined }));
                          setWhatWeDoEyebrow(e.target.value);
                        }}
                      />
                      <Input
                        label="What We Do Title"
                        required
                        disabled={!canEdit}
                        error={errors.whatWeDoTitle}
                        value={whatWeDoTitle}
                        onChange={(e) => {
                          setErrors((curr) => ({ ...curr, whatWeDoTitle: undefined }));
                          setWhatWeDoTitle(e.target.value);
                        }}
                      />
                    </div>

                    <Input
                      label="What We Do Description"
                      as="textarea"
                      required
                      disabled={!canEdit}
                      error={errors.whatWeDoDescription}
                      value={whatWeDoDescription}
                      onChange={(e) => {
                        setErrors((curr) => ({ ...curr, whatWeDoDescription: undefined }));
                        setWhatWeDoDescription(e.target.value);
                      }}
                    />

                    <Input
                      label="What We Do Showcase Image URL"
                      required
                      disabled={!canEdit}
                      error={errors.whatWeDoImage}
                      value={whatWeDoImage}
                      onChange={(e) => {
                        setErrors((curr) => ({ ...curr, whatWeDoImage: undefined }));
                        setWhatWeDoImage(e.target.value);
                      }}
                    />
                  </div>
                )}

                {/* 5. Core Philosophy (Interactive CRUD Layout) */}
                {activeTab === "values" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-stone-800">Company Core Values</h3>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={handleAddValue}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#B9852E] bg-[#D9A44F]/10 hover:bg-[#D9A44F]/20 rounded-full transition-all"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add New Value
                        </button>
                      )}
                    </div>

                    {errors.values && (
                      <p className="text-xs text-rose-600 font-medium">{errors.values}</p>
                    )}

                    {valuesList.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-stone-200 rounded-[20px] text-stone-400 text-sm">
                        No core values configured yet. Click "Add New Value" to start.
                      </div>
                    ) : (
                      <div className="grid gap-6 md:grid-cols-2">
                        {valuesList.map((val) => {
                          const isEditing = editingValueId === val.id;

                          return (
                            <div
                              key={val.id}
                              className="p-5 rounded-[24px] border border-stone-200 bg-stone-50/50 flex flex-col justify-between min-h-[220px] transition-all hover:shadow-md"
                            >
                              {isEditing ? (
                                // Value Form Editor
                                <div className="space-y-4 w-full">
                                  <Input
                                    label="Value Title"
                                    required
                                    disabled={!canEdit}
                                    value={val.title}
                                    onChange={(e) => handleUpdateValue(val.id, "title", e.target.value)}
                                  />
                                  <Input
                                    label="Value Description"
                                    as="textarea"
                                    required
                                    disabled={!canEdit}
                                    value={val.description}
                                    onChange={(e) =>
                                      handleUpdateValue(val.id, "description", e.target.value)
                                    }
                                    className="min-h-[80px]"
                                  />
                                  <Input
                                    label="Value Image URL"
                                    required
                                    disabled={!canEdit}
                                    value={val.image}
                                    onChange={(e) => handleUpdateValue(val.id, "image", e.target.value)}
                                  />
                                  <div className="flex justify-end gap-2 pt-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingValueId(null)}
                                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-full transition-all"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                      Done
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                // Value Visual Preview Card
                                <div className="flex flex-col h-full justify-between">
                                  <div className="space-y-3">
                                    {val.image && (
                                      <div className="w-full h-28 rounded-lg overflow-hidden border border-stone-200 shadow-sm bg-stone-100">
                                        <img src={val.image} alt={val.title} width="400" height="300" className="w-full h-full object-cover" loading="lazy" />
                                      </div>
                                    )}
                                    <div>
                                      <h4 className="font-display text-lg font-bold text-stone-900">{val.title || "Untitled Value"}</h4>
                                      <p className="text-xs text-stone-500 leading-relaxed mt-1">{val.description || "No description provided."}</p>
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-2 pt-4 border-t border-stone-100 mt-4">
                                    <button
                                      type="button"
                                      onClick={() => setEditingValueId(val.id)}
                                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gold-700 bg-[#f4e4bd]/30 hover:bg-[#f4e4bd]/60 rounded-full transition-all"
                                      title="Edit Card"
                                    >
                                      <Pencil className="h-3 w-3" />
                                      Edit
                                    </button>
                                    {canEdit && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveValue(val.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-full transition-all"
                                        title="Delete Card"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Milestones Timeline (Interactive CRUD Layout) */}
                {activeTab === "timeline" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-stone-800">Chronological Steps Towards Success</h3>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={handleAddMilestone}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#B9852E] bg-[#D9A44F]/10 hover:bg-[#D9A44F]/20 rounded-full transition-all"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add New Milestone
                        </button>
                      )}
                    </div>

                    {errors.timeline && (
                      <p className="text-xs text-rose-600 font-medium">{errors.timeline}</p>
                    )}

                    {timelineList.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-stone-200 rounded-[20px] text-stone-400 text-sm">
                        No milestone events configured yet. Click "Add New Milestone" to start.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {timelineList.map((item) => {
                          const isEditing = editingMilestoneId === item.id;

                          return (
                            <div
                              key={item.id}
                              className="p-5 rounded-[24px] border border-stone-200 bg-stone-50/50 flex flex-col gap-4 transition-all hover:shadow-md"
                            >
                              {isEditing ? (
                                // Milestone Form Editor
                                <div className="grid gap-4 grid-cols-1 md:grid-cols-[140px_1fr]">
                                  <Input
                                    label="Milestone Year"
                                    required
                                    placeholder="e.g. 2009 or 2013-14"
                                    disabled={!canEdit}
                                    value={item.year}
                                    onChange={(e) => handleUpdateMilestone(item.id, "year", e.target.value)}
                                  />
                                  <div className="flex flex-col justify-between">
                                    <Input
                                      label="Milestone Details/Description"
                                      required
                                      disabled={!canEdit}
                                      value={item.description}
                                      onChange={(e) =>
                                        handleUpdateMilestone(item.id, "description", e.target.value)
                                      }
                                    />
                                    <div className="flex justify-end gap-2 pt-3">
                                      <button
                                        type="button"
                                        onClick={() => setEditingMilestoneId(null)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-full transition-all"
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                        Done
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // Milestone Visual Preview Card
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-start gap-4">
                                    <div className="px-3.5 py-1.5 bg-[#f4e4bd]/35 border border-[#dfccab]/50 rounded-full text-[#b9852e] font-display text-lg font-bold shrink-0">
                                      {item.year || "----"}
                                    </div>
                                    <p className="text-sm text-stone-600 leading-relaxed mt-1">{item.description || "No milestone description."}</p>
                                  </div>

                                  <div className="flex gap-2 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => setEditingMilestoneId(item.id)}
                                      className="flex items-center justify-center h-8 w-8 rounded-full bg-[#f4e4bd]/30 text-gold-800 hover:bg-[#f4e4bd]/60 transition-all"
                                      title="Edit Milestone"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    {canEdit && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveMilestone(item.id)}
                                        className="flex items-center justify-center h-8 w-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                                        title="Delete Milestone"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {canEdit && (
                <div className="flex justify-end pt-4 border-t border-stone-200">
                  <Button type="submit" loading={saving}>
                    Save Page Changes
                  </Button>
                </div>
              )}
            </form>
          </AdminPanel>
        )}
      </AdminDataState>
    </div>
  );
}
