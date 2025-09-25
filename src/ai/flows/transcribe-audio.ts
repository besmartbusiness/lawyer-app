
'use server';

/**
 * @fileOverview A flow to transcribe audio to text.
 *
 * - transcribeAudio - A function that transcribes audio.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  text: z.string().describe('The transcribed text.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

const transcribeAudioFlow = ai.defineFlow(
    {
      name: 'transcribeAudioFlow',
      inputSchema: TranscribeAudioInputSchema,
      outputSchema: TranscribeAudioOutputSchema,
    },
    async (input) => {
        const {text} = await ai.generate({
            model: vertexAI.model('gemini-1.5-flash'),
            prompt: [
              {
                text: 'Transkribieren Sie die folgende Audiodatei auf Deutsch. Konzentrieren Sie sich nur auf den gesprochenen Text und lassen Sie alle Füllwörter oder Geräusche weg.',
              },
              {
                media: {
                  url: input.audioDataUri,
                },
              },
            ],
          });

          return {
            text
          }
    }
  );
