
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
  
  console.log('Analytics Event:', eventName, parameters);
};

export const trackPageView = (pageName: string, additionalData?: Record<string, any>) => {
  trackEvent('page_view', {
    page_title: pageName,
    ...additionalData
  });
};

export const trackConversion = (conversionType: 'lead_generated' | 'operator_signup' | 'itinerary_created', value?: number) => {
  trackEvent('conversion', {
    conversion_type: conversionType,
    value: value || 1
  });
};

export const trackUserEngagement = (action: string, category: string, label?: string) => {
  trackEvent('user_engagement', {
    action,
    category,
    label
  });
};
