
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { AuthLayoutWrapper } from '@/components/layout/auth-layout-wrapper';
import { ThemeProvider } from '@/components/theme-provider';
import { CookieBanner } from '@/components/cookie-banner';

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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthLayoutWrapper>{children}</AuthLayoutWrapper>
            <CookieBanner />
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
