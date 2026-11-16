import CodeMirror from '@uiw/react-codemirror'
import { sql, PostgreSQL } from '@codemirror/lang-sql'
import { keymap } from '@codemirror/view'
import { EditorView } from '@codemirror/view'
import { MAX_SQL_LENGTH } from '../lib/sqlGuard'

type Props = {
  value: string
  onChange: (value: string) => void
  onExecute: () => void
}

const arenaTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#0a1220',
      color: '#e8eef9',
      height: '100%',
    },
    '.cm-content': {
      fontFamily: "'JetBrains Mono', monospace",
      caretColor: '#2ee59d',
    },
    '.cm-gutters': {
      backgroundColor: '#0a1220',
      color: '#5a6d8c',
      border: 'none',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(46, 229, 157, 0.06)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'rgba(46, 229, 157, 0.06)',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#2ee59d',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: 'rgba(46, 229, 157, 0.22)',
    },
  },
  { dark: true },
)

export function SqlEditor({ value, onChange, onExecute }: Props) {
  const extensions = [
    sql({ dialect: PostgreSQL }),
    arenaTheme,
    keymap.of([
      {
        key: 'Mod-Enter',
        run: () => {
          onExecute()
          return true
        },
      },
    ]),
    EditorView.lineWrapping,
  ]

  return (
    <div className="flex h-full min-h-[200px] flex-col overflow-hidden rounded-xl border border-arena-border bg-[#0a1220]">
      <div className="flex items-center justify-between border-b border-arena-border px-3 py-1.5 text-xs text-arena-muted">
        <span>Editor SQL · PostgreSQL</span>
        <span>
          {value.length}/{MAX_SQL_LENGTH} · Ctrl/Cmd+Enter
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <CodeMirror
          value={value}
          height="100%"
          theme="dark"
          extensions={extensions}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
          }}
          onChange={(v) => {
            if (v.length <= MAX_SQL_LENGTH) onChange(v)
            else onChange(v.slice(0, MAX_SQL_LENGTH))
          }}
        />
      </div>
    </div>
  )
}
