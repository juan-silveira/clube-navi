import { Inter } from 'next/font/google';
import { ClubProvider } from '@/contexts/ClubContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Club Admin',
  description: 'Club Administration Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ClubProvider>
          {children}
        </ClubProvider>
      </body>
    </html>
  );
}
