import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "@/utils/slugify";
import { extractText } from "@/utils/textExtraction";

const createHeading = (level: 1 | 2 | 3, className: string) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return ({
    node,
    ...props
  }: { node: any } & React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = extractText(props.children);
    const slug = slugify(text);
    const id =
      slug || `heading-${level}-${Math.random().toString(36).slice(2, 8)}`;
    return React.createElement(Tag, { ...props, id, className });
  };
};

type BlogPostContentProps = {
  content: string;
};

const BlogPostContent: React.FC<BlogPostContentProps> = ({ content }) => (
  <div className="prose prose-lg max-w-none prose-earth prose-headings:font-serif prose-headings:text-earth-800 prose-p:text-earth-600 prose-li:text-earth-600 prose-strong:text-earth-800">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: createHeading(
          1,
          "text-3xl md:text-4xl font-serif font-bold text-earth-800 mb-6",
        ),
        h2: createHeading(
          2,
          "text-2xl md:text-3xl font-serif font-bold text-earth-800 mt-8 mb-4",
        ),
        h3: createHeading(
          3,
          "text-xl md:text-2xl font-serif font-bold text-earth-800 mt-6 mb-3",
        ),
        p: ({ node, ...props }) => (
          <p className="text-earth-600 mb-4 leading-relaxed" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc pl-6 mb-6 text-earth-600" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal pl-6 mb-6 text-earth-600" {...props} />
        ),
        li: ({ node, ...props }) => <li className="mb-2" {...props} />,
        a: ({ node, ...props }) => (
          <a
            className="text-sage-700 hover:text-sage-900 underline"
            {...props}
          />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-sage-300 pl-4 italic text-earth-500 my-4"
            {...props}
          />
        ),
        code: ({ node, ...props }) => (
          <code
            className="bg-sage-50 px-1 py-0.5 rounded text-earth-700"
            {...props}
          />
        ),
        pre: ({ node, ...props }) => (
          <pre
            className="bg-sage-50 p-4 rounded-lg overflow-x-auto my-4"
            {...props}
          />
        ),
        img: ({ node, src, alt, ...props }) => (
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
