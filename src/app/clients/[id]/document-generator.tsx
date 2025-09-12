'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { Loader2, Wand2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateLegalDocument } from '@/ai/flows/generate-legal-document-from-notes';

export function DocumentGenerator({ clientNotes }: { clientNotes: string }) {
  const [notes, setNotes] = useState(clientNotes);
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!notes.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please enter some case notes to generate a document.',
      });
      return;
    }
    setIsGenerating(true);
    setGeneratedDoc('');
    try {
      const result = await generateLegalDocument({ notes });
      setGeneratedDoc(result.document);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'An error occurred while generating the document.',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    // Mock save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: 'Document Saved',
      description: 'The document has been successfully saved.',
    });
    setIsSaving(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.Gavel className="h-6 w-6" />
          Document Generator
        </CardTitle>
        <CardDescription>
          Use AI to draft legal documents from your case notes. You can edit the result before saving.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="notes">Case Notes</Label>
          <Textarea
            id="notes"
            placeholder="Enter client notes, meeting transcripts, or key case points here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[200px] h-full"
            disabled={isGenerating}
          />
        </div>
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="generated-doc">Generated Document</Label>
          <div className="relative flex-1">
             <Textarea
                id="generated-doc"
                placeholder="AI-generated document will appear here..."
                value={generatedDoc}
                onChange={(e) => setGeneratedDoc(e.target.value)}
                className="min-h-[200px] h-full"
                readOnly={isGenerating}
            />
            {isGenerating && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-md transition-opacity duration-300">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Generating document...</p>
                </div>
            )}
          </div>
        </div>
      </CardContent>
      <div className="flex items-center justify-end gap-2 p-6 pt-0">
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !generatedDoc} variant="outline">
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Document
          </Button>
        </div>
    </Card>
  );
}
