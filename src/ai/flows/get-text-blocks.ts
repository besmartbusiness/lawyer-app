
'use server';
/**
 * @fileOverview A tool for retrieving user-specific text blocks (templates).
 *
 * - getTextBlocksTool - The Genkit tool definition.
 * - getTextBlocks - A function to fetch text blocks from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase'; // Ensure firebase is initialized
import { TextBlock } from '@/lib/definitions';

// Get the currently authenticated user's ID
async function getCurrentUserId(): Promise<string | null> {
    // This is a server-side flow, so we can't use the useAuth hook.
    // In a real app, you'd get the user from the session/request context.
    // For this prototype, we'll assume a hardcoded user or find another way
    // to pass the userId to the flow.
    // For now, let's pass it into the tool input.
    return null;
}

export const getTextBlocksTool = ai.defineTool(
    {
        name: 'getTextBlockByName',
        description: 'Ruft einen kanzlei-eigenen Textbaustein anhand seines Namens/Kürzels ab, um ihn in ein Dokument einzufügen. Verwenden Sie dieses Tool, wenn der Benutzer einen Befehl wie "/einfügen [Kürzel]" verwendet.',
        inputSchema: z.object({
            name: z.string().describe('Der exakte Name/Kürzel des abzurufenden Textbausteins.'),
            userId: z.string().describe('Die ID des aktuellen Benutzers.'),
        }),
        outputSchema: z.string().describe('Der Inhalt des gefundenen Textbausteins oder eine Fehlermeldung, wenn er nicht gefunden wurde.'),
    },
    async ({ name, userId }) => {
        try {
            const db = getFirestore(app);
            const q = query(collection(db, "text_blocks"), where("userId", "==", userId), where("name", "==", name));
            
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                return `FEHLER: Der Textbaustein mit dem Kürzel "${name}" wurde nicht gefunden.`;
            }
            
            const doc = querySnapshot.docs[0];
            const textBlock = doc.data() as TextBlock;

            // Return the content, which will be inserted into the prompt by the LLM
            return textBlock.content;

        } catch (error) {
            console.error("Error fetching text block:", error);
            return `FEHLER: Beim Abrufen des Textbausteins "${name}" ist ein interner Fehler aufgetreten.`;
        }
    }
);
