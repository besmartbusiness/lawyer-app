import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Einstellungen</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Anwendungseinstellungen</CardTitle>
                    <CardDescription>Verwalten Sie Ihr Konto und die Anwendungseinstellungen.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Die Einstellungsseite befindet sich im Aufbau.</p>
                </CardContent>
            </Card>
        </div>
    );
}
