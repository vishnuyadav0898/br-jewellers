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

  const handleSeed = async () => {
    setSaving(true);
    try {
      const blogsToSeed = [
        {
          title: "The Ultimate Guide to Selecting the Perfect Engagement Ring",
          coverImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
          description: "Selecting an engagement ring is one of the most significant and memorable decisions of a lifetime. This comprehensive guide simplifies the journey by walking you through the essential 4Cs of diamonds—Cut, Color, Clarity, and Carat weight.\n\nFirst, consider the cut, which governs the diamond's brilliance and ability to catch light. A round brilliant cut offers unmatched fire, while an emerald cut delivers elegant sophistication.\n\nNext, explore settings and metals. From classical solitaire designs to modern halo mountings in platinum or warm 18k yellow gold, the setting should reflect your partner's unique personal style and daily comfort.\n\nFinally, establish a comfortable budget and consult with certified gemologists. A ring is not just a piece of precious metal; it is a lasting testament of love, craft, and devotion."
        },
        {
          title: "A History of Royal Tiaras and Headpieces",
          coverImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
          description: "Tiaras have served as symbols of ultimate prestige, power, and elegance for centuries. From ancient crowns crafted of olive branches to the glittering diamond masterpieces of European courts, these ornaments hold captivating histories.\n\nDuring the nineteenth century, tiaras transitioned from emblems of monarchy to fashionable bridal accessories for high society, celebrating grand scale romance and family legacy.\n\nThe craftsmanship involved in making royal headpieces is extraordinary. Master jewellers spent months hand-setting hundreds of diamonds in platinum and gold alloys, creating delicate floral and geometric art pieces.\n\nToday, modern designers draw inspiration from these historic tiaras to create delicate headpieces for modern brides, blending legacy with minimalist luxury."
        },
        {
          title: "Understanding Gold Purity: 24k vs 18k vs 14k Explained",
          coverImage: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80",
          description: "Gold is the foundation of fine jewellery, but understanding karat values can sometimes feel confusing. A karat measures the purity of gold out of 24 parts.\n\n24k gold is 100% pure gold. While stunningly bright, it is highly soft and prone to scratching, making it unsuitable for complex everyday rings or stone settings.\n\n18k gold contains 75% gold blended with 25% alloy metals like copper or silver. It strikes a perfect balance, preserving gold's rich hue while adding structural strength for diamonds.\n\n14k gold, containing 58.3% gold, is highly durable and affordable, making it a favorite for active individuals who wear their jewellery continuously."
        },
        {
          title: "The Eternal Brilliance of Diamond Cuts: Which One Suits You?",
          coverImage: "https://images.unsplash.com/photo-1588444839799-eaa4344eee19?auto=format&fit=crop&w=800&q=80",
          description: "A diamond's shape reflects the wearer's personality. The cut is what unlocks a stone's inner fire and sparkle.\n\nThe Round Brilliant cut is engineered for maximum light return, perfect for classic and sparkling tastes. The Princess cut offers a modern, square look with incredible brilliance.\n\nFor a vintage flair, the Cushion and Marquise cuts recall romantic historical eras, while Pear and Oval shapes lengthen the fingers elegantly.\n\nExplore different cuts under varying light conditions to see which one resonates with your style, as every diamond interacts uniquely."
        },
        {
          title: "The Rise of Ethically Sourced and Lab-Grown Diamonds",
          coverImage: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80",
          description: "Modern luxury requires a balance of beauty and responsibility. The demand for ethical gemstones is reshaping how we view diamonds.\n\nLab-grown diamonds are chemically, physically, and optically identical to mined diamonds, offering a transparent supply chain and reduced environmental footprint.\n\nConflict-free mined diamonds, certified under the Kimberley Process, ensure that miners work in safe conditions and receive fair wages.\n\nChoosing ethical diamonds allows couples to celebrate their love stories with peace of mind, knowing their ring represents a sustainable future."
        },
        {
          title: "How to Clean and Care for Your Luxury Jewellery at Home",
          coverImage: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=800&q=80",
          description: "To maintain the sparkle of your heirlooms, regular care and professional check-ups are essential.\n\nFor daily cleaning, soak your gold and diamond pieces in warm water with a few drops of mild dish soap, then gently scrub with a soft-bristled toothbrush.\n\nAvoid using harsh chemicals like bleach or abrasive toothpastes, which can scratch precious metals and damage delicate gems like pearls.\n\nStore pieces separately in velvet-lined boxes to prevent scratching, and visit a trusted jeweller annually to check prongs and settings."
        },
        {
          title: "Unveiling the Mystique of Rare Blue Sapphires",
          coverImage: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80",
          description: "Sapphires have captured the imagination for thousands of years as symbols of wisdom, loyalty, and divine protection.\n\nThe most prized sapphires exhibit a rich, velvety cornflower blue color, often originating from historical mines in Kashmir and Ceylon.\n\nSapphires are highly durable, scoring a 9 on the Mohs hardness scale, which makes them an excellent alternative to diamonds for engagement rings.\n\nWhether set in modern white gold or classical yellow gold, the deep blue tone of a sapphire adds an air of sophistication and timeless royal appeal."
        },
        {
          title: "Platinum vs. White Gold: A Detailed Comparison Guide",
          coverImage: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80",
          description: "While platinum and white gold appear similar, they differ in durability, maintenance, and cost.\n\nPlatinum is a dense, naturally white metal that is hypoallergenic. It develops a vintage patina over time rather than wearing away.\n\nWhite gold is pure gold mixed with white alloys and plated with rhodium. It offers a brighter mirror shine but requires re-plating every few years.\n\nFor heavy settings and lifetime durability, platinum is ideal. White gold offers a lightweight and budget-friendly alternative with exceptional shine."
        },
        {
          title: "Modern Minimalist Jewellery Trends for the Daily Wardrobe",
          coverImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
          description: "Minimalism is about focusing on clean lines and simple elegance. Small details can elevate an everyday outfit.\n\nDelicate gold chain necklaces, mini huggie earrings, and stackable bands are the cornerstones of modern style.\n\nChoose pieces that can be layered seamlessly. A simple bar pendant paired with a thin snake chain creates a subtle yet sophisticated look.\n\nInvesting in high-quality minimalist gold jewellery ensures durability and a lifetime of effortless style."
        },
        {
          title: "The Meaning and History Behind Birthstone Jewellery",
          coverImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
          description: "Birthstones connect our personal identities with the rich lore of the mineral kingdom.\n\nThe tradition dates back to the breastplate of Aaron in biblical times, which was set with twelve unique gems representing the tribes of Israel.\n\nFrom the protective properties of January's Garnet to the sparkling fire of April's Diamond, birthstones make meaningful gifts.\n\nWhether customized as a pendant or set in a ring, birthstone jewellery carries personal history and talismanic value."
        },
        {
          title: "Art Deco Jewellery: The Bold Geometric Style of the 1920s",
          coverImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
          description: "The Art Deco period introduced bold geometry, contrasting colors, and a celebration of modern machinery.\n\nCharacterized by symmetrical patterns, step-cut diamonds, and vibrant gemstone combinations like onyx, jade, and rubies.\n\nPlatinum became the metal of choice, allowing artisans to create secure geometric lace-like filigree patterns.\n\nToday, Art Deco remains highly popular for engagement rings, appealing to those who love bold, vintage-inspired design."
        },
        {
          title: "A Buyer’s Guide to Fine Pearl Jewellery and Necklaces",
          coverImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
          description: "Pearls are the only gemstones created by living organisms, epitomizing classic elegance and organic beauty.\n\nWhen buying pearls, look at luster, surface quality, and shape. High-quality pearls have a sharp, mirror-like reflection.\n\nAkoya pearls offer high luster, South Sea pearls provide large sizes and golden hues, and Freshwater pearls come in organic shapes.\n\nStyle a simple strand of pearls with a cocktail dress or wear baroque pearl earrings for a modern look."
        },
        {
          title: "Bridal Jewellery Styling Tips for Your Special Day",
          coverImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
          description: "Your wedding day is a celebration of love, and your accessories should complement, not overwhelm, your gown.\n\nChoose your metal based on your dress color: white gold goes well with pure white, yellow gold complements ivory, and rose gold suits blush tones.\n\nConsider your neckline. A strapless gown looks stunning with a statement necklace, while a high neckline pairs best with drop earrings.\n\nMost importantly, choose pieces that reflect your style so you feel comfortable and radiant."
        },
        {
          title: "The Mystical Origins and Power of Emeralds",
          coverImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
          description: "Emeralds, with their rich green color, have been loved by royalty from Cleopatra to modern duchesses.\n\nKnown as the stone of successful love, emeralds are believed to bring harmony, wisdom, and foresight to the wearer.\n\nThey contain natural inclusions, known as 'jardin' (garden), which make each emerald unique.\n\nDue to their delicate nature, emeralds require gentle care and protective settings like bezel mountings."
        },
        {
          title: "Chunky Gold Chains: A Bold Statement from Retro to Modern",
          coverImage: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80",
          description: "Chunky gold chains are no longer just a retro trend; they are a modern wardrobe staple.\n\nFrom thick curb links to bold paperclip styles, a statement necklace adds instant polish to a simple t-shirt or tailored blazer.\n\nLayer different link textures and lengths for a personalized look, or wear a single heavy chain as a focal point.\n\nInvest in solid or high-quality hollow gold chains to enjoy a bold look without compromising on comfort."
        },
        {
          title: "Customising Your Heirloom: The Process of Bespoke Jewellery",
          coverImage: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=800&q=80",
          description: "Creating a bespoke piece of jewellery is a collaborative journey that turns your ideas into reality.\n\nThe process begins with a consultation and sketching sessions, followed by a 3D CAD render to visualize the design.\n\nNext, the design is cast in precious metals, and gemstones are hand-set by master craftsmen.\n\nWhether redesigning an old heirloom or starting fresh, custom jewellery lets you tell your personal story in gold and stone."
        },
        {
          title: "The Rise of Coloured Gemstones in Engagement Rings",
          coverImage: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80",
          description: "Couples are increasingly looking beyond traditional diamonds to express their unique styles.\n\nColoured gemstones like peach morganite, teal sapphires, and salt-and-pepper diamonds offer a unique aesthetic.\n\nWhen choosing a coloured gem, verify its hardness to ensure it can withstand daily wear.\n\nPairing a vibrant gemstone with a delicate diamond halo creates a beautiful contrast that stands out."
        },
        {
          title: "Filigree Artistry: The Ancient Technique of Wirework Jewellery",
          coverImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
          description: "Filigree is a delicate craft that involves twisting and soldering fine threads of precious metal into intricate patterns.\n\nOriginating in ancient Mesopotamia and Greece, this art form requires immense patience and skill.\n\nFiligree designs mimic lace, floral vines, and geometric screens, creating lightweight yet detailed pieces.\n\nModern filigree jewellery bridges history and fashion, offering romantic and detailed designs."
        },
        {
          title: "Rose Gold: The Romantically Warm Metal Dominating Design",
          coverImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
          description: "Rose gold's pinkish hue is created by alloying pure gold with copper and a touch of silver.\n\nIt gained popularity in nineteenth-century Russia and has become a modern favorite for its warm, romantic tone.\n\nIt complements all skin tones and pairs beautifully with morganite, pink diamonds, and white gold accents.\n\nIts durability is high due to the copper content, making it perfect for daily-wear engagement rings."
        },
        {
          title: "Layering Necklaces and Stacking Rings: The Modern Art of Mix & Match",
          coverImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
          description: "Styling jewellery is an art form. Layering and stacking let you showcase your creativity.\n\nWhen stacking rings, mix different band widths, textures, and metals. Place a gemstone ring between simple gold bands.\n\nFor necklaces, layer different lengths (e.g., 16, 18, and 20 inches) to prevent tangling. Mix thick chains with delicate pendants.\n\nHave fun experimenting with different combinations to find a look that is uniquely yours."
        }
      ];

      for (const item of blogsToSeed) {
        await blogsService.createBlog({
          title: item.title,
          excerpt: item.description.slice(0, 150),
          coverImage: item.coverImage,
          author: "BR Editorial Team",
          readTime: "4 min read",
          content: item.description
        });
      }

      notify.success("20 blogs successfully seeded to database!");
      queryClient.invalidateQueries({ queryKey: queryKeys.adminBlogs });
    } catch (error) {
      notify.error("Seeding failed: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Content Management"
          title="Blog management"
          description="CRUD blog management is kept in the admin content layer so editorial workflows stay separate from storefront rendering."
          actions={
            <div className="flex gap-2">
              <Button tone="secondary" onClick={handleSeed} loading={saving}>
                Seed 20 Blogs
              </Button>
              <PermissionGuard module="Blog" action="Add">
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Create blog
                </Button>
              </PermissionGuard>
            </div>
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
