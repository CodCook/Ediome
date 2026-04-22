import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reel Studio | AI Video Creator',
  description: 'Automated video production studio powered by AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
