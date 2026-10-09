"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Terminal, ExternalLink } from "lucide-react";
import { lowlight } from "@/lib/lowlight";
import { toHtml } from "hast-util-to-html";

function HighlightedCodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState("");

  useEffect(() => {
    try {
      const validLang = language && lowlight.registered(language) ? language : null;
      let tree;
      if (validLang) {
        tree = lowlight.highlight(validLang, code || "");
      } else {
        tree = lowlight.highlightAuto(code || "");
      }
      setHighlightedHtml(toHtml(tree));
    } catch (e) {
      setHighlightedHtml("");
    }
  }, [code, language]);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="code-block-wrapper my-4">
      <div className="code-block-header">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {language || "code"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#1e293b] hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          title="Copy code snippet"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="hljs-container">
        {highlightedHtml ? (
          <code
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            className="hljs"
          />
        ) : (
          <code>{code}</code>
        )}
      </pre>
    </div>
  );
}

function RenderNode({ node, index }) {
  if (!node) return null;

  switch (node.type) {
    case "heading": {
      const level = node.attrs?.level || 2;
      const text = node.content?.map((c) => c.text).join("") || "";
      if (level === 1) return <h1>{text}</h1>;
      if (level === 2) return <h2>{text}</h2>;
      if (level === 3) return <h3>{text}</h3>;
      return <h4>{text}</h4>;
    }

    case "paragraph": {
      if (!node.content || node.content.length === 0) return <p>&nbsp;</p>;
      return (
        <p>
          {node.content.map((child, idx) => (
            <RenderInline key={idx} inline={child} />
          ))}
        </p>
      );
    }

    case "codeBlock": {
      const lang = node.attrs?.language || "javascript";
      const code = node.content?.map((c) => c.text).join("") || "";
      return <HighlightedCodeBlock key={index} code={code} language={lang} />;
    }

    case "blockquote": {
      return (
        <blockquote key={index}>
          {node.content?.map((child, idx) => (
            <RenderNode key={idx} node={child} index={idx} />
          ))}
        </blockquote>
      );
    }

    case "bulletList": {
      return (
        <ul key={index}>
          {node.content?.map((item, idx) => (
            <li key={idx}>
              {item.content?.map((child, cIdx) => (
                <RenderNode key={cIdx} node={child} index={cIdx} />
              ))}
            </li>
          ))}
        </ul>
      );
    }

    case "orderedList": {
      return (
        <ol key={index}>
          {node.content?.map((item, idx) => (
            <li key={idx}>
              {item.content?.map((child, cIdx) => (
                <RenderNode key={cIdx} node={child} index={cIdx} />
              ))}
            </li>
          ))}
        </ol>
      );
    }

    case "image": {
      return (
        <div key={index} className="my-4">
          <img
            src={node.attrs?.src}
            alt={node.attrs?.alt || "Reference illustration"}
            className="rounded-xl border border-[#1e293b] max-h-96 object-contain"
          />
        </div>
      );
    }

    default:
      return null;
  }
}

function RenderInline({ inline }) {
  if (!inline) return null;
  let element = <span>{inline.text}</span>;

  if (inline.marks) {
    inline.marks.forEach((mark) => {
      if (mark.type === "bold") {
        element = <strong>{element}</strong>;
      } else if (mark.type === "italic") {
        element = <em>{element}</em>;
      } else if (mark.type === "underline") {
        element = <u>{element}</u>;
      } else if (mark.type === "code") {
        element = <code>{element}</code>;
      } else if (mark.type === "link") {
        element = (
          <a
            href={mark.attrs?.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5"
          >
            {element}
          </a>
        );
      }
    });
  }

  return element;
}

export default function DocumentRenderer({ doc }) {
  if (!doc || !doc.content || !Array.isArray(doc.content)) {
    return (
      <div className="text-slate-400 text-sm italic py-4">
        No document content available.
      </div>
    );
  }

  return (
    <div className="tiptap-content prose prose-invert max-w-none">
      {doc.content.map((node, index) => (
        <RenderNode key={index} node={node} index={index} />
      ))}
    </div>
  );
}
