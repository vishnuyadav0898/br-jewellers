import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useLocale } from "../../shared/localization";
import { BlogsPageSkeleton } from "../../shared/components/Skeleton";
import { storefrontService } from "../services/storefrontService";
import { formatDate } from "../../shared/utils/formatters";
import { BookOpen, User, Calendar } from "lucide-react";
import { useSEO } from "../../shared/hooks/useSEO";

export function BlogsPage() {
  useSEO({
    title: "Blog & Editorial",
    description: "Read jewellery buying guides, gemstone education, diamond trends, and design craftsmanship stories at the BR Jewellers blog.",
    keywords: "jewellery blog, diamond guides, gold purity tips, jewellery fashion trends, BR Jewellers articles",
  });
  const { language } = useLocale();
  const blogsQuery = useQuery({
    queryKey: ["user-blogs"],
    queryFn: () => storefrontService.getBlogs(),
  });

  if (blogsQuery.isLoading) {
    return <BlogsPageSkeleton />;
  }

  const blogs = blogsQuery.data || [];

  return (
    <div className="space-y-12">
      {/* Editorial Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#B9852E]">
          BR Editorial Journal
        </p>
        <h1 className="font-display text-5xl text-[#1a120e] leading-tight">
          The Art of Fine Jewellery
        </h1>
        <p className="text-stone-600 leading-relaxed">
          Discover styling advice, historical insights, and expert guides crafted by the B.R. Jewellers design team.
        </p>
      </section>

      {/* Featured Blog (if at least one exists) */}
      {blogs.length > 0 && (
        <Link to={`/blogs/${blogs[0].id}`} className="group block overflow-hidden rounded-[36px] border border-[#e1cfab] bg-white shadow-[0_18px_60px_rgba(40,24,13,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(40,24,13,0.12)]">
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div className="h-72 md:h-96 overflow-hidden">
              <img
                src={blogs[0].coverImage || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80"}
                alt={blogs[0].title}
                width="600"
                height="384"
                fetchpriority="high"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-12 space-y-4">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-[#9e6c24]">
                <span>{blogs[0].readTime}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(blogs[0].publishedAt, language)}
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-[#1a120e] group-hover:text-[#9e6c24] transition-colors leading-tight">
                {blogs[0].title}
              </h2>
              <p className="text-stone-600 leading-relaxed text-sm md:text-base">
                {blogs[0].excerpt}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#1a120e] uppercase tracking-widest group-hover:underline">
                Read Article <BookOpen className="h-4 w-4" />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Grid of other blogs */}
      {blogs.length > 1 ? (
        <section className="grid gap-4 md:gap-8 grid-cols-2 lg:grid-cols-3">
          {blogs.slice(1).map((blog) => (
            <Link
              key={blog.id}
              to={`/blogs/${blog.id}`}
              className="group block overflow-hidden rounded-[20px] md:rounded-[30px] border border-[#e1cfab] bg-white shadow-[0_12px_45px_rgba(40,24,13,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(40,24,13,0.08)]"
            >
              <div className="h-32 sm:h-56 overflow-hidden">
                <img
                  src={blog.coverImage || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"}
                  alt={blog.title}
                  width="400"
                  height="224"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs text-stone-500">
                  <span className="font-semibold text-[#9e6c24]">{blog.readTime}</span>
                  <span>•</span>
                  <span>{formatDate(blog.publishedAt, language)}</span>
                </div>
                <h3 className="font-display text-base sm:text-2xl text-[#1a120e] group-hover:text-[#9e6c24] transition-colors line-clamp-2 leading-tight">
                  {blog.title}
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
                  {blog.excerpt}
                </p>
                <div className="pt-1 sm:pt-2 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[#1a120e] uppercase tracking-wider group-hover:underline">
                  Read More <BookOpen className="h-3 sm:h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12 rounded-[30px] border border-dashed border-[#e1cfab] bg-[#fffbf4]">
          <BookOpen className="mx-auto h-12 w-12 text-[#9e6c24] opacity-50" />
          <h3 className="mt-4 font-display text-2xl text-[#1a120e]">No journal entries yet</h3>
          <p className="mt-2 text-stone-600 text-sm">Please check back soon for our latest publications.</p>
        </div>
      ) : null}
    </div>
  );
}
