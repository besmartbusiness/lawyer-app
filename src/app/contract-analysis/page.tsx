
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, UploadCloud, File as FileIcon, X, ShieldAlert, FileText, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeContract, AnalyzeContractOutput } from '@/ai/flows/analyze-contract';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ContractAnalysisPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalyzeContractOutput | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0];
            if (selectedFile.type !== 'application/pdf') {
                toast({
                    variant: 'destructive',
                    title: 'Falscher Dateityp',
                    description: 'Es werden nur PDF-Dateien unterstützt.',
                });
                return;
            }
            setFile(selectedFile);
            // Reset previous results when a new file is chosen
            setAnalysisResult(null);
            setError(null);
        }
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setAnalysisResult(null);
        setError(null);
    };

    const handleAnalyze = async () => {
        if (!file) {
            toast({
                variant: 'destructive',
                title: 'Keine Datei ausgewählt',
                description: 'Bitte laden Sie einen Vertragsentwurf (PDF) hoch.',
            });
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const documentDataUri = await fileToDataUri(file);

            const result = await analyzeContract({
                contractDocument: documentDataUri,
            });

            setAnalysisResult(result);
            toast({
                title: 'Analyse abgeschlossen',
                description: 'Der Vertrag wurde auf Risiken und Verbesserungspotenziale geprüft.',
            });

        } catch (e: any) {
            console.error('Contract analysis error:', e);
            setError('Bei der Analyse des Vertrags ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
            toast({
                variant: 'destructive',
                title: 'Analyse fehlgeschlagen',
                description: 'Die KI konnte das Dokument nicht verarbeiten.',
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getRiskBadgeVariant = (riskLevel: 'low' | 'medium' | 'high') => {
        switch (riskLevel) {
            case 'high':
                return 'destructive';
            case 'medium':
                return 'secondary';
            case 'low':
                return 'default';
            default:
                return 'outline';
        }
    };
    
    const getRiskBadgeText = (riskLevel: 'low' | 'medium' | 'high') => {
        switch (riskLevel) {
            case 'high':
                return 'Hohes Risiko';
            case 'medium':
                return 'Mittleres Risiko';
            case 'low':
                return 'Geringes Risiko';
            default:
                return 'Unbekannt';
        }
    };


    const isBusy = isAnalyzing;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
             <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight font-headline">Interaktiver Verhandlungsraum</h2>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-6 w-6 text-primary" />
                        KI-Copilot für Vertragsverhandlungen
                    </CardTitle>
                    <CardDescription>
                       Laden Sie einen Vertragsentwurf hoch. Die KI agiert als Ihr "Copilot", markiert riskante Klauseln, erklärt die Gefahr und schlägt sicherere Alternativen vor.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label>Vertragsentwurf hochladen (PDF)</Label>
                        <Card className="border-2 border-dashed bg-secondary/50">
                            <CardContent className="p-6 text-center">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="application/pdf"
                                    className="hidden"
                                    id="pdf-upload-contract"
                                />
                                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-sm text-muted-foreground">
                                    Ziehen Sie eine PDF-Datei hierher oder <Button variant="link" className="p-0 h-auto" onClick={() => fileInputRef.current?.click()}>klicken Sie zum Hochladen</Button>.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {file && (
                        <div className="space-y-2">
                             <Label>Hochgeladene Datei</Label>
                             <div className="flex items-center justify-between rounded-md border p-3 bg-secondary/30">
                                <div className="flex items-center gap-3">
                                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{file.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={removeFile} disabled={isBusy} title="Datei entfernen">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Analysefehler</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end">
                        <Button onClick={handleAnalyze} disabled={isBusy || !file}>
                            {isAnalyzing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Wand2 className="mr-2 h-4 w-4" />
                            )}
                            Vertrag analysieren
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isAnalyzing && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-lg font-semibold">Analysiere Vertrag...</p>
                        <p className="text-muted-foreground">Die KI prüft den Vertrag auf Risiken und Potenziale. Dies kann einen Moment dauern.</p>
                    </CardContent>
                </Card>
            )}

            {analysisResult && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-6 w-6" />KI-Analyse der Vertragsklauseln</CardTitle>
                        <CardDescription>Die KI hat die folgenden Klauseln als potenziell riskant oder verbesserungswürdig identifiziert.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analysisResult.analyzedClauses.length > 0 ? (
                            <Accordion type="multiple" className="w-full space-y-4">
                                {analysisResult.analyzedClauses.map((item, index) => (
                                    <AccordionItem value={`item-${index}`} key={index} className="border-b-0">
                                        <Card className="overflow-hidden">
                                            <AccordionTrigger className="p-4 hover:no-underline hover:bg-muted/50">
                                                <div className="flex items-center justify-between w-full">
                                                     <div className="flex-1 text-left">
                                                        <Badge variant={getRiskBadgeVariant(item.riskLevel)}>{getRiskBadgeText(item.riskLevel)}</Badge>
                                                        <p className="font-semibold mt-2 truncate pr-4">{item.clauseText}</p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="p-6 pt-0 space-y-6">
                                                
                                                <div className="space-y-2">
                                                    <h4 className="font-semibold">Original-Klausel</h4>
                                                    <blockquote className="border-l-4 pl-4 text-sm italic bg-secondary/40 py-2">"{item.clauseText}"</blockquote>
                                                </div>

                                                <div className="space-y-2">
                                                    <h4 className="font-semibold">Risiko-Analyse</h4>
                                                    <p className="text-sm text-muted-foreground">{item.riskExplanation}</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <h4 className="font-semibold">Alternativer Formulierungsvorschlag</h4>
                                                    <p className="text-sm text-green-700 bg-green-50 p-3 rounded-md dark:bg-green-950 dark:text-green-300">{item.alternativeFormulation}</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <h4 className="font-semibold">Vergleich mit Marktdaten</h4>
                                                     <p className="text-sm text-muted-foreground">{item.marketComparison}</p>
                                                </div>
                                               
                                            </AccordionContent>
                                        </Card>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center py-10">
                                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">Keine signifikanten Risiken gefunden</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Die KI hat in diesem Vertragsentwurf keine unüblichen oder hoch riskanten Klauseln identifiziert.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
