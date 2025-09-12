
'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const tabs = [
        { name: 'Allgemein', href: '/settings', path: '/settings' },
        { name: 'Vorlagen & Textbausteine', href: '/settings/templates', path: '/settings/templates' },
    ];
    
    // Determine the active tab by finding the most specific match
    const activeTab = tabs.slice().reverse().find(tab => pathname.startsWith(tab.path))?.path || '/settings';

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Einstellungen</h2>
            <Tabs value={activeTab} className="space-y-4">
                <TabsList>
                    {tabs.map(tab => (
                        <TabsTrigger key={tab.path} value={tab.path} asChild>
                            <Link href={tab.href}>{tab.name}</Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
                <div className="pt-4">
                    {children}
                </div>
            </Tabs>
        </div>
    );
}
