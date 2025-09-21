
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/hooks/use-auth";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    const { user } = useAuth();

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
                        <Input id="name" defaultValue={user?.displayName || ''} disabled />
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
                                Ändern Sie das Passwort für Ihr Konto.
                            </p>
                        </div>
                        <Button variant="outline" disabled>Ändern</Button>
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
