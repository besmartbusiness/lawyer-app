
'use server';
/**
 * @fileOverview A flow to generate legal documents from notes.
 *
 * - generateLegalDocument - A function that generates a legal document from notes.
 * - GenerateLegalDocumentInput - The input type for the generateLegalDocument function.
 * - GenerateLegalDocumentOutput - The return type for the generateLegalDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getTextBlocksTool } from './get-text-blocks';
import { getDocumentTemplateTool } from './get-document-templates';
import vertexAI from '@genkit-ai/vertexai';

const GenerateLegalDocumentInputSchema = z.object({
  notes: z.string().describe('Die Fallnotizen, entweder aus einer Sprachaufnahme oder einer Texteingabe. Diese enthalten die Stammdaten des Falls (Parteien, Gericht, Aktenzeichen) und die inhaltlichen Anweisungen.'),
  userId: z.string().describe('Die ID des angemeldeten Benutzers, um auf seine Textbausteine zuzugreifen.'),
});
export type GenerateLegalDocumentInput = z.infer<typeof GenerateLegalDocumentInputSchema>;

const GenerateLegalDocumentOutputSchema = z.object({
  document: z.string().describe('Das generierte juristische Dokument mit professionellem Text und Absatz-Zitaten.'),
});
export type GenerateLegalDocumentOutput = z.infer<typeof GenerateLegalDocumentOutputSchema>;

export async function generateLegalDocument(input: GenerateLegalDocumentInput): Promise<GenerateLegalDocumentOutput> {
  return generateLegalDocumentFlow(input);
}

const generateLegalDocumentPrompt = ai.definePrompt({
  name: 'generateLegalDocumentPrompt',
  model: vertexAI.model('gemini-2.5-pro'),
  input: {schema: GenerateLegalDocumentInputSchema},
  output: {schema: GenerateLegalDocumentOutputSchema},
  tools: [getTextBlocksTool, getDocumentTemplateTool],
  prompt: `Sie sind ein hochqualifizierter KI-Rechtsassistent für eine deutsche Anwaltskanzlei. Ihre Aufgabe ist es, auf Basis von Fallnotizen formelle juristische Dokumente zu erstellen.

**Anweisungen:**
1.  **Rubrum & Formatierung:** Die Notizen enthalten einen Abschnitt "Fall-Stammdaten". Verwenden Sie diese Informationen (Kläger, Beklagter, Gericht, Aktenzeichen), um ein vollständiges und korrektes Rubrum am Anfang des Dokuments zu erstellen. Formatieren Sie das gesamte Dokument professionell nach gängigen deutschen Justiz-Standards (z.B. Schriftgröße, Zeilenabstand, Absätze, Hervorhebungen).
2.  **Dokumentenerstellung:** Erstellen Sie auf Basis der inhaltlichen Anweisungen und Stichpunkte in den Fallnotizen (nach den Stammdaten) ein formelles juristisches Dokument in deutscher Sprache. Achten Sie auf eine professionelle Ausdrucksweise, korrekte juristische Terminologie und fügen Sie, wo sinnvoll, Absatz- oder Paragraph-Zitate hinzu.
3.  **Verwendung von Dokumentvorlagen:** Wenn Sie in den Notizen einen Befehl im Format "/vorlage [Vorlagenname]" finden, verwenden Sie das 'getDocumentTemplateByName'-Tool, um die entsprechende kanzlei-eigene Dokumentvorlage abzurufen. Nutzen Sie diese Vorlage als Grundlage für das zu erstellende Dokument und füllen Sie die darin enthaltenen Platzhalter oder Abschnitte intelligent mit den restlichen Informationen aus den Notizen.
4.  **Verwendung von Textbausteinen:** Wenn Sie in den Notizen einen Befehl im Format "/einfügen [Kürzel]" entdecken, verwenden Sie das 'getTextBlockByName'-Tool, um den entsprechenden kanzlei-eigenen Textbaustein abzurufen. Fügen Sie den Inhalt dieses Textbausteins nahtlos und kontextbezogen in das Dokument ein.
5.  **Fehlerbehandlung:** Geben Sie keine Fehlermeldungen aus, die von den Tools zurückgegeben werden könnten. Ignorieren Sie Befehle für nicht gefundene Vorlagen oder Textbausteine.

**Fallnotizen (inkl. Stammdaten und inhaltliche Anweisungen):**
{{{notes}}}`,
});

const generateLegalDocumentFlow = ai.defineFlow(
  {
    name: 'generateLegalDocumentFlow',
    inputSchema: GenerateLegalDocumentInputSchema,
    outputSchema: GenerateLegalDocumentOutputSchema,
  },
  async input => {
    const {output} = await generateLegalDocumentPrompt(input);
    return output!;
  }
);

    