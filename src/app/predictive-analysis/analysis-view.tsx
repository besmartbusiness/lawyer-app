
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Percent, Scale, BrainCircuit, UserCheck, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { predictiveAnalysis, PredictiveAnalysisOutput } from '@/ai/flows/predictive-analysis';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

type AnalysisViewProps = {
    defaultCourtLocation?: string;
    defaultLegalArea?: string;
    defaultCoreArgument?: string;
    defaultSummary?: string;
};

export function AnalysisView({ 
    defaultCourtLocation = '', 
    defaultLegalArea = '', 
    defaultCoreArgument = '', 
    defaultSummary = '' 
}: AnalysisViewProps) {
    const [courtLocation, setCourtLocation] = useState(defaultCourtLocation);
    const [legalArea, setLegalArea] = useState(defaultLegalArea);
    const [coreArgument, setCoreArgument] = useState(defaultCoreArgument);
    const [caseSummary, setCaseSummary] = useState(defaultSummary);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<PredictiveAnalysisOutput | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleAnalyze = async () => {
        if (!courtLocation || !legalArea || !coreArgument || !caseSummary) {
            toast({
                variant: 'destructive',
                title: 'Eingabe unvollständig',
                description: 'Bitte füllen Sie alle Felder aus, um eine Prognose zu erstellen.',
            });
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await predictiveAnalysis({
                courtLocation,
                legalArea,
                coreArgument,
                caseSummary,
            });

            setAnalysisResult(result);
            toast({
                title: 'Prognose erstellt',
                description: 'Die prädiktive Analyse Ihres Falles ist abgeschlossen.',
            });

        } catch (e: any) {
            console.error('Predictive analysis error:', e);
            setError('Bei der Erstellung der Prognose ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
            toast({
                variant: 'destructive',
                title: 'Prognose fehlgeschlagen',
                description: 'Die KI konnte die Analyse nicht durchführen.',
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const isBusy = isAnalyzing;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BrainCircuit className="h-6 w-6 text-primary" />
                        Prädiktive Analyse
                    </CardTitle>
                    <CardDescription>
                    Bewerten Sie die Erfolgschancen Ihres Falles datengestützt. Geben Sie die Kerndaten ein, um eine Prognose basierend auf (simulierten) historischen Urteilen zu erhalten.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="court-location">Gerichtsort</Label>
                            <Input id="court-location" placeholder="z.B. OLG München" value={courtLocation} onChange={(e) => setCourtLocation(e.target.value)} disabled={isBusy} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="legal-area">Rechtsgebiet</Label>
                            <Input id="legal-area" placeholder="z.B. Mietrecht, Arbeitsrecht..." value={legalArea} onChange={(e) => setLegalArea(e.target.value)} disabled={isBusy} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="core-argument">Kernargument</Label>
                            <Input id="core-argument" placeholder="z.B. Verjährungseinrede..." value={coreArgument} onChange={(e) => setCoreArgument(e.target.value)} disabled={isBusy} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="case-summary">Kurze Zusammenfassung des Sachverhalts</Label>
                        <Textarea
                            id="case-summary"
                            placeholder="Beschreiben Sie hier kurz den relevanten Sachverhalt..."
                            value={caseSummary}
                            onChange={(e) => setCaseSummary(e.target.value)}
                            className="min-h-[100px]"
                            disabled={isBusy}
                        />
                    </div>
                    
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Analysefehler</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end">
                        <Button onClick={handleAnalyze} disabled={isBusy || !courtLocation || !legalArea || !coreArgument || !caseSummary}>
                            {isAnalyzing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Wand2 className="mr-2 h-4 w-4" />
                            )}
                            Prognose erstellen
                        </Button>
                    </div>

                </CardContent>
            </Card>

            {isAnalyzing && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-lg font-semibold">Erstelle Prognose...</p>
                        <p className="text-muted-foreground">Die KI analysiert (simulierte) historische Daten. Dies kann einen Moment dauern.</p>
                    </CardContent>
                </Card>
            )}

            {analysisResult && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5 text-primary" />Gesamteinschätzung & Empfehlung</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Prognostizierte Erfolgswahrscheinlichkeit</p>
                                <p className="text-6xl font-bold text-primary my-2">{analysisResult.successPrediction.percentage}%</p>
                                <Progress value={analysisResult.successPrediction.percentage} className="w-full" />
                            </div>
                            <div className="space-y-2 pt-4">
                            <p className="font-semibold">Begründung:</p>
                            <p className="text-sm text-muted-foreground">{analysisResult.successPrediction.rationale}</p>
                            </div>
                            <div className="space-y-2 pt-2">
                            <p className="font-semibold">Strategische Empfehlung:</p>
                            <p className="text-sm font-medium text-primary bg-primary/10 p-3 rounded-md">{analysisResult.successPrediction.recommendation}</p>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg"><Scale className="h-5 w-5 text-primary"/>Argumenten-Stärke</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {analysisResult.argumentStrength.map((item, index) => (
                                    <div key={index}>
                                        <p className="font-semibold">{item.argument}</p>
                                        <p className="text-sm text-muted-foreground">{item.analysis}</p>
                                        <p className="text-sm font-bold text-right text-primary">{item.successRate}% Erfolgsquote</p>
                                        <Progress value={item.successRate} className="h-2 mt-1" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg"><UserCheck className="h-5 w-5 text-primary"/>Richter-Analyse</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {analysisResult.judgeAnalysis.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0"/>
                                        <div>
                                            <p className="font-semibold">{item.judgeName}</p>
                                            <p className="text-sm text-muted-foreground">{item.analysis}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
