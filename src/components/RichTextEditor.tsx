import { Bold, Italic, List, Heading2 } from 'lucide-react'
import { inputCls, labelCls } from '../lib/styles'

interface Props {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
  disabled?: boolean
}

export default function RichTextEditor({
  id,
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  disabled,
}: Props) {
  function wrapText(before: string, after: string) {
    const textarea = document.getElementById(id) as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const replacement = `${before}${selectedText || 'type text here'}${after}`

    const newValue = value.substring(0, start) + replacement + value.substring(end)
    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className={`${labelCls} mb-0`}>{label}</label>
        
        {/* NON-TECH FORMATTING BUTTONS */}
        <div className="flex items-center gap-1.5 bg-sand-100 p-1 rounded-xl border border-sand-200">
          <button
            type="button"
            title="Make Bold"
            onClick={() => wrapText('**', '**')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white shadow-sm text-xs font-bold text-slate-700 hover:bg-forest-50 hover:text-forest-700 transition"
          >
            <Bold className="h-3.5 w-3.5" /> Bold
          </button>
          <button
            type="button"
            title="Make Italic"
            onClick={() => wrapText('*', '*')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white shadow-sm text-xs font-semibold text-slate-700 hover:bg-forest-50 hover:text-forest-700 transition italic"
          >
            <Italic className="h-3.5 w-3.5" /> Italic
          </button>
          <button
            type="button"
            title="Add Heading"
            onClick={() => wrapText('### ', '')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white shadow-sm text-xs font-semibold text-slate-700 hover:bg-forest-50 hover:text-forest-700 transition"
          >
            <Heading2 className="h-3.5 w-3.5" /> Heading
          </button>
          <button
            type="button"
            title="Bullet Point"
            onClick={() => wrapText('- ', '')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white shadow-sm text-xs font-semibold text-slate-700 hover:bg-forest-50 hover:text-forest-700 transition"
          >
            <List className="h-3.5 w-3.5" /> Bullet
          </button>
        </div>
      </div>

      <textarea
        id={id}
        rows={rows}
        className={`${inputCls} text-sm leading-relaxed`}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="mt-1 text-[11px] text-slate-400">
        Type naturally. Click the buttons above to instantly make text bold, italic, headings, or bullet points.
      </p>
    </div>
  )
}