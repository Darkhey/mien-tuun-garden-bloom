import React from 'react';
import { siteConfig } from '@/config/site.config';
import { ExternalLink, Heart, Mail, Flower } from 'lucide-react';
import LegalLinkTree from "@/components/LegalLinkTree";

const Links = () => {
  const linkGroups = [
    {
      title: 'Social Media',
      links: [
        {
          name: 'Instagram',
          description: 'Tägliche Gartenimpressionen & Behind-the-Scenes',
          url: siteConfig.social.instagram,
          icon: '📷',
          color: 'from-pink-400 to-purple-500'
        },
        {
          name: 'Pinterest',
          description: 'Rezepte, Gartentipps & DIY-Inspiration',
          url: siteConfig.social.pinterest,
          icon: '📌',
          color: 'from-red-400 to-pink-500'
        }
      ]
    },
    {
      title: 'Newsletter & Kontakt',
      links: [
        {
          name: 'Newsletter abonnieren',
          description: 'Saisonale Rezepte & Gartentipps direkt ins Postfach',
          url: siteConfig.social.newsletter,
          icon: '💌',
          color: 'from-sage-400 to-sage-600'
        },
        {
          name: 'E-Mail schreiben',
          description: 'Fragen, Anregungen oder einfach ein Hallo',
          url: `mailto:${siteConfig.social.email}`,
          icon: '✉️',
          color: 'from-earth-400 to-earth-600'
        }
      ]
    },
    {
      title: 'Unterstützen',
      links: [
        {
          name: 'Ko-fi Spende',
          description: 'Unterstütze die Arbeit an diesem Blog',
          url: siteConfig.monetization.donationLink,
          icon: '☕',
          color: 'from-yellow-400 to-orange-500'
        }
      ]
    }
  ];

  return (
    {/* Header */}
      <section className="bg-gradient-to-br from-sage-50 to-accent-50 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Flower className="h-12 w-12 text-sage-600" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-earth-800 mb-4">
            {siteConfig.name}
          </h1>
          <p className="text-lg text-earth-600 mb-6">
            {siteConfig.description}
          </p>
          <div className="flex justify-center space-x-4">
            <span className="bg-sage-100 text-sage-700 px-3 py-1 rounded-full text-sm">
              🌱 Nachhaltigkeit
            </span>
            <span className="bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-sm">
              🍅 Saisonale Küche
            </span>
            <span className="bg-earth-100 text-earth-700 px-3 py-1 rounded-full text-sm">
              🌿 Gartenliebe
            </span>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto space-y-12">
          {linkGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h2 className="text-2xl font-serif font-bold text-earth-800 mb-6 text-center">
                {group.title}
              </h2>
              <div className="space-y-4">
                {group.links.map((link, linkIndex) => (
                  link.url && (
                    <a
                      key={linkIndex}
                      href={link.url}
                      target={link.url.startsWith('mailto:') ? '_self' : '_blank'}
                      rel={link.url.startsWith('mailto:') ? '' : 'noopener noreferrer'}
                      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-sage-100 overflow-hidden group"
                    >
                      <div className={`h-2 bg-gradient-to-r ${link.color}`}></div>
                      <div className="p-6 flex items-center">
                        <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">
                          {link.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-earth-800 mb-1 flex items-center">
                            {link.name}
                            <ExternalLink className="h-4 w-4 ml-2 text-earth-400 group-hover:text-sage-600 transition-colors" />
                          </h3>
                          <p className="text-earth-600 text-sm">
                            {link.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rechtliches/Legal Pages */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-serif font-bold text-earth-800 mb-2">Rechtliches</h2>
          <p className="text-earth-600 mb-4 text-sm">
            Hier findest du die wichtigsten rechtlichen Infos zu dieser Website.
          </p>
          <LegalLinkTree />
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-sage-600 to-earth-600">
        <div className="max-w-2xl mx-auto text-center text-white">
          <Heart className="h-12 w-12 mx-auto mb-4 text-sage-200" />
          <h2 className="text-2xl font-serif font-bold mb-4">
            Danke, dass du hier bist!
          </h2>
          <p className="text-lg text-sage-100 mb-6">
            Jeder Besuch, jedes geteilte Rezept und jeder Gartentipp macht diese Community lebendiger. 
            Zusammen schaffen wir eine grünere, nachhaltigere Welt.
          </p>
          <div className="inline-flex items-center bg-white/10 px-6 py-3 rounded-full">
            <Flower className="h-5 w-5 mr-2" />
            <span>Gemeinsam für eine grünere Zukunft</span>
          </div>
        </div>
      </section>
  );
};

export default Links;
