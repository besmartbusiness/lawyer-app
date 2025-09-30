
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { Loader2, Wand2, Save, Mic, MicOff, AlertCircle, FilePlus2, FileText, BookOpenCheck, Languages, Copy, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateLegalDocument } from '@/ai/flows/generate-legal-document-from-notes';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/use-auth';
import { Citation, suggestCitations } from '@/ai/flows/suggest-citations';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { summarizeForClient } from '@/ai/flows/summarize-for-client';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


type Document = {
  id: string;
  title: string;
  createdAt: string;
  content: string;
  notes: string;
};

type DocumentGeneratorProps = {
  clientName: string;
  onSave: (doc: { title: string; content: string; notes: string }) => void;
  onNew: () => void;
  selectedDocument: Document | null;
};

export function DocumentGenerator({ clientName, onSave, onNew, selectedDocument }: DocumentGeneratorProps) {
  const [notes, setNotes] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isSummarizingForClient, setIsSummarizingForClient] = useState(false);
  const [clientSummary, setClientSummary] = useState('');
  const [showClientSummaryDialog, setShowClientSummaryDialog] = useState(false);


  useEffect(() => {
    if (selectedDocument) {
      setNotes(selectedDocument.notes);
      setGeneratedDoc(selectedDocument.content);
      setDocumentTitle(selectedDocument.title);
      setCitations([]); // Clear citations when loading a doc
    } else {
        // Clear fields when there is no selected document or when creating a new one
        setNotes('');
        setGeneratedDoc('');
        setDocumentTitle('');
        setCitations([]);
    }
  }, [selectedDocument]);


  const handleGenerate = async () => {
    if (!notes.trim()) {
      toast({
        variant: 'destructive',
        title: 'Eingabe erforderlich',
        description: 'Bitte geben Sie Fallnotizen ein, um ein Dokument zu generieren.',
      });
      return;
    }
    if (!user) {
        toast({ variant: 'destructive', title: 'Nicht angemeldet', description: 'Sie müssen angemeldet sein.' });
        return;
    }
    setIsGenerating(true);
    setIsSuggesting(true);
    setGeneratedDoc('');
    setCitations([]);

    try {
        const docPromise = generateLegalDocument({ notes, userId: user.uid });
        const citationPromise = suggestCitations({ context: notes });

        citationPromise.then(result => {
            setCitations(result.suggestions);
        }).catch(error => {
            console.error("Citation suggestion failed:", error);
        }).finally(() => {
            setIsSuggesting(false);
        });

        const docResult = await docPromise;
        setGeneratedDoc(docResult.document);
        if (!documentTitle) {
            setDocumentTitle("Unbenanntes Dokument");
        }

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generierung fehlgeschlagen',
        description: 'Beim Generieren des Dokuments ist ein Fehler aufgetreten.',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSave = async () => {
    if (!documentTitle.trim()) {
        toast({
            variant: 'destructive',
            title: 'Titel erforderlich',
            description: 'Bitte geben Sie einen Titel für das Dokument ein.',
        });
        return;
    }
    if (!generatedDoc.trim()) {
        toast({
            variant: 'destructive',
            title: 'Inhalt erforderlich',
            description: 'Es gibt keinen Inhalt zum Speichern.',
        });
        return;
    }

    setIsSaving(true);
    onSave({ title: documentTitle, content: generatedDoc, notes: notes });
    
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    toast({
      title: 'Dokument gespeichert',
      description: `"${documentTitle}" wurde erfolgreich gespeichert.`,
    });
    setIsSaving(false);
  }

  const startRecording = async () => {
    setTranscriptionError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setTranscriptionError("Ihr Browser unterstützt keine Audioaufnahmen.");
      return;
    }
    if (!user) {
        toast({ variant: 'destructive', title: 'Nicht angemeldet', description: 'Sie müssen angemeldet sein.' });
        return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
        }
        setIsRecording(false);
        setRecordingTime(0);
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());

        if (audioBlob.size === 0) {
            toast({ variant: 'destructive', title: 'Aufnahme leer', description: 'Die Aufnahme war zu kurz oder leer.' });
            return;
        }

        setIsTranscribing(true);
        toast({ title: 'Aufnahme beendet', description: 'Audio wird hochgeladen...' });

        try {
            const audioFileName = `audio/${Date.now()}.webm`;
            const storageRef = ref(storage, `uploads/${user.uid}/${audioFileName}`);
            await uploadBytes(storageRef, audioBlob);
            const downloadURL = await getDownloadURL(storageRef);

            toast({ title: 'Upload erfolgreich', description: 'Transkription wird verarbeitet...' });
            
            const transcriptionResult = await transcribeAudio({ audioUrl: downloadURL });
            const transcribedNotes = transcriptionResult.text;
            
            setNotes(prev => prev ? `${prev}\n\n--- Diktat ---\n${transcribedNotes}` : transcribedNotes);
            toast({ title: 'Transkription erfolgreich', description: 'Notizen wurden aktualisiert.' });
            
        } catch (error) {
            console.error('Transcription or upload error:', error);
            setTranscriptionError("Bei der Verarbeitung der Aufnahme ist ein Fehler aufgetreten.");
        } finally {
            setIsTranscribing(false);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setTranscriptionError("Mikrofonzugriff verweigert. Bitte erlauben Sie den Zugriff in Ihren Browsereinstellungen.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  
  const handleNewDocument = () => {
    onNew(); 
    setNotes('');
    setGeneratedDoc('');
    setDocumentTitle('');
    setCitations([]);
    toast({
        title: 'Neues Dokument',
        description: 'Sie können jetzt ein neues Dokument erstellen.'
    })
  };
  
  const handleSummarizeForClient = async () => {
    if (!generatedDoc.trim()) {
        toast({ variant: 'destructive', title: 'Kein Dokument', description: 'Es gibt kein Dokument zum Übersetzen.' });
        return;
    }
    setIsSummarizingForClient(true);
    setClientSummary('');
    setShowClientSummaryDialog(true);
    try {
        const result = await summarizeForClient({ documentContent: generatedDoc });
        setClientSummary(result.summary);
    } catch(error) {
        console.error('Client summary error:', error);
        toast({ variant: 'destructive', title: 'Übersetzung fehlgeschlagen', description: 'Die Zusammenfassung konnte nicht erstellt werden.' });
        setShowClientSummaryDialog(false);
    } finally {
        setIsSummarizingForClient(false);
    }
  }

  const copyToClipboard = (text: string, successMessage: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Kopiert', description: successMessage });
  }

  const isBusy = isGenerating || isRecording || isTranscribing || isSaving || isSuggesting;

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
                <CardTitle className="flex items-center gap-2">
                <Icons.Gavel className="h-6 w-6" />
                KI-Generator
                </CardTitle>
                <CardDescription>
                Nutzen Sie /vorlage [Name] für Dokumentvorlagen und /einfügen [Kürzel] für Textbausteine.
                </CardDescription>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={handleNewDocument} disabled={isBusy}>
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Neues Dokument
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2">
              <div>
                <Label htmlFor="notes">Fallnotizen / Aktenvermerk / Diktat</Label>
                <Textarea
                    id="notes"
                    placeholder="Geben Sie hier Ihre Notizen ein oder starten Sie ein Diktat, um diesen Bereich automatisch zu füllen."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2 min-h-[150px]"
                    disabled={isBusy}
                />
              </div>

              {isRecording ? (
                <div className="rounded-lg border bg-secondary p-4 flex flex-col items-center justify-center text-center">
                   <div className="flex items-center gap-3 text-destructive">
                       <Mic className="animate-pulse" />
                       <span className="text-xl font-mono tabular-nums">{formatRecordingTime(recordingTime)}</span>
                   </div>
                   <p className="text-sm text-muted-foreground mt-1 mb-4">Aufnahme läuft...</p>
                   <Button onClick={stopRecording} variant="destructive" size="lg" className="rounded-full w-24 h-24 shadow-lg">
                       <Square className="h-8 w-8 fill-white" />
                       <span className="sr-only">Aufnahme stoppen</span>
                   </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-6 flex flex-col items-center justify-center text-center">
                    <div className="mb-4">
                        <Button onClick={startRecording} size="lg" disabled={isBusy} variant="outline">
                            <Mic className="mr-2 h-5 w-5" />
                            Diktat starten
                        </Button>
                    </div>
                     <p className="text-xs text-muted-foreground">Oder geben Sie Ihre Notizen manuell oben ein.</p>
                </div>
              )}
            

               {transcriptionError && (
                <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Fehler bei der Aufnahme</AlertTitle>
                    <AlertDescription>{transcriptionError}</AlertDescription>
                </Alert>
              )}
               {isTranscribing && (
                 <div className="flex items-center justify-center gap-2 text-sm text-primary animate-pulse pt-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Transkription wird verarbeitet...</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="document-title">Dokumententitel</Label>
                <Input 
                    id="document-title"
                    placeholder="Geben Sie hier den Titel des Dokuments ein..."
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    disabled={isBusy}
                />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="generated-doc">Generiertes Dokument</Label>
              <div className="relative flex-1">
                 <Textarea
                    id="generated-doc"
                    placeholder="Das KI-generierte Dokument wird hier angezeigt..."
                    value={generatedDoc}
                    onChange={(e) => setGeneratedDoc(e.target.value)}
                    className="min-h-[200px] h-full"
                    readOnly={isBusy}
                />
                {isGenerating && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-md transition-opacity duration-300">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Dokument wird generiert...</p>
                    </div>
                )}
              </div>
              <Button 
                variant="link" 
                onClick={handleSummarizeForClient} 
                disabled={isBusy || !generatedDoc}
                className="self-end mt-2"
                >
                    <Languages className="mr-2 h-4 w-4" />
                    Für Mandanten übersetzen
                </Button>
            </div>
        </div>

        {(isSuggesting || citations.length > 0) && (
            <div className="space-y-4">
                 <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpenCheck className="h-5 w-5 text-primary" />
                    KI-Vorschläge für Zitate & Paragrafen
                 </h3>
                 {isSuggesting ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Suche nach relevanten Paragrafen und Urteilen...</span>
                    </div>
                 ) : (
                    <Accordion type="multiple" className="w-full">
                        {citations.map((citation, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-semibold py-1 px-2 rounded-full ${citation.type === 'paragraph' ? 'bg-primary/10 text-primary' : 'bg-accent/20 text-accent-foreground'}`}>
                                            {citation.type === 'paragraph' ? '§' : 'Urteil'}
                                        </span>
                                        <span>{citation.citation}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{citation.explanation}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                 )}
            </div>
        )}

         <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2">
            <Button onClick={handleSave} disabled={isSaving || !generatedDoc || !documentTitle} variant="outline" className="w-full sm:w-auto">
                {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Save className="mr-2 h-4 w-4" />
                )}
                Dokument speichern
            </Button>
            <Button onClick={handleGenerate} disabled={isBusy || !notes} className="w-full sm:w-auto">
                {isGenerating || isSuggesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Wand2 className="mr-2 h-4 w-4" />
                )}
                Aus Notizen generieren
            </Button>
            </div>
      </CardContent>
    </Card>

    <Dialog open={showClientSummaryDialog} onOpenChange={setShowClientSummaryDialog}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
            <DialogTitle>Mandantenfreundliche Zusammenfassung</DialogTitle>
            <DialogDescription>
                Eine vereinfachte Version des Dokuments zur Weitergabe an Ihren Mandanten.
            </DialogDescription>
            </DialogHeader>
            <div className="relative mt-4 min-h-[300px] max-h-[60vh] overflow-y-auto rounded-md border bg-secondary/30 p-4">
                {isSummarizingForClient ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-md transition-opacity duration-300">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Dokument wird übersetzt...</p>
                    </div>
                ) : (
                    <p className="text-sm text-secondary-foreground whitespace-pre-wrap">
                        {clientSummary}
                    </p>
                )}
            </div>
             <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => copyToClipboard(clientSummary, 'Die Zusammenfassung wurde in die Zwischenablage kopiert.')} disabled={isSummarizingForClient || !clientSummary}>
                    <Copy className="mr-2 h-4 w-4" />
                    Text kopieren
                </Button>
            </div>
        </DialogContent>
    </Dialog>
    </>
  );
}

    