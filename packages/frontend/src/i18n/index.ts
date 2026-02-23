import en from './en.json';
import mr from './mr.json';

export type Language = 'en' | 'mr';

export const translations = {
  en,
  mr,
} as const;

export type TranslationKey = keyof typeof en;

export const getTranslation = (lang: Language, path: string): string => {
  const keys = path.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = translations[lang];
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path;
    }
  }
  
  return typeof result === 'string' ? result : path;
};

export const useTranslation = (lang: Language = 'en') => {
  return {
    t: (path: string) => getTranslation(lang, path),
    lang,
  };
};
