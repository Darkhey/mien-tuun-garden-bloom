import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import SowingCalendar from '@/components/admin/SowingCalendar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Sprout, Search, Filter, Leaf, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Companion planting data
const COMPANION_PLANTS: Record<string, { good: string[], bad: string[] }> = {
  "Tomaten": {
    good: ["Basilikum", "Karotten", "Zwiebeln", "Petersilie", "Spinat"],
    bad: ["Kartoffeln", "Fenchel", "Mais", "Kohl"]
  },
  "Karotten": {
    good: ["Zwiebeln", "Lauch", "Tomaten", "Radieschen", "Salat"],
    bad: ["Dill", "Petersilie", "Sellerie"]
  },
  "Gurken": {
    good: ["Bohnen", "Erbsen", "Salat", "Zwiebeln", "Kohl"],
    bad: ["Kartoffeln", "Tomaten", "Radieschen"]
  },
  "Kartoffeln": {
    good: ["Bohnen", "Kohl", "Mais", "Spinat"],
    bad: ["Tomaten", "Gurken", "Kürbis", "Sonnenblumen"]
  },
  "Bohnen": {
    good: ["Karotten", "Gurken", "Kartoffeln", "Kohl"],
    bad: ["Zwiebeln", "Knoblauch", "Fenchel"]
  },
  "Kohl": {
    good: ["Zwiebeln", "Kartoffeln", "Salat", "Spinat"],
    bad: ["Erdbeeren", "Tomaten", "Bohnen"]
  },
  "Salat": {
    good: ["Karotten", "Radieschen", "Gurken", "Erdbeeren"],
    bad: ["Petersilie", "Sellerie"]
  },
  "Zwiebeln": {
    good: ["Karotten", "Rote Bete", "Salat", "Tomaten"],
    bad: ["Bohnen", "Erbsen", "Kohl"]
  },
  "Erdbeeren": {
    good: ["Spinat", "Salat", "Zwiebeln", "Knoblauch"],
    bad: ["Kohl", "Blumenkohl"]
  },
  "Spinat": {
    good: ["Erdbeeren", "Kohl", "Radieschen", "Kartoffeln"],
    bad: ["Rote Bete", "Mangold"]
  }
};

const AussaatkalenderPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('kalender');
  const [currentMonth] = useState(() => {
    const now = new Date();
    return ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'][now.getMonth()];
  });

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Interaktiver Aussaatkalender | Mien Tuun</title>
        <meta name="description" content="Unser interaktiver Aussaatkalender hilft dir, den perfekten Zeitpunkt für Aussaat, Pflanzung und Ernte zu finden. Mit Beetnachbar-Finder und Pflanzenfilter." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sage-50 to-accent-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center bg-white/50 p-3 rounded-full mb-6">
            <Calendar className="h-8 w-8 text-sage-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-6">
            Interaktiver Aussaatkalender
          </h1>
          <p className="text-xl text-earth-600 max-w-2xl mx-auto mb-8">
            Finde den perfekten Zeitpunkt für Aussaat, Pflanzung und Ernte deiner Lieblingsgemüse, Kräuter und Obst.
          </p>
          <div className="inline-flex items-center bg-accent-100 text-accent-800 px-3 py-1 rounded-full text-sm font-medium">
            <Info className="h-4 w-4 mr-1" />
            Beta-Version
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Alert className="mb-8 bg-sage-50 border-sage-200">
            <Sprout className="h-4 w-4" />
            <AlertTitle>Beta-Version</AlertTitle>
            <AlertDescription>
              Unser interaktiver Aussaatkalender befindet sich noch in der Entwicklung. Wir arbeiten kontinuierlich daran, mehr Funktionen und Pflanzen hinzuzufügen.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="kalender" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Aussaatkalender
              </TabsTrigger>
              <TabsTrigger value="beetnachbarn" className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Beetnachbarn-Finder
              </TabsTrigger>
              <TabsTrigger value="tipps" className="flex items-center gap-2">
                <Sprout className="h-4 w-4" />
                Aussaat-Tipps
              </TabsTrigger>
            </TabsList>

            <TabsContent value="kalender">
              <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-400 h-5 w-5" />
                    <Input
                      type="search"
                      placeholder="Nach Pflanzen suchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-3 border border-sage-200 rounded-full focus:ring-2 focus:ring-sage-300 focus:border-transparent"
                    />
                  </div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                  <Button className="bg-sage-600 hover:bg-sage-700 text-white">
                    Aktuelle Saison ({currentMonth})
                  </Button>
                </div>

                <SowingCalendar />
              </div>
            </TabsContent>

            <TabsContent value="beetnachbarn">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-sage-600" />
                    Beetnachbarn-Finder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-earth-600 mb-4">
                      Finde heraus, welche Pflanzen gut nebeneinander wachsen und welche sich gegenseitig beeinträchtigen können.
                    </p>
                    
                    <div className="relative mb-6">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-400 h-5 w-5" />
                      <Input
                        type="search"
                        placeholder="Pflanze auswählen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 border border-sage-200 rounded-full focus:ring-2 focus:ring-sage-300 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                      {Object.keys(COMPANION_PLANTS).map(plant => (
                        <Button 
                          key={plant}
                          variant={selectedPlant === plant ? "default" : "outline"}
                          onClick={() => setSelectedPlant(plant)}
                          className="justify-start"
                        >
                          {plant}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {selectedPlant && COMPANION_PLANTS[selectedPlant] && (
                    <div className="border rounded-lg p-6 bg-sage-50">
                      <h3 className="text-xl font-serif font-bold text-earth-800 mb-4">Beetnachbarn für {selectedPlant}</h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-earth-800 mb-2 flex items-center gap-2">
                            <span className="text-green-600">✓</span> Gute Nachbarn
                          </h4>
                          <ul className="space-y-2">
                            {COMPANION_PLANTS[selectedPlant].good.map(plant => (
                              <li key={plant} className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span>{plant}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-earth-800 mb-2 flex items-center gap-2">
                            <span className="text-red-600">✗</span> Schlechte Nachbarn
                          </h4>
                          <ul className="space-y-2">
                            {COMPANION_PLANTS[selectedPlant].bad.map(plant => (
                              <li key={plant} className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                <span>{plant}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tipps">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-sage-600" />
                    Aussaat-Tipps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-sage-50 p-4 rounded-lg border border-sage-200">
                      <h3 className="font-medium text-earth-800 mb-2">Aussaat im Freiland</h3>
                      <p className="text-earth-600">
                        Achte auf die richtige Bodentemperatur und Frostgefahr. Viele Gemüsesorten benötigen mindestens 8-10°C Bodentemperatur für eine erfolgreiche Keimung.
                      </p>
                    </div>
                    
                    <div className="bg-accent-50 p-4 rounded-lg border border-accent-200">
                      <h3 className="font-medium text-earth-800 mb-2">Vorziehen auf der Fensterbank</h3>
                      <p className="text-earth-600">
                        Wärmebedürftige Pflanzen wie Tomaten, Paprika und Auberginen sollten 6-8 Wochen vor dem Auspflanzen vorgezogen werden. Achte auf ausreichend Licht!
                      </p>
                    </div>
                    
                    <div className="bg-sage-50 p-4 rounded-lg border border-sage-200">
                      <h3 className="font-medium text-earth-800 mb-2">Saattiefe</h3>
                      <p className="text-earth-600">
                        Als Faustregel gilt: Saattiefe = etwa das Doppelte des Samendurchmessers. Lichtkeimer wie Salat werden nur leicht angedrückt.
                      </p>
                    </div>
                    
                    <div className="bg-accent-50 p-4 rounded-lg border border-accent-200">
                      <h3 className="font-medium text-earth-800 mb-2">Gießen</h3>
                      <p className="text-earth-600">
                        Halte die Aussaat gleichmäßig feucht, aber nicht nass. Verwende eine Sprühflasche für feine Samen, um sie nicht wegzuspülen.
                      </p>
                    </div>
                    
                    <div className="bg-sage-50 p-4 rounded-lg border border-sage-200">
                      <h3 className="font-medium text-earth-800 mb-2">Abhärten</h3>
                      <p className="text-earth-600">
                        Vorgezogene Pflanzen vor dem Auspflanzen 1-2 Wochen abhärten, indem du sie tagsüber nach draußen stellst und nachts wieder reinholst.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 bg-gradient-to-r from-sage-50 to-accent-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-4">
            Plane deinen Garten mit unserem Aussaatkalender
          </h2>
          <p className="text-lg text-earth-600 mb-6">
            Entdecke noch mehr Gartentipps und saisonale Rezepte in unserem Blog.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-sage-600 hover:bg-sage-700">
              <a href="/blog?category=aussaat-pflanzung">Aussaat & Pflanzung Tipps</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/blog?category=saisonale-kueche">Saisonale Rezepte</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default AussaatkalenderPage;