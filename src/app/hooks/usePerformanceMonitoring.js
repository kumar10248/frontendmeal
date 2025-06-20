"use client";

import { useEffect, useCallback } from 'react';

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const reportWebVitals = useCallback((metric) => {
    // Only report in production
    if (process.env.NODE_ENV === 'production') {
      // Log to console for debugging
      console.log(metric);
      
      // Send to analytics (you can integrate with your preferred analytics service)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }
    }
  }, []);

  useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined') {
      // Dynamic import to avoid SSR issues
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(reportWebVitals);
        getFID(reportWebVitals);
        getFCP(reportWebVitals);
        getLCP(reportWebVitals);
        getTTFB(reportWebVitals);
      }).catch(() => {
        // Silently fail if web-vitals is not available
      });

      // Monitor memory usage
      if ('memory' in performance) {
        const memoryInfo = performance.memory;
        console.log('Memory Usage:', {
          usedJSHeapSize: memoryInfo.usedJSHeapSize,
          totalJSHeapSize: memoryInfo.totalJSHeapSize,
          jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
        });
      }

      // Monitor connection
      if ('connection' in navigator) {
        const connection = navigator.connection;
        console.log('Connection Info:', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        });
      }
    }
  }, [reportWebVitals]);

  return { reportWebVitals };
}

// Hook for monitoring API performance
export function useAPIPerformanceMonitoring() {
  const measureAPICall = useCallback((name, promise) => {
    const startTime = performance.now();
    
    return promise
      .then((result) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`API Call ${name} took ${duration.toFixed(2)}ms`);
        
        // Report to analytics if needed
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'api_performance', {
            event_category: 'Performance',
            event_label: name,
            value: Math.round(duration),
          });
        }
        
        return result;
      })
      .catch((error) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.error(`API Call ${name} failed after ${duration.toFixed(2)}ms:`, error);
        
        // Report error to analytics
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'api_error', {
            event_category: 'Error',
            event_label: name,
            value: Math.round(duration),
          });
        }
        
        throw error;
      });
  }, []);

  return { measureAPICall };
}
