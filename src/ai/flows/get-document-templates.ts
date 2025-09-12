
'use server';
/**
 * @fileOverview A tool for retrieving user-specific document templates.
 *
 * - getDocumentTemplateTool - The Genkit tool definition.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { TextBlock } from '@/lib/definitions';


export const getDocumentTemplateTool = ai.defineTool(
    {
        name: 'getDocumentTemplateByName',
        description: 'Ruft eine kanzlei-eigene Dokumentvorlage anhand ihres Namens ab, um sie als Basis für ein neues Dokument zu verwenden. Verwenden Sie dieses Tool, wenn der Benutzer einen Befehl wie "/vorlage [Vorlagenname]" verwendet.',
        inputSchema: z.object({
            name: z.string().describe('Der exakte Name der abzurufenden Dokumentvorlage.'),
            userId: z.string().describe('Die ID des aktuellen Benutzers.'),
        }),
        outputSchema: z.string().describe('Der Inhalt der gefundenen Dokumentvorlage oder eine Fehlermeldung, wenn sie nicht gefunden wurde.'),
    },
    async ({ name, userId }) => {
        try {
            const db = getFirestore(app);
            const q = query(collection(db, "doc_templates"), where("userId", "==", userId), where("name", "==", name));
            
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                return `FEHLER: Die Dokumentvorlage mit dem Namen "${name}" wurde nicht gefunden.`;
            }
            
            const doc = querySnapshot.docs[0];
            const template = doc.data() as TextBlock;

            // Return the content, which will be inserted into the prompt by the LLM
            return template.content;

        } catch (error) {
            console.error("Error fetching document template:", error);
            return `FEHLER: Beim Abrufen der Dokumentvorlage "${name}" ist ein interner Fehler aufgetreten.`;
        }
    }
);
