import "simplebar-react/dist/simplebar.min.css";
import "flatpickr/dist/themes/light.css";
import "react-svg-map/lib/index.css";
import "leaflet/dist/leaflet.css";
import "./scss/app.scss";

export const metadata = {
  title: 'Coinage - Sistema de Gestão',
  description: 'Sistema de gestão de tokens e transações blockchain.',
  icons: {
    icon: '/favicon.png',
  },
}

import ThemeProvider from "./theme-provider"
import { AlertProvider } from "@/contexts/AlertContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { ActiveCompanyProvider } from "@/contexts/ActiveCompanyContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NoSSR from "@/components/wrappers/NoSSR";

export default function RootLayout({ children }) {
  return (
    <>
      <html lang="pt-BR">
        <body className="font-inter  custom-tippy dashcode-app" suppressHydrationWarning>
          <NoSSR>
            <ThemeProvider>
              <LanguageProvider>
                <ConfigProvider>
                  <AlertProvider>
                    <CompanyProvider>
                      <ActiveCompanyProvider>
                        <div suppressHydrationWarning>
                          {children}
                        </div>
                      </ActiveCompanyProvider>
                    </CompanyProvider>
                  </AlertProvider>
                </ConfigProvider>
              </LanguageProvider>
            </ThemeProvider>
          </NoSSR>
        </body>
      </html>
    </>
  );
}
