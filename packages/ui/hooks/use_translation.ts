import { useTranslation as useReactI18nextTranslation } from "react-i18next";

export type SimpleTFunction = (
  key: string | string[],
  options?: Record<string, unknown>,
) => string;

interface I18nService {
  t: SimpleTFunction;
  changeLanguage: (lang: string) => Promise<void>;
  language: string;
}

export function useTranslation(): I18nService {
  const { t, i18n } = useReactI18nextTranslation();

  return {
    t: (key, options) => t(key, options),
    changeLanguage: async (lang: string) => {
      if (i18n.language !== lang) {
        await i18n.changeLanguage(lang);
      }
    },
    language: i18n.language,
  };
}
