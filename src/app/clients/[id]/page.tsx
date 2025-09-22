
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, addDoc, collection, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
  import { DocumentGenerator } from './document-generator';
  import { SummaryGenerator } from './summary-generator';
  import { StrategyView } from '@/app/case-strategy/strategy-view';
  import { AnalysisView } from '@/app/predictive-analysis/analysis-view';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';


  // Define the type for a document
  type Document = {
    id: string;
    title: string;
    createdAt: string; // Keep as string for display
    content: string;
    notes: string;
  };

  type Client = {
      id: string;
      name: string;
      caseInfo: {
        plaintiff: string;
        defendant: string;
        court: string;
        caseNumber: string;
        legalArea: string;
        coreArgument: string;
      },
      caseSummary: string;
  };

  
  export default function ClientDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [client, setClient] = useState<Client | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [activeTab, setActiveTab] = useState("overview");

    const [isLoadingClient, setIsLoadingClient] = useState(true);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Fetch client data
    useEffect(() => {
        if (!user || !id) return;
        setIsLoadingClient(true);
        const clientDocRef = doc(db, 'clients', id);
        const unsubscribe = onSnapshot(clientDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                // Security check: ensure the client belongs to the user
                if (data.userId !== user.uid) {
                    toast({ variant: 'destructive', title: 'Zugriff verweigert', description: 'Sie haben keine Berechtigung, diesen Mandanten anzuzeigen.' });
                    setClient(null);
                } else {
                    setClient({
                        id: doc.id,
                        name: data.name || '',
                        caseInfo: data.caseInfo || {
                            plaintiff: "", defendant: "", court: "", caseNumber: "", legalArea: "", coreArgument: ""
                        },
                        caseSummary: data.caseSummary || ''
                    });
                }
            } else {
                toast({ variant: 'destructive', title: 'Fehler', description: 'Mandant nicht gefunden.' });
            }
            setIsLoadingClient(false);
        });
        return () => unsubscribe();
    }, [id, user, toast]);

    // Fetch documents for the client
    useEffect(() => {
      if (!user || !id) return;
      setIsLoadingDocuments(true);
      const docsQuery = query(
        collection(db, 'documents'),
        where('clientId', '==', id),
        where('userId', '==', user.uid), // Ensure user can only query their own documents
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(docsQuery, (querySnapshot) => {
        const docsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                createdAt: data.createdAt?.toDate().toISOString().split('T')[0] || '',
                content: data.content,
                notes: data.notes
            }
        });
        setDocuments(docsData);
        setIsLoadingDocuments(false);
      }, (error) => {
        console.error("Error fetching documents: ", error);
        toast({ variant: 'destructive', title: 'Fehler', description: 'Dokumente konnten nicht geladen werden.' });
        setIsLoadingDocuments(false);
      });

      return () => unsubscribe();

    }, [id, user, toast]);


    const handleSaveDocument = async (docToSave: { title: string; content: string; notes: string; }) => {
        if (!user || !id) {
            toast({ variant: 'destructive', title: 'Fehler', description: 'Sie müssen angemeldet sein und einen Mandanten ausgewählt haben.' });
            return;
        }

        try {
            await addDoc(collection(db, 'documents'), {
                ...docToSave,
                clientId: id,
                userId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            // The onSnapshot listener will update the UI automatically.
            setActiveTab("overview");
        } catch(error) {
            console.error("Error saving document: ", error);
            toast({ variant: 'destructive', title: 'Speicherfehler', description: 'Das Dokument konnte nicht gespeichert werden.' });
        }
    };

    const handleNewDocument = () => {
        setSelectedDocument(null);
        setActiveTab('generator');
    }

    const handleRowClick = (doc: Document) => {
        setSelectedDocument(doc);
        setActiveTab("generator");
    };

    const handleMasterDataChange = (field: keyof Client['caseInfo'] | 'caseSummary', value: string) => {
        if (!client) return;
    
        if (field === 'caseSummary') {
            setClient({
                ...client,
                caseSummary: value
            });
        } else {
            setClient({
                ...client,
                caseInfo: {
                    ...client.caseInfo,
                    [field]: value
                }
            });
        }
    };
    
    const handleSaveMasterData = async () => {
        if (!client) return;
        setIsSaving(true);
        try {
            const clientDocRef = doc(db, 'clients', id);
            await updateDoc(clientDocRef, {
                caseInfo: client.caseInfo,
                caseSummary: client.caseSummary
            });
            toast({
                title: 'Gespeichert',
                description: 'Die Stammdaten wurden erfolgreich aktualisiert.',
            });
        } catch (error) {
            console.error("Error updating master data: ", error);
            toast({ variant: 'destructive', title: 'Speicherfehler', description: 'Die Stammdaten konnten nicht aktualisiert werden.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingClient || authLoading) {
        return (
             <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <Skeleton className='h-10 w-3/4 mb-2'/>
                <Skeleton className='h-6 w-1/4 mb-6'/>
                <div className='flex gap-2 mb-4'>
                    <Skeleton className='h-10 w-24'/>
                    <Skeleton className='h-10 w-24'/>
                    <Skeleton className='h-10 w-24'/>
                </div>
                <Card>
                    <CardHeader><Skeleton className='h-8 w-1/3'/></CardHeader>
                    <CardContent className='space-y-2'>
                        <Skeleton className='h-8 w-full'/>
                        <Skeleton className='h-8 w-full'/>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!client) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <p>Mandant konnte nicht geladen werden oder Sie haben keine Zugriffsberechtigung.</p>
            </div>
        );
    }
  
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline break-words">
                Fall: {client.name}
            </h2>
            <p className="text-muted-foreground">Aktenzeichen: {client.caseInfo.caseNumber}</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="h-auto grid grid-cols-1 md:inline-flex md:flex-wrap md:justify-start">
                <TabsTrigger value="overview">Übersicht</TabsTrigger>
                <TabsTrigger value="generator">KI-Generator</TabsTrigger>
                <TabsTrigger value="scanner">KI-Akten-Scanner</TabsTrigger>
                <TabsTrigger value="strategy">KI-Stratege</TabsTrigger>
                <TabsTrigger value="prediction">KI-Prognose</TabsTrigger>
            </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Dokumentenübersicht</CardTitle>
                    <CardDescription>
                        Alle für diesen Fall generierten oder zusammengefassten Dokumente. Klicken Sie auf eine Zeile, um ein Dokument zu bearbeiten.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Titel</TableHead>
                                <TableHead className='hidden sm:table-cell'>Erstellt am</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {isLoadingDocuments ? (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center">
                                    <Loader2 className="mx-auto animate-spin" />
                                </TableCell>
                            </TableRow>
                        ) : documents.length === 0 ? (
                             <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center">
                                    Noch keine Dokumente für diesen Fall erstellt.
                                </TableCell>
                            </TableRow>
                        ) : (
                            documents.map((doc) => (
                                <TableRow key={doc.id} onClick={() => handleRowClick(doc)} className="cursor-pointer">
                                    <TableCell className="font-medium">{doc.title}</TableCell>
                                    <TableCell className='hidden sm:table-cell'>{doc.createdAt}</TableCell>
                                </TableRow>
                            ))
                        )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Stammdaten & Notizen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 text-sm">
                        <div className="space-y-2">
                            <Label htmlFor="plaintiff">Kläger</Label>
                            <Textarea id="plaintiff" value={client.caseInfo.plaintiff} onChange={e => handleMasterDataChange('plaintiff', e.target.value)} placeholder="Name und Adresse des Klägers" className='min-h-[100px]'/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="defendant">Beklagter</Label>
                            <Textarea id="defendant" value={client.caseInfo.defendant} onChange={e => handleMasterDataChange('defendant', e.target.value)} placeholder="Name und Adresse des Beklagten" className='min-h-[100px]'/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="court">Gericht / AZ</Label>
                            <Textarea id="court" value={client.caseInfo.court + (client.caseInfo.caseNumber ? ', ' + client.caseInfo.caseNumber : '')} 
                            onChange={e => {
                                const parts = e.target.value.split(',');
                                handleMasterDataChange('court', parts[0] || '');
                                handleMasterDataChange('caseNumber', parts.slice(1).join(',').trim());
                            }} placeholder="Gericht, Aktenzeichen" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="caseSummary">Zusammenfassung</Label>
                            <Textarea id="caseSummary" value={client.caseSummary} onChange={e => handleMasterDataChange('caseSummary', e.target.value)} placeholder="Kurze Zusammenfassung des Falls..." className='min-h-[100px]'/>
                        </div>
                    </div>
                     <div className="flex justify-end">
                        <Button onClick={handleSaveMasterData} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Stammdaten speichern
                        </Button>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="generator">
             <DocumentGenerator 
                clientName={client.name} 
                onSave={handleSaveDocument}
                onNew={handleNewDocument}
                selectedDocument={selectedDocument}
            />
          </TabsContent>
          <TabsContent value="scanner">
              <SummaryGenerator onSave={handleSaveDocument}/>
          </TabsContent>
           <TabsContent value="strategy">
                <StrategyView defaultSummary={client.caseSummary}/>
            </TabsContent>
            <TabsContent value="prediction">
                <AnalysisView 
                    defaultCourtLocation={client.caseInfo.court}
                    defaultLegalArea={client.caseInfo.legalArea}
                    defaultCoreArgument={client.caseInfo.coreArgument}
                    defaultSummary={client.caseSummary}
                />
            </TabsContent>
        </Tabs>
      </div>
    );
  }

    

