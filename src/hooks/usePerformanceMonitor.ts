
import { useEffect } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
}

export const usePerformanceMonitor = (pageName: string) => {
  useEffect(() => {
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const metrics: Partial<PerformanceMetrics> = {
        pageLoadTime: navigation?.loadEventEnd - navigation?.navigationStart,
        timeToInteractive: navigation?.domInteractive - navigation?.navigationStart,
      };

      const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        metrics.firstContentfulPaint = fcp.startTime;
      }

      // Log to analytics service (could be Google Analytics, etc.)
      console.log(`Performance metrics for ${pageName}:`, metrics);
      
      // Report to monitoring service
      if (window.gtag) {
        window.gtag('event', 'page_performance', {
          page_name: pageName,
          page_load_time: metrics.pageLoadTime,
          time_to_interactive: metrics.timeToInteractive,
          first_contentful_paint: metrics.firstContentfulPaint
        });
      }
    };

    // Wait for page load to complete
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, [pageName]);
};
