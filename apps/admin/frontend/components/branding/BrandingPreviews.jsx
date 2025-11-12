"use client";
import React, { useState } from 'react';
import { Icon } from "@iconify/react";

const BrandingPreviews = ({
  appName = "Clube Digital",
  logoUrl = null,
  logoIconUrl = null,
  faviconUrl = null,
  primaryColor = "#3B82F6",
  secondaryColor = "#10B981",
  loginDescriptionPt = "",
  loginDescriptionEn = "",
  loginDescriptionEs = "",
  loginIllustrationUrl = null,
  loginWelcomePt = "",
  loginWelcomeEn = "",
  loginWelcomeEs = ""
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('pt');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const getTranslatedText = (ptText, enText, esText, defaultText) => {
    const texts = {
      pt: ptText || defaultText,
      en: enText || defaultText,
      es: esText || defaultText
    };
    return texts[selectedLanguage] || defaultText;
  };

  const loginDescription = getTranslatedText(
    loginDescriptionPt,
    loginDescriptionEn,
    loginDescriptionEs,
    "Sistema de gestão de tokens e transações em blockchain"
  );

  const loginWelcome = getTranslatedText(
    loginWelcomePt,
    loginWelcomeEn,
    loginWelcomeEs,
    `Bem-vindo ao ${appName}`
  );

  const footerText = {
    pt: `Copyright © ${new Date().getFullYear()} ${appName}. Todos os direitos reservados.`,
    en: `Copyright © ${new Date().getFullYear()} ${appName}. All Rights Reserved.`,
    es: `Copyright © ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.`
  };

  const languages = [
    { code: 'pt', name: 'Português', flag: 'circle-flags:br' },
    { code: 'en', name: 'English', flag: 'circle-flags:us' },
    { code: 'es', name: 'Español', flag: 'circle-flags:es' }
  ];

  const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  return (
    <div className="space-y-8">
      {/* Mobile App Previews */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Previews do Aplicativo Mobile
        </h3>
        <div className="flex gap-4 justify-center flex-wrap">
          {/* Home Screen Icon */}
          <div className="relative">
            <p className="text-xs text-center text-slate-600 dark:text-slate-400 mb-2 font-medium">
              Ícone na Home
            </p>
            <div className="relative w-[280px] h-[580px] rounded-[40px] border-8 border-slate-900 shadow-2xl overflow-hidden"
                 style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              {/* Status bar */}
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-slate-900 rounded-full w-28 h-6" />

              {/* Time and Status */}
              <div className="absolute top-4 left-0 right-0 px-6">
                <div className="flex items-center justify-between text-white text-xs">
                  <span className="font-semibold">
                    {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-1">
                    <Icon icon="heroicons:signal" className="w-3 h-3" />
                    <Icon icon="heroicons:wifi" className="w-3 h-3" />
                    <Icon icon="heroicons:battery-100" className="w-4 h-3" />
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="absolute top-14 left-0 right-0 text-center">
                <p className="text-white text-xs opacity-90">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>

              {/* App Icon - Centered */}
              <div className="absolute top-32 left-0 right-0 bottom-20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    {logoIconUrl ? (
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/50 p-2">
                        <img src={logoIconUrl} alt="App Icon" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/50"
                           style={{ backgroundColor: primaryColor }}>
                        <Icon icon="heroicons:sparkles" className="w-7 h-7 text-white" />
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse border-2 border-white shadow-lg" />
                  </div>
                  <span className="text-white text-xs font-semibold text-center px-2">
                    {appName.length > 10 ? appName.substring(0, 10) + '...' : appName}
                  </span>
                </div>
              </div>

              {/* Bottom Dock */}
              <div className="absolute bottom-16 left-0 right-0 px-6">
                <div className="bg-white/20 backdrop-blur-md rounded-3xl px-4 py-3 flex items-center justify-around">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon icon="heroicons:phone" className="w-7 h-7 text-white" />
                  </div>
                  <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon icon="heroicons:chat-bubble-left-right" className="w-7 h-7 text-white" />
                  </div>
                  <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon icon="heroicons:globe-alt" className="w-7 h-7 text-white" />
                  </div>
                  <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon icon="heroicons:musical-note" className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Home indicator */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full" />
            </div>
          </div>

          {/* Splash Screen */}
          <div className="relative">
            <p className="text-xs text-center text-slate-600 dark:text-slate-400 mb-2 font-medium">
              Splash Screen
            </p>
            <div className="relative w-[280px] h-[580px] rounded-[40px] border-8 border-slate-900 shadow-2xl overflow-hidden"
                 style={{ backgroundColor: primaryColor }}>
              {/* Status bar */}
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-slate-900 rounded-full w-28 h-6" />

              {/* Time and Status */}
              <div className="absolute top-4 left-0 right-0 px-6">
                <div className="flex items-center justify-between text-white text-xs">
                  <span className="font-semibold">
                    {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-1">
                    <Icon icon="heroicons:signal" className="w-3 h-3" />
                    <Icon icon="heroicons:wifi" className="w-3 h-3" />
                    <Icon icon="heroicons:battery-100" className="w-4 h-3" />
                  </div>
                </div>
              </div>

              {/* Splash content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                {logoIconUrl ? (
                  <div className="w-32 h-32 mb-6 bg-white rounded-3xl flex items-center justify-center p-6 shadow-2xl">
                    <img src={logoIconUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-32 h-32 mb-6 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                    <Icon icon="heroicons:sparkles" className="w-16 h-16" style={{ color: primaryColor }} />
                  </div>
                )}

                <h1 className="text-white text-xl font-bold text-center drop-shadow-lg">{appName}</h1>
              </div>

              {/* Home indicator */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Club Admin Web Previews */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Previews do Painel Club Admin
        </h3>
        <div className="flex gap-4 justify-center flex-wrap">
          {/* Login Page */}
          <div className="relative">
            <p className="text-xs text-center text-slate-600 dark:text-slate-400 mb-2 font-medium">
              Tela de Login
            </p>
            <div className="relative w-[680px] h-[520px] bg-white dark:bg-slate-900 rounded-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
              {/* Browser Chrome */}
              <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-900 rounded px-2 py-1 text-xs">
                    {faviconUrl ? (
                      <img src={faviconUrl} alt="Favicon" className="w-3 h-3" />
                    ) : (
                      <div className="w-3 h-3 rounded flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                        <Icon icon="heroicons:sparkles" className="w-2 h-2 text-white" />
                      </div>
                    )}
                    <span className="text-slate-500 dark:text-slate-400 truncate">admin.{appName.toLowerCase().replace(/\s+/g, '')}.com</span>
                  </div>
                </div>
              </div>

              {/* Login Content - Two Column Layout */}
              <div className="flex h-[calc(100%-40px)] relative">
                {/* Left Column - Description & Illustration */}
                <div className="w-2/5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 flex flex-col relative">
                  <div className="flex-1 flex flex-col justify-center max-w-md">
                    {/* Logo */}
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-10 object-contain mb-6 self-start" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: primaryColor }}>
                        <Icon icon="heroicons:sparkles" className="w-5 h-5 text-white" />
                      </div>
                    )}

                    {/* Description */}
                    <h4 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                      {loginDescription}
                    </h4>
                  </div>

                  {/* Illustration */}
                  <div className="flex items-end justify-center mt-auto px-4">
                    {loginIllustrationUrl ? (
                      <img src={loginIllustrationUrl} alt="Illustration" className="max-h-48 object-contain" />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                        <Icon icon="heroicons:photo" className="w-12 h-12 text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Login Form */}
                <div className="w-3/5 bg-white dark:bg-slate-800 flex flex-col relative">
                  {/* Language Selector - Top Right */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        <Icon icon={selectedLang.flag} className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">{selectedLang.name}</span>
                        <Icon icon="heroicons:chevron-down" className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                      </button>
                      {showLangMenu && (
                        <div className="absolute top-full mt-1 right-0 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden z-20">
                          {languages.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => {
                                setSelectedLanguage(lang.code);
                                setShowLangMenu(false);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-[10px] transition-colors ${
                                selectedLanguage === lang.code
                                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                              }`}
                            >
                              <Icon icon={lang.flag} className="w-3.5 h-3.5" />
                              <span className="flex-1 text-left">{lang.name}</span>
                              {selectedLanguage === lang.code && (
                                <Icon icon="heroicons:check" className="w-3 h-3" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-sm mx-auto w-full">
                    {/* Welcome Title */}
                    <h2 className="text-lg font-semibold text-center text-slate-900 dark:text-white mb-2">
                      {loginWelcome}
                    </h2>
                    <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-6">
                      {selectedLanguage === 'en' ? 'Sign in to access your account' :
                       selectedLanguage === 'es' ? 'Inicia sesión para acceder a tu cuenta' :
                       'Faça login para acessar sua conta'}
                    </p>

                    {/* Form */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          Email
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          placeholder={selectedLanguage === 'en' ? 'your@email.com' :
                                     selectedLanguage === 'es' ? 'tu@email.com' :
                                     'seu@email.com'}
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          {selectedLanguage === 'en' ? 'Password' :
                           selectedLanguage === 'es' ? 'Contraseña' :
                           'Senha'}
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          placeholder="••••••••"
                          disabled
                        />
                      </div>
                      <button
                        className="w-full py-2.5 rounded-lg text-white text-xs font-semibold shadow-md transition-all mt-4"
                        style={{ backgroundColor: primaryColor }}
                        disabled
                      >
                        {selectedLanguage === 'en' ? 'Sign In' :
                         selectedLanguage === 'es' ? 'Iniciar Sesión' :
                         'Entrar'}
                      </button>
                    </div>
                    </div>
                  </div>

                  {/* Footer - Fixed at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 text-center py-3 text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800">
                    {footerText[selectedLanguage]}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Page */}
          <div className="relative">
            <p className="text-xs text-center text-slate-600 dark:text-slate-400 mb-2 font-medium">
              Dashboard
            </p>
            <div className="relative w-[680px] h-[520px] bg-slate-50 dark:bg-slate-900 rounded-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
              {/* Browser Chrome */}
              <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-900 rounded px-2 py-1 text-xs">
                    {faviconUrl ? (
                      <img src={faviconUrl} alt="Favicon" className="w-3 h-3" />
                    ) : (
                      <div className="w-3 h-3 rounded flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                        <Icon icon="heroicons:sparkles" className="w-2 h-2 text-white" />
                      </div>
                    )}
                    <span className="text-slate-500 dark:text-slate-400 truncate">admin.{appName.toLowerCase().replace(/\s+/g, '')}.com/dashboard</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="flex h-[calc(100%-40px)]">
                {/* Sidebar - Wider with text */}
                <div className="w-48 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                  {/* Logo at top */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-8 w-full object-contain" />
                    ) : (
                      <div className="h-8 flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                        <Icon icon="heroicons:sparkles" className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                      <Icon icon="heroicons:home" className="w-4 h-4" />
                      <span className="text-xs font-medium">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400">
                      <Icon icon="heroicons:currency-dollar" className="w-4 h-4" />
                      <span className="text-xs font-medium">Financeiro</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400">
                      <Icon icon="heroicons:users" className="w-4 h-4" />
                      <span className="text-xs font-medium">Usuários</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400">
                      <Icon icon="heroicons:lifebuoy" className="w-4 h-4" />
                      <span className="text-xs font-medium">Suporte</span>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden flex flex-col relative">
                  {/* Header */}
                  <div className="bg-white dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <h1 className="text-sm font-bold text-slate-900 dark:text-white">Dashboard</h1>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: primaryColor }}>
                        A
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="flex-1 p-4 pb-12 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                            <Icon icon="heroicons:users" className="w-4 h-4" style={{ color: primaryColor }} />
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Usuários</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">1.234</p>
                      </div>

                      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: `${secondaryColor}20` }}>
                            <Icon icon="heroicons:currency-dollar" className="w-4 h-4" style={{ color: secondaryColor }} />
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Receita</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">R$ 45k</p>
                      </div>
                    </div>

                    {/* Chart Preview */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 mb-3">
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-3">Visão Geral</h3>
                      <div className="flex items-end justify-between h-24 gap-1.5">
                        {[40, 60, 35, 80, 50, 70, 45].map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t transition-all"
                            style={{
                              height: `${height}%`,
                              backgroundColor: i === 3 ? primaryColor : `${primaryColor}40`
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      className="w-full py-2.5 rounded-lg text-white text-xs font-semibold shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                      disabled
                    >
                      Ver Relatório Completo
                    </button>
                  </div>

                  {/* Footer - Fixed at bottom of main content */}
                  <div className="absolute bottom-0 left-0 right-0 text-center py-2.5 text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                    {footerText[selectedLanguage]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingPreviews;
