import { PlaybackLabel, Section, SectionHeader, SectionTitle } from './Animation.styles'
import { AnimationFields } from './Fields'
import { AnimationHeader } from './Header'
import { AnimationHint } from './Hint'
import { useAnimation } from './hooks/useAnimation'
import { AnimationPlayback } from './Playback'

export function Animation() {
  const {
    selectedId,
    tag,
    isAnimatable,
    canDrawPath,
    isAdvanced,
    isPlaying,
    setIsPlaying,
    docDuration,
    customAnim,
    update,
    handleAdvancedToggle,
    handleGlobalDurationChange,
    handleReset,
    hasAnimations,
  } = useAnimation()

  if (!selectedId) return null

  if (!isAnimatable) {
    return (
      <Section>
        <SectionHeader>
          <SectionTitle>Animation</SectionTitle>
        </SectionHeader>
        <PlaybackLabel>{`<${tag}> elements cannot be animated.`}</PlaybackLabel>
      </Section>
    )
  }

  return (
    <Section>
      <div>
        <AnimationHeader
          isAdvanced={isAdvanced}
          hasAnimations={hasAnimations}
          onAdvancedToggle={handleAdvancedToggle}
          onReset={handleReset}
        />

        <AnimationPlayback
          isPlaying={isPlaying}
          isMirror={customAnim.mirror !== '0'}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onMirrorChange={(v) => update('mirror', v ? '1' : '0')}
        />

        <AnimationHint isAdvanced={isAdvanced} />

        <AnimationFields
          isAdvanced={isAdvanced}
          canDrawPath={canDrawPath}
          customAnim={customAnim}
          docDuration={docDuration}
          onUpdate={update}
          onGlobalDurationChange={handleGlobalDurationChange}
        />
      </div>
    </Section>
  )
}
