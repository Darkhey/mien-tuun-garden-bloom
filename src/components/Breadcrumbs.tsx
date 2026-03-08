import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://mien-tuun.de/" },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.label,
        ...(item.href ? { item: `https://mien-tuun.de${item.href}` } : {}),
      })),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground py-3 px-4 max-w-4xl mx-auto flex-wrap">
        <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="h-3.5 w-3.5" /> Home
        </Link>
        {items.map((item, i) => (
          <React.Fragment key={i}>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            {item.href ? (
              <Link to={item.href} className="hover:text-primary transition-colors">{item.label}</Link>
            ) : (
              <span className="text-foreground font-medium truncate max-w-[200px]">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  );
};

export default Breadcrumbs;
