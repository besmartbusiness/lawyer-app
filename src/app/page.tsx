
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Bot, ScanText, Lightbulb, UserCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Icons } from "@/components/icons";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <Link href="#" className="flex items-center justify-center gap-2">
          <Icons.Logo className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold font-headline text-primary">Legiscribe</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Anmelden
          </Link>
          <Button asChild>
            <Link href="/signup">Jetzt kostenlos testen</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Die Zukunft der juristischen Arbeit. Automatisiert. Präzise. Effizient.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Legiscribe ist Ihr KI-Assistent, der Routineaufgaben automatisiert, komplexe Dokumente analysiert und Ihnen hilft, sich auf das Wesentliche zu konzentrieren: die perfekte Strategie für Ihre Mandanten.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                     <Link href="/signup">14 Tage kostenlos testen</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="#features">Mehr erfahren</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="https://images.pexels.com/photos/8112159/pexels-photo-8112159.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  width={600}
                  height={400}
                  alt="Hero"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Kernfunktionen</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Entwickelt für die moderne Kanzlei</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Steigern Sie Ihre Effizienz und Fallqualität mit Werkzeugen, die speziell für die juristische Praxis entwickelt wurden.
                </p>
              </div>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              <div className="grid gap-1">
                <Bot className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-bold">KI-Dokumentengenerator</h3>
                <p className="text-sm text-muted-foreground">Erstellen Sie in Sekundenschnelle Schriftsätze, Verträge und andere juristische Dokumente aus Stichpunkten, Diktaten oder Vorlagen.</p>
              </div>
               <div className="grid gap-1">
                <ScanText className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-bold">KI-Akten-Scanner</h3>
                <p className="text-sm text-muted-foreground">Lassen Sie lange Dokumente und Akten von der KI analysieren und erhalten Sie prägnante Zusammenfassungen der Kernaussagen.</p>
              </div>
              <div className="grid gap-1">
                <ShieldCheck className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-bold">Interaktiver Verhandlungs-Copilot</h3>
                <p className="text-sm text-muted-foreground">Analysieren Sie Vertragsentwürfe auf Risiken, erhalten Sie alternative Formulierungen und vergleichen Sie Klauseln mit Marktdaten.</p>
              </div>
              <div className="grid gap-1">
                <Lightbulb className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-bold">KI-Chef-Stratege</h3>
                <p className="text-sm text-muted-foreground">Entwickeln Sie aus einem Stapel von Dokumenten eine umfassende Fallstrategie, inklusive Zeitstrahl, Streitpunkten und Beweismittel-Analyse.</p>
              </div>
              <div className="grid gap-1">
                <UserCheck className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-bold">Prädiktive Analyse</h3>
                <p className="text-sm text-muted-foreground">Bewerten Sie die Erfolgschancen eines Falles basierend auf echten, vergleichbaren Urteilen und erhalten Sie eine datengestützte Prognose.</p>
              </div>
               <div className="grid gap-1">
                <CheckCircle className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-bold">Mandanten-Übersetzer</h3>
                <p className="text-sm text-muted-foreground">Wandeln Sie komplexe juristische Dokumente mit einem Klick in leicht verständliche Zusammenfassungen für Ihre Mandanten um.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Vertraut von führenden Anwälten</h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Lesen Sie, wie Kanzleien wie Ihre mit Legiscribe ihre Arbeitsweise transformieren.
                </p>
                </div>
                <div className="grid w-full grid-cols-1 lg:grid-cols-3 gap-6 pt-8">
                <Card>
                    <CardHeader>
                         <div className="flex items-center gap-4">
                            <Image src="https://images.pexels.com/photos/3760856/pexels-photo-3760856.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Avatar" width={40} height={40} className="rounded-full object-cover"/>
                            <div>
                                <CardTitle className="text-left">Dr. Clara Schmidt</CardTitle>
                                <CardDescription className="text-left">Fachanwältin für Arbeitsrecht</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm italic">"Legiscribe hat die Zeit für die Schriftsatzerstellung halbiert. Ich kann mich jetzt mehr auf die strategische Mandantenberatung konzentrieren. Ein absoluter Game-Changer."</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                         <div className="flex items-center gap-4">
                            <Image src="https://images.pexels.com/photos/532220/pexels-photo-532220.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Avatar" width={40} height={40} className="rounded-full object-cover"/>
                            <div>
                                <CardTitle className="text-left">Markus Weber</CardTitle>
                                <CardDescription className="text-left">Partner, M&A Kanzlei</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm italic">"Die Vertragsanalyse-Funktion ist unglaublich. Wir identifizieren Risiken in Due-Diligence-Prozessen jetzt in einem Bruchteil der Zeit. Unsere Mandanten sind begeistert."</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                         <div className="flex items-center gap-4">
                            <Image src="https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Avatar" width={40} height={40} className="rounded-full object-cover"/>
                            <div>
                                <CardTitle className="text-left">Julia Richter</CardTitle>
                                <CardDescription className="text-left">Syndikusanwältin</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm italic">"Als Inhouse-Juristin muss ich schnell und präzise sein. Der Akten-Scanner und der Dokumenten-Generator sind zu unverzichtbaren Werkzeugen in meinem Alltag geworden."</p>
                    </CardContent>
                </Card>
                </div>
            </div>
        </section>


        {/* Pricing Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Ein Preis, alle Funktionen</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Wählen Sie den Plan, der zu Ihrer Kanzlei passt. Jederzeit kündbar.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm pt-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Premium</CardTitle>
                  <CardDescription>Für Einzelanwälte und kleine Kanzleien, die ihre Effizienz maximieren wollen.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="text-4xl font-bold">
                    €249 <span className="text-lg font-normal text-muted-foreground">+ MwSt. / Monat</span>
                  </div>
                  <ul className="grid gap-2 text-left text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Unbegrenzte Dokumentengenerierung
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Alle KI-Werkzeuge inklusive
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Sichere Mandantenverwaltung
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Vorlagen & Textbausteine
                    </li>
                  </ul>
                  <Button asChild size="lg" className="w-full">
                    <Link href="/signup">Jetzt 14 Tage kostenlos testen</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
             <p className="text-xs text-muted-foreground mt-4">Für Enterprise-Lösungen und Kanzlei-Lizenzen, <a href="#" className="underline">kontaktieren Sie uns</a>.</p>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container max-w-4xl px-4 md:px-6">
                <div className="space-y-3 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Häufig gestellte Fragen</h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Haben Sie Fragen? Hier finden Sie die Antworten.
                    </p>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Wie sicher sind meine Mandantendaten?</AccordionTrigger>
                        <AccordionContent>
                        Höchste Sicherheit hat für uns Priorität. Alle Daten werden Ende-zu-Ende-verschlüsselt und auf sicheren Servern in Deutschland gespeichert. Unsere KI-Modelle werden unter strengsten Datenschutzauflagen betrieben.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Kann ich meine eigenen Vorlagen und Textbausteine verwenden?</AccordionTrigger>
                        <AccordionContent>
                        Ja, absolut. Legiscribe verfügt über eine integrierte Verwaltung für Ihre kanzlei-eigenen Dokumentvorlagen und wiederverwendbaren Textbausteine, auf die die KI intelligent zugreifen kann.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Wie funktioniert die 14-tägige Testphase?</AccordionTrigger>
                        <AccordionContent>
                        Sie können Legiscribe 14 Tage lang mit vollem Funktionsumfang kostenlos und unverbindlich testen. Es ist keine Kreditkarte erforderlich. Nach Ablauf der Testphase können Sie entscheiden, ob Sie ein Abonnement abschließen möchten.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>Kann ich mein Abonnement jederzeit kündigen?</AccordionTrigger>
                        <AccordionContent>
                        Ja, Ihr Abonnement ist monatlich kündbar. Es gibt keine langfristigen Vertragsbindungen. Sie behalten die volle Flexibilität.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>

      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Legiscribe. Alle Rechte vorbehalten.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Impressum
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Datenschutz
          </Link>
        </nav>
      </footer>
    </div>
  );
}
