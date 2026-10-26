import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { StreamLanguage, bracketMatching, defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { stex } from '@codemirror/legacy-modes/mode/stex'
import { highlightSelectionMatches, search, searchKeymap } from '@codemirror/search'
import { Compartment, EditorState, type Extension } from '@codemirror/state'
import {
  Decoration,
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view'

export type TexEditorHandle = { goToLine: (line: number) => void }

type TexEditorProps = {
  value: string
  readOnly: boolean
  /** Lines the last compile reported errors on, marked in the gutter's row. */
  errorLines: number[]
  onChange: (value: string) => void
  /** Mod-Enter, as in Overleaf. */
  onCompile: () => void
  ref?: Ref<TexEditorHandle>
}

const theme = EditorView.theme({
  '&': { height: '100%', fontSize: '11px', backgroundColor: '#fbfcfe' },
  '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', lineHeight: '17px' },
  '.cm-gutters': { backgroundColor: '#f4f7fa', borderRight: '1px solid #e3eaf1', color: '#a3b3c2' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: '#eef4f9' },
  '.cm-tex-error-line': { backgroundColor: '#fdecea' },
  '&.cm-focused': { outline: 'none' },
})

function errorMarks(lines: number[]): Extension {
  return EditorView.decorations.of(view => {
    const doc = view.state.doc
    const marks = [...new Set(lines)]
      .filter(line => line >= 1 && line <= doc.lines)
      .sort((a, b) => a - b)
      .map(line => Decoration.line({ class: 'cm-tex-error-line' }).range(doc.line(line).from))
    return Decoration.set(marks)
  })
}

/**
 * The LaTeX source in CodeMirror 6: highlighting, search, line numbers and
 * bracket matching. CodeMirror uses no eval, and the style elements it adds are
 * covered by the page policy's style-src (cv_architecture.md §8.4).
 */
export function TexEditor({ value, readOnly, errorLines, onChange, onCompile, ref }: TexEditorProps) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const callbacks = useRef({ onChange, onCompile })
  const [compartments] = useState(() => ({ readOnly: new Compartment(), errors: new Compartment() }))
  const initial = useRef({ value, readOnly, errorLines })

  useEffect(() => {
    callbacks.current = { onChange, onCompile }
  }, [onChange, onCompile])

  useEffect(() => {
    const { value: doc, readOnly: locked, errorLines: lines } = initial.current
    const editor = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          history(),
          drawSelection(),
          bracketMatching(),
          highlightActiveLine(),
          highlightSelectionMatches(),
          search({ top: true }),
          StreamLanguage.define(stex),
          syntaxHighlighting(defaultHighlightStyle),
          EditorView.lineWrapping,
          keymap.of([
            { key: 'Mod-Enter', run: () => { callbacks.current.onCompile(); return true } },
            ...defaultKeymap,
            ...historyKeymap,
            ...searchKeymap,
            indentWithTab,
          ]),
          compartments.readOnly.of(EditorState.readOnly.of(locked)),
          compartments.errors.of(errorMarks(lines)),
          EditorView.updateListener.of(update => {
            if (update.docChanged && !update.state.readOnly) callbacks.current.onChange(update.state.doc.toString())
          }),
          theme,
        ],
      }),
    })
    view.current = editor
    return () => {
      editor.destroy()
      view.current = null
    }
  }, [compartments])

  // The generated source follows the configuration, so it is swapped in whole;
  // an edit made here already matches and is left alone.
  useEffect(() => {
    const editor = view.current
    if (!editor || editor.state.doc.toString() === value) return
    editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } })
  }, [value])

  useEffect(() => {
    view.current?.dispatch({ effects: compartments.readOnly.reconfigure(EditorState.readOnly.of(readOnly)) })
  }, [readOnly, compartments])

  useEffect(() => {
    view.current?.dispatch({ effects: compartments.errors.reconfigure(errorMarks(errorLines)) })
  }, [errorLines, compartments])

  useImperativeHandle(ref, () => ({
    goToLine(line) {
      const editor = view.current
      if (!editor) return
      const target = editor.state.doc.line(Math.min(Math.max(line, 1), editor.state.doc.lines))
      editor.dispatch({ selection: { anchor: target.from, head: target.to }, effects: EditorView.scrollIntoView(target.from, { y: 'center' }) })
      editor.focus()
    },
  }), [])

  return <div ref={host} className="cv-editor" />
}
