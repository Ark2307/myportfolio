"use client";

import { isValidElement, type ReactElement, type ReactNode } from "react";
import type { ExtraProps } from "react-markdown";
import Mermaid from "@/components/blog/Mermaid";

type CodeElement = ReactElement<{ className?: string; children?: ReactNode }>;

function getTextContent(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return getTextContent(node.props.children);
  return "";
}

type CodeBlockProps = React.ComponentPropsWithoutRef<"pre"> & ExtraProps;

/**
 * Overrides react-markdown's `pre` rendering (fenced code blocks only —
 * inline `code` never appears inside a `pre`, so it's unambiguous). Routes
 * ```mermaid fences to the <Mermaid/> renderer; everything else falls
 * through to a plain <pre><code> that rehype-highlight has already
 * annotated with `hljs-*` classes, styled by .prose-blueprint in globals.css.
 */
export default function CodeBlock({ children, node: _node, ...rest }: CodeBlockProps) {
  const codeEl = isValidElement(children) ? (children as CodeElement) : null;
  const className = codeEl?.props.className ?? "";
  const language = /language-(\w+)/.exec(className)?.[1];

  if (language === "mermaid") {
    return <Mermaid chart={getTextContent(codeEl?.props.children)} />;
  }

  return (
    <pre {...rest} data-language={language}>
      {children}
    </pre>
  );
}
