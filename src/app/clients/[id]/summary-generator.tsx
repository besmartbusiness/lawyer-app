
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, BookText, Wand2, UploadCloud, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeText } from '@/ai/flows/summarize-text';
import { Input } from '@/components/ui/input';

type SummaryGeneratorProps = {
    onSave: (doc: { title: string; content: string; notes: string }) => void;
};


export function SummaryGenerator({ onSave }: SummaryGeneratorProps) {
  const [textToSummarize, setTextToSummarize] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryTitle, setSummaryTitle] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
            variant: 'destructive',
            title: 'Falscher Dateityp',
            description: 'Bitte laden Sie nur PDF-Dateien hoch.',
        });
        return;
      }
      setFile(selectedFile);
      setTextToSummarize(''); // Clear text area if a file is selected
    }
  };


  const handleSummarize = async () => {
    if (!textToSummarize.trim() && !file) {
      toast({
        variant: 'destructive',
        title: 'Eingabe erforderlich',
        description: 'Bitte fügen Sie Text ein oder laden Sie ein PDF-Dokument hoch.',
      });
      return;
    }

    setIsSummarizing(true);
    setSummary('');
    setSummaryTitle('');

    try {
        let documentDataUri: string | undefined = undefined;

        if (file) {
            toast({ title: 'Verarbeite Dokument...', description: 'Ihr Dokument wird für die Analyse vorbereitet.' });
            documentDataUri = await fileToDataUri(file);
        }

        toast({ title: 'Erstelle Zusammenfassung...', description: 'Die KI analysiert den Inhalt.' });
        const result = await summarizeText({ 
            textToSummarize: textToSummarize || undefined,
            documentDataUri: documentDataUri,
        });
        setSummary(result.summary);
        setSummaryTitle(`Zusammenfassung für ${file?.name || 'eingefügten Text'}`);
    } catch (error: any) {
      console.error('Summarization error:', error);
      toast({
        variant: 'destructive',
        title: 'Zusammenfassung fehlgeschlagen',
        description: error.message || 'Bei der Analyse des Dokuments ist ein Fehler aufgetreten.',
      });
    } finally {
      setIsSummarizing(false);
    }
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextToSummarize(e.target.value);
    if (e.target.value) {
        // If user types, clear the file selection
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const handleSaveSummary = async () => {
    if (!summaryTitle.trim()) {
        toast({
            variant: 'destructive',
            title: 'Titel erforderlich',
            description: 'Bitte geben Sie einen Titel für die Zusammenfassung ein.',
        });
        return;
    }
    if (!summary.trim()) {
        toast({
            variant: 'destructive',
            title: 'Keine Zusammenfassung',
            description: 'Es gibt keine Zusammenfassung zum Speichern.',
        });
        return;
    }
    
    setIsSaving(true);
    // Use the original text/file name as "notes"
    const notes = textToSummarize || `Zusammenfassung der Datei: ${file?.name || ''}`;
    onSave({ title: summaryTitle, content: summary, notes: notes });

    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    toast({
        title: 'Zusammenfassung gespeichert',
        description: `Das Dokument "${summaryTitle}" wurde erstellt. Sie finden es im Tab "Übersicht".`,
    });
    
    // Clear the form
    setTextToSummarize('');
    setSummary('');
    setSummaryTitle('');
    setFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }

    setIsSaving(false);
  }

  const isBusy = isSummarizing || isSaving;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookText className="h-6 w-6" />
          KI-Akten-Scanner
        </CardTitle>
        <CardDescription>
          Fügen Sie den Inhalt eines Dokuments ein oder laden Sie ein PDF hoch, um eine KI-gestützte Zusammenfassung der Kernaussagen, Argumente und Beweismittel zu erhalten.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="text-to-summarize">Zu analysierendes Dokument</Label>
            <div className='relative'>
                 <Textarea
                    id="text-to-summarize"
                    placeholder="Fügen Sie hier den Text ein oder laden Sie unten ein PDF hoch..."
                    value={textToSummarize}
                    onChange={handleTextChange}
                    className="min-h-[300px] h-full"
                    disabled={isBusy}
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf"
                    className="hidden"
                    id="pdf-upload"
                 />
                <Button
                    variant="outline"
                    className='absolute bottom-3 right-3'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isBusy}
                >
                    <UploadCloud className="mr-2" /> PDF hochladen
                </Button>
            </div>
             {file && (
                <div className="text-sm text-muted-foreground pt-2">
                    Ausgewählte Datei: <span className='font-medium'>{file.name}</span>
                </div>
            )}
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="summary">KI-Zusammenfassung</Label>
             <div className="relative flex-1">
                {isSummarizing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-md z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Dokument wird analysiert...</p>
                    </div>
                )}
                <div className="space-y-2 flex flex-col h-full">
                    <Input 
                        id="summary-title"
                        placeholder="Titel der Zusammenfassung..."
                        value={summaryTitle}
                        onChange={(e) => setSummaryTitle(e.target.value)}
                        disabled={isBusy || !summary}
                        />
                    <Textarea
                        id="summary"
                        placeholder="Die Zusammenfassung der KI wird hier angezeigt..."
                        value={summary}
                        readOnly
                        className="flex-grow min-h-[150px] bg-secondary/50"
                    />
                </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
          <Button onClick={handleSaveSummary} disabled={isBusy || !summary || !summaryTitle} variant="outline" className='w-full sm:w-auto'>
              {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
              <Save className="mr-2 h-4 w-4" />
              )}
              Zusammenfassung speichern
          </Button>
          <Button onClick={handleSummarize} disabled={isBusy || (!textToSummarize.trim() && !file)} className='w-full sm:w-auto'>
            {isSummarizing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Zusammenfassung erstellen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

    