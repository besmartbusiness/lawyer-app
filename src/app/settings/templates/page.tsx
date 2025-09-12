
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/use-auth';
import type { TextBlock } from '@/lib/definitions';
import { Loader2, PlusCircle, Trash2, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TemplatesPage() {
  const { user, loading: authLoading } = useAuth();
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [docTemplates, setDocTemplates] = useState<TextBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newEntryName, setNewEntryName] = useState('');
  const [newEntryContent, setNewEntryContent] = useState('');
  
  const [editingEntry, setEditingEntry] = useState<TextBlock | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      const fetchEntries = async () => {
        setIsLoading(true);
        try {
          const blocksQuery = query(collection(db, 'text_blocks'), where('userId', '==', user.uid));
          const templatesQuery = query(collection(db, 'doc_templates'), where('userId', '==', user.uid));
          
          const [blocksSnapshot, templatesSnapshot] = await Promise.all([
            getDocs(blocksQuery),
            getDocs(templatesQuery)
          ]);

          const blocksData = blocksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TextBlock));
          setTextBlocks(blocksData.sort((a, b) => a.name.localeCompare(b.name)));
          
          const templatesData = templatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TextBlock));
          setDocTemplates(templatesData.sort((a, b) => a.name.localeCompare(b.name)));

        } catch (error) {
          console.error("Error fetching templates: ", error);
          toast({ variant: 'destructive', title: 'Fehler', description: 'Vorlagen und Textbausteine konnten nicht geladen werden.' });
        } finally {
          setIsLoading(false);
        }
      };
      fetchEntries();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading, toast]);

  const handleAddEntry = async (type: 'text_block' | 'doc_template') => {
    if (!newEntryName.trim() || !newEntryContent.trim() || !user) return;
    setIsSaving(true);
    const collectionName = type === 'text_block' ? 'text_blocks' : 'doc_templates';
    const stateSetter = type === 'text_block' ? setTextBlocks : setDocTemplates;
    const entryTypeName = type === 'text_block' ? 'Textbaustein' : 'Dokumentvorlage';

    try {
      const docRef = await addDoc(collection(db, collectionName), {
        userId: user.uid,
        name: newEntryName,
        content: newEntryContent,
        createdAt: serverTimestamp(),
      });
      stateSetter(prev => [...prev, { id: docRef.id, userId: user.uid, name: newEntryName, content: newEntryContent, createdAt: new Date() } as TextBlock].sort((a, b) => a.name.localeCompare(b.name)));
      setNewEntryName('');
      setNewEntryContent('');
      toast({ title: 'Erfolg', description: `${entryTypeName} wurde hinzugefügt.` });
    } catch (error) {
      console.error(`Error adding ${entryTypeName}: `, error);
      toast({ variant: 'destructive', title: 'Fehler', description: `${entryTypeName} konnte nicht hinzugefügt werden.` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string, type: 'text_block' | 'doc_template') => {
    const collectionName = type === 'text_block' ? 'text_blocks' : 'doc_templates';
    const stateSetter = type === 'text_block' ? setTextBlocks : setDocTemplates;
    const entryTypeName = type === 'text_block' ? 'Textbaustein' : 'Dokumentvorlage';
    try {
      await deleteDoc(doc(db, collectionName, id));
      stateSetter(prev => prev.filter(t => t.id !== id));
      toast({ title: 'Erfolg', description: `${entryTypeName} wurde gelöscht.` });
    } catch (error) {
      console.error(`Error deleting ${entryTypeName}: `, error);
      toast({ variant: 'destructive', title: 'Fehler', description: `${entryTypeName} konnte nicht gelöscht werden.` });
    }
  };
  
  const handleUpdateEntry = async () => {
    if (!editingEntry || !editingEntry.name.trim() || !editingEntry.content.trim()) return;
    
    // We need to know if it's a text_block or doc_template. We can store this in the editing state.
    const type = (editingEntry as any).type as 'text_block' | 'doc_template';
    if (!type) {
        toast({ variant: 'destructive', title: 'Fehler', description: 'Typ der Vorlage konnte nicht bestimmt werden.' });
        return;
    }

    setIsSaving(true);
    const collectionName = type === 'text_block' ? 'text_blocks' : 'doc_templates';
    const stateSetter = type === 'text_block' ? setTextBlocks : setDocTemplates;
    const entryTypeName = type === 'text_block' ? 'Textbaustein' : 'Dokumentvorlage';
    
    try {
        const templateRef = doc(db, collectionName, editingEntry.id);
        await updateDoc(templateRef, {
            name: editingEntry.name,
            content: editingEntry.content,
        });
        stateSetter(prev => prev.map(t => t.id === editingEntry.id ? editingEntry : t).sort((a,b) => a.name.localeCompare(b.name)));
        setEditingEntry(null);
        toast({ title: 'Erfolg', description: `${entryTypeName} wurde aktualisiert.` });
    } catch (error) {
        console.error(`Error updating ${entryTypeName}: `, error);
        toast({ variant: 'destructive', title: 'Fehler', description: `${entryTypeName} konnte nicht aktualisiert werden.` });
    } finally {
        setIsSaving(false);
    }
  }

  const startEditing = (entry: TextBlock, type: 'text_block' | 'doc_template') => {
    setEditingEntry({ ...entry, type } as any);
  }

  if (authLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>;
  }
  
  const renderList = (entries: TextBlock[], type: 'text_block' | 'doc_template') => (
    <div className="space-y-4">
      {isLoading ? (
         <Loader2 className="animate-spin" />
      ) : entries.length === 0 ? (
        <p>Sie haben noch keine Einträge erstellt.</p>
      ) : (
        entries.map(entry => (
          <Card key={entry.id} className="overflow-hidden">
            {editingEntry?.id === entry.id ? (
               <div className="p-4 bg-secondary/50">
                 <div className="space-y-2">
                   <Input 
                     value={editingEntry.name}
                     onChange={(e) => setEditingEntry({...editingEntry, name: e.target.value})}
                     className="font-bold"
                     disabled={isSaving}
                   />
                   <Textarea
                     value={editingEntry.content}
                     onChange={(e) => setEditingEntry({...editingEntry, content: e.target.value})}
                     className="min-h-[120px]"
                     disabled={isSaving}
                   />
                 </div>
                 <div className="flex justify-end gap-2 mt-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingEntry(null)} disabled={isSaving}><X className="h-4 w-4" /></Button>
                    <Button size="icon" onClick={handleUpdateEntry} disabled={isSaving || !editingEntry.name.trim() || !editingEntry.content.trim()}><Save className="h-4 w-4" /></Button>
                 </div>
               </div>
            ) : (
                <div className='p-4 group'>
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-lg">{entry.name}</h4>
                        <div className='opacity-0 group-hover:opacity-100 transition-opacity flex gap-1'>
                           <Button variant="ghost" size="icon" onClick={() => startEditing(entry, type)}><Edit className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id, type)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">{entry.content}</p>
                </div>
            )}
          </Card>
        ))
      )}
    </div>
  );

  return (
    <Tabs defaultValue="doc_templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="doc_templates">Dokumentvorlagen</TabsTrigger>
            <TabsTrigger value="text_blocks">Textbausteine</TabsTrigger>
        </TabsList>
        <TabsContent value="doc_templates">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Neue Dokumentvorlage erstellen</CardTitle>
                        <CardDescription>Erstellen Sie einen Namen und den Inhalt für eine komplette Dokumentvorlage (z.B. Arbeitsvertrag, Mietvertrag).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Name der Vorlage (z.B. Mietvertrag Gewerbe)"
                                value={newEntryName}
                                onChange={(e) => setNewEntryName(e.target.value)}
                                disabled={isSaving}
                            />
                            <Textarea
                                placeholder="Inhalt der Dokumentvorlage..."
                                value={newEntryContent}
                                onChange={(e) => setNewEntryContent(e.target.value)}
                                className="min-h-[200px]"
                                disabled={isSaving}
                            />
                        </div>
                        <Button onClick={() => handleAddEntry('doc_template')} disabled={isSaving || !newEntryName.trim() || !newEntryContent.trim()}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                            Dokumentvorlage hinzufügen
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Meine Dokumentvorlagen</CardTitle>
                        <CardDescription>Hier finden Sie alle Ihre persönlichen Dokumentvorlagen, die Sie mit /vorlage [Name] verwenden können.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderList(docTemplates, 'doc_template')}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        <TabsContent value="text_blocks">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Neuen Textbaustein erstellen</CardTitle>
                        <CardDescription>Erstellen Sie ein Kürzel und den dazugehörigen Text, den Sie mit /einfügen [Kürzel] in Dokumenten wiederverwenden können.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Kürzel (z.B. Haftungsklausel)"
                                value={newEntryName}
                                onChange={(e) => setNewEntryName(e.target.value)}
                                disabled={isSaving}
                            />
                            <Textarea
                                placeholder="Inhalt des Textbausteins..."
                                value={newEntryContent}
                                onChange={(e) => setNewEntryContent(e.target.value)}
                                className="min-h-[100px]"
                                disabled={isSaving}
                            />
                        </div>
                        <Button onClick={() => handleAddEntry('text_block')} disabled={isSaving || !newEntryName.trim() || !newEntryContent.trim()}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                            Textbaustein hinzufügen
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Meine Textbausteine</CardTitle>
                        <CardDescription>Hier finden Sie alle Ihre persönlichen Textbausteine, die Sie mit /einfügen [Kürzel] verwenden können.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderList(textBlocks, 'text_block')}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
    </Tabs>
  );
}
