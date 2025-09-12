
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
  import { CaseStrategyView } from './strategy-view';

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
        caseNumber: "123 C 456/24"
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
                    title: doc.title,
                    content: doc.content,
                    notes: doc.notes,
                };
                updatedDocuments[existingDocIndex] = updatedDoc;
                // Keep the updated doc selected
                setSelectedDocument(updatedDoc);
                return updatedDocuments;
            });
        } else {
             // Create new document
            const newDocument: Document = {
                id: `doc${documents.length + 1 + Math.random()}`,
                title: doc.title,
                createdAt: new Date().toISOString().split('T')[0],
                content: doc.content,
                notes: doc.notes,
            };
            setDocuments(prevDocs => [newDocument, ...prevDocs]);
            setSelectedDocument(newDocument);
            
            // If the summary was saved, switch to the documents tab to show it
            if (activeTab === 'summary' || activeTab === 'strategy') {
                setActiveTab('documents');
            }
        }
    };
    
    const handleNewDocument = () => {
        setSelectedDocument(null);
    }

    const handleSelectDocument = (doc: Document) => {
        setSelectedDocument(doc);
        setActiveTab('documents');
    }
    
    const clientNameForTimeTracking = client.name;


    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-headline">Fall: {client.name}</h2>
                <p className="text-muted-foreground">Aktenzeichen: {client.caseInfo.caseNumber}</p>
            </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="documents">KI-Dokumente</TabsTrigger>
            <TabsTrigger value="summary">KI-Akten-Scanner</TabsTrigger>
            <TabsTrigger value="strategy">KI-Strategie</TabsTrigger>
            <TabsTrigger value="details">Stammdaten & Details</TabsTrigger>
          </TabsList>
          <TabsContent value="documents" className="space-y-4">
            <DocumentGenerator 
              clientName={clientNameForTimeTracking}
              onSave={handleSaveDocument}
              onNew={handleNewDocument}
              selectedDocument={selectedDocument}
            />
            <Card>
              <CardHeader>
                <CardTitle>Generierte Dokumente</CardTitle>
                <CardDescription>
                  Für diesen Fall generierte Dokumente. Klicken Sie auf ein Dokument, um es zu bearbeiten.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titel</TableHead>
                      <TableHead>Erstellungsdatum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow 
                        key={doc.id} 
                        onClick={() => handleSelectDocument(doc)} 
                        className="cursor-pointer"
                        data-state={selectedDocument?.id === doc.id ? 'selected' : ''}
                      >
                        <TableCell className="font-medium hover:underline">
                          {doc.title}
                        </TableCell>
                        <TableCell>{doc.createdAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="summary">
            <SummaryGenerator onSave={handleSaveDocument} />
          </TabsContent>
          <TabsContent value="strategy">
            <CaseStrategyView caseSummary={client.caseSummary} />
          </TabsContent>
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Stammdaten des Falls</CardTitle>
                <CardDescription>
                  Parteien, Gericht und weitere Details zum Fall.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <p className="font-semibold text-base mb-2">Kläger</p>
                        <p className="whitespace-pre-wrap">{client.caseInfo.plaintiff}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-base mb-2">Beklagter</p>
                        <p className="whitespace-pre-wrap">{client.caseInfo.defendant}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-base mb-2">Gericht</p>
                        <p className="whitespace-pre-wrap">{client.caseInfo.court}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-base mb-2">Aktenzeichen</p>
                        <p className="whitespace-pre-wrap">{client.caseInfo.caseNumber}</p>
                    </div>
                </div>
                 <div className="pt-4 border-t">
                    <p className="font-semibold text-base mb-2">Zusammenfassung des Falls</p>
                    <p className="whitespace-pre-wrap text-sm">{client.caseSummary}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
