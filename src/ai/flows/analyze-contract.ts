
'use server';
/**
 * @fileOverview A flow to analyze a contract for risks and suggest improvements.
 *
 * - analyzeContract - A function that performs contract analysis.
 * - AnalyzeContractInput - The input type for the analyzeContract function.
 * - AnalyzeContractOutput - The return type for the analyzeContract function.
 */

import {ai} from '@/ai/genkit';
import vertexAI from '@genkit-ai/vertexai';
import {z} from 'genkit';

const AnalyzeContractInputSchema = z.object({
  contractDocument: z.string().describe("The contract document (PDF) as a data URI, including MIME type and Base64 encoding. Format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AnalyzeContractInput = z.infer<typeof AnalyzeContractInputSchema>;

const AnalyzedClauseSchema = z.object({
  clauseText: z.string().describe("Der genaue Text der analysierten Vertragsklausel."),
  riskLevel: z.enum(['low', 'medium', 'high']).describe("Das identifizierte Risikoniveau der Klausel."),
  riskExplanation: z.string().describe("Eine klare und prägnante Erklärung, warum die Klausel als risikoreich eingestuft wird."),
  alternativeFormulation: z.string().describe("Ein alternativer, sichererer Formulierungsvorschlag für die Klausel."),
  marketComparison: z.string().describe("Ein Vergleich der Klausel mit dem Marktstandard, inklusive (simulierter) Daten. Z.B. 'Die Vertragsstrafe liegt 30% über dem Branchenstandard.'"),
});

const AnalyzeContractOutputSchema = z.object({
  analyzedClauses: z.array(AnalyzedClauseSchema).describe("Eine Liste der analysierten, potenziell riskanten Klauseln aus dem Vertrag."),
});
export type AnalyzeContractOutput = z.infer<typeof AnalyzeContractOutputSchema>;


export async function analyzeContract(input: AnalyzeContractInput): Promise<AnalyzeContractOutput> {
  return analyzeContractFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzeContractPrompt',
  model: vertexAI.model('gemini-1.5-flash'),
  input: {schema: AnalyzeContractInputSchema},
  output: {schema: AnalyzeContractOutputSchema},
  prompt: `Sie sind ein hochspezialisierter KI-Anwalt für deutsches Wirtschafts- und Vertragsrecht. Ihre Aufgabe ist es, einen Vertragsentwurf zu prüfen und als "interaktiver Verhandlungs-Copilot" zu agieren. Sie wurden auf zehntausenden von Verträgen und Marktdaten trainiert.

**Anweisungen:**
Analysieren Sie den folgenden Vertragsentwurf. Identifizieren Sie Klauseln, die für Ihren Mandanten unüblich, nachteilig oder riskant sind. Für jede dieser Klauseln erstellen Sie eine detaillierte Analyse:

1.  **Klausel-Identifikation:** Extrahieren Sie den exakten Text der problematischen Klausel.
2.  **Risiko-Bewertung:** Stufen Sie das Risiko als 'low', 'medium' oder 'high' ein.
3.  **Risiko-Erklärung:** Erklären Sie präzise und verständlich, worin die Gefahr oder der Nachteil der aktuellen Formulierung besteht.
4.  **Formulierungs-Vorschlag:** Bieten Sie eine konkrete, alternative Formulierung an, die das Risiko für Ihren Mandanten minimiert und seine Position stärkt.
5.  **Marktvergleich:** Setzen Sie die Klausel in den Kontext von Marktdaten (simuliert). Geben Sie eine Einschätzung, wie die Klausel im Vergleich zum Branchenstandard abschneidet. (z.B. "Eine Haftungsbegrenzung auf die einfache Auftragssumme ist unüblich, marktüblich wäre die doppelte Auftragssumme." oder "Die hier geforderte Vertragsstrafe von 5% liegt deutlich über den marktüblichen 1-2%.")

Konzentrieren Sie sich auf die wichtigsten und riskantesten Klauseln. Es ist nicht notwendig, jede einzelne Klausel zu analysieren, sondern nur diejenigen mit signifikantem Optimierungspotenzial.

**Zu analysierender Vertragsentwurf:**
{{media url=contractDocument}}
`,
});

const analyzeContractFlow = ai.defineFlow(
  {
    name: 'analyzeContractFlow',
    inputSchema: AnalyzeContractInputSchema,
    outputSchema: AnalyzeContractOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
