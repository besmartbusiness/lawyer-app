import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-client-notes.ts';
import '@/ai/flows/generate-legal-document-from-notes.ts';
import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/get-text-blocks.ts';
