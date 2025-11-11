"use client";
import React from "react";
import { AlertTriangle, X } from "lucide-react";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar", variant = "warning" }) => {
  if (!isOpen) return null;

  const variantStyles = {
    warning: {
      icon: "text-yellow-600 dark:text-yellow-400",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      confirmBtn: "bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
    },
    danger: {
      icon: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      confirmBtn: "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
    },
    success: {
      icon: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      confirmBtn: "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
    }
  };

  const styles = variantStyles[variant] || variantStyles.warning;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}>
              <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 dark:text-gray-300 pl-16">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-slate-900/50 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${styles.confirmBtn} transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
