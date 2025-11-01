import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import useDarkmode from '@/hooks/useDarkMode';

const MultiSelect = ({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Selecione...",
  className = "",
  disabled = false,
  renderOption,
  renderTag
}) => {
  const [isDark] = useDarkmode();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue, isDisabled) => {
    if (isDisabled) return;
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue) => {
    onChange(value.filter(v => v !== optionValue));
  };

  const filteredOptions = options.filter(option => {
    const searchLower = searchTerm.toLowerCase();
    if (typeof option === 'object') {
      return option.label?.toLowerCase().includes(searchLower) ||
             option.searchText?.toLowerCase().includes(searchLower);
    }
    return option.toLowerCase().includes(searchLower);
  });

  const selectedOptions = options.filter(option => {
    const optionValue = typeof option === 'object' ? option.value : option;
    return value.includes(optionValue);
  });

  const getOptionLabel = (option) => {
    return typeof option === 'object' ? option.label : option;
  };

  const getOptionValue = (option) => {
    return typeof option === 'object' ? option.value : option;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className={`block mb-2 text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
          {label}
        </label>
      )}

      {/* Selected tags */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOptions.map(option => {
            const optionValue = getOptionValue(option);
            return (
              <div
                key={optionValue}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                  isDark
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-500 text-white'
                }`}
              >
                {renderTag ? renderTag(option) : (
                  <span>{getOptionLabel(option)}</span>
                )}
                <button
                  type="button"
                  onClick={() => removeOption(optionValue)}
                  disabled={disabled}
                  className={`hover:bg-primary-700 rounded-full p-0.5 transition-colors ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Select input */}
      <div className="relative">
        <input
          type="text"
          className={`form-control py-2 pr-10 w-full ${
            isDark
              ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
          }`}
          placeholder={selectedOptions.length > 0 ? 'Adicionar mais...' : placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown
            size={20}
            className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${
              isDark ? 'text-slate-300' : 'text-slate-500'
            }`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg border max-h-60 overflow-y-auto ${
          isDark
            ? 'bg-slate-700 border-slate-600'
            : 'bg-white border-slate-200'
        }`}>
          {filteredOptions.length === 0 ? (
            <div className={`p-3 text-center text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Nenhuma opção encontrada
            </div>
          ) : (
            filteredOptions.map(option => {
              const optionValue = getOptionValue(option);
              const isSelected = value.includes(optionValue);
              const isDisabled = typeof option === 'object' ? option.disabled : false;

              return (
                <div
                  key={optionValue}
                  className={`p-3 transition-colors ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : isSelected
                        ? (isDark ? 'bg-primary-900/30 cursor-pointer' : 'bg-primary-50 cursor-pointer')
                        : (isDark ? 'hover:bg-slate-600 cursor-pointer' : 'hover:bg-slate-50 cursor-pointer')
                  }`}
                  onClick={() => toggleOption(optionValue, isDisabled)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      disabled={isDisabled}
                      className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                    />
                    {renderOption ? renderOption(option) : (
                      <div className="flex-1">
                        {getOptionLabel(option)}
                        {isDisabled && (
                          <span className="text-xs ml-2 text-gray-500 dark:text-gray-400">
                            (sem telefone)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
