import messages from './messages';

export const SUPPORTED_LOCALES = ['en', 'es', 'gl'];
export const DEFAULT_LOCALE = 'en';
export const LOCALE_STORAGE_KEY = 'app.locale';

export const getMessages = (locale) => messages[locale] || messages[DEFAULT_LOCALE];

export const detectSystemLocale = () => {

    let locale = (navigator.languages && navigator.languages[0]) ||
        navigator.language || navigator.userLanguage || DEFAULT_LOCALE;
    const normalized = locale.toLowerCase().split(/[_-]+/)[0];

    return SUPPORTED_LOCALES.includes(normalized) ? normalized : DEFAULT_LOCALE;

};

export const getInitialLocale = () => {

    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);

    return saved && SUPPORTED_LOCALES.includes(saved) ? saved : detectSystemLocale();

};

/* Mantenido por compatibilidad: devuelve el locale inicial y sus mensajes. */
export const initReactIntl = () => {

    const locale = getInitialLocale();

    return {locale, messages: getMessages(locale)};

}
