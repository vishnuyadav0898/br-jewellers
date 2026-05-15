import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";

export function LocalizationBootstrap() {
  const language = useAppStore((state) => state.language);

  useEffect(() => {
    document.documentElement.lang = language || "en";
  }, [language]);

  return null;
}
