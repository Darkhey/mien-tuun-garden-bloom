import React from "react";
export const extractText = (children: React.ReactNode): string => {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (children == null) return "";
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (React.isValidElement(children))
    return extractText(children.props.children);
  return "";
};
