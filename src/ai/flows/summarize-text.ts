
'use server';
/**
 * @fileOverview A flow to summarize long legal texts or documents.
 *
 * - summarizeText - A function that summarizes text or a document.
 * - SummarizeTextInput - The input type for the summarizeText function.
 * - SummarizeTextOutput - The return type for the summarizeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTextInputSchema = z.object({
  textToSummarize: z.string().optional().describe('Der lange juristische Text (z.B. ein Schriftsatz oder eine Akte), der zusammengefasst werden soll.'),
  documentDataUri: z.string().optional().describe("Ein Dokument (PDF), als Daten-URI, der einen MIME-Typ und eine Base64-Kodierung enthalten muss. Erwartetes Format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type SummarizeTextInput = z.infer<typeof SummarizeTextInputSchema>;

const SummarizeTextOutputSchema = z.object({
  summary: z.string().describe('Eine prägnante, strukturierte Zusammenfassung des Textes, die die wichtigsten Argumente, Beweismittel und Anträge hervorhebt.'),
});
export type SummarizeTextOutput = z.infer<typeof SummarizeTextOutputSchema>;

export async function summarizeText(input: SummarizeTextInput): Promise<SummarizeTextOutput> {
  return summarizeTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTextPrompt',
  input: {schema: SummarizeTextInputSchema},
  output: {schema: SummarizeTextOutputSchema},
  prompt: `Sie sind ein hochqualifizierter KI-Rechtsassistent, spezialisiert auf die Analyse umfangreicher juristischer Dokumente in Deutschland. Ihre Aufgabe ist es, das folgende Dokument oder den folgenden Text zu analysieren und eine prägnante, strukturierte Zusammenfassung zu erstellen.

**Anweisungen:**
1.  **Identifizieren Sie die Kernaussagen:** Extrahieren Sie die zentralen rechtlichen Argumente und Positionen.
2.  **Listen Sie die Beweismittel:** Führen Sie die wichtigsten genannten Beweismittel (z.B. Zeugen, Dokumente, Sachverständigengutachten) auf.
3.  **Erfassen Sie die Anträge:** Stellen Sie die konkreten Anträge, die im Text gestellt werden, klar dar.
4.  **Strukturieren Sie die Ausgabe:** Gliedern Sie die Zusammenfassung übersichtlich in Abschnitte wie "Kernaussagen", "Beweismittel" und "Anträge".
5.  **Sprache:** Verwenden Sie präzise juristische Fachsprache und formulieren Sie die Zusammenfassung auf Deutsch.

{{#if textToSummarize}}
**Zu analysierender Text:**
{{{textToSummarize}}}
{{/if}}

{{#if documentDataUri}}
**Zu analysierendes Dokument:**
{{media url=documentDataUri}}
{{/if}}
`,
});

const summarizeTextFlow = ai.defineFlow(
  {
    name: 'summarizeTextFlow',
    inputSchema: SummarizeTextInputSchema,
    outputSchema: SummarizeTextOutputSchema,
  },
  async input => {
    if (!input.textToSummarize && !input.documentDataUri) {
      throw new Error("Either textToSummarize or documentDataUri must be provided.");
    }
    const {output} = await prompt(input);
    return output!;
  }
);
