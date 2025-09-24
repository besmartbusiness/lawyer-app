
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AddClientDialog } from './add-client-dialog';
import { Skeleton } from '@/components/ui/skeleton';

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export default function ClientsPage() {
  const { user, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
        // Wait until authentication status is resolved
        return;
    }
    if (!user) {
        setLoading(false);
        return;
    }

    setLoading(true);
    const q = query(
        collection(db, 'clients'), 
        where("userId", "==", user.uid), 
        orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const clientsData: Client[] = [];
      querySnapshot.forEach((doc) => {
        clientsData.push({ id: doc.id, ...doc.data() } as Client);
      });
      setClients(clientsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching clients: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleClientAdded = (newClient: Client) => {
    // No optimistic update needed here. 
    // The onSnapshot listener will automatically update the state.
  };

  const isLoading = loading || authLoading;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Mandanten</h2>
        <AddClientDialog onClientAdded={handleClientAdded} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mandantenliste</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Telefon</TableHead>
                <TableHead><span className="sr-only">Aktionen</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{client.email}</TableCell>
                    <TableCell className="hidden lg:table-cell">{client.phone}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" asChild>
                        <Link href={`/clients/${client.id}`}>Details anzeigen</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
               {!isLoading && clients.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                        Noch keine Mandanten hinzugefügt.
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
