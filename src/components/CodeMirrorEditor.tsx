import { useEffect, useRef, forwardRef } from 'react';
import { EditorState, StateEffect } from '@codemirror/state';
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { StreamLanguage } from '@codemirror/language';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { asciidoc } from 'codemirror-asciidoc';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeMirrorEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  isDark: boolean;
  onEditorCreated: (editor: EditorView) => void;
}

const baseTheme = EditorView.baseTheme({
  '&': {
    height: '100%',
    fontSize: '14px',
  },
  '.cm-scroller': {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    lineHeight: '1.6',
    padding: '1rem',
  },
});

const lightHighlightStyle = HighlightStyle.define([
  { tag: tags.heading, color: '#0550AE', fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic', color: '#24292f' },
  { tag: tags.strong, fontWeight: 'bold', color: '#24292f' },
  { tag: tags.keyword, color: '#CF222E' },
  { tag: tags.atom, color: '#0550AE' },
  { tag: tags.bool, color: '#0550AE' },
  { tag: tags.url, color: '#0A3069', textDecoration: 'underline' },
  { tag: tags.link, color: '#0A3069', textDecoration: 'underline' },
  { tag: tags.string, color: '#0A3069' },
  { tag: tags.comment, color: '#6E7781', fontStyle: 'italic' },
  { tag: tags.meta, color: '#116329' },
  { tag: tags.operator, color: '#CF222E' },
]);

const customLightTheme = EditorView.theme({
  '&': {
    color: '#24292f',
    backgroundColor: '#ffffff',
  },
  '.cm-content': {
    caretColor: '#24292f',
  },
  '.cm-cursor': {
    borderLeftColor: '#24292f',
  },
  '.cm-gutters': {
    backgroundColor: '#f6f8fa',
    color: '#57606a',
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#f0f1f3',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#b4d5fe80',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: '#b4d5fe80',
  },
  '.cm-line': {
    '&::selection': {
      backgroundColor: '#b4d5fe80',
    },
  },
});

const getThemeExtensions = (isDark: boolean) =>
  isDark
    ? oneDark
    : [customLightTheme, syntaxHighlighting(lightHighlightStyle)];

const createExtensions = (isDark: boolean, onChange: (value: string) => void) => [
  history(),
  lineNumbers(),
  highlightActiveLine(),
  StreamLanguage.define(asciidoc),
  keymap.of([...defaultKeymap, ...historyKeymap]),
  EditorView.lineWrapping,
  EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      onChange(update.state.doc.toString());
    }
  }),
  baseTheme,
  getThemeExtensions(isDark),
];

const CodeMirrorEditor = forwardRef<HTMLDivElement, CodeMirrorEditorProps>(
  ({ initialValue, onChange, isDark, onEditorCreated }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView>();

    useEffect(() => {
      if (!editorRef.current || viewRef.current) return;

      try {
        const state = EditorState.create({
          doc: initialValue,
          extensions: createExtensions(isDark, onChange),
        });

        const view = new EditorView({
          state,
          parent: editorRef.current,
        });

        viewRef.current = view;
        onEditorCreated(view);

        return () => {
          view.destroy();
          viewRef.current = undefined;
        };
      } catch (error) {
        console.error('Error initializing CodeMirror:', error);
      }
    }, [onChange, isDark, onEditorCreated]);

    // Handle theme changes
    useEffect(() => {
      if (!viewRef.current) return;

      try {
        //const themeExtensions = getThemeExtensions(isDark);
        viewRef.current.dispatch({
          effects: StateEffect.reconfigure.of(createExtensions(isDark, onChange))
        });
      } catch (error) {
        console.error('Error updating CodeMirror theme:', error);
      }
    }, [isDark, onChange]);

    // Handle external value changes
    useEffect(() => {
      if (!viewRef.current) return;

      const doc = viewRef.current.state.doc.toString();
      if (doc !== initialValue) {
        viewRef.current.dispatch({
          changes: { from: 0, to: doc.length, insert: initialValue },
        });
      }
    }, [initialValue]);

    return <div ref={editorRef} className="h-full" />;
  }
);

export default CodeMirrorEditor;