import type { Metadata } from 'next';
import { Manrope, Spline_Sans_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { ToastProvider } from '@/components/Toast';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

const splineSansMono = Spline_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-spline-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Newsroom Hub',
    template: '%s — Newsroom Hub',
  },
  description:
    'Console éditoriale de la plateforme Tunisia News : rédaction assistée par IA et publication multi-sites.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body
        className={`${manrope.variable} ${splineSansMono.variable} bg-paper font-sans text-ink antialiased`}
      >
        <ToastProvider>
          <Sidebar />
          <main className="min-h-screen pl-64">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
