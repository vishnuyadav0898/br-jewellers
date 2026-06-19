import { useRef, useState } from "react";
import { cn } from "../../shared/utils/cn";

export function RichTextEditor({ label, error, helperText, value, onChange, disabled }) {
  const textareaRef = useRef(null);
  const [activeTab, setActiveTab] = useState("edit");

  const insertTag = (before, after = "") => {
    if (disabled || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = before + selectedText + after;
    
    onChange(text.substring(0, start) + replacement + text.substring(end));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const handleBold = () => insertTag("<b>", "</b>");
  const handleItalic = () => insertTag("<i>", "</i>");
  const handleH1 = () => insertTag("<h1 class=\"text-2xl font-display text-stone-900 mt-4 mb-2\">", "</h1>");
  const handleH2 = () => insertTag("<h2 class=\"text-xl font-display text-stone-850 mt-3 mb-2\">", "</h2>");
  const handleParagraph = () => insertTag("<p class=\"text-sm leading-7 text-stone-600 mb-3\">", "</p>");
  const handleBulletList = () => insertTag("<ul class=\"list-disc list-inside space-y-1 my-3 text-stone-600\">\n  <li>", "</li>\n</ul>");
  
  const handleInsertImage = () => {
    const url = prompt("Enter image URL:");
    if (!url) return;
    const alt = prompt("Enter image alt text:", "Jewellery focus");
    insertTag(`<img src="${url}" alt="${alt || 'Image'}" class="my-4 rounded-[20px] max-w-full h-auto" />`);
  };

  return (
    <div className="block space-y-2">
      {label && (
        <span className="text-sm font-medium text-stone-700">{label}</span>
      )}
      
      <div className="rounded-[28px] border border-[#dcc8a1] bg-white overflow-hidden focus-within:border-[#d3a347] focus-within:ring-2 focus-within:ring-[#f4e4bd] transition-all">
        <div className="flex flex-wrap items-center justify-between border-b border-stone-100 bg-[#fbf9f6] px-4 py-2">
          <div className="flex flex-wrap items-center gap-1">
            {activeTab === "edit" && !disabled && (
              <>
                <button
                  type="button"
                  onClick={handleBold}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-200"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={handleItalic}
                  className="rounded-lg px-2.5 py-1.5 text-xs italic text-stone-700 hover:bg-stone-200"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={handleH1}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-200"
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={handleH2}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-200"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={handleParagraph}
                  className="rounded-lg px-2.5 py-1.5 text-xs text-stone-700 hover:bg-stone-200"
                  title="Paragraph"
                >
                  P
                </button>
                <button
                  type="button"
                  onClick={handleBulletList}
                  className="rounded-lg px-2.5 py-1.5 text-xs text-stone-700 hover:bg-stone-200"
                  title="Bullet List"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={handleInsertImage}
                  className="rounded-lg px-2.5 py-1.5 text-xs text-stone-700 hover:bg-stone-200"
                  title="Insert Image"
                >
                  Image
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-0.5 ml-auto">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium transition",
                activeTab === "edit"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-900"
              )}
            >
              Write HTML
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium transition",
                activeTab === "preview"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-900"
              )}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="relative">
          {activeTab === "edit" ? (
            <textarea
              ref={textareaRef}
              disabled={disabled}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter page HTML content here..."
              className="w-full min-h-72 resize-y bg-transparent px-4 py-3 text-sm font-mono text-stone-800 focus:outline-none border-none"
            />
          ) : (
            <div className="w-full min-h-72 overflow-y-auto px-6 py-4 bg-[#fdfdfc]">
              <div 
                className="prose prose-stone max-w-none prose-p:text-sm prose-p:leading-7 prose-p:text-stone-600"
                dangerouslySetInnerHTML={{ __html: value || "<p class='text-stone-400 italic'>No content to preview.</p>" }}
              />
            </div>
          )}
        </div>
      </div>

      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
      {!error && helperText ? <span className="text-xs text-stone-500">{helperText}</span> : null}
    </div>
  );
}
