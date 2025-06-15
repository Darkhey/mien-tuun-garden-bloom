
import React from "react";
import { Link } from "react-router-dom";

interface BlogRecipeSuccessMessageProps {
  slug: string;
}

const BlogRecipeSuccessMessage: React.FC<BlogRecipeSuccessMessageProps> = ({
  slug,
}) => (
  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
    <div className="flex items-center gap-2 text-green-800">
      <span>✅</span>
      <span className="font-semibold">Rezept erfolgreich erstellt!</span>
    </div>
    <p className="text-green-700 mt-2">
      Das Rezept wurde zu deinen Rezepten hinzugefügt und ist jetzt für alle sichtbar.
    </p>
    <Link
      to={`/rezept/${slug}`}
      className="inline-flex items-center gap-2 mt-3 bg-sage-600 text-white px-4 py-2 rounded-full hover:bg-sage-700 transition-colors"
    >
      Zum Rezept gehen →
    </Link>
  </div>
);

export default BlogRecipeSuccessMessage;
