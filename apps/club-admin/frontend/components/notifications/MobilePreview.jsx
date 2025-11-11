"use client";
import React from 'react';
import { Icon } from "@iconify/react";
import Image from 'next/image';

const MobilePreview = ({
  title = "Título da Notificação",
  message = "Mensagem da Notificação",
  logo = null,
  banner = null,
  code = "",
  rules = "",
  buttonEnabled = false,
  buttonText = "Texto do Botão",
  showLockScreen = false,
  showInAppList = false,
  showInAppDetail = false
}) => {
  const defaultLogo = "/images/logo/logo-c-2.svg";

  return (
    <div className="flex gap-4 justify-center flex-wrap">
      {/* Notificação de push (lock screen) */}
      {showLockScreen && (
        <div className="relative">
          <p className="text-xs text-center text-slate-600 dark:text-slate-400 mb-2">
            notificação de push
          </p>
          <div className="relative w-[280px] h-[580px] bg-gradient-to-br from-blue-400 to-blue-600 rounded-[40px] border-8 border-slate-900 shadow-2xl">
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

            {/* Time */}
            <div className="absolute top-10 left-0 right-0 text-center">
              <div className="text-white text-5xl font-light">
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-white text-sm opacity-80 mt-1">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>

            {/* Notification card */}
            <div className="absolute top-40 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
              <div className="flex items-start gap-2">
                {logo ? (
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white p-1 flex items-center justify-center">
                    <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
                    <Icon icon="heroicons:bell" className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{title}</p>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{message}</p>
                </div>
                <span className="text-xs text-slate-500">1h atrás</span>
              </div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full" />
          </div>
        </div>
      )}

      {/* Tela de listagem da notificação */}
      {showInAppList && (
        <div className="relative">
          <p className="text-xs text-center text-slate-600 dark:text-slate-400 mb-2">
            Tela de listagem da notificação
          </p>
          <div className="relative w-[280px] h-[580px] bg-white dark:bg-slate-900 rounded-[40px] border-8 border-slate-900 shadow-2xl overflow-hidden">
            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-primary-600 z-10">
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
            <div className="absolute top-12 left-0 right-0 bg-primary-600 px-4 py-4 flex items-center gap-3">
              <Icon icon="heroicons:chevron-left" className="w-6 h-6 text-white" />
              <span className="text-white font-semibold text-lg">Notificação</span>
            </div>

            {/* Content */}
            <div className="absolute top-28 left-0 right-0 bottom-0 bg-white dark:bg-slate-900 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  {logo ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white p-1.5 flex items-center justify-center">
                      <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
                      <Icon icon="heroicons:bell" className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">{message}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>
        </div>
      )}

      {/* Página do desconto */}
      {showInAppDetail && (
        <div className="relative">
          <p className="text-xs text-center text-slate-600 dark:text-slate-400 mb-2">
            página do desconto
          </p>
          <div className="relative w-[280px] h-[580px] bg-white dark:bg-slate-900 rounded-[40px] border-8 border-slate-900 shadow-2xl overflow-hidden">
            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-primary-600 z-10">
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
            <div className="absolute top-12 left-0 right-0 bg-primary-600 px-4 py-4 flex items-center gap-3">
              <Icon icon="heroicons:chevron-left" className="w-6 h-6 text-white" />
              <span className="text-white font-semibold text-lg">Notificação</span>
            </div>

            {/* Content */}
            <div className="absolute top-28 left-0 right-0 bottom-0 bg-white dark:bg-slate-900 overflow-y-auto">
              {/* Banner */}
              {banner ? (
                <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <div className="w-[80%] h-[80%]">
                    <img src={banner} alt="Banner" className="w-full h-full object-contain" />
                  </div>
                </div>
              ) : logo ? (
                <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <div className="w-[80%] h-[80%] flex items-center justify-center">
                    <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <Icon icon="heroicons:photo" className="w-16 h-16 text-white opacity-50" />
                </div>
              )}

              <div className="p-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{message}</p>

                {code && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 border border-dashed border-slate-300 dark:border-slate-600">
                      <span className="text-sm font-mono font-semibold text-slate-900 dark:text-white">{code}</span>
                      <Icon icon="heroicons:clipboard-document" className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Código</p>
                  </div>
                )}

                {buttonEnabled && (
                  <div className="mt-4">
                    <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <span className="text-sm">{buttonText}</span>
                      <Icon icon="heroicons:arrow-right" className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {rules && rules.trim() && (
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white mb-2">Termos e Condições</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                      {rules}
                    </p>
                  </div>
                )}
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

export default MobilePreview;
