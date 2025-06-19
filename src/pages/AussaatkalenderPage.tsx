
import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import SowingCalendar from '@/components/admin/SowingCalendar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Sprout, Search, Filter, Leaf, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Enhanced companion planting data with reasons
const COMPANION_PLANTS: Record<string, { 
  good: Array<{plant: string, reason: string}>, 
  bad: Array<{plant: string, reason: string}> 
}> = {
  "Tomaten": {
    good: [
      {plant: "Basilikum", reason: "Verbessert den Geschmack und hält Schädlinge wie Weiße Fliegen fern"},
      {plant: "Karotten", reason: "Lockern den Boden und konkurrieren nicht um die gleichen Nährstoffe"},
      {plant: "Zwiebeln", reason: "Halten Blattläuse und andere Schädlinge fern durch ihren intensiven Geruch"},
      {plant: "Petersilie", reason: "Verbessert das Wachstum und den Geschmack der Tomaten"},
      {plant: "Spinat", reason: "Beschattet den Boden und hält die Feuchtigkeit, wächst schnell ab"},
      {plant: "Tagetes", reason: "Hält Nematoden und andere Bodenschädlinge fern"},
      {plant: "Sellerie", reason: "Verbessert den Geschmack und hält Schädlinge ab"}
    ],
    bad: [
      {plant: "Kartoffeln", reason: "Beide Nachtschattengewächse - fördern Krankheitsübertragung wie Kraut- und Braunfäule"},
      {plant: "Fenchel", reason: "Hemmt das Wachstum durch allelopathische Substanzen"},
      {plant: "Mais", reason: "Konkurriert um Licht und Nährstoffe, kann Tomaten überschatten"},
      {plant: "Kohl", reason: "Hoher Nährstoffbedarf führt zu Konkurrenz um Stickstoff"},
      {plant: "Gurken", reason: "Ähnliche Krankheitsanfälligkeit und Nährstoffkonkurrenz"},
      {plant: "Rotkohl", reason: "Allelopathische Wirkung hemmt das Tomatenwachstum"}
    ]
  },
  "Karotten": {
    good: [
      {plant: "Zwiebeln", reason: "Möhrenfliege wird durch Zwiebelgeruch abgehalten, Zwiebeln profitieren von lockerem Boden"},
      {plant: "Lauch", reason: "Ähnlicher Effekt wie Zwiebeln - hält Möhrenfliege fern"},
      {plant: "Tomaten", reason: "Karotten lockern Boden für Tomatenwurzeln, verschiedene Wurzeltiefen"},
      {plant: "Radieschen", reason: "Radieschen sind schnell abgeerntet und lockern Boden für Karotten"},
      {plant: "Salat", reason: "Oberflächlicher Wurzelbereich, keine Konkurrenz um Nährstoffe"},
      {plant: "Erbsen", reason: "Erbsen fixieren Stickstoff, den Karotten gut verwerten können"},
      {plant: "Schnittlauch", reason: "Hält Blattläuse und Möhrenfliege durch ätherische Öle fern"}
    ],
    bad: [
      {plant: "Dill", reason: "Kann das Karottenwachstum hemmen und zieht Möhrenfliege an"},
      {plant: "Petersilie", reason: "Verwandte Doldenblütler - können sich gegenseitig in der Entwicklung hemmen"},
      {plant: "Sellerie", reason: "Ebenfalls Doldenblütler mit ähnlichen Nährstoffansprüchen"},
      {plant: "Fenchel", reason: "Allelopathische Wirkung hemmt Karottenwachstum"},
      {plant: "Anis", reason: "Doldenblütler-Konkurrenz und mögliche Wachstumshemmung"}
    ]
  },
  "Gurken": {
    good: [
      {plant: "Bohnen", reason: "Bohnen fixieren Stickstoff, den Gurken für ihr Blattwachstum benötigen"},
      {plant: "Erbsen", reason: "Stickstoffdüngung durch Knöllchenbakterien kommt Gurken zugute"},
      {plant: "Salat", reason: "Bodenbeschattung hält Feuchtigkeit, verschiedene Wurzeltiefen"},
      {plant: "Zwiebeln", reason: "Halten Blattläuse und andere Schädlinge durch Geruch fern"},
      {plant: "Kohl", reason: "Kohl profitiert von der Bodenbeschattung der Gurken"},
      {plant: "Dill", reason: "Verbessert Geschmack und hält Schädlinge wie Spinnmilben fern"},
      {plant: "Basilikum", reason: "Natürlicher Schädlingsschutz und Geschmacksverbesserung"}
    ],
    bad: [
      {plant: "Kartoffeln", reason: "Konkurrenz um Wasser und Nährstoffe, ähnliche Krankheitsanfälligkeit"},
      {plant: "Tomaten", reason: "Beide wärmebedürftig - Konkurrenz um beste Standorte und Krankheitsübertragung"},
      {plant: "Radieschen", reason: "Radieschen können Gurkenwurzeln beim Wachstum stören"},
      {plant: "Aromahafte Kräuter", reason: "Zu intensive Gerüche können Gurkengeschmack beeinträchtigen"}
    ]
  },
  "Kartoffeln": {
    good: [
      {plant: "Bohnen", reason: "Stickstoffdüngung durch Bohnen kommt Kartoffeln zugute"},
      {plant: "Kohl", reason: "Kohl hält Kartoffelkäfer fern, Kartoffeln lockern Boden für Kohl"},
      {plant: "Mais", reason: "Verschiedene Wurzeltiefen und Mais beschattet Kartoffeln nicht"},
      {plant: "Spinat", reason: "Schnell abgeerntet, beschattet Boden und hält Feuchtigkeit"},
      {plant: "Kapuzinerkresse", reason: "Hält Kartoffelkäfer natürlich fern"},
      {plant: "Meerrettich", reason: "Wirkt fungizid und bakterizid, schützt vor Krankheiten"}
    ],
    bad: [
      {plant: "Tomaten", reason: "Beide Nachtschattengewächse - erhöhtes Risiko für Kraut- und Braunfäule"},
      {plant: "Gurken", reason: "Hoher Wasserbedarf beider Pflanzen führt zu Konkurrenz"},
      {plant: "Kürbis", reason: "Platzbedarf und Nährstoffkonkurrenz um Kalium"},
      {plant: "Sonnenblumen", reason: "Allelopathische Wirkung hemmt Kartoffelwachstum"},
      {plant: "Himbeeren", reason: "Können Verticillium-Welke übertragen"}
    ]
  },
  "Bohnen": {
    good: [
      {plant: "Karotten", reason: "Bohnen fixieren Stickstoff, Karotten lockern Boden für Bohnenwurzeln"},
      {plant: "Gurken", reason: "Stickstoffdüngung durch Bohnen unterstützt Gurkenwachstum"},
      {plant: "Kartoffeln", reason: "Ergänzende Nährstoffbedürfnisse und Bohnen verbessern Bodenstruktur"},
      {plant: "Kohl", reason: "Stickstoffversorgung für Kohl, verschiedene Wurzeltiefen"},
      {plant: "Salat", reason: "Schnelle Ernte, profitiert von Stickstoff der Bohnen"},
      {plant: "Radieschen", reason: "Kurze Kulturdauer, lockern Boden für Bohnen"}
    ],
    bad: [
      {plant: "Zwiebeln", reason: "Zwiebeln hemmen das Wachstum der Knöllchenbakterien an Bohnenwurzeln"},
      {plant: "Knoblauch", reason: "Ähnlicher hemmender Effekt auf Stickstoff-Fixierung wie Zwiebeln"},
      {plant: "Fenchel", reason: "Allelopathische Substanzen können Bohnenwachstum beeinträchtigen"},
      {plant: "Lauch", reason: "Kann die Stickstoff-Fixierung der Bohnen beeinträchtigen"}
    ]
  },
  "Kohl": {
    good: [
      {plant: "Zwiebeln", reason: "Halten Kohlweißling und andere Schädlinge durch intensiven Geruch fern"},
      {plant: "Kartoffeln", reason: "Kartoffeln halten Erdflöhe fern, Kohl schützt vor Kartoffelkäfer"},
      {plant: "Salat", reason: "Beschattet Boden, verschiedene Nährstoffansprüche"},
      {plant: "Spinat", reason: "Bodenbeschattung und schnelle Ernte vor Kohlentwicklung"},
      {plant: "Sellerie", reason: "Hält Kohlweißling fern und verbessert Bodenstruktur"},
      {plant: "Tomaten", reason: "Tomaten können Kohlweißling abhalten"}
    ],
    bad: [
      {plant: "Erdbeeren", reason: "Kohl entzieht Erdbeeren wichtige Nährstoffe und hemmt Fruchtbildung"},
      {plant: "Knoblauch", reason: "Kann Kohlwachstum durch allelopathische Wirkung hemmen"},
      {plant: "Andere Kohlarten", reason: "Gleiche Schädlinge und Krankheiten, Nährstoffkonkurrenz"}
    ]
  },
  "Salat": {
    good: [
      {plant: "Karotten", reason: "Oberflächliche Wurzeln konkurrieren nicht mit tiefen Karottenwurzeln"},
      {plant: "Radieschen", reason: "Beide schnellwachsend, Radieschen lockern Boden für Salat"},
      {plant: "Gurken", reason: "Salat beschattet Boden und hält Feuchtigkeit für Gurken"},
      {plant: "Erdbeeren", reason: "Salat hält Boden feucht und unkrautfrei für Erdbeeren"},
      {plant: "Zwiebeln", reason: "Zwiebelgeruch hält Blattläuse vom Salat fern"},
      {plant: "Lauch", reason: "Ähnlicher Schutzeffekt wie Zwiebeln gegen Schädlinge"}
    ],
    bad: [
      {plant: "Petersilie", reason: "Kann Salat in der Entwicklung hemmen durch Wurzelausscheidungen"},
      {plant: "Sellerie", reason: "Konkurrenz um oberflächennahe Nährstoffe"}
    ]
  },
  "Zwiebeln": {
    good: [
      {plant: "Karotten", reason: "Klassische Partnerschaft - Zwiebelgeruch hält Möhrenfliege fern"},
      {plant: "Rote Bete", reason: "Verschiedene Wurzeltiefen, Zwiebeln schützen vor Blattläusen"},
      {plant: "Salat", reason: "Schutz vor Schädlingen, verschiedene Nährstoffansprüche"},
      {plant: "Tomaten", reason: "Halten Blattläuse und andere Schädlinge von Tomaten fern"},
      {plant: "Erdbeeren", reason: "Schützen vor Grauschimmel und anderen Pilzkrankheiten"},
      {plant: "Kohl", reason: "Intensiver Geruch hält Kohlschädlinge fern"}
    ],
    bad: [
      {plant: "Bohnen", reason: "Hemmen die Knöllchenbakterien und damit Stickstoff-Fixierung der Bohnen"},
      {plant: "Erbsen", reason: "Ähnlicher negativer Effekt auf Stickstoff-Fixierung wie bei Bohnen"},
      {plant: "Lauch", reason: "Konkurrenz der Zwiebelgewächse um gleiche Nährstoffe"}
    ]
  },
  "Erdbeeren": {
    good: [
      {plant: "Spinat", reason: "Hält Boden feucht und unkrautfrei, schnelle Ernte vor Erdbeersaison"},
      {plant: "Salat", reason: "Bodenbeschattung und Unkrautunterdrückung"},
      {plant: "Zwiebeln", reason: "Schützen vor Grauschimmel und anderen Pilzkrankheiten"},
      {plant: "Knoblauch", reason: "Natürlicher Fungizidschutz gegen Erdbeerkrankheiten"},
      {plant: "Thymian", reason: "Hält Schnecken fern und verbessert Erdbeergeschmack"},
      {plant: "Borretsch", reason: "Verbessert Geschmack und zieht Bestäuber an"}
    ],
    bad: [
      {plant: "Kohl", reason: "Entzieht Erdbeeren wichtige Nährstoffe und kann Wachstum hemmen"},
      {plant: "Blumenkohl", reason: "Starke Nährstoffkonkurrenz schadet der Fruchtbildung"}
    ]
  },
  "Spinat": {
    good: [
      {plant: "Erdbeeren", reason: "Beschattet Boden, hält Feuchtigkeit und ist früh abgeerntet"},
      {plant: "Kohl", reason: "Verschiedene Wachstumsperioden, Spinat ist vor Kohlentwicklung geerntet"},
      {plant: "Radieschen", reason: "Beide schnellwachsend, ergänzen sich in der Bodennutzung"},
      {plant: "Kartoffeln", reason: "Bodenbeschattung für Kartoffeln, verschiedene Nährstoffbedürfnisse"},
      {plant: "Tomaten", reason: "Frühe Ernte vor Tomatenhauptwachstum"}
    ],
    bad: [
      {plant: "Rote Bete", reason: "Beide Gänsefußgewächse - können sich gegenseitig hemmen"},
      {plant: "Mangold", reason: "Verwandte Pflanzen konkurrieren um gleiche Nährstoffe"}
    ]
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

  const filteredPlants = Object.keys(COMPANION_PLANTS).filter(plant =>
    plant.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                      {filteredPlants.map(plant => (
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
                          <h4 className="font-medium text-earth-800 mb-3 flex items-center gap-2">
                            <span className="text-green-600">✓</span> Gute Nachbarn
                          </h4>
                          <div className="space-y-3">
                            {COMPANION_PLANTS[selectedPlant].good.map(({plant, reason}) => (
                              <TooltipProvider key={plant}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 cursor-help transition-colors">
                                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                      <span className="font-medium">{plant}</span>
                                      <Info className="h-3 w-3 text-green-600 ml-auto" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-xs">
                                    <p className="text-sm">{reason}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-earth-800 mb-3 flex items-center gap-2">
                            <span className="text-red-600">✗</span> Schlechte Nachbarn
                          </h4>
                          <div className="space-y-3">
                            {COMPANION_PLANTS[selectedPlant].bad.map(({plant, reason}) => (
                              <TooltipProvider key={plant}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 cursor-help transition-colors">
                                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                      <span className="font-medium">{plant}</span>
                                      <Info className="h-3 w-3 text-red-600 ml-auto" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-xs">
                                    <p className="text-sm">{reason}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
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

                    <div className="bg-accent-50 p-4 rounded-lg border border-accent-200">
                      <h3 className="font-medium text-earth-800 mb-2">Mischkultur-Prinzipien</h3>
                      <p className="text-earth-600">
                        Nutze die natürlichen Eigenschaften der Pflanzen: Tiefwurzler neben Flachwurzlern, Starkzehrer neben Schwachzehrern, duftende Kräuter als natürlicher Schädlingsschutz.
                      </p>
                    </div>

                    <div className="bg-sage-50 p-4 rounded-lg border border-sage-200">
                      <h3 className="font-medium text-earth-800 mb-2">Fruchtfolge beachten</h3>
                      <p className="text-earth-600">
                        Baue nicht jedes Jahr die gleichen Pflanzen am selben Standort an. Eine gute Fruchtfolge beugt Bodenmüdigkeit und Krankheiten vor.
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
