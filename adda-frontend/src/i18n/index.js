import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import bn from './locales/bn.json';

// অ্যাপের ভাষা এখানে localStorage এ সেভ থাকে, রিফ্রেশ করলেও মনে থাকে।
// ডিফল্ট ভাষা বাংলা (bn), চাইলে LanguageSwitcher দিয়ে English এ বদলানো যায়।
const LANGUAGE_KEY = 'adda_language';
const savedLanguage = localStorage.getItem(LANGUAGE_KEY) || 'bn';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bn: { translation: bn },
  },
  lng: savedLanguage,
  fallbackLng: 'bn',
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = (lang) => {
  localStorage.setItem(LANGUAGE_KEY, lang);
  i18n.changeLanguage(lang);
};

export default i18n;