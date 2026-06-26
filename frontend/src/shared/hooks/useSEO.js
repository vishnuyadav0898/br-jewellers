import { useEffect } from "react";

export function useSEO({ title, description, keywords } = {}) {
  useEffect(() => {
    // Update Document Title
    const baseTitle = "BR Jewellers | Premium Fine Jewellery & Diamonds";
    if (title) {
      document.title = `${title} | BR Jewellers`;
    } else {
      document.title = baseTitle;
    }

    // Update Meta Description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", description);
    }

    // Update Meta Keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", keywords);
    }
  }, [title, description, keywords]);
}
