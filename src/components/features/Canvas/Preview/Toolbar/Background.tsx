import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/base/Button'
import { useSvgContext } from '@/context'

import { Icon } from './Icon'

interface BackgroundProps {
  mobile?: boolean
}

export function Background({ mobile }: BackgroundProps) {
  const { canvasBg, setCanvasBg } = useSvgContext()

  return (
    <Button
      variant="black"
      size="sm"
      className={mobile ? 'w-9 h-9 flex-none' : 'aspect-square'}
      onClick={() => setCanvasBg((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      title="Toggle Background"
      aria-label="Toggle Background"
    >
      <Icon icon={canvasBg === 'dark' ? Sun : Moon} />
    </Button>
  )
}
