import React, { useState, useEffect, useCallback } from "react";
import asciidoctor from "asciidoctor";
import CodeMirrorEditor from "./CodeMirrorEditor";
import { EditorView } from "@codemirror/view";
const processor = asciidoctor();

const defaultContent = `= Welcome to AsciiDoc Alive
:toc: auto
:icons: font

== Introduction
This is a *live* AsciiDoc editor. Start typing in the left panel to see the rendered output on the right.

== Features
* Real-time preview
* Syntax highlighting with CodeMirror
* Line numbers
* Dark theme
* Export functionality
* Clean interface

[source,javascript]
----
console.log('Hello, AsciiDoc!');
----

== Formatting Examples
This text is *bold*, this is _italic_, and this is \`monospace\`.

=== Lists
. First item
. Second item
.. Nested item
. Third item

[TIP]
====
This is a sample tip block.
====

[NOTE]
====
This is a sample note block.
====

[WARNING]
====
This is a sample warning block.
====

[IMPORTANT]
====
This is a sample important block.
====
`;

interface EditorProps {
  isDark: boolean;
  fileContent?: string;
  onEditorReady: (getValue: () => string) => void;
}

const Editor: React.FC<EditorProps> = ({
  isDark,
  fileContent,
  onEditorReady,
}) => {
  const [content, setContent] = useState(defaultContent);
  const [html, setHtml] = useState("");
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [asciidoctorStyles, setAsciidoctorStyles] = useState("");

  useEffect(() => {
    // Fetch Asciidoctor CSS
    const cssUrl = isDark
      ? "https://raw.githubusercontent.com/gaurav-nelson/scripts/refs/heads/main/asciidoctordark.css"
      : "https://raw.githubusercontent.com/asciidoctor/asciidoctor/main/src/stylesheets/asciidoctor.css";
    fetch(cssUrl)
      .then((response) => response.text())
      .then((styles) => setAsciidoctorStyles(styles))
      .catch((error) =>
        console.error("Error loading Asciidoctor styles:", error)
      );
  }, [isDark]);

  useEffect(() => {
    if (fileContent) {
      setContent(fileContent);
    }
  }, [fileContent]);

  useEffect(() => {
    try {
      const converted = processor.convert(content, {
        safe: "safe",
        attributes: {
          showtitle: true,
          "source-highlighter": "highlight.js",
          icons: "font",
          toc: "auto",
          "toc-title": "Table of Contents",
        },
      }) as string;
      setHtml(converted);
    } catch (error) {
      console.error("Error converting AsciiDoc:", error);
    }
  }, [content]);

  const handleEditorCreated = useCallback(
    (view: EditorView) => {
      setEditorView(view);
      onEditorReady(() => view.state.doc.toString());
    },
    [onEditorReady]
  );

  return (
    <div
      className={`${
        isDark ? "bg-slate-800" : "bg-white"
      } flex-1 grid grid-cols-2 gap-6 h-[calc(100vh-8rem)]`}
    >
      <div
        className={`${
          isDark ? "bg-slate-700" : "bg-white"
        } rounded-lg shadow-lg overflow-hidden asciidocalive-editor`}
      >
        <CodeMirrorEditor
          initialValue={content}
          onChange={setContent}
          isDark={isDark}
          onEditorCreated={handleEditorCreated}
        />
      </div>

      <div
        className={`${
          isDark ? "bg-slate-800" : "bg-white"
        } overflow-auto asciidocalive-preview`}
      >
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/3.2.1/css/font-awesome.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/default.min.css"
        />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
        <script>hljs.highlightAll();</script>
        <style>{`
          .asciidocalive-preview {
            padding: 1rem;
          }
          .asciidocalive-preview {
            ${asciidoctorStyles}
          }
          ${
            isDark
              ? `
            .asciidocalive-preview .content {
              color: white !important;
            }
            .asciidocalive-preview .content h1,
            .asciidocalive-preview .content h2,
            .asciidocalive-preview .content h3,
            .asciidocalive-preview .content h4,
            .asciidocalive-preview .content h5,
            .asciidocalive-preview .content h6 {
              color: white !important;
            }
            #toctitle {
              color: white !important;
              }
            .asciidocalive-preview .content a {
              color: #60A5FA !important;
            }
          `
              : ""
          }
        `}</style>
        <div
          id="editor-content"
          className="content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
};

export default Editor;
