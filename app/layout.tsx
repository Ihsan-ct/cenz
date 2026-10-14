import './globals.css';

export const metadata = {
  title: 'NakaTune — Roblox Audio Converter',
  description: 'Convert & upload audio to Roblox',
  manifest: '/manifest.json',
  themeColor: '#22d3ee',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
