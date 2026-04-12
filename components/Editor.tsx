'use client'
import dynamic from 'next/dynamic'
import { useRef } from 'react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface EditorProps {
  value: string
  onChange: (value: string) => void
  language: string
}

const LANGUAGES = ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'bash']

export function Editor({ value, onChange, language }: EditorProps) {
  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={value}
      onChange={(val) => onChange(val ?? '')}
      theme="vs-dark"
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        minimap: { enabled: false },
        padding: { top: 16 },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        smoothScrolling: true,
      }}
    />
  )
}

export function LanguageSelector({
  language,
  onChange,
}: {
  language: string
  onChange: (l: string) => void
}) {
  return (
    <select
      value={language}
      onChange={e => onChange(e.target.value)}
      className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded px-2 py-1 focus:outline-none"
    >
      {LANGUAGES.map(l => (
        <option key={l} value={l}>{l}</option>
      ))}
    </select>
  )
}
