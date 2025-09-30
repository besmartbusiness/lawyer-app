
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
  audioUrl: z
    .string()
    .describe(
      "A public URL to an audio file. This URL will be used to fetch the audio for transcription."
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
            model: vertexAI.model('gemini-2.5-pro'),
            prompt: [
              {
                text: 'Transkribieren Sie die folgende Audiodatei auf Deutsch. Konzentrieren Sie sich nur auf den gesprochenen Text und lassen Sie alle Füllwörter oder Geräusche weg.',
              },
              {
                media: {
                  url: input.audioUrl,
                },
              },
            ],
          });

          return {
            text
          }
    }
  );

    
