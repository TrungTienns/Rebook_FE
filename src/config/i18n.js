import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import vi from '../locales/vi';
import en from '../locales/en';

i18n
  .use(LanguageDetector)       // Tự động detect ngôn ngữ từ browser
  .use(initReactI18next)
  .init({
    resources: {
      vi,
      en,
    },
    fallbackLng: 'vi',          // Mặc định tiếng Việt
    interpolation: {
      escapeValue: false,       // React đã tự escape XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      cacheUserLanguage: true,  // Lưu lựa chọn ngôn ngữ của user vào localStorage
    },
  });

export default i18n;
