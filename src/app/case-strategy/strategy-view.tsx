
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, UploadCloud, File, X, Lightbulb, Milestone, Scale, CheckSquare, FileSignature } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateCaseStrategy, CaseStrategyOutput } from '@/ai/flows/generate-case-strategy';
import { Badge } from '@/components/ui/badge';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/lib/hooks/use-auth';
import { storage } from '@/lib/firebase';

type StrategyViewProps = {
    defaultSummary?: string;
};

export function StrategyView({ defaultSummary = '' }: StrategyViewProps) {
    const [userSummary, setUserSummary] = useState(defaultSummary);
    const [files, setFiles] = useState<File[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<CaseStrategyOutput | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { user } = useAuth();


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');

            if (pdfFiles.length !== newFiles.length) {
                toast({
                    variant: 'destructive',
                    title: 'Falscher Dateityp',
                    description: 'Es werden nur PDF-Dateien unterstützt.',
                });
            }

            setFiles(prevFiles => {
                const uniqueNewFiles = pdfFiles.filter(newFile => !prevFiles.some(existingFile => existingFile.name === newFile.name));
                return [...prevFiles, ...uniqueNewFiles];
            });
        }
    };

    const removeFile = (fileName: string) => {
        setFiles(files.filter(file => file.name !== fileName));
    };

    const handleAnalyze = async () => {
        if (files.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Keine Dateien ausgewählt',
                description: 'Bitte laden Sie mindestens ein PDF-Dokument hoch, um die Analyse zu starten.',
            });
            return;
        }
        if (!user) {
            toast({ variant: 'destructive', title: 'Nicht angemeldet', description: 'Sie müssen angemeldet sein.' });
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null);

        try {
            toast({ title: 'Lade Dokumente hoch...', description: 'Dies kann einen Moment dauern.' });
            
            const uploadPromises = files.map(async (file) => {
                const filePath = `uploads/${user.uid}/strategy_docs/${Date.now()}_${file.name}`;
                const fileStorageRef = storageRef(storage, filePath);
                await uploadBytes(fileStorageRef, file);
                return getDownloadURL(fileStorageRef);
            });
            
            const documentUrls = await Promise.all(uploadPromises);

            toast({ title: 'Entwickle Strategie...', description: 'Die KI analysiert die hochgeladenen Dokumente.' });

            const result = await generateCaseStrategy({
                documents: documentUrls,
                caseSummary: userSummary,
            });

            setAnalysisResult(result);
            toast({
                title: 'Analyse erfolgreich',
                description: 'Die strategische Auswertung Ihres Falles ist abgeschlossen.',
            });

        } catch (e: any) {
            console.error('Case strategy analysis error:', e);
            setError('Bei der Analyse der Dokumente ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
            toast({
                variant: 'destructive',
                title: 'Analyse fehlgeschlagen',
                description: e.message || 'Die KI konnte die Dokumente nicht verarbeiten.',
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
                        <Lightbulb className="h-6 w-6 text-primary" />
                        Strategische Fallanalyse
                    </CardTitle>
                    <CardDescription>
                        Laden Sie alle relevanten Dokumente zum Fall hoch. Die KI erstellt daraus eine strategische Gesamtanalyse, identifiziert Streitpunkte, prüft Beweismittel und skizziert die beste Vorgehensweise.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="case-summary">Zusammenfassung des Falls / Ziele des Mandanten</Label>
                        <Textarea
                            id="case-summary"
                            placeholder="Beschreiben Sie hier kurz den Fall aus Ihrer Sicht oder was das Ziel des Mandanten ist..."
                            value={userSummary}
                            onChange={(e) => setUserSummary(e.target.value)}
                            className="min-h-[100px]"
                            disabled={isBusy}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Dokumente zum Fall</Label>
                        <Card className="border-2 border-dashed bg-secondary/50">
                            <CardContent className="p-6 text-center">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="application/pdf"
                                    multiple
                                    className="hidden"
                                    id="pdf-upload-strategy"
                                />
                                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-sm text-muted-foreground">
                                    Ziehen Sie PDFs hierher oder <Button variant="link" className="p-0 h-auto" onClick={() => fileInputRef.current?.click()}>klicken Sie zum Hochladen</Button>.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {files.length > 0 && (
                        <div className="space-y-2">
                            <Label>Hochgeladene Dokumente</Label>
                            <div className="space-y-2">
                                {files.map(file => (
                                    <div key={file.name} className="flex items-center justify-between rounded-md border p-2 bg-secondary/30">
                                        <div className="flex items-center gap-2">
                                            <File className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{file.name}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeFile(file.name)} disabled={isBusy}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
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
                        <Button onClick={handleAnalyze} disabled={isBusy || files.length === 0}>
                            {isAnalyzing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Wand2 className="mr-2 h-4 w-4" />
                            )}
                            Strategie entwickeln
                        </Button>
                    </div>

                </CardContent>
            </Card>

            {isAnalyzing && !analysisResult && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-lg font-semibold">Analysiere Fallstrategie...</p>
                        <p className="text-muted-foreground">Die KI liest und bewertet die Dokumente. Dies kann einen Moment dauern.</p>
                    </CardContent>
                </Card>
            )}


            {analysisResult && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Milestone className="h-5 w-5 text-primary" />Zeitstrahl der Ereignisse</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pl-6">
                                <div className="absolute left-[30px] h-full w-0.5 bg-border -translate-x-1/2"></div>
                                {analysisResult.timeline.map((item, index) => (
                                    <div key={index} className="relative mb-6">
                                        <div className="absolute left-[30px] top-1 h-4 w-4 bg-primary rounded-full border-4 border-background -translate-x-1/2"></div>
                                        <div className="pl-8">
                                            <p className="font-semibold">{item.date}</p>
                                            <p className="text-sm text-muted-foreground">{item.event}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5 text-primary"/>Identifizierte Streitpunkte</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {analysisResult.disputedPoints.map((item, index) => (
                                <div key={index} className="p-3 rounded-md border bg-secondary/50">
                                    <p className="font-semibold">{item.point}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{item.explanation}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CheckSquare className="h-5 w-5 text-primary"/>Beweismittel-Analyse</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analysisResult.evidenceAnalysis.map((item, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div>
                                            <Badge variant={item.status === 'available' ? 'default' : 'destructive'}>
                                                {item.status === 'available' ? 'Verfügbar' : 'Fehlend'}
                                            </Badge>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{item.evidence}</p>
                                            {item.suggestion && (
                                                <p className="text-sm text-muted-foreground italic mt-1">Vorschlag: {item.suggestion}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileSignature className="h-5 w-5 text-primary"/>Erste Argumentations-Skizze</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analysisResult.argumentOutline.map((item, index) => (
                                    <div key={index}>
                                        <h4 className="font-bold text-lg">{item.section}</h4>
                                        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                                            {item.arguments.map((arg, argIndex) => (
                                                <li key={argIndex} className="text-sm">{arg}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
