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
  
  // Mock data for a single client and their documents
  const client = {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    address: "123 Main St, Anytown, USA",
    caseDetails: "Initial consultation regarding a contractual dispute with a supplier. The client claims non-delivery of goods despite full payment. Contract signed on Jan 15, 2024."
  };
  
  const documents = [
    { id: "doc1", title: "Initial Demand Letter", createdAt: "2024-05-21" },
    { id: "doc2", title: "Client Agreement", createdAt: "2024-05-20" },
  ];
  
  export default function ClientDetailPage({ params }: { params: { id: string } }) {
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
            <TabsTrigger value="documents">AI Documents</TabsTrigger>
            <TabsTrigger value="details">Client Details</TabsTrigger>
          </TabsList>
          <TabsContent value="documents" className="space-y-4">
            <DocumentGenerator clientNotes={client.caseDetails || ''} />
            <Card>
              <CardHeader>
                <CardTitle>Generated Documents</CardTitle>
                <CardDescription>
                  Documents generated for {client.name}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium hover:underline cursor-pointer">
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
                <CardTitle>Client Information</CardTitle>
                <CardDescription>
                  Contact and case details for {client.name}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-medium text-muted-foreground">Email</p>
                        <p>{client.email}</p>
                    </div>
                     <div>
                        <p className="font-medium text-muted-foreground">Phone</p>
                        <p>{client.phone}</p>
                    </div>
                     <div>
                        <p className="font-medium text-muted-foreground">Address</p>
                        <p>{client.address}</p>
                    </div>
                </div>
                 <div>
                    <p className="font-medium text-muted-foreground">Case Details</p>
                    <p className="whitespace-pre-wrap">{client.caseDetails}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  