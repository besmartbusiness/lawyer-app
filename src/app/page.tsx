
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Bot, ScanText, Lightbulb, UserCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Icons } from "@/components/icons";
import { useAuth } from "@/lib/hooks/use-auth";
import { motion, useInView } from "framer-motion";
import React, { useRef } from "react";

function AuthNav() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <div className="flex gap-4 items-center">
            <div className="h-6 w-20 bg-muted rounded-md animate-pulse hidden sm:inline-block"></div>
            <div className="h-10 w-36 bg-muted rounded-md animate-pulse"></div>
        </div>
    );
  }

  if (user) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <Button asChild>
          <Link href="/dashboard">Zur App</Link>
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-4 sm:gap-6">
      <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4 hidden sm:inline-block">
        Anmelden
      </Link>
      <Button asChild>
        <Link href="/signup">Jetzt kostenlos testen</Link>
      </Button>
    </motion.div>
  )
}

function AnimatedSection({ children, className }: { children: React.ReactNode, className?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <motion.section
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.section>
    );
}


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <Link href="#" className="flex items-center justify-center gap-2">
          <Icons.Logo className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold font-headline text-primary">Legiscribe</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
         <AuthNav />
        </nav>
      </header>

      <main className="flex-1 overflow-x-hidden">
        {/* Hero Section */}
        <section className="w-full relative overflow-hidden py-24 md:py-32 lg:py-48">
             <div className="absolute inset-0 z-0">
                <Image
                    src="https://picsum.photos/seed/legiscribe-hero/1920/1080"
                    alt="Modern Office"
                    fill
                    className="object-cover"
                    priority
                    data-ai-hint="modern office"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
            </div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="max-w-3xl text-center mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-foreground">
                    Die Zukunft der juristischen Arbeit. Automatisiert. Präzise. Effizient.
                  </h1>
                  <p className="max-w-[700px] text-muted-foreground md:text-xl mx-auto mt-6">
                    Legiscribe ist Ihr KI-Assistent, der Routineaufgaben automatisiert, komplexe Dokumente analysiert und Ihnen hilft, sich auf das Wesentliche zu konzentrieren: die perfekte Strategie für Ihre Mandanten.
                  </p>
               </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="flex flex-col gap-4 min-[400px]:flex-row justify-center mt-8"
                >
                  <Button asChild size="lg" className="transition-transform duration-300 hover:scale-105">
                     <Link href="/signup">14 Tage kostenlos testen</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="transition-transform duration-300 hover:scale-105 bg-background/50">
                    <Link href="#features">Mehr erfahren</Link>
                  </Button>
                </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <AnimatedSection id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
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
              {[
                { icon: <Bot/>, title: "KI-Dokumentengenerator", description: "Erstellen Sie in Sekundenschnelle Schriftsätze, Verträge und andere juristische Dokumente aus Stichpunkten, Diktaten oder Vorlagen." },
                { icon: <ScanText/>, title: "KI-Akten-Scanner", description: "Lassen Sie lange Dokumente und Akten von der KI analysieren und erhalten Sie prägnante Zusammenfassungen der Kernaussagen." },
                { icon: <ShieldCheck/>, title: "Interaktiver Verhandlungs-Copilot", description: "Analysieren Sie Vertragsentwürfe auf Risiken, erhalten Sie alternative Formulierungen und vergleichen Sie Klauseln mit Marktdaten." },
                { icon: <Lightbulb/>, title: "KI-Chef-Stratege", description: "Entwickeln Sie aus einem Stapel von Dokumenten eine umfassende Fallstrategie, inklusive Zeitstrahl, Streitpunkten und Beweismittel-Analyse." },
                { icon: <UserCheck/>, title: "Prädiktive Analyse", description: "Bewerten Sie die Erfolgschancen eines Falles basierend auf echten, vergleichbaren Urteilen und erhalten Sie eine datengestützte Prognose." },
                { icon: <CheckCircle/>, title: "Mandanten-Übersetzer", description: "Wandeln Sie komplexe juristische Dokumente mit einem Klick in leicht verständliche Zusammenfassungen für Ihre Mandanten um." }
              ].map((feature, index) => (
                 <div key={index} className="grid gap-2 group">
                    <div className="text-primary mb-2 transition-transform duration-300 group-hover:scale-110">{React.cloneElement(feature.icon, { className: "h-8 w-8"})}</div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Testimonials Section */}
        <AnimatedSection className="w-full py-12 md:py-24 lg:py-32">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Vertraut von führenden Anwälten</h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Lesen Sie, wie Kanzleien wie Ihre mit Legiscribe ihre Arbeitsweise transformieren.
                </p>
                </div>
                <div className="grid w-full grid-cols-1 lg:grid-cols-3 gap-6 pt-8">
                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <CardHeader>
                         <div className="flex items-center gap-4">
                            <Image data-ai-hint="professional woman" src="https://images.pexels.com/photos/3760856/pexels-photo-3760856.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Avatar" width={40} height={40} className="rounded-full object-cover"/>
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
                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <CardHeader>
                         <div className="flex items-center gap-4">
                            <Image data-ai-hint="professional man" src="https://images.pexels.com/photos/532220/pexels-photo-532220.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Avatar" width={40} height={40} className="rounded-full object-cover"/>
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
                <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <CardHeader>
                         <div className="flex items-center gap-4">
                            <Image data-ai-hint="business woman" src="https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Avatar" width={40} height={40} className="rounded-full object-cover"/>
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
        </AnimatedSection>


        {/* Pricing Section */}
        <AnimatedSection className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Ein Preis, alle Funktionen</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Wählen Sie den Plan, der zu Ihrer Kanzlei passt. Jederzeit kündbar.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm pt-8">
              <Card className="shadow-xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
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
                  <Button asChild size="lg" className="w-full transition-transform duration-300 hover:scale-105">
                    <Link href="/signup">Jetzt 14 Tage kostenlos testen</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
             <p className="text-xs text-muted-foreground mt-4">Für Enterprise-Lösungen und Kanzlei-Lizenzen, <Link href="#" className="underline">kontaktieren Sie uns</Link>.</p>
          </div>
        </AnimatedSection>
        
        {/* FAQ Section */}
        <AnimatedSection className="w-full py-12 md:py-24 lg:py-32">
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
        </AnimatedSection>

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

    