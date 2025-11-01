import { Fragment, useState, useEffect } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "@/hooks/useTranslation";

const languages = [
  { name: "Português", icon: "circle-flags:br", code: "pt-BR" },
  { name: "English", icon: "circle-flags:us", code: "en-US" },
  { name: "Español", icon: "circle-flags:es", code: "es" },
];

/**
 * Componente de seleção de idioma simplificado para telas de autenticação
 * Sem dependências do layout principal
 */
const LanguageSelectorSimple = ({ className = "" }) => {
  const { currentLanguage, changeLanguage } = useTranslation();
  const [selected, setSelected] = useState(languages[0]);

  // Sincronizar o idioma selecionado com o idioma atual
  useEffect(() => {
    const currentLang = languages.find(lang => lang.code === currentLanguage);
    if (currentLang) {
      setSelected(currentLang);
    }
  }, [currentLanguage]);

  // Atualizar o idioma quando o usuário selecionar
  const handleLanguageChange = (language) => {
    setSelected(language);
    changeLanguage(language.code);
  };

  return (
    <div className={className}>
      <Listbox value={selected} onChange={handleLanguageChange}>
        <div className="relative z-[100]">
          <Listbox.Button className="relative w-full flex items-center cursor-pointer space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <span className="inline-block h-5 w-5">
              <Icon
                icon={selected.icon}
                className="h-full w-full"
              />
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {selected.name}
            </span>
            <Icon
              icon="heroicons:chevron-down"
              className="h-4 w-4 text-slate-500 dark:text-slate-400"
            />
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute right-0 mt-2 w-40 origin-top-right bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
              {languages.map((item, i) => (
                <Listbox.Option key={i} value={item} as={Fragment}>
                  {({ active }) => (
                    <li
                      className={`
                      px-3 py-2.5 cursor-pointer transition-colors flex items-center space-x-2 rtl:space-x-reverse
                        ${
                          active
                            ? "bg-slate-100 dark:bg-slate-700"
                            : "text-slate-700 dark:text-slate-300"
                        }
                        ${
                          selected.code === item.code
                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium"
                            : ""
                        }
                        `}
                    >
                      <span className="flex-none">
                        <span className="h-5 w-5 inline-block">
                          <Icon
                            icon={item.icon}
                            className="w-full h-full"
                          />
                        </span>
                      </span>
                      <span className="flex-1 text-sm">
                        {item.name}
                      </span>
                      {selected.code === item.code && (
                        <Icon
                          icon="heroicons:check"
                          className="h-4 w-4"
                        />
                      )}
                    </li>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default LanguageSelectorSimple;
