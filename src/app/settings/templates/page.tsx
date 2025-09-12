
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

export default function TemplatesPage() {
  const { user, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<TextBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<TextBlock | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      const fetchTemplates = async () => {
        setIsLoading(true);
        try {
          const q = query(collection(db, 'text_blocks'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const templatesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TextBlock));
          setTemplates(templatesData.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
          console.error("Error fetching templates: ", error);
          toast({ variant: 'destructive', title: 'Fehler', description: 'Textbausteine konnten nicht geladen werden.' });
        } finally {
          setIsLoading(false);
        }
      };
      fetchTemplates();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading, toast]);

  const handleAddTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim() || !user) return;
    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'text_blocks'), {
        userId: user.uid,
        name: newTemplateName,
        content: newTemplateContent,
        createdAt: serverTimestamp(),
      });
      setTemplates(prev => [...prev, { id: docRef.id, userId: user.uid, name: newTemplateName, content: newTemplateContent, createdAt: new Date() } as TextBlock].sort((a, b) => a.name.localeCompare(b.name)));
      setNewTemplateName('');
      setNewTemplateContent('');
      toast({ title: 'Erfolg', description: 'Textbaustein wurde hinzugefügt.' });
    } catch (error) {
      console.error("Error adding template: ", error);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Textbaustein konnte nicht hinzugefügt werden.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'text_blocks', id));
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast({ title: 'Erfolg', description: 'Textbaustein wurde gelöscht.' });
    } catch (error) {
      console.error("Error deleting template: ", error);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Textbaustein konnte nicht gelöscht werden.' });
    }
  };
  
  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !editingTemplate.name.trim() || !editingTemplate.content.trim()) return;
    setIsSaving(true);
    try {
        const templateRef = doc(db, 'text_blocks', editingTemplate.id);
        await updateDoc(templateRef, {
            name: editingTemplate.name,
            content: editingTemplate.content,
        });
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t).sort((a,b) => a.name.localeCompare(b.name)));
        setEditingTemplate(null);
        toast({ title: 'Erfolg', description: 'Textbaustein wurde aktualisiert.' });
    } catch (error) {
        console.error("Error updating template: ", error);
        toast({ variant: 'destructive', title: 'Fehler', description: 'Textbaustein konnte nicht aktualisiert werden.' });
    } finally {
        setIsSaving(false);
    }
  }

  const startEditing = (template: TextBlock) => {
    setEditingTemplate({ ...template });
  }

  if (isLoading || authLoading) {
    return <Loader2 className="animate-spin" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Neuen Textbaustein erstellen</CardTitle>
          <CardDescription>Erstellen Sie ein Kürzel und den dazugehörigen Text, den Sie in Dokumenten wiederverwenden können.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Kürzel (z.B. Haftungsklausel)"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              disabled={isSaving}
            />
            <Textarea
              placeholder="Inhalt des Textbausteins..."
              value={newTemplateContent}
              onChange={(e) => setNewTemplateContent(e.target.value)}
              className="min-h-[100px]"
              disabled={isSaving}
            />
          </div>
          <Button onClick={handleAddTemplate} disabled={isSaving || !newTemplateName.trim() || !newTemplateContent.trim()}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Textbaustein hinzufügen
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meine Textbausteine</CardTitle>
          <CardDescription>Hier finden Sie alle Ihre persönlichen Textbausteine.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.length === 0 && !isLoading && <p>Sie haben noch keine Textbausteine erstellt.</p>}
            {templates.map(template => (
              <Card key={template.id} className="overflow-hidden">
                {editingTemplate?.id === template.id ? (
                   <div className="p-4 bg-secondary/50">
                     <div className="space-y-2">
                       <Input 
                         value={editingTemplate.name}
                         onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                         className="font-bold"
                         disabled={isSaving}
                       />
                       <Textarea
                         value={editingTemplate.content}
                         onChange={(e) => setEditingTemplate({...editingTemplate, content: e.target.value})}
                         className="min-h-[120px]"
                         disabled={isSaving}
                       />
                     </div>
                     <div className="flex justify-end gap-2 mt-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingTemplate(null)} disabled={isSaving}><X className="h-4 w-4" /></Button>
                        <Button size="icon" onClick={handleUpdateTemplate} disabled={isSaving || !editingTemplate.name.trim() || !editingTemplate.content.trim()}><Save className="h-4 w-4" /></Button>
                     </div>
                   </div>
                ) : (
                    <div className='p-4 group'>
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-lg">{template.name}</h4>
                            <div className='opacity-0 group-hover:opacity-100 transition-opacity flex gap-1'>
                               <Button variant="ghost" size="icon" onClick={() => startEditing(template)}><Edit className="h-4 w-4" /></Button>
                               <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(template.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">{template.content}</p>
                    </div>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
