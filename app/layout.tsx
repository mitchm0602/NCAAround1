import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NCAA Live Matchup App',
  description: 'Live NCAA team comparison, market odds, projected spread and total, confidence, and upset-risk flags.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
