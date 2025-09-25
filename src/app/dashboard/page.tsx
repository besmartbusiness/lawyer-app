
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, limit, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, FileText, PlusCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Client = {
  id: string;
  name: string;
  email: string;
  createdAt: {
    toDate: () => Date;
  }
};

type Document = {
  id: string;
  title: string;
  clientId: string;
  createdAt: {
    toDate: () => Date;
  }
};

type UserData = {
    trialEndDate?: {
        toDate: () => Date;
    };
};

function TrialBanner({ trialEndDate }: { trialEndDate?: Date }) {
    if (!trialEndDate) return null;

    const now = new Date();
    const differenceInTime = trialEndDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

    if (remainingDays < 0) {
        return (
             <Alert variant="destructive">
                <Clock className="h-4 w-4" />
                <AlertTitle>Testzeitraum abgelaufen</AlertTitle>
                <AlertDescription>
                    Ihr kostenloser Testzeitraum ist abgelaufen. Bitte upgraden Sie, um Legiscribe weiterhin zu nutzen.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Willkommen bei Legiscribe!</AlertTitle>
            <AlertDescription>
                Ihr kostenloser Testzeitraum endet in {remainingDays} {remainingDays === 1 ? 'Tag' : 'Tagen'}.
            </AlertDescription>
        </Alert>
    );
}


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clientCount, setClientCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) {
      if (!authLoading) setLoadingData(false);
      return;
    }

    setLoadingData(true);

    // Listener for user data (for trial)
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
            setUserData(doc.data() as UserData);
        }
    });

    // Listener for clients
    const clientsQuery = query(
      collection(db, 'clients'),
      where('userId', '==', user.uid)
    );
    const unsubscribeClients = onSnapshot(clientsQuery, (snapshot) => {
      const allClients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      allClients.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
      setClients(allClients.slice(0, 5));
    });

    // Listener for all clients count
    const allClientsQuery = query(collection(db, 'clients'), where('userId', '==', user.uid));
    const unsubscribeAllClients = onSnapshot(allClientsQuery, (snapshot) => {
        setClientCount(snapshot.size);
    });

    // Listener for documents
    const documentsQuery = query(
      collection(db, 'documents'),
      where('userId', '==', user.uid)
    );
    const unsubscribeDocuments = onSnapshot(documentsQuery, (snapshot) => {
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
      allDocs.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
      setDocuments(allDocs.slice(0, 5));
      setLoadingData(false); // Stop loading once we have some data
    });

     // Listener for all documents count
     const allDocumentsQuery = query(collection(db, 'documents'), where('userId', '==', user.uid));
     const unsubscribeAllDocuments = onSnapshot(allDocumentsQuery, (snapshot) => {
         setDocumentCount(snapshot.size);
     });

    return () => {
      unsubscribeUser();
      unsubscribeClients();
      unsubscribeAllClients();
      unsubscribeDocuments();
      unsubscribeAllDocuments();
    };

  }, [user, authLoading]);

  const isLoading = authLoading || loadingData;
  const trialEndDate = userData?.trialEndDate?.toDate();


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
        <div className="flex items-center">
          <Button asChild>
            <Link href="/clients">
              <PlusCircle className="mr-2 h-4 w-4" /> Neuer Mandant
            </Link>
          </Button>
        </div>
      </div>

       { trialEndDate && <TrialBanner trialEndDate={trialEndDate} /> }

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mandanten insgesamt
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{clientCount}</div>}
            <p className="text-xs text-muted-foreground">
              Anzahl aller erfassten Mandanten
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dokumente generiert
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{documentCount}</div>}
            <p className="text-xs text-muted-foreground">
              Anzahl aller erstellten Dokumente
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Letzte Mandanten</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Erstellt am</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : clients.length > 0 ? (
                  clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                         <Link href={`/clients/${client.id}`} className="hover:underline">{client.name}</Link>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right">{client.createdAt?.toDate().toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                            Noch keine Mandanten angelegt.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Letzte Dokumente</CardTitle>
          </CardHeader>
          <CardContent>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Erstellt am</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : documents.length > 0 ? (
                  documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                         <Link href={`/clients/${doc.clientId}?tab=generator&docId=${doc.id}`} className="hover:underline">{doc.title}</Link>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right">{doc.createdAt?.toDate().toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                     <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                            Noch keine Dokumente erstellt.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
