import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { AuthLayoutWrapper } from '@/components/layout/auth-layout-wrapper';

export const metadata: Metadata = {
  title: 'Lexa.i.',
  description: 'AI-powered legal document generation for lawyers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AuthLayoutWrapper>{children}</AuthLayoutWrapper>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
