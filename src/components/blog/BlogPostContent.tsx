
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type BlogPostContentProps = {
  content: string;
};

const BlogPostContent: React.FC<BlogPostContentProps> = ({ content }) => (
  <div className="prose prose-lg max-w-none prose-earth prose-headings:font-serif prose-headings:text-earth-800 prose-p:text-earth-600 prose-li:text-earth-600 prose-strong:text-earth-800">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        img: ({ node, ...props }) => (
          <img
            {...props}
            className="rounded shadow max-w-full h-auto mx-auto my-6"
            alt={props.alt ?? ""}
          />
        ),
        code({ node, inline, className, children, ...props }) {
          return (
            <code
              className={
                "bg-sage-50 rounded px-1.5 py-1 text-[14px] font-mono" +
                (className ? " " + className : "")
              }
              {...props}
            >
              {children}
            </code>
          );
        },
        a: ({ node, ...props }) => (
          <a {...props} className="underline text-sage-700 hover:text-sage-900" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default BlogPostContent;
