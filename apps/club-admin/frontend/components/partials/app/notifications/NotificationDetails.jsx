import React from "react";
import Icon from "@/components/ui/Icon";
import Tooltip from "@/components/ui/Tooltip";
import { useTranslation } from '@/hooks/useTranslation';

const NotificationDetails = ({ notification, onClose, onMarkAsRead, onMarkAsUnread, onToggleFavorite, onDelete }) => {
  const { t } = useTranslation('notifications');

  if (!notification) return null;

  const { id, isRead, sender, title, message, createdAt, isFavorite } = notification;

  return (
    <div className="absolute left-0 top-0 w-full h-full bg-white dark:bg-slate-800 z-[55] rounded-md flex flex-col">
      {/* Header com botões de ação - sempre visível */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 p-4 bg-white dark:bg-slate-800 flex-shrink-0">
        <div className="flex items-center">
          <Tooltip content={t('details.back')} placement="top" arrow>
            <button
              className="email-icon mr-3"
              type="button"
              onClick={onClose}
            >
              <Icon icon="heroicons-outline:arrow-left" />
            </button>
          </Tooltip>
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            {t('details.title')}
          </h2>
        </div>
        
        {/* Botões de ação sempre visíveis */}
        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-700 rounded-lg p-2">
          <Tooltip placement="top" arrow content={isRead ? t('details.tooltips.markAsUnread') : t('details.tooltips.markAsRead')}>
            <button 
              className={`p-2 rounded-md transition-colors ${
                isRead 
                  ? 'text-green-600 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800' 
                  : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              type="button"
              onClick={() => {
                if (isRead) {
                  onMarkAsUnread(id);
                } else {
                  onMarkAsRead(id);
                }
              }}
            >
              <Icon icon={isRead ? "heroicons-solid:check-circle" : "heroicons-outline:eye-off"} className="w-4 h-4" />
            </button>
          </Tooltip>
          
          <Tooltip placement="top" arrow content={isFavorite ? t('details.tooltips.removeFromFavorites') : t('details.tooltips.addToFavorites')}>
            <button 
              className={`p-2 rounded-md transition-colors ${
                isFavorite 
                  ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800' 
                  : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => onToggleFavorite(id)}
            >
              <Icon icon={isFavorite ? "heroicons-solid:star" : "heroicons-outline:star"} className="w-4 h-4" />
            </button>
          </Tooltip>
          
          <Tooltip placement="top" arrow content={t('details.tooltips.delete')}>
            <button 
              className="p-2 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
              onClick={() => onDelete(id)}
            >
              <Icon icon="heroicons-outline:trash" className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Conteúdo da notificação - área expansível */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Título */}
        <div className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
          {title}
        </div>

        {/* Informações do sender */}
        <div className="flex space-x-4 pb-6 mb-6 border-b border-slate-100 dark:border-slate-700 items-start">
          <div className="flex-none">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <Icon 
                icon="heroicons-solid:user" 
                className="text-white text-base" 
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="text-base text-slate-700 dark:text-slate-200 font-semibold">
              {sender}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {new Date(createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Mensagem com suporte a markdown - área maior */}
        <div className="text-base text-slate-700 dark:text-slate-200 font-normal leading-relaxed min-h-[300px] bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
          <div 
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: message
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic text-slate-800 dark:text-slate-200">$1</em>')
                .replace(/`(.*?)`/g, '<code class="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-sm font-mono">$1</code>')
                .replace(/\n/g, '<br class="mb-2" />')
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationDetails;
