import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Shield, Eye, Globe, AlertTriangle } from 'lucide-react';

const CookiePolicy = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Cookie className="h-12 w-12 text-sage-600 mx-auto mb-4" />
        <h1 className="text-3xl font-serif font-bold text-earth-800 mb-4">
          Cookie-Richtlinie & Werbung
        </h1>
        <p className="text-lg text-earth-600">
          Transparente Information über Cookies und Werbung auf unserer Website
        </p>
      </div>

      <div className="space-y-8">
        {/* Was sind Cookies */}
        <section className="bg-sage-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-sage-600 mr-2" />
            <h2 className="text-xl font-semibold text-earth-800">Was sind Cookies?</h2>
          </div>
          <p className="text-earth-700 mb-4">
            Cookies sind kleine Textdateien, die von Websites auf deinem Gerät gespeichert werden. 
            Sie helfen uns dabei, die Website benutzerfreundlicher, effektiver und sicherer zu machen.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-earth-800 mb-2">Notwendige Cookies</h3>
              <p className="text-sm text-earth-600">
                Ermöglichen grundlegende Funktionen wie Navigation und Zugang zu sicheren Bereichen.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-earth-800 mb-2">Analyse-Cookies</h3>
              <p className="text-sm text-earth-600">
                Helfen uns zu verstehen, wie Besucher mit der Website interagieren (Google Analytics).
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-earth-800 mb-2">Werbe-Cookies</h3>
              <p className="text-sm text-earth-600">
                Werden für relevante Werbeanzeigen und Reichweitenmessung verwendet (Google AdSense).
              </p>
            </div>
          </div>
        </section>

        {/* Konkrete Cookie-Verwendung */}
        <section>
          <div className="flex items-center mb-4">
            <Eye className="h-6 w-6 text-sage-600 mr-2" />
            <h2 className="text-xl font-semibold text-earth-800">Welche Cookies wir verwenden</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
              <thead className="bg-sage-100">
                <tr>
                  <th className="text-left p-4 font-semibold text-earth-800">Cookie-Name</th>
                  <th className="text-left p-4 font-semibold text-earth-800">Zweck</th>
                  <th className="text-left p-4 font-semibold text-earth-800">Anbieter</th>
                  <th className="text-left p-4 font-semibold text-earth-800">Laufzeit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                <tr>
                  <td className="p-4 font-mono text-sm">_ga</td>
                  <td className="p-4 text-earth-700">Unterscheidung von Nutzern</td>
                  <td className="p-4 text-earth-700">Google Analytics</td>
                  <td className="p-4 text-earth-700">2 Jahre</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-sm">_gid</td>
                  <td className="p-4 text-earth-700">Unterscheidung von Nutzern</td>
                  <td className="p-4 text-earth-700">Google Analytics</td>
                  <td className="p-4 text-earth-700">24 Stunden</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-sm">__gads</td>
                  <td className="p-4 text-earth-700">Werbeanzeigen-Tracking</td>
                  <td className="p-4 text-earth-700">Google AdSense</td>
                  <td className="p-4 text-earth-700">2 Jahre</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-sm">sb-*</td>
                  <td className="p-4 text-earth-700">Authentifizierung</td>
                  <td className="p-4 text-earth-700">Supabase</td>
                  <td className="p-4 text-earth-700">Session</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Google AdSense Information */}
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 mr-2" />
            <h2 className="text-xl font-semibold text-earth-800">Werbung mit Google AdSense</h2>
          </div>
          <div className="space-y-4">
            <p className="text-earth-700">
              Wir verwenden Google AdSense, um Werbeanzeigen zu schalten. Google kann dabei folgende Daten verarbeiten:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-earth-700">
              <li>IP-Adresse (anonymisiert)</li>
              <li>Informationen über besuchte Seiten</li>
              <li>Browser- und Geräteinformationen</li>
              <li>Ungefährer Standort (auf Stadtebene)</li>
            </ul>
            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-earth-800 mb-2">Personalisierte Werbung</h3>
              <p className="text-earth-700 mb-3">
                Google kann personalisierte Werbung basierend auf deinen Interessen anzeigen.
              </p>
              <a 
                href="https://www.google.com/settings/ads" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sage-600 hover:text-sage-700 font-medium"
              >
                <Globe className="h-4 w-4 mr-1" />
                Werbeeinstellungen bei Google verwalten
              </a>
            </div>
          </div>
        </section>

        {/* Cookie-Kontrolle */}
        <section>
          <h2 className="text-xl font-semibold text-earth-800 mb-4">Deine Cookie-Kontrolle</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-sage-50 p-6 rounded-lg">
              <h3 className="font-semibold text-earth-800 mb-3">Browser-Einstellungen</h3>
              <p className="text-earth-700 mb-4">
                Du kannst Cookies in deinem Browser verwalten oder komplett deaktivieren.
                Beachte, dass dies die Funktionalität der Website beeinträchtigen kann.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Chrome:</strong> Einstellungen → Erweitert → Datenschutz und Sicherheit → Cookies</p>
                <p><strong>Firefox:</strong> Einstellungen → Datenschutz & Sicherheit → Cookies</p>
                <p><strong>Safari:</strong> Einstellungen → Datenschutz → Cookies verwalten</p>
              </div>
            </div>
            <div className="bg-accent-50 p-6 rounded-lg">
              <h3 className="font-semibold text-earth-800 mb-3">Werbung abschalten</h3>
              <p className="text-earth-700 mb-4">
                Du kannst personalisierte Werbung deaktivieren:
              </p>
              <div className="space-y-3">
                <a 
                  href="https://www.google.com/settings/ads" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-sage-600 hover:text-sage-700 underline"
                >
                  → Google Werbeeinstellungen
                </a>
                <a 
                  href="https://optout.aboutads.info/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-sage-600 hover:text-sage-700 underline"
                >
                  → Digital Advertising Alliance Opt-Out
                </a>
                <a 
                  href="https://www.youronlinechoices.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-sage-600 hover:text-sage-700 underline"
                >
                  → Your Online Choices (EU)
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Kontakt und weitere Infos */}
        <section className="bg-white border border-sage-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-earth-800 mb-4">Fragen zu Cookies und Datenschutz?</h2>
          <p className="text-earth-700 mb-4">
            Bei Fragen zur Verwendung von Cookies oder zum Datenschutz kannst du uns gerne kontaktieren.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/kontakt" 
              className="inline-flex items-center bg-sage-600 text-white px-4 py-2 rounded-lg hover:bg-sage-700 transition-colors"
            >
              Kontakt aufnehmen
            </Link>
            <Link 
              to="/datenschutz" 
              className="inline-flex items-center border border-sage-600 text-sage-600 px-4 py-2 rounded-lg hover:bg-sage-50 transition-colors"
            >
              Vollständige Datenschutzerklärung
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-12 text-center text-sm text-sage-600 bg-sage-50 p-4 rounded-lg">
        <p>
          Letzte Aktualisierung: {new Date().toLocaleDateString('de-DE')} | 
          Diese Cookie-Richtlinie wird regelmäßig überprüft und bei Bedarf aktualisiert.
        </p>
      </div>
    </div>
  );
};

export default CookiePolicy;