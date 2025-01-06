// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./locales/en/en.json";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enTranslations
            },
            // ... other languages can be added here
        },
        lng: "en", // Default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
