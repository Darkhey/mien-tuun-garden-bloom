
import React from "react";
const Impressum = () => (
  <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-serif font-bold mb-6 text-earth-800">
        Impressum
      </h1>
      <p className="mb-4 text-earth-700">
        Angaben gemäß § 5 TMG und Verantwortlich für den Inhalt dieser Seite:
      </p>
      <div className="mb-4">
        <strong>Max Mustermann</strong><br />
        Musterstraße 1<br />
        12345 Musterstadt<br />
        Deutschland
      </div>
      <div className="mb-4">
        <strong>Kontakt:</strong><br />
        E-Mail: info@example.com
      </div>
      <div className="mb-4">
        <strong>Haftung für Inhalte</strong><br />
        Trotz sorgfältiger inhaltlicher Kontrolle übernehme ich keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
      </div>
      <div className="mb-4">
        <strong>Werbung &amp; Partnerprogramme</strong><br />
        Diese Website bindet Anzeigen über Google AdSense ein und verwendet gelegentlich Affiliate-Links. Entsprechende Inhalte sind gekennzeichnet.
      </div>
      <div className="mt-8 text-sm text-sage-700">Letzte Aktualisierung: {new Date().getFullYear()}</div>
    </div>
);

export default Impressum;
