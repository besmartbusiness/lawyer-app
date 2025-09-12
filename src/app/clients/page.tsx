import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data - replace with Firestore data fetching
const clients = [
  { id: "1", name: "John Doe", email: "john.doe@example.com", phone: "123-456-7890" },
  { id: "2", name: "Jane Smith", email: "jane.smith@example.com", phone: "234-567-8901" },
  { id: "3", name: "Peter Jones", email: "peter.jones@example.com", phone: "345-678-9012" },
  { id: "4", name: "Acme Corporation", email: "contact@acme.com", phone: "456-789-0123" },
  { id: "5", name: "Stark Industries", email: "pepper@stark.com", phone: "567-890-1234" },
];

export default function ClientsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Clients</h2>
        <div className="flex items-center space-x-2">
          {/* A dialog would be better here, but for simplicity, linking to a new page or handling in-place */}
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Client
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{client.email}</TableCell>
                  <TableCell className="hidden md:table-cell">{client.phone}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" asChild>
                      <Link href={`/clients/${client.id}`}>View Details</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
