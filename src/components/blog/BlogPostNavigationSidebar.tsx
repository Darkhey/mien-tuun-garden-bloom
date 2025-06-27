import React from "react";

export type Heading = {
  id: string;
  text: string;
  level: number;
};

interface BlogPostNavigationSidebarProps {
  headings: Heading[];
}

const BlogPostNavigationSidebar: React.FC<BlogPostNavigationSidebarProps> = ({
  headings,
}) => {
  if (headings.length === 0) return null;

  return (
    <aside className="hidden xl:block fixed top-32 right-8 w-64 text-sm">
      <nav className="sticky top-32" aria-label="Article navigation">
        <h2 className="text-lg font-serif font-bold mb-4 text-earth-800">
          Inhalt
        </h2>
        <ul className="space-y-2">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
              <a
                href={`#${h.id}`}
                className="text-sage-700 hover:text-sage-900"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default BlogPostNavigationSidebar;
