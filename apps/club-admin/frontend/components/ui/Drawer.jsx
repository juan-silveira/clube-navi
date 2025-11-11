"use client";
import React, { useEffect, useState } from 'react';
import Icon from './Icon';

const Drawer = ({ isOpen, onClose, title, children, position = 'bottom' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle mount/unmount animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to trigger animation after mount
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevenir scroll do body quando drawer está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fechar ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  const positionClasses = {
    bottom: 'bottom-[150px] left-0 right-0 rounded-t-2xl max-h-[calc(85vh-150px)]',
    right: 'right-0 top-0 bottom-0 w-full sm:w-96 rounded-l-2xl',
    left: 'left-0 top-0 bottom-0 w-full sm:w-96 rounded-r-2xl',
    top: 'top-0 left-0 right-0 rounded-b-2xl max-h-[85vh]'
  };

  const translateClasses = {
    bottom: isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
    right: isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
    left: isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0',
    top: isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out z-40 ${
          isAnimating ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed ${positionClasses[position]} bg-white dark:bg-slate-800 shadow-2xl transform transition-all duration-300 ease-out z-50 ${translateClasses[position]} overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon icon="heroicons:x-mark" className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: position === 'bottom' ? 'calc(85vh - 150px - 4rem)' : 'calc(85vh - 4rem)' }}>
          {children}
        </div>
      </div>
    </>
  );
};

export default Drawer;
