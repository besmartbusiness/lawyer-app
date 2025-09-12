
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
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    address: "123 Main St, Anytown, USA",
    caseDetails: "Erstes Beratungsgespräch bezüglich eines Vertragsstreits mit einem Lieferanten. Der Mandant behauptet die Nichtlieferung von Waren trotz vollständiger Bezahlung. Vertrag unterzeichnet am 15. Januar 2024."
  };
  
  // Initial mock documents
  const initialDocuments: Document[] = [
    { id: "doc1", title: "Erstes Aufforderungsschreiben", createdAt: "2024-05-21", content: "Inhalt des ersten Aufforderungsschreibens...", notes: client.caseDetails },
    { id: "doc2", title: "Mandantenvereinbarung", createdAt: "2024-05-20", content: "Inhalt der Mandantenvereinbarung...", notes: client.caseDetails },
  ];
  
  export default function ClientDetailPage({ params }: { params: { id: string } }) {
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

    const handleSaveDocument = (doc: { title: string; content: string; notes: string; }) => {
        // This is a special case to handle "new document" which clears the selection
        if (!doc.title && !doc.content && !doc.notes) {
            setSelectedDocument(null);
            return;
        }

        const existingDocIndex = selectedDocument ? documents.findIndex(d => d.id === selectedDocument.id) : -1;

        if (existingDocIndex > -1) {
            // Update existing document
            const updatedDocuments = [...documents];
            const updatedDoc = {
                ...updatedDocuments[existingDocIndex],
                title: doc.title,
                content: doc.content,
                notes: doc.notes,
            };
            updatedDocuments[existingDocIndex] = updatedDoc;
            setDocuments(updatedDocuments);
            setSelectedDocument(updatedDoc);
        } else {
             // Create new document
            const newDocument: Document = {
                id: `doc${documents.length + 1 + Math.random()}`,
                title: doc.title,
                createdAt: new Date().toISOString().split('T')[0],
                content: doc.content,
                notes: doc.notes,
            };
            setDocuments(prevDocs => [...prevDocs, newDocument]);
            setSelectedDocument(newDocument);
        }
    };

    const handleSelectDocument = (doc: Document) => {
        setSelectedDocument(doc);
    }

    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-headline">{client.name}</h2>
                <p className="text-muted-foreground">{client.email}</p>
            </div>
        </div>
        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList>
            <TabsTrigger value="documents">KI-Dokumente</TabsTrigger>
            <TabsTrigger value="details">Mandantendetails</TabsTrigger>
          </TabsList>
          <TabsContent value="documents" className="space-y-4">
            <DocumentGenerator 
              clientNotes={client.caseDetails || ''} 
              onSave={handleSaveDocument}
              selectedDocument={selectedDocument}
            />
            <Card>
              <CardHeader>
                <CardTitle>Generierte Dokumente</CardTitle>
                <CardDescription>
                  Für {client.name} generierte Dokumente.
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
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Mandanteninformationen</CardTitle>
                <CardDescription>
                  Kontakt- und Falldetails für {client.name}.
                </CardDescription>
              </Header>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-medium text-muted-foreground">Email</p>
                        <p>{client.email}</p>
                    </div>
                     <div>
                        <p className="font-medium text-muted-foreground">Telefon</p>
                        <p>{client.phone}</p>
                    </div>
                     <div>
                        <p className="font-medium text-muted-foreground">Adresse</p>
                        <p>{client.address}</p>
                    </div>
                </div>
                 <div>
                    <p className="font-medium text-muted-foreground">Falldetails</p>
                    <p className="whitespace-pre-wrap">{client.caseDetails}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
