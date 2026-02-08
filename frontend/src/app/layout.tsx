import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Photography Equipment Marketplace',
  description: 'Buy and sell used photography gear in South Africa',
  keywords: ['photography', 'marketplace', 'camera', 'lens', 'used gear', 'South Africa'],
  authors: [{ name: 'CameraStuff' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
