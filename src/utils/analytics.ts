declare global {
    interface Window {
        dataLayer: unknown[];
        gtag: (...args: unknown[]) => void;
    }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

export const initAnalytics = () => {
    if (!GA_MEASUREMENT_ID)
        return;

    if (document.getElementById('ga4-script'))
        return;

    const bootstrapScript = document.createElement('script');
    bootstrapScript.id = 'ga4-script';
    bootstrapScript.async = true;
    bootstrapScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(bootstrapScript);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
        anonymize_ip: true
    });
};

export const trackSearch = (searchTerm: string, distance: number, resultCount: number) => {
    if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function')
        return;

    window.gtag('event', 'search', {
        search_term: searchTerm,
        distance,
        result_count: resultCount,
        has_result: resultCount > 0
    });
};

