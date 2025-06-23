
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { fetchLatestComments, type CommentRow } from '@/queries/content';

const LatestCommentsSection: React.FC = () => {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['latest-comments'],
    queryFn: fetchLatestComments,
  });

  if (isLoading) {
    return (
      <section className="py-16 px-4 text-center">
        <p className="text-sage-600">Lade neueste Kommentare...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 text-center">
        <p className="text-sage-600">
          Kommentare konnten nicht geladen werden.
          {process.env.NODE_ENV === 'development' && (
            <span className="block text-xs text-red-500 mt-1">
              {error instanceof Error ? error.message : 'Unknown error'}
            </span>
          )}
        </p>
      </section>
    );
  }

  if (!data.length) return null;

  return (
    <section className="py-16 px-4 bg-sage-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mb-8 text-center">
          Neueste Kommentare
        </h2>
        <ul className="space-y-4">
          {data.map((c) => (
            <li key={c.id} className="bg-white p-4 rounded-xl border border-sage-100 shadow-sm">
              <p
                className="text-earth-700 text-sm mb-2 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(c.content) }}
              />
              <Link to={`/blog/${c.blog_slug}`} className="text-sage-600 text-xs hover:underline">
                Zum Beitrag
              </Link>
              <span className="text-sage-400 text-xs ml-2">
                {new Date(c.created_at).toLocaleDateString('de-DE')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default LatestCommentsSection;
