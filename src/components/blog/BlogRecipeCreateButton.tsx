
import React from "react";
import { Loader } from "lucide-react";

interface BlogRecipeCreateButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}

const BlogRecipeCreateButton: React.FC<BlogRecipeCreateButtonProps> = ({
  disabled,
  loading,
  onClick,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="bg-sage-600 text-white px-6 py-2 rounded-full hover:bg-sage-700 transition-colors flex items-center gap-2"
  >
    {loading && <Loader className="animate-spin h-4 w-4" />}
    Rezept zum Thema erstellen
  </button>
);

export default BlogRecipeCreateButton;
