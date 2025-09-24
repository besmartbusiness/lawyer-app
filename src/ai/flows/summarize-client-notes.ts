
'use server';

/**
 * @fileOverview Summarizes client notes into a concise summary for quick review.
 *
 * - summarizeClientNotes - A function that takes client notes as input and returns a summarized version.
 * - SummarizeClientNotesInput - The input type for the summarizeClientNotes function.
 * - SummarizeClientNotesOutput - The return type for the summarizeClientNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';

const SummarizeClientNotesInputSchema = z.object({
  notes: z
    .string()
    .describe('Die zu zusammenfassenden Mandantennotizen.'),
});
export type SummarizeClientNotesInput = z.infer<typeof SummarizeClientNotesInputSchema>;

const SummarizeClientNotesOutputSchema = z.object({
  summary: z.string().describe('Eine prägnante Zusammenfassung der Mandantennotizen.'),
});
export type SummarizeClientNotesOutput = z.infer<typeof SummarizeClientNotesOutputSchema>;

export async function summarizeClientNotes(input: SummarizeClientNotesInput): Promise<SummarizeClientNotesOutput> {
  return summarizeClientNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeClientNotesPrompt',
  model: vertexAI.model('gemini-2.5-pro'),
  input: {schema: SummarizeClientNotesInputSchema},
  output: {schema: SummarizeClientNotesOutputSchema},
  prompt: `Sie sind ein erfahrener juristischer Assistent in einer deutschen Anwaltskanzlei. Fassen Sie die folgenden Mandantennotizen prägnant, strukturiert und verständlich auf Deutsch zusammen:\n\nNotizen: {{{notes}}}`,
});

const summarizeClientNotesFlow = ai.defineFlow(
  {
    name: 'summarizeClientNotesFlow',
    inputSchema: SummarizeClientNotesInputSchema,
    outputSchema: SummarizeClientNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
