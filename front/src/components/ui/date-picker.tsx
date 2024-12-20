import { format } from "date-fns"
import { useRef } from "react"

interface DatePickerProps {
  selected?: Date
  onSelect: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePicker({ selected, onSelect, placeholder = "날짜 선택" }: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.showPicker()
  }

  return (
    <input
      ref={inputRef}
      type="date"
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50"
      value={selected ? format(selected, "yyyy-MM-dd") : ""}
      onChange={(e) => {
        const value = e.target.value
        onSelect(value ? new Date(value) : undefined)
      }}
      onClick={handleClick}
      placeholder={placeholder}
    />
  )
}
