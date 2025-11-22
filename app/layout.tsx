import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Not-Env',
  description: 'Environment variable management system',
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

