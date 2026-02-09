import type { Metadata } from 'next';
import '../styles/globals.css';
import Providers from './providers';

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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
