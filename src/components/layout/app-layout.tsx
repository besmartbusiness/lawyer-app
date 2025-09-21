'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/layout/user-nav';
import { Icons } from '@/components/icons';
import { LayoutDashboard, Users, Settings, LogOut, FileText, ShieldCheck, BrainCircuit, Lightbulb, Bot } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen">
        <div className="hidden md:flex flex-col w-64 border-r bg-sidebar p-4 gap-4">
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full bg-sidebar-accent" />
                <Skeleton className="h-6 w-24 bg-sidebar-accent" />
            </div>
            <div className="flex flex-col gap-2 mt-4">
                <Skeleton className="h-8 w-full bg-sidebar-accent" />
                <Skeleton className="h-8 w-full bg-sidebar-accent" />
                <Skeleton className="h-8 w-full bg-sidebar-accent" />
            </div>
            <div className="mt-auto">
                <Skeleton className="h-8 w-full bg-sidebar-accent" />
            </div>
        </div>
        <div className="flex-1 p-8">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full mt-8" />
        </div>
      </div>
    );
  }
  
  const handleLogout = async () => {
    const { auth } = await import('@/lib/firebase');
    await auth.signOut();
    router.push('/login');
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-sidebar-primary">
                    <Icons.Logo className="h-7 w-7" />
                </Button>
                <h1 className="text-xl font-bold font-headline text-sidebar-primary-foreground group-data-[collapsible=icon]:hidden">Lexa.i.</h1>
            </Link>
            <SidebarTrigger className="md:hidden"/>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/'} >
                <Link href="/">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/clients')}>
                <Link href="/clients">
                  <Users />
                  <span>Mandanten</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarSeparator />
             <SidebarMenuItem>
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground/70 group-data-[collapsible=icon]:hidden">
                    KI-Werkzeuge
                </div>
             </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/contract-analysis')}>
                <Link href="/contract-analysis">
                  <Bot />
                  <span>Verhandlungs-Copilot</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/case-strategy')}>
                <Link href="/case-strategy">
                  <Lightbulb />
                  <span>KI-Stratege</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/predictive-analysis')}>
                 <Link href="/predictive-analysis">
                  <BrainCircuit />
                  <span>KI-Prognose</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/settings')}>
                    <Link href="/settings">
                      <Settings />
                      <span>Einstellungen</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout}>
                        <LogOut />
                        <span>Ausloggen</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="hidden md:flex"/>
                {/* We can add breadcrumbs or page title here later */}
            </div>
            <UserNav />
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
