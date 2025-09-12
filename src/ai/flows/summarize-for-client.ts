
'use server';
/**
 * @fileOverview A flow to summarize a legal document for a client in simple terms.
 *
 * - summarizeForClient - A function that simplifies a legal text.
 * - SummarizeForClientInput - The input type for the summarizeForClient function.
 * - SummarizeForClientOutput - The return type for the summarizeForClient function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeForClientInputSchema = z.object({
  documentContent: z.string().describe('Der juristische Dokumenteninhalt, der für einen Mandanten vereinfacht werden soll.'),
});
export type SummarizeForClientInput = z.infer<typeof SummarizeForClientInputSchema>;

const SummarizeForClientOutputSchema = z.object({
  summary: z.string().describe('Eine klare, einfache und leicht verständliche Zusammenfassung des Dokuments für einen Laien.'),
});
export type SummarizeForClientOutput = z.infer<typeof SummarizeForClientOutputSchema>;

export async function summarizeForClient(input: SummarizeForClientInput): Promise<SummarizeForClientOutput> {
  return summarizeForClientFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeForClientPrompt',
  input: {schema: SummarizeForClientInputSchema},
  output: {schema: SummarizeForClientOutputSchema},
  prompt: `Sie sind ein erfahrener Anwalt, der einem Mandanten einen komplexen juristischen Sachverhalt erklären muss. Ihre Aufgabe ist es, das folgende Dokument zu analysieren und dessen Inhalt in eine einfache, klare und leicht verständliche Sprache zu "übersetzen".

**Anweisungen:**
1.  **Vermeiden Sie juristischen Fachjargon:** Ersetzen Sie komplexe Begriffe durch alltägliche Worte.
2.  **Konzentrieren Sie sich auf das Wesentliche:** Was sind die Kernaussagen? Was bedeutet das konkret für den Mandanten? Was sind die nächsten Schritte?
3.  **Strukturieren Sie die Erklärung:** Verwenden Sie kurze Sätze, Absätze und ggf. Aufzählungszeichen, um die Lesbarkeit zu erhöhen.
4.  **Seien Sie beruhigend, aber ehrlich:** Vermitteln Sie die Informationen auf eine beruhigende, aber dennoch realistische Weise.
5.  **Anrede:** Sprechen Sie den Mandanten direkt an (z.B. "Das bedeutet für Sie...", "Wichtig für Sie ist...").

**Zu übersetzendes Dokument:**
{{{documentContent}}}`,
});

const summarizeForClientFlow = ai.defineFlow(
  {
    name: 'summarizeForClientFlow',
    inputSchema: SummarizeForClientInputSchema,
    outputSchema: SummarizeForClientOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
