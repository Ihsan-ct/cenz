import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'NakaTune — Roblox Audio Converter',
  description: 'Convert & upload audio to Roblox',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  themeColor: '#22d3ee',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
