"use client";

import "@mdxeditor/editor/style.css";
import { useCallback, useMemo, useState } from "react";
import { FiAlignCenter } from "react-icons/fi";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ButtonWithTooltip,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  DirectiveDescriptor,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  NestedLexicalEditor,
  Separator,
  StrikeThroughSupSubToggles,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  directivesPlugin,
  headingsPlugin,
  imagePlugin,
  insertDirective$,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  usePublisher,
} from "@mdxeditor/editor";
import { uploadFileToCloudinary } from "@/lib/cloudinary-upload";
import { sileo } from "sileo";
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

const CenterDirectiveDescriptor: DirectiveDescriptor = {
  name: "center",
  type: "containerDirective",
  attributes: [],
  hasChildren: true,
  testNode(node) {
    return node.type === "containerDirective" && node.name === "center";
  },
  Editor() {
    return (
      <div className="my-2 px-4 py-2.5 border border-dashed border-rule bg-sheet-alt/40 rounded-sm text-center">
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1 select-none">
          Centered Block
        </div>
        <NestedLexicalEditor
          block
          getContent={(node) =>
            (node as { children: unknown[] }).children as never
          }
          getUpdatedMdastNode={(mdastNode, children) => ({
            ...mdastNode,
            children: children as never,
          })}
        />
      </div>
    );
  },
};

function InsertCenterButton() {
  const insertDirective = usePublisher(insertDirective$);
  return (
    <ButtonWithTooltip
      title="Insert centered block"
      onClick={() => {
        insertDirective({
          name: "center",
          type: "containerDirective",
          attributes: {},
          children: [],
        } as never);
      }}
    >
      <FiAlignCenter aria-hidden={true} className="w-4 h-4" />
    </ButtonWithTooltip>
  );
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
        sileo.success({
          title: "Image inserted",
          description: result.folder,
        });
        setPendingUpload(null);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Upload failed. Please try again.";
        setUploadError(msg);
        sileo.error({
          title: "Image upload failed",
          description: msg,
        });
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
      directivesPlugin({
        directiveDescriptors: [CenterDirectiveDescriptor],
      }),
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
          html: "HTML",
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
            <StrikeThroughSupSubToggles />
            <CodeToggle />
            <Separator />
            <ListsToggle />
            <InsertCenterButton />
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
      <div className="portfolio-mdx-editor border border-rule bg-sheet rounded-sm">
        <MDXEditor
          markdown={markdown}
          onChange={onChange}
          plugins={plugins}
          contentEditableClassName="portfolio-mdx-prose min-h-[520px] px-5 sm:px-6 py-4 text-[15px] text-ink leading-relaxed focus:outline-none"
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
