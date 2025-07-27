
import React from "react";

const Datenschutz = () => (
  <div className="max-w-2xl mx-auto px-4 py-16">
    <h1 className="text-3xl font-serif font-bold mb-6 text-earth-800">
      Datenschutzerklärung
    </h1>
    <p className="mb-4 text-earth-700">
      Der Schutz deiner persönlichen Daten ist uns ein besonderes Anliegen. Wir
      verarbeiten deine Daten daher ausschließlich auf Grundlage der gesetzlichen
      Bestimmungen (DSGVO, TKG 2003).
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-3">Kontakt mit uns</h2>
    <p className="mb-4">
      Wenn du per Formular auf der Website oder per E-Mail Kontakt mit uns
      aufnimmst, werden deine angegebenen Daten zwecks Bearbeitung der Anfrage
      und für den Fall von Anschlussfragen sechs Monate bei uns gespeichert.
      Diese Daten geben wir nicht ohne deine Einwilligung weiter.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-3">Eingesetzte Dienste</h2>
    <p className="mb-4">Für den Betrieb dieser Website nutzen wir:</p>
    <ul className="list-disc pl-5 mb-4 space-y-1">
      <li><strong>Supabase</strong> (Backend und Datenbank) - Datenverarbeitung in der EU</li>
      <li><strong>OpenAI und Google Gemini</strong> (KI-generierte Inhalte) - Anonymisierte Textverarbeitung</li>
      <li><strong>Unsplash</strong> (Bilderdienst) - Nur öffentliche Bilder</li>
      <li><strong>Open-Meteo</strong> (Wetterdaten) - Keine personenbezogenen Daten</li>
      <li><strong>Google Analytics</strong> (Reichweitenmessung) - IP-Anonymisierung aktiviert</li>
      <li><strong>Google AdSense</strong> (Werbeanzeigen) - Personalisierte Werbung (deaktivierbar)</li>
      <li><strong>Resend</strong> (E-Mail-Versand) - Nur für Kontaktformular-Anfragen</li>
    </ul>

    <h3 className="text-lg font-semibold mt-6 mb-3">Google AdSense - Detaillierte Informationen</h3>
    <p className="mb-4">
      Google AdSense verwendet Cookies und ähnliche Technologien, um personalisierte Werbung anzuzeigen.
      Dabei können folgende Daten verarbeitet werden:
    </p>
    <ul className="list-disc pl-5 mb-4 space-y-1">
      <li>Anonymisierte IP-Adresse (letztes Oktett entfernt)</li>
      <li>Browser- und Geräteinformationen</li>
      <li>Ungefährer Standort (nur auf Stadtebene)</li>
      <li>Besuchte Seiten auf unserer Website</li>
      <li>Interessen basierend auf dem Browsing-Verhalten</li>
    </ul>
    <p className="mb-4">
      <strong>Deine Kontrolle:</strong> Du kannst personalisierte Werbung deaktivieren über 
      <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener" className="text-sage-600 hover:text-sage-700 underline ml-1">
        Google Werbeeinstellungen
      </a> oder eine umfassende Cookie-Verwaltung über 
      <a href="/cookie-policy" className="text-sage-600 hover:text-sage-700 underline ml-1">
        unsere Cookie-Richtlinie
      </a> vornehmen.
    </p>

    <p className="mb-4">
      Bei der Nutzung dieser Services können Daten wie IP-Adresse und
      Browser-Informationen an die jeweiligen Anbieter übertragen werden. Alle
      Services sind DSGVO-konform konfiguriert. Für Details verweisen wir auf die 
      Datenschutzerklärungen dieser Drittanbieter.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-3">Cookies</h2>
    <p className="mb-4">
      Unsere Website verwendet verschiedene Arten von Cookies:
    </p>
    <ul className="list-disc pl-5 mb-4 space-y-1">
      <li><strong>Technisch notwendige Cookies:</strong> Session-Management, Authentifizierung</li>
      <li><strong>Analytics-Cookies (Google Analytics):</strong> Besucherstatistiken, anonymisiert</li>
      <li><strong>Werbe-Cookies (Google AdSense):</strong> Personalisierte Werbung</li>
      <li><strong>Funktions-Cookies:</strong> Benutzereinstellungen (z.B. Sidebar-Status)</li>
    </ul>
    <p className="mb-4">
      <strong>Cookie-Kontrolle:</strong> Du kannst Cookies in deinem Browser verwalten, 
      blockieren oder löschen. Eine detaillierte Anleitung und Opt-Out-Möglichkeiten 
      findest du in unserer 
      <a href="/cookie-policy" className="text-sage-600 hover:text-sage-700 underline">
        Cookie-Richtlinie
      </a>.
      Das Deaktivieren von Cookies kann die Funktionalität unserer Website einschränken.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-3">Deine Rechte</h2>
    <p className="mb-4">
      Nach der DSGVO stehen dir folgende Rechte zu:
    </p>
    <ul className="list-disc pl-5 mb-4 space-y-1">
      <li><strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Welche Daten wir über dich gespeichert haben</li>
      <li><strong>Berichtigungsrecht (Art. 16 DSGVO):</strong> Korrektur falscher Daten</li>
      <li><strong>Löschungsrecht (Art. 17 DSGVO):</strong> "Recht auf Vergessenwerden"</li>
      <li><strong>Einschränkungsrecht (Art. 18 DSGVO):</strong> Sperrung der Datenverarbeitung</li>
      <li><strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Export deiner Daten</li>
      <li><strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Stopp der Datenverarbeitung</li>
    </ul>
    <p className="mb-4">
      <strong>Kontakt für Datenschutzanfragen:</strong> Sende uns eine E-Mail an 
      <a href="mailto:datenschutz@mien-tuun.de" className="text-sage-600 hover:text-sage-700 underline">
        datenschutz@mien-tuun.de
      </a> oder nutze unser <a href="/kontakt" className="text-sage-600 hover:text-sage-700 underline">Kontaktformular</a>.
    </p>
    <p className="mb-4">
      <strong>Beschwerderecht:</strong> Du kannst dich bei der zuständigen Aufsichtsbehörde beschweren:
      <br />
      Landesbeauftragte für Datenschutz und Informationsfreiheit Niedersachsen
      <br />
      Prinzenstraße 5, 30159 Hannover
      <br />
      <a href="https://lfd.niedersachsen.de/" target="_blank" rel="noopener" className="text-sage-600 hover:text-sage-700 underline">
        lfd.niedersachsen.de
      </a>
    </p>
    <div className="mt-8 text-sm text-sage-700">
      Letzte Aktualisierung: {new Date().getFullYear()}
    </div>
  </div>
);

export default Datenschutz;
