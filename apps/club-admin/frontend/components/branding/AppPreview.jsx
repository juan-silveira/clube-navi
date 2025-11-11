"use client";
import React from 'react';
import { Icon } from "@iconify/react";

const AppPreview = ({
  appName = "Nome do App",
  appDescription = "Descrição do app",
  logoUrl = null,
  logoIconUrl = null,
  primaryColor = "#3B82F6",
  secondaryColor = "#10B981",
  accentColor = "#F59E0B",
  userName = "Usuário",
  showSplash = false,
  showHome = false,
  showHomeScreen = false,
  modules = null,
  moduleIcons = {}
}) => {
  // Se modules foram fornecidos, mostrar tela de módulos
  const showModules = modules && modules.length > 0;
  return (
    <div className="flex gap-4 justify-center flex-wrap">
      {/* Smartphone Home Screen */}
      {showHomeScreen && (
        <div className="relative">
          <p className="text-xs text-center text-slate-600 dark:text-slate-400 mb-2">
            ícone na home do smartphone
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
            <div className="absolute top-13 left-0 right-0 text-center">
              <p className="text-white text-xs opacity-90">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>

            {/* App Grid - 4x4 with only your app */}
            <div className="absolute top-32 left-0 right-0 bottom-20 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                {/* YOUR APP ICON - CENTERED AND HIGHLIGHTED */}
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
                  {/* Highlight indicator */}
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
      )}

      {/* Splash Screen */}
      {showSplash && (
        <div className="relative">
          <p className="text-xs text-center text-slate-600 dark:text-slate-400 mb-2">
            splash screen
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
      )}

      {/* Home Screen */}
      {showHome && (
        <div className="relative">
          <p className="text-xs text-center text-slate-600 dark:text-slate-400 mb-2">
            tela principal
          </p>
          <div className="relative w-[280px] h-[580px] bg-slate-50 rounded-[40px] border-8 border-slate-900 shadow-2xl overflow-hidden">
            {/* Status bar with dynamic color */}
            <div className="absolute top-0 left-0 right-0 h-12 z-10" style={{ backgroundColor: primaryColor }}>
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
            </div>

            {/* Header with logo */}
            <div className="absolute top-12 left-0 right-0 px-3 py-3" style={{ backgroundColor: primaryColor }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="text-sm font-bold" style={{ color: primaryColor }}>
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-sm drop-shadow-md">{appName}</h2>
                    <p className="text-white/90 text-[10px] drop-shadow-sm">Olá, {userName}!</p>
                  </div>
                </div>
                <div className="w-7 h-7 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                  <Icon icon="heroicons:bell" className="w-4 h-4 text-white drop-shadow-md" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="absolute top-[120px] left-0 right-0 bottom-16 bg-slate-50 overflow-y-auto">
              <div className="p-3 space-y-3">
                {/* Card Destaque */}
                <div className="bg-white rounded-xl p-3 shadow-md border border-slate-100">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                         style={{ backgroundColor: `${primaryColor}15` }}>
                      <Icon icon="heroicons:wifi" className="w-5 h-5" style={{ color: primaryColor }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xs font-bold text-slate-900 mb-0.5">Gerencie sua Internet!</h3>
                      <p className="text-[10px] text-slate-600 leading-tight">Veja seus planos, benefícios e faturas em um só lugar.</p>
                    </div>
                  </div>
                  <button
                    className="w-full py-2 px-3 rounded-lg font-semibold text-white text-[10px] transition-colors shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Acessar agora
                  </button>
                </div>

                {/* Você pode gostar disso */}
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-slate-900">Você pode gostar disso</h3>
                  <button className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-slate-200 text-slate-700">
                    Explorar
                  </button>
                </div>

                {/* Cards horizontais */}
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  <div className="flex-shrink-0 w-28 rounded-lg p-2 shadow-sm"
                       style={{ backgroundColor: primaryColor }}>
                    <Icon icon="heroicons:wifi" className="w-6 h-6 text-white mb-1" />
                    <p className="text-[10px] font-semibold text-white">Internet</p>
                  </div>
                  <div className="flex-shrink-0 w-28 rounded-lg p-2 shadow-sm"
                       style={{ backgroundColor: primaryColor }}>
                    <Icon icon="heroicons:currency-dollar" className="w-6 h-6 text-white mb-1" />
                    <p className="text-[10px] font-semibold text-white">Cashback</p>
                  </div>
                  <div className="flex-shrink-0 w-28 rounded-lg p-2 shadow-sm"
                       style={{ backgroundColor: primaryColor }}>
                    <Icon icon="heroicons:gift" className="w-6 h-6 text-white mb-1" />
                    <p className="text-[10px] font-semibold text-white">Vale-Presente</p>
                  </div>
                </div>

                {/* Banner Cashback */}
                <div className="rounded-xl p-4 shadow-lg relative overflow-hidden"
                     style={{
                       background: `linear-gradient(135deg, ${accentColor} 0%, ${secondaryColor} 100%)`,
                       minHeight: '80px'
                     }}>
                  <div className="relative z-10">
                    <h2 className="text-xl font-black text-white mb-0 leading-tight drop-shadow-lg">CASH</h2>
                    <h2 className="text-xl font-black text-white leading-tight drop-shadow-lg">BACK</h2>
                  </div>
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1 right-1 w-14 h-14 rounded-full border-2 border-white"></div>
                    <div className="absolute bottom-1 left-1 w-10 h-10 rounded-full border-2 border-white"></div>
                  </div>
                </div>

                {/* Vantagens exclusivas */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 mb-2">Vantagens exclusivas</h3>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold text-slate-900 mb-0.5">Conheça nossas</p>
                        <p className="text-[10px] font-semibold text-slate-900">melhores opções</p>
                      </div>
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                             style={{ backgroundColor: primaryColor }}>
                          <span className="text-xs font-bold text-white">Até 25%</span>
                        </div>
                      </div>
                      <p className="text-[10px] font-semibold text-slate-900">Lojas<br/>exclusivas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 flex items-center justify-around px-3">
              <div className="flex flex-col items-center gap-0.5">
                <Icon icon="heroicons:home-solid" className="w-5 h-5" style={{ color: primaryColor }} />
                <span className="text-[9px] font-medium" style={{ color: primaryColor }}>Início</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Icon icon="heroicons:square-3-stack-3d" className="w-5 h-5 text-slate-400" />
                <span className="text-[9px] text-slate-400">Explorar</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center -mt-8 shadow-xl"
                     style={{ backgroundColor: primaryColor }}>
                  <span className="text-white text-xl font-bold">{userName.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Icon icon="heroicons:bell" className="w-5 h-5 text-slate-400" />
                <span className="text-[9px] text-slate-400">Notificações</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Icon icon="heroicons:bars-3" className="w-5 h-5 text-slate-400" />
                <span className="text-[9px] text-slate-400">Mais</span>
              </div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-300 rounded-full" />
          </div>
        </div>
      )}

      {/* Modules Screen - App Layout Preview */}
      {showModules && (
        <div className="relative">
          <p className="text-xs text-center text-slate-600 dark:text-slate-400 mb-2">
            módulos ativos
          </p>
          <div className="relative w-[280px] h-[580px] bg-slate-50 dark:bg-slate-900 rounded-[40px] border-8 border-slate-900 shadow-2xl overflow-hidden">
            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 h-12 z-10" style={{ backgroundColor: primaryColor }}>
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
            </div>

            {/* Header */}
            <div className="absolute top-12 left-0 right-0 px-4 py-4 flex items-center gap-3" style={{ backgroundColor: primaryColor }}>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-sm font-bold" style={{ color: primaryColor }}>
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-white font-bold text-sm drop-shadow-md">{appName}</h2>
                <p className="text-white/90 text-[10px] drop-shadow-sm">Olá, {userName}!</p>
              </div>
            </div>

            {/* Content - Module List */}
            <div className="absolute top-[120px] left-0 right-0 bottom-16 overflow-y-auto">
              <div className="p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Módulos Disponíveis</h3>

                {modules.map((module) => (
                  <div
                    key={module.id}
                    className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-md border border-slate-100 dark:border-slate-700 flex items-center gap-3"
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <Icon
                        icon={moduleIcons[module.moduleKey] || "heroicons:cube"}
                        className="w-6 h-6"
                        style={{ color: primaryColor }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                        {module.displayName}
                      </h4>
                      {module.description && (
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-1">
                          {module.description}
                        </p>
                      )}
                    </div>
                    <Icon
                      icon="heroicons:chevron-right"
                      className="w-5 h-5 text-slate-400 flex-shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-around px-3">
              <div className="flex flex-col items-center gap-0.5">
                <Icon icon="heroicons:home-solid" className="w-5 h-5" style={{ color: primaryColor }} />
                <span className="text-[9px] font-medium" style={{ color: primaryColor }}>Início</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Icon icon="heroicons:square-3-stack-3d" className="w-5 h-5 text-slate-400" />
                <span className="text-[9px] text-slate-400">Explorar</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center -mt-8 shadow-xl"
                     style={{ backgroundColor: primaryColor }}>
                  <span className="text-white text-xl font-bold">{userName.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Icon icon="heroicons:bell" className="w-5 h-5 text-slate-400" />
                <span className="text-[9px] text-slate-400">Notificações</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Icon icon="heroicons:bars-3" className="w-5 h-5 text-slate-400" />
                <span className="text-[9px] text-slate-400">Mais</span>
              </div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AppPreview;
