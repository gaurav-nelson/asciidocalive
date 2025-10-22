import React, { useState, useEffect, useCallback, useRef } from "react";
import asciidoctor from "asciidoctor";
import CodeMirrorEditor from "./CodeMirrorEditor";
import { EditorView } from "@codemirror/view";
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';
import { renderKrokiDiagrams } from "../utils/krokiUtils";

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
* Diagram rendering (PlantUML, Mermaid, GraphViz, and more)
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

== Mathematical Expressions
You can write mathematical expressions using STEM notation.

=== Inline Math
The quadratic formula is stem:[x = (-b \pm sqrt(b^2-4ac))/(2a)].

Einstein's famous equation: stem:[E = mc^2].

A matrix example: stem:[[[a,b],[c,d]]((n),(k))].

=== Block Math
[stem]
++++
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
++++

[stem]
++++
\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
++++

[stem]
++++
\\begin{bmatrix}
a & b \\\\
c & d
\\end{bmatrix}
\\begin{pmatrix}
n \\\\
k
\\end{pmatrix}
++++

== Diagrams with Kroki
Create beautiful diagrams using various diagram types powered by https://kroki.io[Kroki.io].

=== PlantUML Sequence Diagram
[plantuml]
----
@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response

Alice -> Bob: Another authentication Request
Alice <-- Bob: Another authentication Response
@enduml
----

=== Mermaid Flowchart
[mermaid]
----
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
----

=== GraphViz Directed Graph
[graphviz]
----
digraph G {
    rankdir=LR;
    node [shape=box, style=rounded];
    
    Frontend -> Backend [label="API Request"];
    Backend -> Database [label="Query"];
    Database -> Backend [label="Result"];
    Backend -> Frontend [label="Response"];
}
----

=== Ditaa Diagram
[ditaa]
----
+--------+   +-------+    +-------+
|        | --+ ditaa +--> |       |
|  Text  |   +-------+    |diagram|
|Document|   |!magic!|    |       |
|     {d}|   |       |    |       |
+---+----+   +-------+    +-------+
    :                         ^
    |       Lots of work      |
    +-------------------------+
