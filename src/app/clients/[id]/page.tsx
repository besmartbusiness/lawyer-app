
'use client';

import { useState } from 'react';
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


  // Define the type for a document
  type Document = {
    id: string;
    title: string;
    createdAt: string;
    content: string;
    notes: string;
  };
  
  // Mock data for a single client
  const client = {
    id: "1",
    name: "Max Mustermann vs. Gegenpartei GmbH",
    caseInfo: {
        plaintiff: "Max Mustermann\nMusterstraße 1\n12345 Musterstadt",
        defendant: "Gegenpartei GmbH\nFirmenweg 2\n54321 Firmenstadt",
        court: "Amtsgericht Musterstadt",
        caseNumber: "123 C 456/24",
        legalArea: "Vertragsrecht",
        coreArgument: "Nichterfüllung des Kaufvertrags"
    },
    caseSummary: "Erstes Beratungsgespräch bezüglich eines Vertragsstreits mit einem Lieferanten. Der Mandant behauptet die Nichtlieferung von Waren trotz vollständiger Bezahlung. Vertrag unterzeichnet am 15. Januar 2024."
  };
  
  // Initial mock documents
  const initialDocuments: Document[] = [
    { id: "doc1", title: "Erstes Aufforderungsschreiben", createdAt: "2024-05-21", content: "Inhalt des ersten Aufforderungsschreibens...", notes: client.caseSummary },
    { id: "doc2", title: "Mandantenvereinbarung", createdAt: "2024-05-20", content: "Inhalt der Mandantenvereinbarung...", notes: client.caseSummary },
  ];
  
  export default function ClientDetailPage({ params }: { params: { id: string } }) {
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [activeTab, setActiveTab] = useState("documents");


    const handleSaveDocument = (doc: { title: string; content: string; notes: string; }) => {
        const existingDocIndex = selectedDocument ? documents.findIndex(d => d.id === selectedDocument.id) : -1;

        if (existingDocIndex > -1) {
            // Update existing document
            setDocuments(docs => {
                const updatedDocuments = [...docs];
                const updatedDoc = {
                    ...updatedDocuments[existingDocIndex],
                    ...doc,
                };
                updatedDocuments[existingDocIndex] = updatedDoc;
                setSelectedDocument(updatedDoc); // Ensure the selected document is the updated one
                return updatedDocuments;
            });
        } else {
            // Add new document
            const newDoc = {
                id: `doc${Date.now()}`,
                createdAt: new Date().toISOString().split('T')[0],
                ...doc,
            };
            const newDocuments = [newDoc, ...documents];
            setDocuments(newDocuments);
            setSelectedDocument(newDoc); // Select the newly created document
        }
        setActiveTab("documents");
    };

    const handleNewDocument = () => {
        setSelectedDocument(null);
        setActiveTab('generator');
    }

    const handleRowClick = (doc: Document) => {
        setSelectedDocument(doc);
        setActiveTab("generator");
    };
  
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
                <TabsTrigger value="documents">KI-Dokumente</TabsTrigger>
                <TabsTrigger value="generator">KI-Generator</TabsTrigger>
                <TabsTrigger value="scanner">KI-Akten-Scanner</TabsTrigger>
                <TabsTrigger value="strategy">KI-Stratege</TabsTrigger>
                <TabsTrigger value="prediction">KI-Prognose</TabsTrigger>
            </TabsList>
          <TabsContent value="documents" className="space-y-4">
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
                        {documents.map((doc) => (
                            <TableRow key={doc.id} onClick={() => handleRowClick(doc)} className="cursor-pointer">
                                <TableCell className="font-medium">{doc.title}</TableCell>
                                <TableCell className='hidden sm:table-cell'>{doc.createdAt}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Stammdaten & Notizen</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 text-sm">
                    <div className="space-y-2">
                        <h4 className='font-semibold'>Kläger</h4>
                        <p className='text-muted-foreground whitespace-pre-wrap'>{client.caseInfo.plaintiff}</p>
                    </div>
                    <div className="space-y-2">
                        <h4 className='font-semibold'>Beklagter</h4>
                        <p className='text-muted-foreground whitespace-pre-wrap'>{client.caseInfo.defendant}</p>
                    </div>
                    <div className="space-y-2">
                        <h4 className='font-semibold'>Gericht / AZ</h4>
                        <p className='text-muted-foreground'>{client.caseInfo.court}, {client.caseInfo.caseNumber}</p>
                    </div>
                     <div className="space-y-2">
                        <h4 className='font-semibold'>Zusammenfassung</h4>
                        <p className='text-muted-foreground'>{client.caseSummary}</p>
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

    