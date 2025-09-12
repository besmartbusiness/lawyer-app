
'use server';
/**
 * @fileOverview A flow to provide predictive analysis on legal cases.
 *
 * - predictiveAnalysis - A function that generates a predictive analysis.
 * - PredictiveAnalysisInput - The input type for the predictiveAnalysis function.
 * - PredictiveAnalysisOutput - The return type for the predictiveAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const PredictiveAnalysisInputSchema = z.object({
  courtLocation: z.string().describe('Der Gerichtsort, an dem der Fall verhandelt wird (z.B. "OLG München", "AG Mannheim").'),
  legalArea: z.string().describe('Das betreffende Rechtsgebiet (z.B. "Mietrecht", "Arbeitsrecht", "Verkehrsrecht").'),
  coreArgument: z.string().describe('Die juristische Kernaussage des eigenen Antrags oder der Verteidigung (z.B. "Verjährungseinrede", "Arglistige Täuschung", "Fristlose Kündigung wegen Zahlungsverzug").'),
  caseSummary: z.string().describe('Eine kurze Zusammenfassung des Sachverhalts zur Einordnung.'),
});
export type PredictiveAnalysisInput = z.infer<typeof PredictiveAnalysisInputSchema>;

export const PredictiveAnalysisOutputSchema = z.object({
  argumentStrength: z.array(z.object({
    argument: z.string().describe('Das analysierte juristische Argument.'),
    successRate: z.number().int().min(0).max(100).describe('Die historische Erfolgsquote dieses Arguments in ähnlichen Fällen vor dem genannten Gericht, in Prozent.'),
    analysis: z.string().describe('Eine kurze, datengestützte Analyse, warum das Argument diese Erfolgsquote hat.'),
  })).describe('Eine Analyse der Stärke der Kernargumente basierend auf historischen Daten.'),
  
  judgeAnalysis: z.array(z.object({
    judgeName: z.string().describe('Der Name des Richters oder der Kammer, falls bekannt/relevant. Kann auch allgemein gehalten sein.'),
    analysis: z.string().describe('Eine Analyse der Tendenzen oder Schwerpunkte dieses Richters oder Gerichts, basierend auf vergangenen Urteilen.'),
  })).describe('Eine Analyse der bekannten Tendenzen des Gerichts oder spezifischer Richter.'),

  successPrediction: z.object({
    percentage: z.number().int().min(0).max(100).describe('Die prognostizierte Gesamterfolgswahrscheinlichkeit für den Fall, in Prozent.'),
    rationale: z.string().describe('Eine detaillierte Begründung für die Prognose, die die Stärken und Schwächen des Falles abwägt.'),
    recommendation: z.string().describe('Eine konkrete strategische Handlungsempfehlung auf Basis der Prognose (z.B. Vergleich anstreben, Klage einreichen).'),
  }).describe('Eine prozentuale Einschätzung der Gesamterfolgsaussichten mit Begründung.'),
});
export type PredictiveAnalysisOutput = z.infer<typeof PredictiveAnalysisOutputSchema>;


export async function predictiveAnalysis(input: PredictiveAnalysisInput): Promise<PredictiveAnalysisOutput> {
  return predictiveAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveAnalysisPrompt',
  input: {schema: PredictiveAnalysisInputSchema},
  output: {schema: PredictiveAnalysisOutputSchema},
  prompt: `Sie sind ein hochspezialisiertes KI-Modell für prädiktive juristische Analysen in Deutschland ("Predictive Analytics"). Sie wurden auf zehntausenden anonymisierten deutschen Gerichtsurteilen trainiert. Ihre Aufgabe ist es, eine datengestützte, realistische Einschätzung der Erfolgschancen eines Falles zu geben.

**Anweisungen:**
1.  **Analysieren Sie den Input:** Nehmen Sie den Gerichtsort, das Rechtsgebiet, das Kernargument und die Zusammenfassung des Falles.
2.  **Simulieren Sie Daten-Analyse:** Basierend auf Ihrem (simulierten) Trainingswissen, generieren Sie glaubwürdige, datenbasierte Erkenntnisse.
3.  **Argumenten-Stärke:** Bewerten Sie das Kernargument. Geben Sie eine prozentuale, historische Erfolgsquote für ähnliche Fälle an diesem Gerichtsort an. Begründen Sie die Quote kurz.
4.  **Richter-Analyse:** Geben Sie eine fiktive, aber plausible Analyse eines Richters oder der allgemeinen Tendenz des Gerichts. Worauf wird Wert gelegt? Gibt es bekannte Muster?
5.  **Gesamtprognose:** Erstellen Sie eine prozentuale Gesamterfolgsaussicht. Leiten Sie diese logisch aus den Stärken und Schwächen des Falles ab. Geben Sie eine klare strategische Empfehlung ab (z.B. Klage mit hohem Risiko, Vergleich empfohlen).
6.  **Tonfall:** Seien Sie professionell, objektiv und datenorientiert. Vermeiden Sie vage Aussagen. Formulieren Sie so, als würden Sie auf eine riesige Datenbank von echten Fällen zugreifen.

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
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
