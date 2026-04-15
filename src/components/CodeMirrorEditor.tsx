import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
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
import type { ToolbarAction } from './Toolbar';

export interface CodeMirrorEditorHandle {
  applyToolbarAction: (action: ToolbarAction) => void;
}

interface CodeMirrorEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  isDark: boolean;
  onEditorCreated: (editor: EditorView) => void;
  onCursorChange?: (lineNumber: number, lineContent: string) => void;
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

function applyToolbarAction(view: EditorView, action: ToolbarAction) {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);

  let insert: string;
  let cursorPos: number;

  switch (action.type) {
    case 'wrap': {
      insert = selected
        ? `${action.before}${selected}${action.after}`
        : `${action.before}${action.after}`;
      cursorPos = selected ? from + insert.length : from + action.before.length;
      break;
    }
    case 'linePrefix': {
      const line = view.state.doc.lineAt(from);
      view.dispatch({
        changes: { from: line.from, to: line.from, insert: action.prefix },
      });
      return;
    }
    case 'insert': {
      insert = action.text;
      cursorPos = from + insert.length;
      break;
    }
    case 'wrapBlock': {
      insert = selected
        ? `${action.before}${selected}${action.after}`
        : `${action.before}${action.after}`;
      cursorPos = selected ? from + insert.length : from + action.before.length;
      break;
    }
    default:
      return;
  }

  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: cursorPos },
  });
  view.focus();
}

const asciidocKeymap = [
  {
    key: 'Mod-b',
    run: (view: EditorView) => {
      applyToolbarAction(view, { type: 'wrap', before: '*', after: '*' });
      return true;
    },
  },
  {
    key: 'Mod-i',
    run: (view: EditorView) => {
      applyToolbarAction(view, { type: 'wrap', before: '_', after: '_' });
      return true;
    },
  },
  {
    key: 'Mod-`',
    run: (view: EditorView) => {
      applyToolbarAction(view, { type: 'wrap', before: '`', after: '`' });
      return true;
    },
  },
  {
    key: 'Mod-k',
    run: (view: EditorView) => {
      applyToolbarAction(view, { type: 'insert', text: 'https://url[link text]' });
      return true;
    },
  },
];

const createExtensions = (
  isDark: boolean,
  onChange: (value: string) => void,
  onCursorChange?: (lineNumber: number, lineContent: string) => void
) => [
  history(),
  lineNumbers(),
  highlightActiveLine(),
  StreamLanguage.define(asciidoc),
  keymap.of([...asciidocKeymap, ...defaultKeymap, ...historyKeymap]),
  EditorView.lineWrapping,
  EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      onChange(update.state.doc.toString());
    }
    // Track cursor position changes
    if (update.selectionSet && onCursorChange) {
      const cursorPos = update.state.selection.main.head;
      const line = update.state.doc.lineAt(cursorPos);
      const lineNumber = line.number;
      const lineContent = line.text;
      onCursorChange(lineNumber, lineContent);
    }
  }),
  baseTheme,
  getThemeExtensions(isDark),
];

const CodeMirrorEditor = forwardRef<CodeMirrorEditorHandle, CodeMirrorEditorProps>(
  ({ initialValue, onChange, isDark, onEditorCreated, onCursorChange }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView>();

    useImperativeHandle(ref, () => ({
      applyToolbarAction: (action: ToolbarAction) => {
        if (viewRef.current) {
          applyToolbarAction(viewRef.current, action);
        }
      },
    }), []);

    useEffect(() => {
      if (!editorRef.current || viewRef.current) return;

      try {
        const state = EditorState.create({
          doc: initialValue,
          extensions: createExtensions(isDark, onChange, onCursorChange),
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
    }, [onChange, isDark, onEditorCreated, onCursorChange]);

    // Handle theme changes
    useEffect(() => {
      if (!viewRef.current) return;

      try {
        viewRef.current.dispatch({
          effects: StateEffect.reconfigure.of(createExtensions(isDark, onChange, onCursorChange))
        });
      } catch (error) {
        console.error('Error updating CodeMirror theme:', error);
      }
    }, [isDark, onChange, onCursorChange]);

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