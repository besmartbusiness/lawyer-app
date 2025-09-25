
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Helper function to set a cookie
const setCookie = (name: string, value: string, days: number) => {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

// Helper function to get a cookie
const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

export function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Only show the banner if the consent cookie has not been set yet
        const consent = getCookie('cookie_consent');
        if (consent === null) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        setCookie('cookie_consent', 'true', 365);
        setShowBanner(false);
    };
    
    const handleDecline = () => {
        setCookie('cookie_consent', 'false', 365);
        setShowBanner(false);
    }

    if (!showBanner) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            <div className="container mx-auto p-4 sm:p-6">
                <div className="bg-card text-card-foreground border rounded-lg shadow-2xl p-4 sm:p-6 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex-grow">
                             <h3 className="font-semibold text-base sm:text-lg">Wir verwenden Cookies</h3>
                             <p className="text-sm text-muted-foreground mt-1">
                                Wir nutzen Cookies, um Ihre Erfahrung auf unserer Website zu verbessern und die Nutzung zu analysieren.
                                Durch Klicken auf "Akzeptieren" stimmen Sie der Verwendung aller Cookies zu. Weitere Informationen finden Sie in unserer{' '}
                                <Link href="/#" className="underline hover:text-primary">Datenschutzerklärung</Link>.
                             </p>
                        </div>
                        <div className="flex gap-2 self-stretch sm:self-center flex-shrink-0">
                             <Button onClick={handleAccept} className="w-full sm:w-auto">Akzeptieren</Button>
                             <Button variant="outline" onClick={handleDecline} className="w-full sm:w-auto">Ablehnen</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

