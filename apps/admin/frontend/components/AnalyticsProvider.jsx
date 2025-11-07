/**
 * Provider de Analytics
 * Rastreia automaticamente page views e erros globais
 */

'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePathname } from 'next/navigation';

export default function AnalyticsProvider({ children }) {
  const analytics = useAnalytics();
  const pathname = usePathname();

  // Rastrear erros globais
  useEffect(() => {
    const handleError = (event) => {
      analytics.trackError(
        event.message,
        event.error?.stack
      );
    };

    const handleUnhandledRejection = (event) => {
      analytics.trackError(
        `Unhandled Promise Rejection: ${event.reason}`,
        event.reason?.stack
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [analytics]);

  // Rastrear mudanças de visibilidade da página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        analytics.trackEvent('custom', 'page_hidden', {
          category: 'engagement',
          data: { pagePath: pathname }
        });
      } else {
        analytics.trackEvent('custom', 'page_visible', {
          category: 'engagement',
          data: { pagePath: pathname }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [analytics, pathname]);

  return <>{children}</>;
}
