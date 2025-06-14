
import React from "react";
import { Link } from "react-router-dom";

const legalLinks = [
  { title: "Impressum", to: "/impressum" },
  { title: "Datenschutzerklärung", to: "/datenschutz" },
  // Du kannst hier weitere rechtliche Seiten verlinken, falls vorhanden.
];

const LegalLinkTree = () => (
  <div className="space-y-2 my-4">
    {legalLinks.map((item) => (
      <Link
        key={item.to}
        to={item.to}
        className="block px-4 py-2 bg-earth-50 hover:bg-sage-100 rounded text-earth-700 font-medium border border-sage-100"
      >
        {item.title}
      </Link>
    ))}
  </div>
);

export default LegalLinkTree;
