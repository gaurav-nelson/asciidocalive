import React, { useState, useEffect, useCallback } from "react";
import asciidoctor from "asciidoctor";
import CodeMirrorEditor from "./CodeMirrorEditor";
import { EditorView } from "@codemirror/view";
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';
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
  const [content, setContent] = useState(() => {
    const savedContent = localStorage.getItem("asciidocalivecontent");
    return savedContent || defaultContent;
  });
  const [html, setHtml] = useState("");
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [asciidoctorStyles, setAsciidoctorStyles] = useState("");

  useEffect(() => {
    const cssUrl = isDark
      ? "https://raw.githubusercontent.com/gaurav-nelson/scripts/refs/heads/main/asciidoctordark.css"
      : "https://raw.githubusercontent.com/asciidoctor/asciidoctor/main/src/stylesheets/asciidoctor.css";
    fetch(cssUrl)
      .then((response) => response.text())
      .then(setAsciidoctorStyles)
      .catch((error) =>
        console.error("Error loading Asciidoctor styles:", error)
      );
  }, [isDark]);

  useEffect(() => {
    if (fileContent) {
      setContent(fileContent);
      localStorage.setItem("asciidocalivecontent", fileContent);
    }
  }, [fileContent]);

  useEffect(() => {
    try {
      const converted = processor.convert(content, {
        safe: "safe",
        attributes: {
          showtitle: true,
          "source-highlighter": "highlight.js",
        },
      }) as string;
      setHtml(converted);
      setTimeout(hljs.highlightAll, 0);
      localStorage.setItem("asciidocalivecontent", content);
    } catch (error) {
      console.error("Error converting AsciiDoc:", error);
    }
  }, [content, isDark]);

  useEffect(() => {
    hljs.highlightAll();
  }, []);

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
      } flex-1 grid grid-cols-2 gap-6 h-[calc(100vh-4rem)] overflow-hidden`}
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
          pre, code {
            all: unset;
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
