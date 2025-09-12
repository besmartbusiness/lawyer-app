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

const GenerateLegalDocumentInputSchema = z.object({
  notes: z.string().describe('Die Fallnotizen, entweder aus einer Sprachaufnahme oder einer Texteingabe.'),
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
  input: {schema: GenerateLegalDocumentInputSchema},
  output: {schema: GenerateLegalDocumentOutputSchema},
  prompt: `Sie sind ein KI-Rechtsassistent für eine deutsche Anwaltskanzlei. Erstellen Sie auf Basis der folgenden Fallnotizen ein formelles juristisches Dokument in deutscher Sprache. Achten Sie auf eine professionelle Ausdrucksweise, korrekte juristische Terminologie und fügen Sie, wo sinnvoll, Absatz- oder Paragraph-Zitate hinzu.\n\nFallnotizen: {{{notes}}}`,
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
