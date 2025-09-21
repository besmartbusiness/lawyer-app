import {genkit} from 'genkit';
import {vertexAI} from '@genkit-ai/vertexai';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI(),
    vertexAI({
      location: 'europe-west1',
    }),
  ],
  model: 'vertexai/gemini-2.5-pro',
});
