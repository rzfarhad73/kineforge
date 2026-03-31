import { Pause, Play } from 'lucide-react'

import { Button } from '@/components/base/Button'
import { InfoTip } from '@/components/base/InfoTip'
import { Switch } from '@/components/base/Switch'

import { PlaybackRow } from './Animation.styles'

interface AnimationPlaybackProps {
  isPlaying: boolean
  isMirror: boolean
  onTogglePlay: () => void
  onMirrorChange: (v: boolean) => void
}

export function AnimationPlayback({
  isPlaying,
  isMirror,
  onTogglePlay,
  onMirrorChange,
}: AnimationPlaybackProps) {
  const Icon = isPlaying ? Pause : Play
  const playLabel = isPlaying ? 'Stop' : 'Play'
  return (
    <PlaybackRow>
      <Button variant={isPlaying ? 'secondary' : 'primary'} size="sm" onClick={onTogglePlay}>
        <Icon className="w-3.5 h-3.5" />
        {playLabel}
      </Button>
      <Switch checked={isMirror} onChange={onMirrorChange} label="Mirror" />
      <InfoTip content="Smoothly reverses the animation at each end instead of jumping back to the start" />
    </PlaybackRow>
  )
}
