'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GoogleAuthButton } from '@/components/auth/google-auth-button';
import { Icons } from '@/components/icons';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';


const signupSchema = z.object({
  name: z.string().min(2, { message: 'Der Name muss mindestens 2 Zeichen lang sein.' }),
  email: z.string().email({ message: 'Ungültige E-Mail-Adresse.' }),
  password: z.string().min(6, { message: 'Das Passwort muss mindestens 6 Zeichen lang sein.' }),
});

export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof signupSchema>) {
        setIsLoading(true);
        try {
            const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            await updateProfile(userCredential.user, {
                displayName: values.name
            });
            router.push('/dashboard');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Registrierung fehlgeschlagen',
                description: error.message || 'Ein unbekannter Fehler ist aufgetreten.',
            });
        } finally {
            setIsLoading(false);
        }
    }


  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
             <Icons.Logo className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-headline">Konto erstellen</CardTitle>
        <CardDescription>Generieren Sie juristische Dokumente mit KI</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Max Mustermann" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passwort</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Konto erstellen
            </Button>
          </form>
        </Form>
        <Separator className="my-6" />
        <GoogleAuthButton />
        <div className="mt-4 text-center text-sm">
          Sie haben bereits ein Konto?{' '}
          <Link href="/login" className="underline font-medium text-primary">
            Anmelden
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
