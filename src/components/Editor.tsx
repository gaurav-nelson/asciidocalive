import React, { useState, useEffect, useCallback } from 'react';
import asciidoctor from 'asciidoctor';
import CodeMirrorEditor from './CodeMirrorEditor';
import { EditorView } from '@codemirror/view';

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

const Editor: React.FC<EditorProps> = ({ isDark, fileContent, onEditorReady }) => {
  const [content, setContent] = useState(defaultContent);
  const [html, setHtml] = useState('');
  const [editorView, setEditorView] = useState<EditorView | null>(null);

  useEffect(() => {
    if (fileContent) {
      setContent(fileContent);
    }
  }, [fileContent]);

  useEffect(() => {
    try {
      const converted = processor.convert(content, {
        safe: 'safe',
        attributes: {
          showtitle: true,
          'source-highlighter': 'highlight.js',
          icons: 'font',
          toc: 'auto',
          'toc-title': 'Table of Contents'
        }
      }) as string;
      setHtml(converted);
    } catch (error) {
      console.error('Error converting AsciiDoc:', error);
    }
  }, [content]);

  const handleEditorCreated = useCallback((view: EditorView) => {
    setEditorView(view);
    onEditorReady(() => view.state.doc.toString());
  }, [onEditorReady]);

  return (
    <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} flex-1 grid grid-cols-2 gap-6 h-[calc(100vh-8rem)]`}>
      <div className={`${isDark ? 'bg-slate-700' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
        <CodeMirrorEditor
          initialValue={content}
          onChange={setContent}
          isDark={isDark}
          onEditorCreated={handleEditorCreated}
        />
      </div>

      <div className={`${isDark ? 'bg-slate-700 text-white' : 'bg-white'} rounded-lg shadow-lg overflow-auto`}>
        <div
          id="editor-content"
          className={`prose ${isDark ? 'prose-invert' : ''} max-w-none p-6`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
};

export default Editor;