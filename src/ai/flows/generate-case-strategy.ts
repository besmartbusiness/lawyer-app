
'use server';
/**
 * @fileOverview A flow to analyze multiple documents and generate a case strategy.
 *
 * - generateCaseStrategy - A function that creates a strategic analysis.
 * - CaseStrategyInput - The input type for the generateCaseStrategy function.
 * - CaseStrategyOutput - The return type for the generateCaseStrategy function.
 */

import {ai} from '@/ai/genkit';
import {vertexAI} from '@genkit-ai/vertexai';
import {z} from 'genkit';

const CaseStrategyInputSchema = z.object({
    documents: z.array(z.string().describe("A document (PDF), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.")).describe("Eine Liste von Dokumenten (z.B. Klageschriften, E-Mail-Verkehr, Verträge), die die Grundlage des Falles bilden."),
    caseSummary: z.string().describe("Eine kurze, vom Anwalt bereitgestellte Zusammenfassung des Falles oder der Mandantenziele."),
});
export type CaseStrategyInput = z.infer<typeof CaseStrategyInputSchema>;

const CaseStrategyOutputSchema = z.object({
  timeline: z.array(z.object({
    date: z.string().describe("Das Datum des Ereignisses im Format YYYY-MM-DD."),
    event: z.string().describe("Eine kurze Beschreibung des Ereignisses."),
  })).describe("Ein chronologischer Zeitstrahl der wichtigsten Ereignisse aus den Dokumenten."),
  
  disputedPoints: z.array(z.object({
    point: z.string().describe("Ein identifizierter juristischer Streitpunkt."),
    explanation: z.string().describe("Eine kurze Erklärung, warum dies ein zentraler Punkt ist."),
  })).describe("Eine Liste der juristischen Kernfragen und Streitpunkte im Fall."),

  evidenceAnalysis: z.array(z.object({
    evidence: z.string().describe("Das vorhandene Beweismittel (z.B. 'Vertrag vom 15.01.2024')."),
    status: z.enum(['available', 'missing']).describe("Der Status des Beweismittels."),
    suggestion: z.string().optional().describe("Ein Vorschlag, wie ein fehlendes Beweismittel beschafft werden kann (z.B. 'Zeugenaussage von Herrn Meier anfordern')."),
  })).describe("Eine Analyse der vorhandenen und fehlenden Beweismittel."),

  argumentOutline: z.array(z.object({
    section: z.string().describe("Ein Hauptpunkt oder Abschnitt in der Gliederung (z.B. 'I. Anspruch auf Kaufpreiszahlung')."),
    arguments: z.array(z.string()).describe("Die unterstützenden Argumente für diesen Abschnitt."),
  })).describe("Eine erste Gliederung für einen Schriftsatz, basierend auf den stärksten Argumenten."),
});

export type CaseStrategyOutput = z.infer<typeof CaseStrategyOutputSchema>;


export async function generateCaseStrategy(input: CaseStrategyInput): Promise<CaseStrategyOutput> {
  return generateCaseStrategyFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateCaseStrategyPrompt',
  model: vertexAI.model('gemini-2.5-pro'),
  input: {schema: CaseStrategyInputSchema},
  output: {schema: CaseStrategyOutputSchema},
  prompt: `Sie sind ein hochqualifizierter strategischer KI-Assistent (Konzipient) für eine deutsche Spitzenkanzlei. Ihre Aufgabe ist es, aus den bereitgestellten Dokumenten und einer Fallzusammenfassung eine umfassende strategische Analyse für den bearbeitenden Anwalt zu erstellen.

**Anweisungen:**
Analysieren Sie die folgenden Dokumente und die Zusammenfassung des Falls sorgfältig. Extrahieren und strukturieren Sie die Informationen, um die folgenden vier Analysebereiche zu erstellen:

1.  **Zeitstrahl der Ereignisse:** Erstellen Sie eine chronologische Auflistung aller wichtigen Daten und Fakten aus den Dokumenten. Fassen Sie die Ereignisse kurz und prägnant zusammen.

2.  **Identifizierte Streitpunkte:** Identifizieren Sie die juristischen Kernfragen des Falles. Formulieren Sie diese als klare Streitpunkte (z.B. "Wurde die Frist für die Mängelrüge eingehalten?", "Liegt ein Sachmangel gemäß § 434 BGB vor?"). Erklären Sie kurz, warum jeder Punkt relevant ist.

3.  **Beweismittel-Analyse:** Listen Sie alle in den Dokumenten erwähnten, relevanten Beweismittel auf (z.B. Verträge, E-Mails, Zeugen). Markieren Sie für jedes Beweismittel, ob es vorhanden ('available') oder noch zu beschaffen ('missing') ist. Wenn ein Beweismittel fehlt, machen Sie einen konkreten Vorschlag, wie es beschafft werden könnte (z.B. "Anforderung des Übergabeprotokolls", "Benennung von Frau Müller als Zeugin").

4.  **Erste Argumentations-Skizze:** Basierend auf den stärksten Argumenten für die Position des Mandanten, erstellen Sie eine Gliederung für einen möglichen ersten Schriftsatz. Strukturieren Sie diese Gliederung logisch mit Haupt- und Unterpunkten.

**Fallzusammenfassung des Anwalts:**
{{{caseSummary}}}

**Hochgeladene Dokumente:**
{{#each documents}}
--- Dokument Start ---
{{media url=this}}
--- Dokument Ende ---
{{/each}}
`,
});

const generateCaseStrategyFlow = ai.defineFlow(
  {
    name: 'generateCaseStrategyFlow',
    inputSchema: CaseStrategyInputSchema,
    outputSchema: CaseStrategyOutputSchema,
  },
  async input => {
    if (!input.documents || input.documents.length === 0) {
      throw new Error("At least one document is required for analysis.");
    }
    const {output} = await prompt(input);
    return output!;
  }
);
