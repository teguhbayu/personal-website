"use client";

import "@mdxeditor/editor/style.css";
import { useCallback, useMemo, useState } from "react";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  Separator,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import { uploadFileToCloudinary } from "@/lib/cloudinary-upload";
import ImageCropModal from "../../components/ImageCropModal";

interface PendingImageUpload {
  file: File;
  resolve: (url: string) => void;
  reject: (err: Error) => void;
}

interface InitializedMdxEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
}

export default function InitializedMdxEditor({
  markdown,
  onChange,
}: InitializedMdxEditorProps) {
  const [pendingUpload, setPendingUpload] =
    useState<PendingImageUpload | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const imageUploadHandler = useCallback((file: File): Promise<string> => {
    setUploadError(null);
    return new Promise<string>((resolve, reject) => {
      setPendingUpload({ file, resolve, reject });
    });
  }, []);

  const handleUploadCropped = useCallback(
    async (fileToUpload: File) => {
      if (!pendingUpload) return;
      setUploadError(null);
      setUploading(true);
      try {
        const result = await uploadFileToCloudinary(fileToUpload, "blog");
        pendingUpload.resolve(result.secureUrl);
        setPendingUpload(null);
      } catch (err) {
        setUploadError(
          err instanceof Error
            ? err.message
            : "Upload failed. Please try again.",
        );
      } finally {
        setUploading(false);
      }
    },
    [pendingUpload],
  );

  const handleCancelCrop = useCallback(() => {
    if (uploading) return;
    if (pendingUpload) {
      pendingUpload.reject(new Error("Image upload cancelled."));
      setPendingUpload(null);
    }
    setUploadError(null);
  }, [uploading, pendingUpload]);

  const plugins = useMemo(
    () => [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      markdownShortcutPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      tablePlugin(),
      imagePlugin({
        imageUploadHandler,
      }),
      codeBlockPlugin({ defaultCodeBlockLanguage: "ts" }),
      codeMirrorPlugin({
        codeBlockLanguages: {
          ts: "TypeScript",
          tsx: "TSX",
          js: "JavaScript",
          jsx: "JSX",
          bash: "Bash",
          sql: "SQL",
          json: "JSON",
          css: "CSS",
          go: "Go",
          yaml: "YAML",
          "": "Plain Text",
        },
      }),
      diffSourcePlugin({ viewMode: "rich-text" }),
      toolbarPlugin({
        toolbarContents: () => (
          <DiffSourceToggleWrapper>
            <UndoRedo />
            <Separator />
            <BlockTypeSelect />
            <Separator />
            <BoldItalicUnderlineToggles />
            <CodeToggle />
            <Separator />
            <ListsToggle />
            <Separator />
            <CreateLink />
            <InsertImage />
            <InsertTable />
            <InsertCodeBlock />
            <InsertThematicBreak />
          </DiffSourceToggleWrapper>
        ),
      }),
    ],
    [imageUploadHandler],
  );

  return (
    <>
      <div className="portfolio-mdx-editor border border-rule bg-sheet rounded-sm overflow-hidden">
        <MDXEditor
          markdown={markdown}
          onChange={onChange}
          plugins={plugins}
          contentEditableClassName="portfolio-mdx-prose min-h-[280px] max-h-[460px] overflow-y-auto px-4 py-3 text-sm text-ink leading-relaxed focus:outline-none"
        />
      </div>

      <ImageCropModal
        file={pendingUpload?.file ?? null}
        folder="blog"
        defaultAspect="custom"
        uploading={uploading}
        error={uploadError}
        onCancel={handleCancelCrop}
        onUploadFile={handleUploadCropped}
      />
    </>
  );
}
