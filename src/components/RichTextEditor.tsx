"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { useCallback } from "react";
import { FontSize } from "@/lib/tiptapFontSize";
import type { Lang } from "@/lib/i18n";

const L: Record<
  Lang,
  {
    sizeSmall: string;
    sizeNormal: string;
    sizeLarge: string;
    sizeXLarge: string;
    fontSize: string;
    bold: string;
    italic: string;
    underline: string;
    strike: string;
    heading: string;
    bulletList: string;
    orderedList: string;
    blockquote: string;
    link: string;
    undo: string;
    redo: string;
    linkPrompt: string;
  }
> = {
  ko: {
    sizeSmall: "작게",
    sizeNormal: "보통",
    sizeLarge: "크게",
    sizeXLarge: "아주 크게",
    fontSize: "글씨 크기",
    bold: "굵게",
    italic: "기울임",
    underline: "밑줄",
    strike: "취소선",
    heading: "소제목",
    bulletList: "글머리 기호 목록",
    orderedList: "번호 매기기 목록",
    blockquote: "인용구",
    link: "링크",
    undo: "실행 취소",
    redo: "다시 실행",
    linkPrompt: "링크 주소를 입력하세요",
  },
  en: {
    sizeSmall: "Small",
    sizeNormal: "Normal",
    sizeLarge: "Large",
    sizeXLarge: "Extra large",
    fontSize: "Font size",
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    strike: "Strikethrough",
    heading: "Heading",
    bulletList: "Bullet list",
    orderedList: "Numbered list",
    blockquote: "Blockquote",
    link: "Link",
    undo: "Undo",
    redo: "Redo",
    linkPrompt: "Enter the link URL",
  },
  es: {
    sizeSmall: "Pequeño",
    sizeNormal: "Normal",
    sizeLarge: "Grande",
    sizeXLarge: "Muy grande",
    fontSize: "Tamaño de letra",
    bold: "Negrita",
    italic: "Cursiva",
    underline: "Subrayado",
    strike: "Tachado",
    heading: "Subtítulo",
    bulletList: "Lista con viñetas",
    orderedList: "Lista numerada",
    blockquote: "Cita",
    link: "Enlace",
    undo: "Deshacer",
    redo: "Rehacer",
    linkPrompt: "Escribe la dirección del enlace",
  },
};

const FONT_SIZE_VALUES = ["14px", "", "20px", "28px"] as const;

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-sm font-semibold transition ${
        active ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-5 w-px bg-slate-300" />;
}

export default function RichTextEditor({
  content,
  onChange,
  lang = "ko",
}: {
  content: string;
  onChange: (html: string) => void;
  lang?: Lang;
}) {
  const s = L[lang];
  const fontSizes = [
    { label: s.sizeSmall, value: FONT_SIZE_VALUES[0] },
    { label: s.sizeNormal, value: FONT_SIZE_VALUES[1] },
    { label: s.sizeLarge, value: FONT_SIZE_VALUES[2] },
    { label: s.sizeXLarge, value: FONT_SIZE_VALUES[3] },
  ];
  const editor = useEditor({
    extensions: [StarterKit, TextStyle, FontSize],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "blog-body min-h-[240px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(s.linkPrompt, previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor, s.linkPrompt]);

  if (!editor) return null;

  const currentFontSize = (editor.getAttributes("textStyle").fontSize as string | undefined) ?? "";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <select
          value={currentFontSize}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) editor.chain().focus().unsetFontSize().run();
            else editor.chain().focus().setFontSize(v).run();
          }}
          aria-label={s.fontSize}
          className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-xs font-medium text-slate-700 outline-none"
        >
          {fontSizes.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <ToolbarDivider />
        <ToolbarButton label={s.bold} active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton label={s.italic} active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton label={s.underline} active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton label={s.strike} active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <span className="line-through">S</span>
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          label={s.heading}
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          label={s.bulletList}
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •≡
        </ToolbarButton>
        <ToolbarButton
          label={s.orderedList}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1≡
        </ToolbarButton>
        <ToolbarButton
          label={s.blockquote}
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          &ldquo;
        </ToolbarButton>
        <ToolbarButton label={s.link} active={editor.isActive("link")} onClick={setLink}>
          🔗
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label={s.undo} onClick={() => editor.chain().focus().undo().run()}>
          ↺
        </ToolbarButton>
        <ToolbarButton label={s.redo} onClick={() => editor.chain().focus().redo().run()}>
          ↻
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
