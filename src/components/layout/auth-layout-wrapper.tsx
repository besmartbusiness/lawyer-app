'use client';

import { usePathname } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';

const authRoutes = ['/login', '/signup'];
const publicRoutes = ['/']; // Landing page

function CenteredLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      {children}
    </div>
  );
}

function LandingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.includes(pathname);
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isAuthRoute) {
    return <CenteredLayout>{children}</CenteredLayout>;
  }

  if (isPublicRoute) {
    return <LandingLayout>{children}</LandingLayout>;
  }

  return <AppLayout>{children}</AppLayout>;
}
