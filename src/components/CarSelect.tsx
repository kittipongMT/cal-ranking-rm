// src/components/CarSelect.tsx
import * as Select from '@radix-ui/react-select'

interface CarSelectProps {
  value: string
  onChange: (val: string) => void
  options: string[]
  placeholder?: string
}

export default function CarSelect({
  value,
  onChange,
  options,
  placeholder = 'เลือกรถ...',
}: CarSelectProps) {
  return (
    <Select.Root value={value || '__none__'} onValueChange={(v) => onChange(v === '__none__' ? '' : v)}>
      <Select.Trigger
        className="flex-1 min-w-0 flex items-center justify-between gap-1 h-10 px-3
          rounded border border-zinc-700 bg-black/25
          text-zinc-200 font-kanit font-bold text-sm outline-none
          focus:border-zinc-500 focus:ring-2 focus:ring-zinc-700/30
          data-[placeholder]:text-zinc-500
          truncate cursor-pointer"
        aria-label="เลือกรถ"
      >
        <Select.Value placeholder={placeholder} className="truncate" />
        <Select.Icon className="ml-1 opacity-60 flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={4}
          className="z-50 min-w-[180px] max-h-60 overflow-auto rounded
            border border-zinc-700 bg-zinc-900 shadow-2xl
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        >
          <Select.ScrollUpButton className="flex items-center justify-center h-6 text-zinc-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14l5-5 5 5z" />
            </svg>
          </Select.ScrollUpButton>

          <Select.Viewport className="p-1">
            <Select.Item
              value="__none__"
              className="flex items-center px-3 py-2 rounded-lg text-sm text-zinc-500
                cursor-pointer outline-none select-none
                data-[highlighted]:bg-zinc-800 data-[highlighted]:text-zinc-300"
            >
              <Select.ItemText>{placeholder}</Select.ItemText>
            </Select.Item>

            {options.map((name) => (
              <Select.Item
                key={name}
                value={name}
                className="flex items-center px-3 py-2 rounded text-sm
                  text-zinc-200 cursor-pointer outline-none select-none
                  data-[highlighted]:bg-zinc-800 data-[highlighted]:text-white data-[state=checked]:font-bold"
              >
                <Select.ItemIndicator className="mr-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </svg>
                </Select.ItemIndicator>
                <Select.ItemText>{name}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex items-center justify-center h-6 text-zinc-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
