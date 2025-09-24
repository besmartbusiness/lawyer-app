
'use server';
/**
 * @fileOverview A flow to provide predictive analysis on legal cases.
 *
 * - predictiveAnalysis - A function that generates a predictive analysis.
 * - PredictiveAnalysisInput - The input type for the predictiveAnalysis function.
 * - PredictiveAnalysisOutput - The return type for the predictiveAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const PredictiveAnalysisInputSchema = z.object({
  courtLocation: z.string().describe('Der Gerichtsort, an dem der Fall verhandelt wird (z.B. "OLG München", "AG Mannheim").'),
  legalArea: z.string().describe('Das betreffende Rechtsgebiet (z.B. "Mietrecht", "Arbeitsrecht", "Verkehrsrecht").'),
  coreArgument: z.string().describe('Die juristische Kernaussage des eigenen Antrags oder der Verteidigung (z.B. "Verjährungseinrede", "Arglistige Täuschung", "Fristlose Kündigung wegen Zahlungsverzug").'),
  caseSummary: z.string().describe('Eine kurze Zusammenfassung des Sachverhalts zur Einordnung.'),
});
export type PredictiveAnalysisInput = z.infer<typeof PredictiveAnalysisInputSchema>;

const PredictiveAnalysisOutputSchema = z.object({
  argumentStrength: z.array(z.object({
    argument: z.string().describe('Das analysierte juristische Argument.'),
    successRate: z.number().int().min(0).max(100).describe('Die aus der Recherche abgeleitete, geschätzte Erfolgsquote dieses Arguments in ähnlichen Fällen vor dem genannten Gericht, in Prozent.'),
    analysis: z.string().describe('Eine kurze, datengestützte Analyse, warum das Argument diese Erfolgsquote hat, basierend auf den gefundenen Quellen.'),
    sources: z.array(z.string()).describe('Referenzen oder Aktenzeichen von gefundenen Vergleichsfällen, die die Analyse stützen.')
  })).describe('Eine Analyse der Stärke der Kernargumente basierend auf einer Internet-Recherche nach echten Vergleichsfällen.'),
  
  judgeAnalysis: z.array(z.object({
    judgeName: z.string().describe('Der Name des Richters oder der Kammer, falls bekannt/relevant. Kann auch allgemein für das Gericht gehalten sein.'),
    analysis: z.string().describe('Eine Analyse der Tendenzen oder Schwerpunkte dieses Richters oder Gerichts, basierend auf gefundenen, vergangenen Urteilen oder Fachartikeln.'),
  })).describe('Eine Analyse der bekannten Tendenzen des Gerichts oder spezifischer Richter, basierend auf Recherche.'),

  successPrediction: z.object({
    percentage: z.number().int().min(0).max(100).describe('Die prognostizierte Gesamterfolgswahrscheinlichkeit für den Fall, in Prozent, basierend auf den Rechercheergebnissen.'),
    rationale: z.string().describe('Eine detaillierte Begründung für die Prognose, die die Stärken und Schwächen des Falles basierend auf den gefundenen Vergleichsfällen abwägt.'),
    recommendation: z.string().describe('Eine konkrete strategische Handlungsempfehlung auf Basis der Prognose (z.B. Vergleich anstreben, Klage einreichen).'),
  }).describe('Eine prozentuale Einschätzung der Gesamterfolgsaussichten mit Begründung, gestützt auf echte Daten.'),
});
export type PredictiveAnalysisOutput = z.infer<typeof PredictiveAnalysisOutputSchema>;


export async function predictiveAnalysis(input: PredictiveAnalysisInput): Promise<PredictiveAnalysisOutput> {
  return predictiveAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveAnalysisPrompt',
  input: {schema: PredictiveAnalysisInputSchema},
  output: {schema: PredictiveAnalysisOutputSchema},
  tools: [googleAI.googleSearch],
  prompt: `Sie sind ein hochspezialisiertes KI-Modell für prädiktive juristische Analysen in Deutschland. Ihre Aufgabe ist es, eine datengestützte, realistische Einschätzung der Erfolgschancen eines Falles zu geben. Nutzen Sie dafür zwingend das 'googleSearch' Tool, um das Internet nach echten, vergleichbaren Fällen, Urteilen und Fachartikeln zu durchsuchen.

**Anweisungen:**
1.  **Analysieren Sie den Input:** Nehmen Sie Gerichtsort, Rechtsgebiet, Kernargument und die Fallzusammenfassung.
2.  **Führen Sie eine Websuche durch:** Nutzen Sie das 'googleSearch' Tool, um nach passenden, anonymisierten Urteilen und juristischen Analysen in deutschen Datenbanken (z.B. JURIS, Beck-Online, OpenJur) zu suchen. Suchen Sie nach Mustern bei dem angegebenen Gericht oder in dem Rechtsgebiet.
3.  **Argumenten-Stärke:** Bewerten Sie das Kernargument basierend auf den Recherche-Ergebnissen. Leiten Sie eine geschätzte, prozentuale Erfolgsquote für ähnliche Fälle ab. Begründen Sie die Quote kurz und nennen Sie Aktenzeichen oder Quellen als Beleg.
4.  **Richter-Analyse:** Suchen Sie nach Informationen über die Entscheidungspraxis des spezifischen Gerichts oder, falls möglich, einzelner Richter in diesem Rechtsgebiet. Fassen Sie die Tendenzen zusammen.
5.  **Gesamtprognose:** Erstellen Sie eine prozentuale Gesamterfolgsaussicht. Leiten Sie diese logisch aus den Stärken und Schwächen des Falles ab, wie sie sich aus den Recherche-Ergebnissen ergeben. Geben Sie eine klare strategische Empfehlung.
6.  **Tonfall:** Seien Sie professionell, objektiv und datenorientiert. Formulieren Sie so, als würden Sie auf eine riesige Datenbank von echten Fällen zugreifen, die Sie gerade durchsucht haben.

**Zu analysierender Fall:**
*   Gerichtsort: {{{courtLocation}}}
*   Rechtsgebiet: {{{legalArea}}}
*   Kernargument: {{{coreArgument}}}
*   Zusammenfassung: {{{caseSummary}}}
`,
});

const predictiveAnalysisFlow = ai.defineFlow(
  {
    name: 'predictiveAnalysisFlow',
    inputSchema: PredictiveAnalysisInputSchema,
    outputSchema: PredictiveAnalysisOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);

      if (!output) {
        throw new Error("Keine Ausgabe vom KI-Modell erhalten.");
      }

      return output;

    } catch (e: any) {
      console.error("Fehler bei der Ausführung des Prompts:", e);
      throw new Error(`Die prädiktive Analyse konnte nicht generiert werden: ${e.message}`);
    }
  }
);
