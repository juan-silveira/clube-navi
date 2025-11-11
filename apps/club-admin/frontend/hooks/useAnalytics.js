/**
 * Hook para rastreamento de analytics
 *
 * Uso:
 * const analytics = useAnalytics();
 * analytics.trackClick('btn-comprar', 'Comprar Agora');
 * analytics.trackPageView('/produtos');
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export function useAnalytics() {
  const { getAuthHeaders, user } = useAuth();
  const pathname = usePathname();
  const sessionIdRef = useRef(null);

  // Gerar ou recuperar session ID do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('analytics_session_id');

      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('analytics_session_id', sessionId);
      }

      sessionIdRef.current = sessionId;

      // Criar/atualizar sessão no backend
      createSession(sessionId);
    }
  }, []);

  // Rastrear mudança de página automaticamente
  useEffect(() => {
    if (pathname) {
      trackPageView(pathname, document.title);
    }
  }, [pathname]);

  const createSession = useCallback(async (sessionId) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ sessionToken: sessionId })
      });
    } catch (error) {
      console.error('Error creating analytics session:', error);
    }
  }, [getAuthHeaders]);

  const trackEvent = useCallback(async (eventType, eventName, metadata = {}) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          eventType,
          eventName,
          category: metadata.category || 'engagement',
          pagePath: pathname,
          pageTitle: document.title,
          metadata: metadata.data || null
        })
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [pathname, getAuthHeaders]);

  const trackPageView = useCallback(async (path, title) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/pageview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          pagePath: path,
          pageTitle: title,
          referrer: document.referrer || null
        })
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }, [getAuthHeaders]);

  const trackClick = useCallback(async (elementId, elementText, metadata = {}) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          elementId,
          elementText,
          elementClass: metadata.elementClass || null,
          pagePath: pathname,
          metadata: metadata.data || null
        })
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }, [pathname, getAuthHeaders]);

  const trackSearch = useCallback(async (searchTerm, resultsCount = null) => {
    try {
      await trackEvent('search', 'search_performed', {
        category: 'engagement',
        data: { searchTerm, resultsCount }
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }, [trackEvent]);

  const trackPurchase = useCallback(async (purchaseData) => {
    try {
      await trackEvent('purchase', 'purchase_completed', {
        category: 'transaction',
        data: purchaseData
      });
    } catch (error) {
      console.error('Error tracking purchase:', error);
    }
  }, [trackEvent]);

  const trackError = useCallback(async (errorMessage, errorStack = null) => {
    try {
      await trackEvent('error', 'error_occurred', {
        category: 'system',
        data: {
          errorMessage,
          errorStack: errorStack ? errorStack.substring(0, 1000) : null
        }
      });
    } catch (error) {
      console.error('Error tracking error:', error);
    }
  }, [trackEvent]);

  const trackFormSubmit = useCallback(async (formName, formData = {}) => {
    try {
      await trackEvent('form_submit', `form_${formName}_submitted`, {
        category: 'engagement',
        data: formData
      });
    } catch (error) {
      console.error('Error tracking form submit:', error);
    }
  }, [trackEvent]);

  const trackNotificationOpen = useCallback(async (campaignId, notificationLogId) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/notification/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          campaignId,
          notificationLogId
        })
      });
    } catch (error) {
      console.error('Error tracking notification open:', error);
    }
  }, [getAuthHeaders]);

  const trackNotificationClick = useCallback(async (campaignId, notificationLogId, buttonType = null, targetModule = null) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/notification/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          campaignId,
          notificationLogId,
          buttonType,
          targetModule
        })
      });
    } catch (error) {
      console.error('Error tracking notification click:', error);
    }
  }, [getAuthHeaders]);

  return {
    trackEvent,
    trackPageView,
    trackClick,
    trackSearch,
    trackPurchase,
    trackError,
    trackFormSubmit,
    trackNotificationOpen,
    trackNotificationClick,
    sessionId: sessionIdRef.current
  };
}

/**
 * Hook para rastrear cliques automaticamente em um elemento
 *
 * Uso:
 * const buttonRef = useClickTracking('btn-comprar', 'Comprar Agora');
 * <button ref={buttonRef}>Comprar Agora</button>
 */
export function useClickTracking(elementId, elementText, metadata = {}) {
  const analytics = useAnalytics();
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const handleClick = () => {
      analytics.trackClick(elementId, elementText, metadata);
    };

    element.addEventListener('click', handleClick);

    return () => {
      element.removeEventListener('click', handleClick);
    };
  }, [elementId, elementText, metadata, analytics]);

  return elementRef;
}

/**
 * Hook para rastrear tempo de permanência em uma página
 *
 * Uso:
 * usePageTimeTracking('Produtos'); // Rastreia quanto tempo o usuário ficou na página
 */
export function usePageTimeTracking(pageName) {
  const analytics = useAnalytics();
  const startTimeRef = useRef(null);

  useEffect(() => {
    startTimeRef.current = Date.now();

    return () => {
      if (startTimeRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000); // Em segundos

        analytics.trackEvent('custom', 'page_time_spent', {
          category: 'engagement',
          data: {
            pageName,
            timeSpent
          }
        });
      }
    };
  }, [pageName, analytics]);
}

/**
 * Hook para rastrear visibilidade de um elemento (scroll tracking)
 *
 * Uso:
 * const elementRef = useVisibilityTracking('product-123', 'Produto visualizado');
 * <div ref={elementRef}>...</div>
 */
export function useVisibilityTracking(elementId, eventName) {
  const analytics = useAnalytics();
  const elementRef = useRef(null);
  const hasBeenViewedRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element || hasBeenViewedRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenViewedRef.current) {
          hasBeenViewedRef.current = true;

          analytics.trackEvent('custom', eventName, {
            category: 'engagement',
            data: { elementId, visible: true }
          });
        }
      },
      { threshold: 0.5 } // 50% do elemento visível
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementId, eventName, analytics]);

  return elementRef;
}
