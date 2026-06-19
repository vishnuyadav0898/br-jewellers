import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "../../shared/components/Loader";
import { storefrontService } from "../services/storefrontService";

export function AboutPage() {
  const aboutQuery = useQuery({
    queryKey: ["content-page", "about"],
    queryFn: () => storefrontService.getContentPage("about"),
  });

  const [activeMilestoneId, setActiveMilestoneId] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const page = aboutQuery.data || {};
  const timeline = page.timeline || [];

  useEffect(() => {
    if (!timeline.length) return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const triggerPoint = windowHeight * 0.4; // 40% from top of viewport

      let currentActiveId = null;
      let minDistance = Infinity;

      timeline.forEach((item) => {
        const id = item.id || item.year;
        const element = document.getElementById(`timeline-item-${id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const distance = Math.abs(rect.top - triggerPoint);
          if (rect.top < triggerPoint + 150 && distance < minDistance) {
            minDistance = distance;
            currentActiveId = id;
          }
        }
      });

      if (currentActiveId) {
        setActiveMilestoneId(currentActiveId);
      }

      const timelineWrapper = document.getElementById("timeline-wrapper");
      if (timelineWrapper) {
        const rect = timelineWrapper.getBoundingClientRect();
        const elementHeight = rect.height;
        const scrolledPast = triggerPoint - rect.top;
        const progress = Math.min(Math.max((scrolledPast / elementHeight) * 100, 0), 100);
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [timeline]);

  if (aboutQuery.isLoading) {
    return <Loader label="Loading About BR Jewellers..." />;
  }
  const title = page.title || "About BR Jewellers";
  const body = page.body || "";
  const founderName = page.founderName || "";
  const founderTitle = page.founderTitle || "ABOUT THE FOUNDER";
  const founderDescription = page.founderDescription || "";
  const founderImage = page.founderImage || "";
  const founderOmImage = page.founderOmImage || "";
  const storyTitle = page.storyTitle || "OUR STORY";
  const storyDescription = page.storyDescription || "";
  const whatWeDoEyebrow = page.whatWeDoEyebrow || "Introducing The Company";
  const whatWeDoTitle = page.whatWeDoTitle || "WHAT WE DO";
  const whatWeDoDescription = page.whatWeDoDescription || "";
  const whatWeDoImage = page.whatWeDoImage || "";
  const values = page.values || [];

  return (
    <div className="space-y-24 px-4 py-8 w-full">
      {/* 1. Title / Header Block */}
      <div className="relative overflow-hidden rounded-[40px] border border-[#dfccab]/50 bg-gradient-to-b from-[#fdfbf7] to-[#f7f3e9] p-10 md:p-16 max-w-5xl mx-auto shadow-[0_12px_45px_rgba(40,24,13,0.04)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#dfccab]/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#dfccab]/10 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#B9852E]">About B.R. Jewellers</p>
          
          <h1 className="font-display text-5xl md:text-6xl font-medium tracking-tight text-[#241B17] leading-tight">
            {title}
          </h1>

          <div className="flex items-center justify-center gap-4 py-2">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#B9852E]/60"></div>
            <span className="text-[#B9852E] text-xl">✦</span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#B9852E]/60"></div>
          </div>

          {body && (
            <div
              className="text-stone-600 text-base md:text-lg leading-relaxed text-center font-light space-y-4 max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          )}
        </div>
      </div>

      {/* 2. Premium Video Banner */}
      <div className="relative overflow-hidden rounded-[32px] border border-[#dfccab]/50 shadow-[0_24px_80px_rgba(32,21,15,0.15)] max-w-7xl mx-auto">
        <video className="w-full h-auto aspect-video object-cover" autoPlay muted loop playsInline preload="metadata">
          <source src="https://brjeweller.com/wp-content/uploads/2023/08/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* 3. About the Founder Section */}
      {(founderName || founderDescription) && (
        <div className="grid grid-cols-1 md:grid-cols-[1.25fr_0.75fr] gap-12 items-center bg-[#17100d] text-[#f8efdc] p-10 md:p-14 rounded-[32px] border border-[#dfccab] shadow-[0_25px_70px_rgba(32,21,15,0.25)] max-w-7xl mx-auto">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d5a957] mb-2">{founderTitle}</p>
              <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-white">{founderName}</h2>
            </div>
            <div className="h-[1px] w-24 bg-gradient-to-r from-[#d5a957] to-transparent"></div>
            <p className="text-sm leading-8 text-[#ebddc2]/90 text-justify">
              {founderDescription}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {founderImage && (
              <div className="relative overflow-hidden rounded-[20px] border border-white/10 aspect-[3/4] shadow-2xl">
                <img src={founderImage} alt={founderName} className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
            {founderOmImage && (
              <div className="relative overflow-hidden rounded-[20px] border border-white/10 aspect-[3/4] shadow-2xl mt-6">
                <img src={founderOmImage} alt={`${founderName} Workshop`} className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Our Story Section */}
      {(storyTitle || storyDescription) && (
        <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-16 items-center bg-[#FCF8F2]/60 p-10 md:p-14 rounded-[32px] border border-stone-200/80 shadow-md max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Inline BR Jewellers Logo */}
            <svg viewBox="0 0 1600 500" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" className="w-full h-auto max-w-[240px] md:max-w-[300px]">
              <defs>
                <linearGradient id="logo-gold" x1="38" y1="32" x2="295" y2="274" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stop-color="#6F4B16" />
                  <stop offset="0.24" stop-color="#B8862B" />
                  <stop offset="0.48" stop-color="#F6E6B0" />
                  <stop offset="0.68" stop-color="#D4A449" />
                  <stop offset="1" stop-color="#7A531B" />
                </linearGradient>
                <linearGradient id="logo-wordmarkGold" x1="350" y1="94" x2="1200" y2="276" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stop-color="#8C6422" />
                  <stop offset="0.35" stop-color="#F4E3AF" />
                  <stop offset="0.62" stop-color="#D9A94C" />
                  <stop offset="1" stop-color="#76501A" />
                </linearGradient>
              </defs>
              <g transform="translate(36 28)">
                <path d="M154 22L180 48L154 74L128 48L154 22Z" stroke="url(#logo-gold)" stroke-width="8" />
                <path d="M154 38L165 49L154 60L143 49L154 38Z" fill="url(#logo-gold)" opacity="0.32" />
                <path d="M248 36V60" stroke="url(#logo-gold)" stroke-width="5" stroke-linecap="round" />
                <path d="M236 48H260" stroke="url(#logo-gold)" stroke-width="5" stroke-linecap="round" />
                <path d="M74 84C103 51 142 34 188 34C236 34 276 52 307 88" stroke="url(#logo-gold)" stroke-width="7" stroke-linecap="round" opacity="0.85" />
                <path d="M64 214C88 260 131 286 188 286C241 286 286 262 314 214" stroke="url(#logo-gold)" stroke-width="7" stroke-linecap="round" opacity="0.58" />
                <path d="M108 92V252" stroke="url(#logo-gold)" stroke-width="15" stroke-linecap="round" />
                <path d="M108 92H152C194 92 214 106 214 132C214 161 191 176 146 176H108" stroke="url(#logo-gold)" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M108 176H158C204 176 228 195 228 226C228 258 202 278 151 278H108" stroke="url(#logo-gold)" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M144 92H194C246 92 276 117 276 154C276 192 247 214 197 214H144" stroke="url(#logo-gold)" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M198 214L278 286" stroke="url(#logo-gold)" stroke-width="15" stroke-linecap="round" />
                <path d="M108 108V242" stroke="#FFF6D9" stroke-width="3" stroke-linecap="round" opacity="0.35" />
                <path d="M145 105H180C203 105 214 114 214 126" stroke="#FFF4CF" stroke-width="3" stroke-linecap="round" opacity="0.28" />
                <path d="M153 188H183C205 188 216 196 217 210" stroke="#FFF4CF" stroke-width="3" stroke-linecap="round" opacity="0.24" />
              </g>
              <text x="376" y="194" fill="url(#logo-wordmarkGold)" font-family="'Cormorant Garamond', Georgia, serif" font-size="78" letter-spacing="0.34em">BR</text>
              <path d="M378 216H506" stroke="url(#logo-wordmarkGold)" stroke-width="3" stroke-linecap="round" opacity="0.62" />
              <text x="372" y="310" fill="url(#logo-wordmarkGold)" font-family="'Cormorant Garamond', Georgia, serif" font-size="114" font-weight="600" letter-spacing="0.04em">Jewellers</text>
              <path d="M1348 134V154" stroke="url(#logo-wordmarkGold)" stroke-width="4" stroke-linecap="round" opacity="0.75" />
              <path d="M1338 144H1358" stroke="url(#logo-wordmarkGold)" stroke-width="4" stroke-linecap="round" opacity="0.75" />
            </svg>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B9852E] text-center mt-2">Established 2009</div>
          </div>
          <div className="space-y-6 text-stone-600">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B9852E]">{storyTitle}</div>
            <h2 className="font-display text-4xl leading-tight font-semibold text-[#241B17]">We weave emotions into every exquisite piece</h2>
            <div className="h-1 w-20 bg-[#B9852E]"></div>
            <p className="text-sm leading-8 text-justify text-stone-600">
              {storyDescription}
            </p>
          </div>
        </div>
      )}

      {/* 5. What We Do Section */}
      {(whatWeDoTitle || whatWeDoDescription) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-[#FCF8F2]/60 p-10 md:p-14 rounded-[32px] border border-stone-200/80 shadow-md max-w-7xl mx-auto">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B9852E] mb-2">{whatWeDoEyebrow}</p>
              <h2 className="font-display text-4xl font-semibold text-[#241B17]">{whatWeDoTitle}</h2>
            </div>
            <div className="h-[1px] w-20 bg-[#B9852E]"></div>
            <p className="text-sm leading-8 text-stone-600 text-justify">
              {whatWeDoDescription}
            </p>
          </div>
          {whatWeDoImage && (
            <div className="relative overflow-hidden rounded-[24px] border border-stone-200/40 aspect-[16/10] shadow-lg">
              <img src={whatWeDoImage} alt={whatWeDoTitle} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
            </div>
          )}
        </div>
      )}

      {/* 6. Core Values Grid */}
      {values.length > 0 && (
        <div className="space-y-16 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B9852E]">OUR PHILOSOPHY</p>
            <h2 className="font-display text-4xl leading-tight font-semibold text-[#241B17]">CORE CORPORATE VALUES</h2>
            <p className="text-sm text-stone-500">The pillars of our daily operations and global relations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.id || v.title} className="relative overflow-hidden rounded-[28px] border border-[#dfccab] bg-[#1d1613] p-6 text-center space-y-4 flex flex-col items-center justify-between shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                {v.image && (
                  <div className="w-full aspect-[4/3] rounded-[20px] overflow-hidden border border-white/5 shadow-inner">
                    <img src={v.image} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="space-y-2 mt-2">
                  <h4 className="font-display text-2xl font-semibold text-white">{v.title}</h4>
                  <p className="text-xs leading-6 text-[#ebddc2]/80 px-2">
                    {v.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Milestone Timeline Series */}
      {timeline.length > 0 && (
        <div className="space-y-16 max-w-7xl mx-auto px-4 md:px-8 relative pb-20">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B9852E]">OUR STEPS TOWARDS SUCCESS</p>
            <h2 className="font-display text-4xl leading-tight font-semibold text-[#241B17]">CHRONOLOGICAL MILESTONES</h2>
            <p className="text-sm text-stone-500">Trace our growth and global milestones as you scroll.</p>
          </div>

          <div id="timeline-wrapper" className="relative mt-12">
            {/* Central Vertical Line (positioned left on mobile, centered on desktop) */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-stone-200 transform md:-translate-x-1/2 z-0">
              {/* Dynamic scroll progress highlights in gold */}
              <div
                className="absolute top-0 left-0 w-full bg-[#d5a957] transition-all duration-150"
                style={{ height: `${scrollProgress}%` }}
              />
            </div>

            <div className="space-y-12 relative z-10">
              {timeline.map((item, index) => {
                const isLeft = index % 2 === 0;
                const itemId = item.id || item.year;
                const isActive = activeMilestoneId === itemId;

                return (
                  <div
                    key={itemId}
                    id={`timeline-item-${itemId}`}
                    className={`flex flex-col md:flex-row items-start md:items-center ${
                      isLeft ? "md:flex-row-reverse" : ""
                    } relative`}
                  >
                    {/* timeline node point dot */}
                    <div
                      className={`absolute left-4 md:left-1/2 top-8 md:top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? "bg-[#d5a957] border-[#1d1613] scale-125 shadow-[0_0_12px_#d5a957]"
                          : "bg-white border-[#dfccab]"
                      }`}
                    />

                    {/* Left or Right milestone card */}
                    <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${isLeft ? "md:pr-12" : "md:pl-12"}`}>
                      <div
                        className={`bg-[#1d1613] border rounded-[28px] p-6 space-y-4 shadow-xl transition-all duration-500 ${
                          isActive
                            ? "border-[#d5a957] scale-[1.03] shadow-[0_20px_50px_rgba(213,169,87,0.15)]"
                            : "border-[#dfccab]/40 hover:border-[#dfccab]"
                        }`}
                      >
                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                          <span className={`font-display text-4xl font-semibold transition-colors duration-300 ${
                            isActive ? "text-[#d5a957]" : "text-stone-300"
                          }`}>{item.year}</span>
                          <span className="text-[10px] text-[#ebddc2]/60 uppercase tracking-widest font-semibold font-sans">Milestone</span>
                        </div>
                        <p className="text-xs leading-relaxed text-[#ebddc2]/80">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Spacer for desktop alignment */}
                    <div className="hidden md:block w-1/2" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
