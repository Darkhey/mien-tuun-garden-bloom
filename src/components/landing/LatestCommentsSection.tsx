import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { fetchLatestComments } from '@/queries/content';
import { MessageCircle } from 'lucide-react';

const LatestCommentsSection: React.FC = () => {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['latest-comments'],
    queryFn: fetchLatestComments,
  });

  if (isLoading || error || !data.length) return null;

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Aus der Gemeinschaft
          </h2>
          <p className="text-muted-foreground text-lg">Was andere Gartenfreunde sagen</p>
        </div>
        <ul className="space-y-4">
          {data.map((c) => (
            <li key={c.id} className="garden-card p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-foreground/80 text-sm mb-2 line-clamp-2 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(c.content) }}
                />
                <div className="flex items-center gap-3">
                  <Link to={`/blog/${c.blog_slug}`} className="text-primary text-xs font-medium hover:underline">
                    Zum Beitrag →
                  </Link>
                  <span className="text-muted-foreground text-xs">
                    {new Date(c.created_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default LatestCommentsSection;