----
`;

interface EditorProps {
  isDark: boolean;
  fileContent?: string;
  onEditorReady: (getValue: () => string) => void;
  syncScrollEnabled: boolean;
}

const Editor: React.FC<EditorProps> = ({
  isDark,
  fileContent,
  onEditorReady,
  syncScrollEnabled,
}) => {
  const [content, setContent] = useState(() => {
    const savedContent = localStorage.getItem("asciidocalivecontent");
    return savedContent || defaultContent;
  });
  const [html, setHtml] = useState("");
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [asciidoctorStyles, setAsciidoctorStyles] = useState("");
  
  // Refs for scroll sync
  const previewRef = useRef<HTMLDivElement>(null);
  const isEditorScrollingRef = useRef(false);
  const isPreviewScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);

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
    const convertAndRender = async () => {
      try {
        const converted = processor.convert(content, {
          safe: "safe",
          attributes: {
            showtitle: true,
            "source-highlighter": "highlight.js",
            stem: "latexmath",
            experimental: true,
          },
        }) as string;
        setHtml(converted);
        
        // Wait for DOM to update
        setTimeout(async () => {
          // Highlight code blocks safely
          const previewElement = document.getElementById("editor-content");
          if (previewElement) {
            const codeBlocks = previewElement.querySelectorAll('pre code:not([data-highlighted])');
            codeBlocks.forEach((block) => {
              try {
                hljs.highlightElement(block as HTMLElement);
              } catch (error) {
                // Silently ignore highlighting errors (e.g., unescaped HTML warnings)
                // The content is already sanitized by Asciidoctor in 'safe' mode
              }
            });
            
            // Render Kroki diagrams
            await renderKrokiDiagrams(previewElement);
          }
          
          // Trigger MathJax typesetting after content is rendered
          if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise().catch((err: Error) => 
              console.error('MathJax typeset error:', err)
            );
          }
        }, 50);
        
        localStorage.setItem("asciidocalivecontent", content);
      } catch (error) {
        console.error("Error converting AsciiDoc:", error);
      }
    };
    
    convertAndRender();
  }, [content, isDark]);

  const handleEditorCreated = useCallback(
    (view: EditorView) => {
      setEditorView(view);
      onEditorReady(() => view.state.doc.toString());
    },
    [onEditorReady]
  );

  // Debounce function
  const debounce = (func: Function, wait: number) => {
    let timeout: number | null = null;
    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout);
      timeout = window.setTimeout(() => func(...args), wait);
    };
  };

  // Calculate scroll percentage
  const calculateScrollPercentage = (element: Element): number => {
    const { scrollTop, scrollHeight, clientHeight } = element;
    if (scrollHeight <= clientHeight) return 0;
    return scrollTop / (scrollHeight - clientHeight);
  };

  // Apply scroll percentage to target element
  const applyScrollPercentage = (element: Element, percentage: number) => {
    const { scrollHeight, clientHeight } = element;
    const maxScroll = scrollHeight - clientHeight;
    element.scrollTop = maxScroll * percentage;
  };

  // Handle cursor change for heading navigation
  const handleCursorChange = useCallback((_lineNumber: number, lineContent: string) => {
    if (!syncScrollEnabled || !previewRef.current) return;

    // Detect AsciiDoc heading syntax: = Heading
    const headingMatch = lineContent.match(/^(=+)\s+(.+)$/);
    if (headingMatch) {
      const headingText = headingMatch[2].trim();
      
      // AsciiDoc converts "My Heading" to id="_my_heading"
      // It also handles special chars and multiple spaces
      const headingId = '_' + headingText.toLowerCase()
        .replace(/[^\w\s-]/g, '')  // Remove special chars
        .replace(/\s+/g, '_')       // Replace spaces with underscores
        .replace(/_+/g, '_');       // Collapse multiple underscores
      
      // Try to find the heading in the preview
      const previewElement = previewRef.current;
      let targetElement = previewElement.querySelector(`#${CSS.escape(headingId)}`);
      
      // Fallback: try without the leading underscore (some cases)
      if (!targetElement) {
        const altId = headingId.substring(1);
        targetElement = previewElement.querySelector(`#${CSS.escape(altId)}`);
      }
      
      // Fallback: search by text content in headings
      if (!targetElement) {
        const headings = previewElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
        targetElement = Array.from(headings).find(
          h => h.textContent?.trim().toLowerCase() === headingText.toLowerCase()
        ) || null;
      }
      
      if (targetElement) {
        // Prevent triggering preview scroll handler
        isEditorScrollingRef.current = true;
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        setTimeout(() => {
          isEditorScrollingRef.current = false;
        }, 150);
      }
    }
  }, [syncScrollEnabled]);

  // Handle editor scroll
  const handleEditorScroll = useCallback(
    debounce(() => {
      if (!syncScrollEnabled || !editorView || !previewRef.current || isPreviewScrollingRef.current) {
        return;
      }

      isEditorScrollingRef.current = true;
      
      const editorScrollDom = editorView.scrollDOM;
      const percentage = calculateScrollPercentage(editorScrollDom);
      applyScrollPercentage(previewRef.current, percentage);
      
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        isEditorScrollingRef.current = false;
      }, 150);
    }, 100),
    [syncScrollEnabled, editorView]
  );

  // Handle preview scroll
  const handlePreviewScroll = useCallback(
    debounce(() => {
      if (!syncScrollEnabled || !editorView || !previewRef.current || isEditorScrollingRef.current) {
        return;
      }

      isPreviewScrollingRef.current = true;
      
      const percentage = calculateScrollPercentage(previewRef.current);
      applyScrollPercentage(editorView.scrollDOM, percentage);
      
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        isPreviewScrollingRef.current = false;
      }, 150);
    }, 100),
    [syncScrollEnabled, editorView]
  );

  // Set up scroll event listeners
  useEffect(() => {
    if (!editorView || !previewRef.current || !syncScrollEnabled) return;

    const editorScrollDom = editorView.scrollDOM;
    const previewElement = previewRef.current;

    editorScrollDom.addEventListener('scroll', handleEditorScroll);
    previewElement.addEventListener('scroll', handlePreviewScroll);

    return () => {
      editorScrollDom.removeEventListener('scroll', handleEditorScroll);
      previewElement.removeEventListener('scroll', handlePreviewScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [editorView, syncScrollEnabled, handleEditorScroll, handlePreviewScroll]);

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
          onCursorChange={handleCursorChange}
        />
      </div>

      <div
        ref={previewRef}
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
