"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Language } from "@/lib/i18n";
import { parseLanguage, isRtl, SUPPORTED_LANGUAGES } from "@/lib/i18n";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  dir: "ltr",
});

const STORAGE_KEY = "faya9ni-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  /* Hydrate from localStorage on mount */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setLanguageState(parseLanguage(stored));
  }, []);

  /* Sync <html> attributes whenever language changes */
  useEffect(() => {
    const html = document.documentElement;
    html.lang = language === "tn" ? "ar-TN" : language;
    html.dir = isRtl(language) ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    const valid = parseLanguage(lang);
    setLanguageState(valid);
    localStorage.setItem(STORAGE_KEY, valid);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir: isRtl(language) ? "rtl" : "ltr" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/* ── Tiny language switcher button ──────────────────────── */

const LABELS: Record<Language, string> = { en: "EN", ar: "عر", tn: "تو" };

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5 text-xs font-medium">
      {SUPPORTED_LANGUAGES.map((l) => (
        <button
          key={l}
          onClick={() => setLanguage(l)}
          className={`rounded-md px-2 py-1 transition-all duration-150 ${
            language === l
              ? "bg-cyan-500/20 text-cyan-400 shadow-sm"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
