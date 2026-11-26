"use client";

import dynamic from "next/dynamic";

const InitializedMdxEditor = dynamic(() => import("./InitializedMdxEditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[324px] border border-rule bg-sheet-alt rounded-sm flex items-center justify-center font-mono text-xs text-ink-muted">
      Loading MDX editor...
    </div>
  ),
});

interface BlogMdxEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
}

export default function BlogMdxEditor({
  markdown,
  onChange,
}: BlogMdxEditorProps) {
  return <InitializedMdxEditor markdown={markdown} onChange={onChange} />;
}
