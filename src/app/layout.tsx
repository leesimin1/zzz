import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'POLAR HOME',
  applicationName: 'POLAR HOME',
  description: '에너지를 아끼고 북극곰의 집을 함께 지켜요.',
  openGraph: {
    title: 'POLAR HOME',
    siteName: 'POLAR HOME',
    description: '에너지를 아끼고 북극곰의 집을 함께 지켜요.',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
