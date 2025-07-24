
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Initialize Google Analytics
export const initializeAnalytics = (trackingId: string) => {
  if (typeof window === 'undefined') return;

  // Create gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: any[]) {
    window.dataLayer?.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', trackingId, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
  
  console.log('Analytics Event:', eventName, parameters);
};

export const trackPageView = (pageName: string, additionalData?: Record<string, any>) => {
  trackEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href,
    page_path: window.location.pathname,
    ...additionalData
  });
};

export const trackConversion = (conversionType: 'lead_generated' | 'operator_signup' | 'itinerary_created', value?: number) => {
  trackEvent('conversion', {
    conversion_type: conversionType,
    value: value || 1,
    currency: 'USD'
  });
};

export const trackUserEngagement = (action: string, category: string, label?: string) => {
  trackEvent('user_engagement', {
    action,
    category,
    label
  });
};

export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount
  });
};

export const trackFormSubmission = (formName: string, success: boolean) => {
  trackEvent('form_submit', {
    form_name: formName,
    success
  });
};
