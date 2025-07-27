
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Clock, MessageCircle, Shield, Heart } from "lucide-react";

const ContactPage = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/functions/v1/send-contact-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Nachricht gesendet", description: "Danke für deine Nachricht! Ich melde mich bald." });
        setForm({ name: "", email: "", message: "" });
      } else {
        toast({ title: "Fehler", description: data?.error || "Nachricht konnte nicht gesendet werden.", variant: "destructive"});
      }
    } catch (err) {
      toast({ title: "Fehler", description: "Nachricht konnte nicht gesendet werden.", variant: "destructive"});
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-accent-50">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sage-100 rounded-full mb-6">
            <MessageCircle className="h-8 w-8 text-sage-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-4">
            Lass uns ins Gespräch kommen!
          </h1>
          <p className="text-xl text-earth-600 max-w-2xl mx-auto">
            Du hast Fragen zu meinen Gartentipps, möchtest ein Rezept teilen oder einfach Hallo sagen? 
            Ich freue mich über jede Nachricht!
          </p>
        </div>
      </section>

      {/* Contact Info und Form */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-serif font-bold text-earth-800 mb-4 flex items-center">
                <Heart className="h-6 w-6 text-sage-600 mr-2" />
                Über Marianne
              </h2>
              <p className="text-earth-700 mb-4">
                Moin! Ich bin Marianne, leidenschaftliche Gärtnerin aus Ostfriesland. 
                Hier teile ich meine Erfahrungen aus über 20 Jahren Gärtnerei.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-earth-600">
                  <MapPin className="h-5 w-5 text-sage-600 mr-3" />
                  <span>Ostfriesland, Deutschland</span>
                </div>
                <div className="flex items-center text-earth-600">
                  <Mail className="h-5 w-5 text-sage-600 mr-3" />
                  <span>hallo@mien-tuun.de</span>
                </div>
                <div className="flex items-center text-earth-600">
                  <Clock className="h-5 w-5 text-sage-600 mr-3" />
                  <span>Antwort innerhalb von 24-48 Stunden</span>
                </div>
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-earth-800 mb-4">Häufige Fragen</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-earth-800">🌱 Gartentipps für Anfänger?</p>
                  <p className="text-earth-600">Schau in meinen Blog - dort findest du viele Anfänger-Guides!</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-earth-800">📧 Newsletter abonnieren?</p>
                  <p className="text-earth-600">Am Ende jeder Seite findest du die Newsletter-Anmeldung.</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-earth-800">🍽️ Rezept vorschlagen?</p>
                  <p className="text-earth-600">Nutze gerne das Kontaktformular - ich freue mich über Ideen!</p>
                </div>
              </div>
            </div>

            {/* Datenschutz Hinweis */}
            <div className="bg-sage-50 rounded-lg p-4 text-sm">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-sage-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-earth-700 mb-2">
                    <strong>Datenschutz:</strong> Deine Daten werden nur zur Bearbeitung deiner Anfrage verwendet 
                    und nach 6 Monaten gelöscht.
                  </p>
                  <a href="/datenschutz" className="text-sage-600 hover:text-sage-700 underline">
                    Vollständige Datenschutzerklärung
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-serif font-bold text-earth-800 mb-2">
                Schreib mir eine Nachricht
              </h2>
              <p className="text-earth-600 mb-8">
                Ob Gartenfrage, Rezept-Tipp oder einfach ein nettes Hallo - ich freue mich über deine Nachricht!
              </p>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block mb-2 text-earth-700 font-medium">
                      Dein Name *
                    </label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange} 
                      required 
                      autoComplete="name"
                      className="h-12"
                      placeholder="Wie heißt du?"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-2 text-earth-700 font-medium">
                      Deine E-Mail *
                    </label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={form.email} 
                      onChange={handleChange} 
                      required 
                      autoComplete="email"
                      className="h-12"
                      placeholder="deine@email.de"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block mb-2 text-earth-700 font-medium">
                    Deine Nachricht *
                  </label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    rows={6} 
                    value={form.message} 
                    onChange={handleChange} 
                    required 
                    placeholder="Erzähl mir, womit ich dir helfen kann..."
                    className="resize-none"
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-earth-600">
                    * Pflichtfelder
                  </p>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="px-8 py-3 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Wird gesendet...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Nachricht senden
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default ContactPage;
