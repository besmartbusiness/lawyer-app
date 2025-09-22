
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';

const clientSchema = z.object({
  name: z.string().min(2, { message: 'Der Name muss mindestens 2 Zeichen lang sein.' }),
  email: z.string().email({ message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' }),
  phone: z.string().min(5, { message: 'Bitte geben Sie eine gültige Telefonnummer ein.' }),
});

type ClientFormValues = z.infer<typeof clientSchema>;

type AddClientDialogProps = {
  onClientAdded: (client: any) => void;
};

export function AddClientDialog({ onClientAdded }: AddClientDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  async function onSubmit(values: ClientFormValues) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Sie müssen angemeldet sein.' });
      return;
    }
    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'clients'), {
        ...values,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Erfolg',
        description: `Mandant "${values.name}" wurde erfolgreich hinzugefügt.`,
      });
      onClientAdded({ id: docRef.id, ...values });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error adding client:', error);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Mandant konnte nicht hinzugefügt werden.' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Mandant hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neuen Mandant hinzufügen</DialogTitle>
          <DialogDescription>Geben Sie hier die Details des neuen Mandanten ein.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                    <Input placeholder="max.mustermann@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input placeholder="+49 123 456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Mandant speichern
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
