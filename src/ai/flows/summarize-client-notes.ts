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

const SummarizeClientNotesInputSchema = z.object({
  notes: z
    .string()
    .describe('The client notes to be summarized.'),
});
export type SummarizeClientNotesInput = z.infer<typeof SummarizeClientNotesInputSchema>;

const SummarizeClientNotesOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the client notes.'),
});
export type SummarizeClientNotesOutput = z.infer<typeof SummarizeClientNotesOutputSchema>;

export async function summarizeClientNotes(input: SummarizeClientNotesInput): Promise<SummarizeClientNotesOutput> {
  return summarizeClientNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeClientNotesPrompt',
  input: {schema: SummarizeClientNotesInputSchema},
  output: {schema: SummarizeClientNotesOutputSchema},
  prompt: `You are an expert legal assistant. Please summarize the following client notes into a concise and easy-to-understand summary:\n\nNotes: {{{notes}}}`,
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
