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

const GenerateLegalDocumentInputSchema = z.object({
  notes: z.string().describe('Die Fallnotizen, entweder aus einer Sprachaufnahme oder einer Texteingabe.'),
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
  input: {schema: GenerateLegalDocumentInputSchema},
  output: {schema: GenerateLegalDocumentOutputSchema},
  tools: [getTextBlocksTool],
  prompt: `Sie sind ein KI-Rechtsassistent für eine deutsche Anwaltskanzlei. Erstellen Sie auf Basis der folgenden Fallnotizen ein formelles juristisches Dokument in deutscher Sprache. 
  
Achten Sie auf eine professionelle Ausdrucksweise, korrekte juristische Terminologie und fügen Sie, wo sinnvoll, Absatz- oder Paragraph-Zitate hinzu.

Wenn Sie in den Notizen einen Befehl im Format "/einfügen [Kürzel]" entdecken, verwenden Sie das 'getTextBlockByName'-Tool, um den entsprechenden kanzlei-eigenen Textbaustein abzurufen. Fügen Sie den Inhalt dieses Textbausteins nahtlos und kontextbezogen in das Dokument ein. Geben Sie keine Fehlermeldungen aus, die vom Tool zurückgegeben werden könnten.

Fallnotizen: {{{notes}}}`,
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
