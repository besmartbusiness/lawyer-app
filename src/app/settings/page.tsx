
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { getAuth, sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [name, setName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [isSavingName, setIsSavingName] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);

    useEffect(() => {
        if (user?.displayName) {
            setName(user.displayName);
        }
    }, [user]);

    const handleNameUpdate = async () => {
        if (!user || !name.trim()) return;

        setIsSavingName(true);
        try {
            await updateProfile(user, { displayName: name.trim() });
            toast({
                title: "Erfolg",
                description: "Ihr Name wurde aktualisiert.",
            });
            setIsEditingName(false);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Fehler",
                description: "Ihr Name konnte nicht aktualisiert werden. " + error.message,
            });
        } finally {
            setIsSavingName(false);
        }
    };
    
    const handleResetPassword = async () => {
        if (!user || !user.email) return;

        // Check if the user signed in with a password (not with Google, etc.)
        const isEmailProvider = user.providerData.some(
            (provider) => provider.providerId === 'password'
        );

        if (!isEmailProvider) {
            toast({
                variant: 'destructive',
                title: 'Aktion nicht unterstützt',
                description: 'Passwörter können nur für Konten geändert werden, die mit E-Mail und Passwort erstellt wurden.',
            });
            return;
        }

        setIsSendingReset(true);
        try {
            await sendPasswordResetEmail(getAuth(), user.email);
            toast({
                title: 'E-Mail gesendet',
                description: 'Wir haben Ihnen einen Link zum Zurücksetzen Ihres Passworts gesendet. Bitte überprüfen Sie Ihren Posteingang.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Fehler',
                description: 'Die E-Mail zum Zurücksetzen des Passworts konnte nicht gesendet werden. ' + error.message,
            });
        } finally {
            setIsSendingReset(false);
        }
    }

    const handleCancelEdit = () => {
        setName(user?.displayName || '');
        setIsEditingName(false);
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profil</CardTitle>
                    <CardDescription>Verwalten Sie Ihre persönlichen Informationen.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <div className="flex items-center gap-2">
                            <Input 
                                id="name" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={!isEditingName || isSavingName} 
                            />
                            {isEditingName ? (
                                <>
                                    <Button onClick={handleNameUpdate} disabled={isSavingName || !name.trim()}>
                                        {isSavingName && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Speichern
                                    </Button>
                                    <Button variant="outline" onClick={handleCancelEdit} disabled={isSavingName}>
                                        Abbrechen
                                    </Button>
                                </>
                            ) : (
                                <Button variant="outline" onClick={() => setIsEditingName(true)}>
                                    Bearbeiten
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">E-Mail</Label>
                        <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Sicherheit</CardTitle>
                    <CardDescription>Verwalten Sie Ihre Sicherheitseinstellungen.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <h4 className="font-medium">Passwort ändern</h4>
                            <p className="text-sm text-muted-foreground">
                                Erhalten Sie eine E-Mail, um Ihr Passwort zurückzusetzen.
                            </p>
                        </div>
                        <Button variant="outline" onClick={handleResetPassword} disabled={isSendingReset}>
                            {isSendingReset && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            E-Mail senden
                        </Button>
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <h4 className="font-medium">Zwei-Faktor-Authentifizierung</h4>
                            <p className="text-sm text-muted-foreground">
                                Fügen Sie eine zusätzliche Sicherheitsebene für Ihr Konto hinzu.
                            </p>
                        </div>
                        <Switch disabled />
                    </div>
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle>Darstellung</CardTitle>
                    <CardDescription>Passen Sie das Erscheinungsbild der Anwendung an.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <h4 className="font-medium">Farbschema</h4>
                            <p className="text-sm text-muted-foreground">
                                Wählen Sie zwischen hellem und dunklem Modus.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" disabled>Hell</Button>
                             <Button variant="secondary" disabled>Dunkel</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
