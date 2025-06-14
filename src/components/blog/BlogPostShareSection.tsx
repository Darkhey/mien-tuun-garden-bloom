
import React from 'react';

const BlogPostShareSection: React.FC = () => (
  <div className="mt-12 pt-8 border-t border-sage-200">
    <div className="bg-sage-50 rounded-xl p-6 text-center">
      <h3 className="text-xl font-serif font-bold text-earth-800 mb-4">
        Hat dir dieser Artikel gefallen?
      </h3>
      <p className="text-earth-600 mb-6">
        Teile ihn mit deinen Freunden und lass dich von weiteren Gartentipps inspirieren!
      </p>
      <div className="flex justify-center space-x-4">
        <button className="bg-sage-600 text-white px-6 py-2 rounded-full hover:bg-sage-700 transition-colors">
          Bei Pinterest merken
        </button>
        <button className="bg-earth-600 text-white px-6 py-2 rounded-full hover:bg-earth-700 transition-colors">
          Auf Facebook teilen
        </button>
      </div>
    </div>
  </div>
);

export default BlogPostShareSection;
