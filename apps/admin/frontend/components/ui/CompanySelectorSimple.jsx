import { Fragment, useState, useEffect } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import useDarkMode from "@/hooks/useDarkMode";

/**
 * Componente de seleção de empresa para tela de login
 * Mostra logo mini de cada empresa
 */
const CompanySelectorSimple = ({ companies, currentAlias, className = "" }) => {
  const router = useRouter();
  const [isDark] = useDarkMode();
  const [selected, setSelected] = useState(null);

  // Sincronizar com a empresa atual
  useEffect(() => {
    if (companies && companies.length > 0 && currentAlias) {
      const current = companies.find(c => c.alias === currentAlias);
      if (current) {
        setSelected(current);
      } else {
        setSelected(companies[0]);
      }
    }
  }, [companies, currentAlias]);

  // Alterar empresa
  const handleCompanyChange = (company) => {
    setSelected(company);
    router.push(`/login/${company.alias}`);
  };

  if (!companies || companies.length === 0 || !selected) {
    return null;
  }

  return (
    <div className={className}>
      <Listbox value={selected} onChange={handleCompanyChange}>
        <div className="relative z-[100]">
          <Listbox.Button className="relative w-full flex items-center cursor-pointer space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <img
              src={`/assets/images/companies/${selected.alias}.png`}
              alt={selected.brandName}
              className="h-5 w-5 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {selected.brandName}
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
            <Listbox.Options className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
              {companies.map((item, i) => (
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
                          selected.alias === item.alias
                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium"
                            : ""
                        }
                        `}
                    >
                      <span className="flex-none">
                        <img
                          src={`/assets/images/companies/${item.alias}.png`}
                          alt={item.brandName}
                          className="h-5 w-5 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </span>
                      <span className="flex-1 text-sm">
                        {item.brandName}
                      </span>
                      {selected.alias === item.alias && (
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

export default CompanySelectorSimple;
