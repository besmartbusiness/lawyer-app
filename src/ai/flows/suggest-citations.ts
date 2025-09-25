
'use server';
/**
 * @fileOverview A flow to suggest relevant legal citations based on a given context.
 *
 * - suggestCitations - A function that suggests citations.
 * - SuggestCitationsInput - The input type for the suggestCitations function.
 * - SuggestCitationsOutput - The return type for the suggestCitations function.
 * - Citation - The type for a single citation suggestion.
 */

import {ai} from '@/ai/genkit';
import {vertexAI} from '@genkit-ai/vertexai';
import {z} from 'genkit';

const SuggestCitationsInputSchema = z.object({
  context: z.string().describe('Der juristische Sachverhalt oder die Fallnotizen, für die relevante Paragrafen und Urteile gefunden werden sollen.'),
});
export type SuggestCitationsInput = z.infer<typeof SuggestCitationsInputSchema>;

const CitationSchema = z.object({
    type: z.enum(['paragraph', 'judgment']).describe('Die Art des Zitats: "paragraph" für einen Gesetzesparagrafen oder "judgment" für ein Gerichtsurteil.'),
    citation: z.string().describe('Die exakte Bezeichnung des Paragrafen (z.B. "§ 536 BGB") oder das Aktenzeichen des Urteils (z.B. "BGH, Urteil vom 27.09.2017 - XII ZB 601/15").'),
    explanation: z.string().describe('Eine kurze, prägnante Erklärung, warum dieser Paragraf oder dieses Urteil für den gegebenen Kontext relevant ist, idealerweise mit dem Leitsatz des Urteils.'),
});
export type Citation = z.infer<typeof CitationSchema>;

const SuggestCitationsOutputSchema = z.object({
  suggestions: z.array(CitationSchema).describe('Eine Liste von vorgeschlagenen juristischen Zitaten, einschließlich Paragrafen und relevanter Gerichtsentscheidungen.'),
});
export type SuggestCitationsOutput = z.infer<typeof SuggestCitationsOutputSchema>;

export async function suggestCitations(input: SuggestCitationsInput): Promise<SuggestCitationsOutput> {
  return suggestCitationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCitationsPrompt',
  model: vertexAI.model('gemini-2.5-pro'),
  input: {schema: SuggestCitationsInputSchema},
  output: {schema: SuggestCitationsOutputSchema},
  prompt: `Sie sind ein hochqualifizierter KI-Rechtsassistent für deutsches Recht. Ihre Aufgabe ist es, den folgenden juristischen Sachverhalt zu analysieren und eine Liste relevanter Gesetzesparagrafen und wegweisender Gerichtsentscheidungen vorzuschlagen.

**Anweisungen:**
1.  **Analysieren Sie den Kontext:** Lesen Sie den folgenden Sachverhalt sorgfältig durch und identifizieren Sie die zentralen rechtlichen Fragestellungen.
2.  **Schlagen Sie Paragrafen vor:** Finden Sie relevante Paragrafen aus deutschen Gesetzbüchern (z.B. BGB, StGB, ZPO). Geben Sie für jeden Paragrafen eine kurze Begründung, warum er anwendbar ist.
3.  **Schlagen Sie Urteile vor:** Recherchieren Sie passende, möglichst aktuelle und relevante Urteile von deutschen Gerichten (insbesondere BGH, OLG, etc.). Geben Sie das Aktenzeichen, das Gericht und das Datum an und erklären Sie kurz die Relevanz des Urteils für den Fall, idealerweise durch Nennung des Leitsatzes.
4.  **Strukturieren Sie die Ausgabe:** Geben Sie eine Liste von Vorschlägen zurück. Unterscheiden Sie klar zwischen Paragrafen ('paragraph') und Urteilen ('judgment').

**Zu analysierender Sachverhalt:**
{{{context}}}`,
});

const suggestCitationsFlow = ai.defineFlow(
  {
    name: 'suggestCitationsFlow',
    inputSchema: SuggestCitationsInputSchema,
    outputSchema: SuggestCitationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
