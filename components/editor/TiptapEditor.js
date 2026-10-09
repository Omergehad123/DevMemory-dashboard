"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { lowlight, SUPPORTED_LANGUAGES } from "@/lib/lowlight";
import { useState, useEffect } from "react";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code as InlineCodeIcon,
  FileCode2,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Sparkles,
  Terminal,
  Check,
  ChevronDown,
} from "lucide-react";

export default function TiptapEditor({ content, onChange }) {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [activeCodeBlockLanguage, setActiveCodeBlockLanguage] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disabling standard codeBlock in favor of CodeBlockLowlight
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-400 underline hover:text-indigo-300",
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
      }),
    ],
    content: content || {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [],
        },
      ],
    },
    editorProps: {
      attributes: {
        class:
          "tiptap-content min-h-[380px] p-5 md:p-7 focus:outline-none focus:ring-0 text-slate-200 text-sm leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      // Pass full Tiptap JSON document to parent
      const json = editor.getJSON();
      if (onChange) {
        onChange(json);
      }
    },
    onSelectionUpdate: ({ editor }) => {
      // Check if current selection is inside a code block
      if (editor.isActive("codeBlock")) {
        const attrs = editor.getAttributes("codeBlock");
        setActiveCodeBlockLanguage(attrs.language || "javascript");
      } else {
        setActiveCodeBlockLanguage(null);
      }
    },
    immediatelyRender: false,
  });

  // Sync external content if changed
  useEffect(() => {
    if (editor) {
      const currentJSON = JSON.stringify(editor.getJSON());
      const targetContent = content || {
        type: "doc",
        content: [{ type: "paragraph", content: [] }],
      };
      const targetJSON = JSON.stringify(targetContent);
      if (currentJSON !== targetJSON) {
        editor.commands.setContent(targetContent);
      }
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="h-64 bg-[#0b0f19] border border-[#1e293b] rounded-2xl flex items-center justify-center text-slate-400">
        Loading editor...
      </div>
    );
  }

  const setLink = () => {
    if (!urlInput.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: urlInput.trim() })
        .run();
    }
    setUrlInput("");
    setIsLinkModalOpen(false);
  };

  const addImage = () => {
    if (urlInput.trim()) {
      editor.chain().focus().setImage({ src: urlInput.trim() }).run();
    }
    setUrlInput("");
    setIsImageModalOpen(false);
  };

  const handleInsertCodeBlock = (lang) => {
    const languageToUse = lang || selectedLanguage;
    editor.chain().focus().toggleCodeBlock({ language: languageToUse }).run();
  };

  const handleUpdateCurrentCodeBlockLanguage = (lang) => {
    editor.chain().focus().updateAttributes("codeBlock", { language: lang }).run();
    setActiveCodeBlockLanguage(lang);
  };

  return (
    <div className="bg-[#0e1424] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl flex flex-col focus-within:border-indigo-500/50 transition-colors">
      {/* Editor Main Toolbar */}
      <div className="bg-[#111827] border-b border-[#1e293b] p-2.5 flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <div className="flex items-center bg-[#0b0f19] border border-[#1e293b] rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded-lg transition-colors text-xs font-semibold ${
                editor.isActive("heading", { level: 1 })
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#1e293b]"
              }`}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded-lg transition-colors text-xs font-semibold ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#1e293b]"
              }`}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded-lg transition-colors text-xs font-semibold ${
                editor.isActive("heading", { level: 3 })
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#1e293b]"
              }`}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          {/* Text Formatting */}
          <div className="flex items-center bg-[#0b0f19] border border-[#1e293b] rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive("bold")
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#1e293b]"
              }`}
              title="Bold (Ctrl+B)"
            >
              <BoldIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive("italic")
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#1e293b]"
              }`}
              title="Italic (Ctrl+I)"
            >
              <ItalicIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive("underline")
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#1e293b]"
              }`}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive("code")
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#1e293b]"
              }`}
              title="Inline Code (`code`)"
            >
              <InlineCodeIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Lists & Quotes */}
          <div className="flex items-center bg-[#0b0f19] border border-[#1e293b] rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive("bulletList")
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#1e293b]"
              }`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive("orderedList")
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#1e293b]"
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive("blockquote")
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#1e293b]"
              }`}
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>

          {/* Code Block Inserter with Language Dropdown */}
          <div className="flex items-center bg-[#0b0f19] border border-[#1e293b] rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => handleInsertCodeBlock(selectedLanguage)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-semibold ${
                editor.isActive("codeBlock")
                  ? "bg-indigo-600 text-white shadow"
                  : "text-cyan-400 hover:text-cyan-300 hover:bg-[#1e293b]"
              }`}
              title="Insert / Toggle Code Block"
            >
              <FileCode2 className="w-4 h-4" />
              <span>Code Block</span>
            </button>

            <select
              value={activeCodeBlockLanguage || selectedLanguage}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedLanguage(val);
                if (editor.isActive("codeBlock")) {
                  handleUpdateCurrentCodeBlockLanguage(val);
                }
              }}
              className="bg-transparent text-slate-300 text-xs py-1.5 px-2 rounded-lg focus:outline-none cursor-pointer hover:text-white"
              title="Code Block Language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option
                  key={lang.value}
                  value={lang.value}
                  className="bg-[#111827] text-slate-200"
                >
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Links and Images */}
          <div className="flex items-center bg-[#0b0f19] border border-[#1e293b] rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => {
                setUrlInput(editor.getAttributes("link").href || "");
                setIsLinkModalOpen(true);
              }}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive("link")
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#1e293b]"
              }`}
              title="Insert / Edit Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setUrlInput("");
                setIsImageModalOpen(true);
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
              title="Insert Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center bg-[#0b0f19] border border-[#1e293b] rounded-xl p-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent hover:bg-[#1e293b] transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent hover:bg-[#1e293b] transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Active Code Block Indicator Banner */}
      {editor.isActive("codeBlock") && (
        <div className="bg-indigo-950/40 border-b border-indigo-500/20 px-4 py-2 flex items-center justify-between text-xs text-indigo-300">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Editing Code Block:</span>
            <strong className="text-white font-mono uppercase">
              {activeCodeBlockLanguage || "javascript"}
            </strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Change Language:</span>
            <select
              value={activeCodeBlockLanguage || "javascript"}
              onChange={(e) => handleUpdateCurrentCodeBlockLanguage(e.target.value)}
              className="bg-[#0b0f19] border border-indigo-500/40 text-indigo-200 text-xs rounded-lg px-2 py-1 focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option
                  key={lang.value}
                  value={lang.value}
                  className="bg-[#111827] text-white"
                >
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Editor Content Surface */}
      <div className="flex-1 bg-[#0b0f19] overflow-y-auto cursor-text">
        <EditorContent editor={editor} />
      </div>

      {/* Editor Bottom Status Bar */}
      <div className="bg-[#0d1322] border-t border-[#1e293b] px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>
            {editor.storage?.characterCount?.words?.() ||
              editor.getText().split(/\s+/).filter(Boolean).length}{" "}
            words
          </span>
          <span className="text-slate-400">|</span>
          <span className="font-mono text-[11px] text-slate-400">
            Tiptap JSON Model
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-emerald-400 font-medium">Editor Active</span>
        </div>
      </div>

      {/* Link Dialog Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-white">Insert or Edit Link</h4>
            <input
              type="url"
              placeholder="https://developer.mozilla.org/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-[#1e293b]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={setLink}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Apply Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-white">Insert Image URL</h4>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or /images/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-[#1e293b]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
