import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-client-notes.ts';
import '@/ai/flows/generate-legal-document-from-notes.ts';
import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/get-text-blocks.ts';
import '@/ai/flows/get-document-templates.ts';
import '@/ai/flows/summarize-text.ts';
import '@/ai/flows/suggest-citations.ts';
import '@/ai/flows/summarize-for-client.ts';
import '@/ai/flows/generate-case-strategy.ts';
