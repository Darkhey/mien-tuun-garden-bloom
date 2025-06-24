
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
      <li>Supabase (Backend und Datenbank)</li>
      <li>OpenAI und Google&nbsp;Gemini (KI-generierte Inhalte)</li>
      <li>Unsplash (Bilderdienst)</li>
      <li>Open-Meteo (Wetterdaten)</li>
      <li>Google Analytics (Reichweitenmessung)</li>
      <li>Google AdSense (Werbeanzeigen)</li>
    </ul>
    <p className="mb-4">
      Bei der Nutzung dieser Services können Daten wie IP-Adresse und
      Browser-Informationen an die jeweiligen Anbieter übertragen werden. Für
      Details verweisen wir auf die Datenschutzerklärungen dieser
      Drittanbieter.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-3">Cookies</h2>
    <p className="mb-4">
      Unsere Website verwendet Cookies, um grundlegende Funktionen wie die
      Sidebar-Einstellung zu speichern. Darüber hinaus setzen wir Cookies von
      Google Analytics und Google AdSense ein, um die Nutzung der Website zu
      analysieren und personalisierte Werbung anzuzeigen. Du kannst das Speichern
      von Cookies in deinem Browser einschränken oder verhindern; dies kann
      jedoch die Funktionalität unserer Website einschränken.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-3">Deine Rechte</h2>
    <p>
      Dir stehen grundsätzlich die Rechte auf Auskunft, Berichtigung, Löschung,
      Einschränkung, Datenübertragbarkeit, Widerruf und Widerspruch zu. Wenn du
      glaubst, dass die Verarbeitung deiner Daten gegen das Datenschutzrecht
      verstößt oder deine datenschutzrechtlichen Ansprüche sonst in einer Weise
      verletzt worden sind, kannst du dich bei der Aufsichtsbehörde beschweren.
    </p>
    <div className="mt-8 text-sm text-sage-700">
      Letzte Aktualisierung: {new Date().getFullYear()}
    </div>
  </div>
);

export default Datenschutz;
