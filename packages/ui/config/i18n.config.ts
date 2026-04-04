/// <reference types="vite/client" />

import i18n from "i18next";
import ICU from "i18next-icu";
import { initReactI18next } from "react-i18next";

let i18nInstance: typeof i18n | null = null;

type LocaleFile = {
  default?: Record<string, unknown>;
} & Record<string, unknown>;

type TranslationNamespace = Record<string, Record<string, unknown>>;
type TranslationResources = Record<
  string,
  { translation: TranslationNamespace }
>;

const localeFiles = import.meta.glob("/app/**/resources/lang/*/*.json", {
  eager: true,
}) as Record<string, LocaleFile>;

function buildResources(): TranslationResources {
  const resources: TranslationResources = {};

  for (const path in localeFiles) {
    const match = path.match(
      /app\/([^/]+)\/resources\/lang\/([^/]+)\/([^/]+)\.json$/,
    );
    if (!match) continue;

    const [, moduleName, lang] = match;
    if (!lang || !moduleName) continue;

    const localeFile = localeFiles[path];
    if (!localeFile) continue;

    const json = localeFile.default ?? localeFile;

    resources[lang] ??= { translation: {} };

    resources[lang].translation[moduleName] = {
      ...resources[lang].translation[moduleName],
      ...json,
    };
  }

  return resources;
}

export const setupI18n = ({
  locale,
  fallbackLocale = "en",
}: {
  locale: string;
  fallbackLocale?: string;
}) => {
  if (
    i18nInstance?.isInitialized &&
    i18nInstance.language === locale &&
    i18nInstance.options?.fallbackLng === fallbackLocale
  ) {
    return i18nInstance;
  }

  const resources = buildResources();
  const supportedLngs = Object.keys(resources);

  const config = {
    resources,
    lng: locale,
    fallbackLng: fallbackLocale,
    supportedLngs,
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    load: "currentOnly",
    returnNull: false,
    returnEmptyString: false,
    react: {
      useSuspense: false,
    },
  } as const;

  i18nInstance = i18n.createInstance().use(ICU).use(initReactI18next);
  i18nInstance.init(config);

  return i18nInstance;
};

export const getI18nInstance = () => i18nInstance;
