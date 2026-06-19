import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, Share2 } from "lucide-react";
import { useLocale } from "../../shared/localization";
import { Loader } from "../../shared/components/Loader";
import { storefrontService } from "../services/storefrontService";
import { formatDate } from "../../shared/utils/formatters";
import { Button } from "../../shared/components/Button";
import { notify } from "../../shared/utils/notify";

export function BlogDetailsPage() {
  const { id } = useParams();
  const { language } = useLocale();

  const blogQuery = useQuery({
    queryKey: ["user-blog", id],
    queryFn: () => storefrontService.getBlogById(id),
  });

  if (blogQuery.isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader label="Unveiling editorial masterwork..." />
      </div>
    );
  }

  const blog = blogQuery.data;

  if (!blog) {
    return (
      <div className="text-center py-24 max-w-md mx-auto space-y-6">
        <h2 className="font-display text-4xl text-[#1a120e] tracking-tight">Article Not Found</h2>
        <p className="text-stone-500 leading-relaxed">The page you are looking for has been moved or doesn't exist.</p>
        <Link to="/blogs">
          <Button tone="accent" className="px-8 py-3 rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Journal
          </Button>
        </Link>
      </div>
    );
  }

  const paragraphs = typeof blog.content === "string"
    ? blog.content.split(/\n+/).map(p => p.trim()).filter(Boolean)
    : [];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    notify.success("Link copied to clipboard!", { title: "Share Article" });
  };

  return (
    <article className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      {/* Back button */}
      <div>
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9e6c24] hover:text-[#1c1917] transition duration-300"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Journal
        </Link>
      </div>

      {/* Main Title & Editorial Header (Integrated in unified background) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-widest text-[#9e6c24]">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(blog.publishedAt, language)}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {blog.readTime}
          </span>
        </div>
        
        <h1 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-[#1a120e] leading-tight">
          {blog.title}
        </h1>

        <div className="flex items-center gap-3 pt-2 text-stone-500 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4ebd0] text-[#9e6c24] font-semibold text-xs uppercase">
            {blog.author ? blog.author.slice(0, 2) : "BR"}
          </div>
          <span>Written by <strong className="text-stone-700">{blog.author || "BR Editorial Team"}</strong></span>
        </div>
      </div>

      {/* Main Visual Image container */}
      <div className="overflow-hidden rounded-[24px] border border-[#e1cfab]/50 shadow-md max-h-[480px]">
        <img
          src={blog.coverImage || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80"}
          alt={blog.title}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Sharing and Action panel */}
      <div className="flex items-center justify-between border-y border-[#e1cfab]/40 py-4 text-stone-500 text-sm">
        <p className="italic text-[#9e6c24] text-xs uppercase tracking-widest">BR Editorial Journal</p>
        <button onClick={handleShare} className="flex items-center gap-2 hover:text-[#9e6c24] transition duration-300 font-medium">
          <Share2 className="h-4 w-4" />
          <span>Share Article</span>
        </button>
      </div>

      {/* Article Text Content with Stylized Drop Cap */}
      <div className="space-y-6 prose max-w-none">
        {paragraphs.map((para, idx) => {
          if (idx === 0) {
            return (
              <p key={idx} className="text-lg sm:text-xl leading-relaxed text-stone-700 font-light first-letter:float-left first-letter:text-5xl sm:first-letter:text-6xl first-letter:font-display first-letter:font-bold first-letter:mr-3 first-letter:text-[#9e6c24] first-letter:mt-1">
                {para}
              </p>
            );
          }
          if (idx === Math.floor(paragraphs.length / 2)) {
            return (
              <blockquote key={idx} className="bg-[#fffdf9] p-6 rounded-2xl border-l-4 border-[#9e6c24] my-8">
                <p className="text-xl italic font-display text-[#1a120e] leading-relaxed">
                  "{para}"
                </p>
              </blockquote>
            );
          }
          return (
            <p key={idx} className="text-stone-600 leading-relaxed text-base sm:text-lg">
              {para}
            </p>
          );
        })}
      </div>

      {/* Visual Gallery */}
      {blog.gallery && blog.gallery.length > 0 && (
        <div className="pt-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-[#e1cfab]/40" />
            <h3 className="font-display text-2xl text-[#1a120e] font-light tracking-wide">
              Exquisite Details
            </h3>
            <div className="h-[1px] flex-1 bg-[#e1cfab]/40" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 pt-2">
            {blog.gallery.map((imgUrl, idx) => (
              <div key={idx} className="group overflow-hidden rounded-[20px] border border-[#e1cfab]/55 h-44 shadow-sm relative">
                <img
                  src={imgUrl}
                  alt={`Visual gallery item ${idx + 1}`}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="pt-12 text-center border-t border-[#e1cfab]/30">
        <Link
          to="/blogs"
          className="inline-flex items-center justify-center gap-3 px-8 py-3 rounded-full border border-[#e1cfab] bg-white text-[#9e6c24] hover:bg-[#1a120e] hover:text-white hover:border-[#1a120e] transition duration-500 font-semibold text-sm shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Editorial Journal
        </Link>
      </div>
    </article>
  );
}
