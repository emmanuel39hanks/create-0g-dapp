import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '{{PROJECT_NAME}} — Built on 0G',
  description: 'A decentralized application powered by the 0G network',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
