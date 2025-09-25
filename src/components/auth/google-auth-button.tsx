
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';


export function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document already exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // This is a new user, create their document in Firestore with a trial
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);

        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          createdAt: serverTimestamp(),
          trialEndDate: trialEndDate,
        });
      }

      router.push('/dashboard');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Anmeldung fehlgeschlagen',
            description: error.message || 'Konnte nicht mit Google angemeldet werden.',
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 400.2 0 261.8 0 123.3 111.8 12.5 244 12.5c72.5 0 134.2 29.2 179.8 74.5L351.5 159.9C322.4 133.4 286.5 119.5 244 119.5c-94.8 0-172.2 77.2-172.2 172.2s77.4 172.2 172.2 172.2c108.6 0 148.5-79.6 152.8-117.2H244v-92.3h239.1c1.3 12.8 2.3 26.1 2.3 39.9z"></path>
        </svg>
      )}
      Mit Google anmelden
    </Button>
  );
}
