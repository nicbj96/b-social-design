import { useEffect } from "react";

interface PageMeta {
  title: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
}

export function usePageMeta({ title, description, ogImage, ogType }: PageMeta) {
  useEffect(() => {
    const fullTitle = title ? `${title} | B-Social` : "B-Social – Oplev verden sammen";
    document.title = fullTitle;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(property.startsWith("og:") ? "property" : "name", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("og:title", fullTitle);
    if (description) {
      setMeta("description", description);
      setMeta("og:description", description);
    }
    if (ogImage) setMeta("og:image", ogImage);
    if (ogType) setMeta("og:type", ogType);

    return () => {
      document.title = "B-Social – Oplev verden sammen";
    };
  }, [title, description, ogImage, ogType]);
}
