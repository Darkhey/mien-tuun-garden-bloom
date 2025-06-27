import React from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { slugify } from '@/utils/slugify';

const extractText = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (React.isValidElement(children)) return extractText(children.props.children);
  return '';
};

type BlogPostContentProps = {
  content: string;
};

const BlogPostContent: React.FC<BlogPostContentProps> = ({ content }) => (
  <div className="prose prose-lg max-w-none prose-earth prose-headings:font-serif prose-headings:text-earth-800 prose-p:text-earth-600 prose-li:text-earth-600 prose-strong:text-earth-800">
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => {
          const id = slugify(extractText(props.children));
          return (
            <h1 id={id} className="text-3xl md:text-4xl font-serif font-bold text-earth-800 mb-6" {...props} />
          );
        },
        h2: ({ node, ...props }) => {
          const id = slugify(extractText(props.children));
          return (
            <h2 id={id} className="text-2xl md:text-3xl font-serif font-bold text-earth-800 mt-8 mb-4" {...props} />
          );
        },
        h3: ({ node, ...props }) => {
          const id = slugify(extractText(props.children));
          return (
            <h3 id={id} className="text-xl md:text-2xl font-serif font-bold text-earth-800 mt-6 mb-3" {...props} />
          );
        },
        p: ({node, ...props}) => <p className="text-earth-600 mb-4 leading-relaxed" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 text-earth-600" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 text-earth-600" {...props} />,
        li: ({node, ...props}) => <li className="mb-2" {...props} />,
        a: ({node, ...props}) => <a className="text-sage-700 hover:text-sage-900 underline" {...props} />,
        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-sage-300 pl-4 italic text-earth-500 my-4" {...props} />,
        code: ({node, ...props}) => <code className="bg-sage-50 px-1 py-0.5 rounded text-earth-700" {...props} />,
        pre: ({node, ...props}) => <pre className="bg-sage-50 p-4 rounded-lg overflow-x-auto my-4" {...props} />,
        img: ({node, src, alt, ...props}) => (
          <img 
            src={src} 
            alt={alt || "Blog image"} 
            className="rounded-lg shadow-md my-6 max-w-full h-auto" 
            {...props} 
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default BlogPostContent;