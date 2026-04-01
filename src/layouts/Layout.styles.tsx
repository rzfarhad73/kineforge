export function LayoutShell(props: React.ComponentProps<'div'>) {
  return (
    <div
      className="flex flex-col h-screen [height:100dvh] bg-background text-fg font-sans overflow-hidden"
      {...props}
    />
  )
}

export function ContentArea({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={`flex flex-1 min-h-0 overflow-hidden relative ${className ?? ''}`} {...props} />
  )
}

interface TabPanelProps extends React.ComponentProps<'div'> {
  active: boolean
}

export function TabPanel({ active, className, ...props }: TabPanelProps) {
  return (
    <div
      className={`absolute inset-0 flex flex-col overflow-hidden transition-opacity duration-200 ${
        active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
      } ${className ?? ''}`}
      {...props}
    />
  )
}
