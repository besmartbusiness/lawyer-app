'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, BookText, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeText } from '@/ai/flows/summarize-text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function SummaryGenerator() {
  const [textToSummarize, setTextToSummarize] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!textToSummarize.trim()) {
      toast({
        variant: 'destructive',
        title: 'Eingabe erforderlich',
        description: 'Bitte fügen Sie den zu analysierenden Text ein.',
      });
      return;
    }

    setIsSummarizing(true);
    setSummary('');

    try {
      const result = await summarizeText({ textToSummarize });
      setSummary(result.summary);
    } catch (error) {
      console.error('Summarization error:', error);
      toast({
        variant: 'destructive',
        title: 'Zusammenfassung fehlgeschlagen',
        description: 'Bei der Analyse des Textes ist ein Fehler aufgetreten.',
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookText className="h-6 w-6" />
          KI-Akten-Scanner
        </CardTitle>
        <CardDescription>
          Fügen Sie den Inhalt eines Dokuments ein, um eine KI-gestützte Zusammenfassung zu erhalten.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="text-to-summarize">Zu analysierender Text</Label>
            <Textarea
              id="text-to-summarize"
              placeholder="Fügen Sie hier den Text aus einem Schriftsatz, einer E-Mail oder einem anderen Dokument ein..."
              value={textToSummarize}
              onChange={(e) => setTextToSummarize(e.target.value)}
              className="min-h-[300px] h-full"
              disabled={isSummarizing}
            />
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="summary">KI-Zusammenfassung</Label>
            <div className="relative flex-1">
              <Textarea
                id="summary"
                placeholder="Die Zusammenfassung der KI wird hier angezeigt..."
                value={summary}
                readOnly
                className="min-h-[300px] h-full bg-secondary/50"
              />
              {isSummarizing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Text wird analysiert...</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSummarize} disabled={isSummarizing || !textToSummarize.trim()}>
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
