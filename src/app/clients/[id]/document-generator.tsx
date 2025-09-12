
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { Loader2, Wand2, Save, Mic, MicOff, AlertCircle, FilePlus2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateLegalDocument } from '@/ai/flows/generate-legal-document-from-notes';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

type Document = {
  id: string;
  title: string;
  createdAt: string;
  content: string;
  notes: string;
};

type DocumentGeneratorProps = {
  clientNotes: string;
  onSave: (doc: { title: string; content: string; notes: string }) => void;
  onNew: () => void;
  selectedDocument: Document | null;
};

export function DocumentGenerator({ clientNotes, onSave, onNew, selectedDocument }: DocumentGeneratorProps) {
  const [notes, setNotes] = useState(clientNotes);
  const [documentTitle, setDocumentTitle] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedDocument) {
      setNotes(selectedDocument.notes);
      setGeneratedDoc(selectedDocument.content);
      setDocumentTitle(selectedDocument.title);
    } else {
        // Clear fields when there is no selected document or when creating a new one
        setNotes(clientNotes);
        setGeneratedDoc('');
        setDocumentTitle('');
    }
  }, [selectedDocument, clientNotes]);


  const handleGenerate = async () => {
    if (!notes.trim()) {
      toast({
        variant: 'destructive',
        title: 'Eingabe erforderlich',
        description: 'Bitte geben Sie Fallnotizen ein, um ein Dokument zu generieren.',
      });
      return;
    }
    setIsGenerating(true);
    setGeneratedDoc('');
    try {
      const result = await generateLegalDocument({ notes });
      setGeneratedDoc(result.document);
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

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    setTranscriptionError(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        
        let chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        mediaRecorder.onstart = () => {
            setIsRecording(true);
        };
        
        mediaRecorder.onstop = async () => {
          setIsRecording(false);
          setIsTranscribing(true);
          toast({ title: 'Aufnahme beendet', description: 'Transkription wird verarbeitet...' });
          
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          chunks = [];
          stream.getTracks().forEach(track => track.stop());

          try {
            const audioDataUri = await blobToBase64(audioBlob);
            const transcriptionResult = await transcribeAudio({ audioDataUri });
            const transcribedNotes = transcriptionResult.text;
            
            setNotes(prev => prev ? `${prev}\n\n${transcribedNotes}` : transcribedNotes);
            toast({ title: 'Transkription erfolgreich', description: 'Notizen aktualisiert. Starte Dokumentengenerierung...' });

            setIsTranscribing(false);
            setIsGenerating(true);
            setGeneratedDoc('');

            try {
                const result = await generateLegalDocument({ notes: transcribedNotes });
                setGeneratedDoc(result.document);
                if (!documentTitle) {
                  setDocumentTitle("Entwurf nach Diktat");
                }
              } catch (error) {
                console.error(error);
                toast({
                  variant: 'destructive',
                  title: 'Generierung fehlgeschlagen',
                  description: 'Beim Generieren des Dokuments nach Diktat ist ein Fehler aufgetreten.',
                });
              } finally {
                setIsGenerating(false);
              }

          } catch (error) {
            console.error('Transcription error:', error);
            setTranscriptionError("Bei der Transkription ist ein Fehler aufgetreten.");
            setIsTranscribing(false);
          }
        };
        
        mediaRecorder.start();
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setTranscriptionError("Mikrofonzugriff verweigert. Bitte erlauben Sie den Zugriff in Ihren Browsereinstellungen.");
      }
    } else {
        setTranscriptionError("Ihr Browser unterstützt keine Audioaufnahmen.");
    }
  };
  
  const handleNewDocument = () => {
    onNew(); // This will trigger the parent to clear the selected doc
    setNotes(clientNotes);
    setGeneratedDoc('');
    setDocumentTitle('');
    toast({
        title: 'Neues Dokument',
        description: 'Sie können jetzt ein neues Dokument erstellen.'
    })
  };

  const isBusy = isGenerating || isRecording || isTranscribing || isSaving;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                <Icons.Gavel className="h-6 w-6" />
                KI-Dokumentengenerator
                </CardTitle>
                <CardDescription>
                Erstellen oder diktieren Sie Entwürfe für juristische Dokumente.
                </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleNewDocument} disabled={isBusy}>
                <FilePlus2 className="mr-2 h-4 w-4" />
                Neues Dokument
            </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="notes">Fallnotizen / Aktenvermerk</Label>
                <Button variant="ghost" size="icon" onClick={handleToggleRecording} title={isRecording ? "Aufnahme stoppen" : "Diktat starten"} disabled={isBusy}>
                  {isRecording ? <MicOff className="text-destructive" /> : <Mic />}
                </Button>
              </div>
              <Textarea
                id="notes"
                placeholder="Geben Sie hier Notizen ein oder starten Sie ein Diktat..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[200px] h-full"
                disabled={isBusy}
              />
               {transcriptionError && (
                <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Fehler bei der Aufnahme</AlertTitle>
                    <AlertDescription>{transcriptionError}</AlertDescription>
                </Alert>
              )}
              {isRecording && (
                 <div className="flex items-center gap-2 text-sm text-destructive animate-pulse pt-2">
                    <Mic className="h-4 w-4" />
                    <span>Aufnahme läuft...</span>
                </div>
              )}
               {isTranscribing && (
                 <div className="flex items-center gap-2 text-sm text-primary animate-pulse pt-2">
                    <FileText className="h-4 w-4" />
                    <span>Transkription wird verarbeitet...</span>
                </div>
              )}
            </div>
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="document-title">Dokumententitel</Label>
              <Input 
                id="document-title"
                placeholder="Geben Sie hier den Titel des Dokuments ein..."
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                disabled={isBusy}
              />
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
            </div>
        </div>
         <div className="flex items-center justify-end gap-2">
            <Button onClick={handleGenerate} disabled={isBusy}>
                {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Wand2 className="mr-2 h-4 w-4" />
                )}
                Aus Notizen generieren
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !generatedDoc || !documentTitle} variant="outline">
                {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Save className="mr-2 h-4 w-4" />
                )}
                Dokument speichern
            </Button>
            </div>
      </CardContent>
    </Card>
  );
}
