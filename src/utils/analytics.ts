declare global {
    interface Window {
        dataLayer: unknown[];
        gtag: (...args: unknown[]) => void;
    }
}

export const trackSearch = (searchTerm: string, distance: number, resultCount: number) => {
    if (typeof window.gtag !== 'function')
        return;

    window.gtag('event', 'search', {
        search_term: searchTerm,
        distance,
        result_count: resultCount,
        has_result: resultCount > 0
    });
};
