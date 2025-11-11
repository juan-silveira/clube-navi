'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Namespaces críticos que devem ser carregados primeiro (para login, header e páginas do sistema)
const CRITICAL_NAMESPACES = ['common', 'auth', 'header', 'menu', 'system', 'admin'];

// Lista completa de namespaces
const ALL_NAMESPACES = [
  'common',
  'auth',
  'dashboard',
  'menu',
  'header',
  'deposit',
  'withdraw',
  'transfer',
  'statement',
  'financial',
  'exchange',
  'investments',
  'documentValidation',
  'fees',
  'security',
  'help',
  'stake',
  'admin', // namespace para admin pages
  'profile',
  'system',
  'errors',
  'validations',
  'notifications',
  'emails',
  'contracts',
  'deploy',
  'whatsapp',
  'systemWithdrawals',
  'systemUsers',
  'adminCompanies',
  'systemSettings',
  'taxReports',
];

// Lista de idiomas
const LANGUAGES = ['pt-BR', 'en-US', 'es'];

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('pt-BR');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const initStarted = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (initStarted.current) return;
    initStarted.current = true;

    // Initialize i18next
    const initI18n = async () => {
      try {
        // Check if already initialized
        if (i18n.isInitialized) {
          console.log('[i18n] Already initialized');
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }

        console.log('[i18n] Starting initialization...');

        // Load initial language from localStorage
        const savedLanguage = localStorage.getItem('language') || 'pt-BR';

        // NOVA ESTRATÉGIA: Carregar TODOS os namespaces do idioma atual ANTES de renderizar
        console.log(`[i18n] Loading ALL translations for ${savedLanguage}...`);
        const resources = {};

        // Carregar TODOS os namespaces do idioma atual
        resources[savedLanguage] = {};

        const loadPromises = ALL_NAMESPACES.map(async (ns) => {
          try {
            const response = await fetch(`/locales/${savedLanguage}/${ns}.json`);
            if (response.ok) {
              const data = await response.json();
              if (data && typeof data === 'object') {
                resources[savedLanguage][ns] = data;
              }
            } else {
              resources[savedLanguage][ns] = {};
            }
          } catch (error) {
            console.warn(`[i18n] Failed to load ${savedLanguage}/${ns}:`, error.message);
            resources[savedLanguage][ns] = {};
          }
        });

        // Aguardar TODAS as traduções carregarem
        await Promise.all(loadPromises);

        console.log('[i18n] All translations loaded, initializing...');

        // Initialize i18n with all resources
        await i18n
          .use(initReactI18next)
          .init({
            resources,
            lng: savedLanguage,
            fallbackLng: 'pt-BR',
            defaultNS: 'common',
            ns: ALL_NAMESPACES,
            interpolation: {
              escapeValue: false,
            },
            react: {
              useSuspense: false,
            },
            returnNull: false,
            returnEmptyString: false,
            saveMissing: false,
          });

        console.log('[i18n] Initialized successfully with language:', savedLanguage);
        setCurrentLanguage(savedLanguage);
        setIsInitialized(true);
        setIsLoading(false);

        // BACKGROUND: Carregar outros idiomas (para troca rápida)
        console.log('[i18n] Loading other languages in background...');
        setTimeout(async () => {
          try {
            for (const lang of LANGUAGES) {
              if (lang === savedLanguage) continue; // Já carregado

              for (const ns of ALL_NAMESPACES) {
                try {
                  const response = await fetch(`/locales/${lang}/${ns}.json`);
                  if (response.ok) {
                    const data = await response.json();
                    if (data && typeof data === 'object') {
                      i18n.addResourceBundle(lang, ns, data, true, true);
                    }
                  }
                } catch (error) {
                  // Silently fail for background loading
                }
              }
            }

            console.log('[i18n] Background languages loaded');
          } catch (error) {
            console.warn('[i18n] Background loading failed:', error);
          }
        }, 100);

      } catch (error) {
        console.error('[i18n] Failed to initialize:', error);
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initI18n();
  }, []);

  const changeLanguage = async (language) => {
    try {
      await i18n.changeLanguage(language);
      setCurrentLanguage(language);
      // Save to localStorage
      localStorage.setItem('language', language);

      // Save to backend if user is authenticated
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await fetch('/api/users/language', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ language })
          });
          console.log(`✅ Idioma ${language} salvo no backend`);
        }
      } catch (backendError) {
        console.warn('⚠️ Erro ao salvar idioma no backend:', backendError);
        // Continuar mesmo se falhar no backend
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const value = {
    currentLanguage,
    changeLanguage,
    isInitialized,
    isLoading,
    t: i18n.t ? i18n.t.bind(i18n) : (key) => key,
    i18n,
  };

  return (
    <LanguageContext.Provider value={value}>
      {isLoading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          backgroundColor: '#0f172a'
        }}>
          <div style={{
            textAlign: 'center',
            color: '#fff'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid rgba(255,255,255,0.1)',
              borderTopColor: '#4f46e5',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ fontSize: '14px', opacity: 0.8 }}>Carregando traduções...</p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      ) : children}
    </LanguageContext.Provider>
  );
};
