import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/locales/i18n';

export type Language = 'ko' | 'en';

// Helper function to update document lang attribute for CSS font switching
const updateDocumentLang = (lang: Language) => {
  document.documentElement.lang = lang;
};

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: (i18n.language as Language) || 'ko',
      setLanguage: (lang: Language) => {
        i18n.changeLanguage(lang);
        updateDocumentLang(lang);
        set({ language: lang });
      },
    }),
    {
      name: 'willog-language-store',
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          i18n.changeLanguage(state.language);
          updateDocumentLang(state.language);
        }
      },
    }
  )
);

