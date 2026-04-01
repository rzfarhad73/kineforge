import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/base/Button'
import { ResponsiveDialog } from '@/components/base/ResponsiveDialog'

import { TUTORIAL_STEPS, TUTORIAL_STORAGE_KEY } from './Tutorial.data'
import {
  TutorialIconWrapper,
  TutorialStepContent,
  TutorialStepDot,
  TutorialTip,
} from './Tutorial.styles'
import type { TutorialProps } from './Tutorial.types'

export function Tutorial({ isOpen, onClose }: TutorialProps) {
  const [step, setStep] = useState(0)
  const [displayedStep, setDisplayedStep] = useState(0)
  const [contentVisible, setContentVisible] = useState(true)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true)
    setStep(0)
    setDisplayedStep(0)
    setContentVisible(true)
  }
  if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false)
  }

  // Trigger exit animation whenever step diverges from what's displayed
  if (step !== displayedStep && contentVisible) {
    setContentVisible(false)
  }

  const isFirst = step === 0
  const isLast = step === TUTORIAL_STEPS.length - 1
  const current = TUTORIAL_STEPS[displayedStep]!
  const Icon = current.icon

  function handleContentTransitionEnd(e: React.TransitionEvent) {
    // Only act on one property to avoid double-firing
    if (e.propertyName !== 'opacity') return
    if (!contentVisible) {
      setDisplayedStep(step)
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => setContentVisible(true))
      })
    }
  }

  function handleClose() {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true')
    onClose()
  }

  function handleNext() {
    if (isLast) {
      handleClose()
    } else {
      setStep((s) => s + 1)
    }
  }

  function handleBack() {
    setStep((s) => s - 1)
  }

  return (
    <ResponsiveDialog isOpen={isOpen} onClose={handleClose} title="Quick Tour">
      <div className="flex flex-col gap-6 pt-1">
        <TutorialStepContent $visible={contentVisible} onTransitionEnd={handleContentTransitionEnd}>
          <TutorialIconWrapper>
            <Icon className="w-10 h-10 text-accent" aria-hidden="true" />
          </TutorialIconWrapper>

          <div className="flex flex-col gap-2">
            <h3 className="text-base font-semibold text-fg">{current.title}</h3>
            <p className="text-sm text-fg-secondary leading-relaxed">{current.description}</p>
          </div>

          {current.tip && (
            <TutorialTip>
              <span className="font-medium text-accent-light">Tip: </span>
              <span className="text-fg-secondary">{current.tip}</span>
            </TutorialTip>
          )}
        </TutorialStepContent>

        <div
          className="flex items-center justify-center gap-1.5"
          role="group"
          aria-label="Tour steps"
        >
          {TUTORIAL_STEPS.map((s, i) => (
            <TutorialStepDot
              key={s.title}
              $active={i === step}
              aria-label={`Step ${i + 1}: ${s.title}`}
              aria-current={i === step ? 'step' : undefined}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="text"
            size="sm"
            onClick={handleClose}
            className="text-fg-muted hover:text-fg"
          >
            Skip tour
          </Button>
          <div className="flex gap-2">
            {!isFirst && (
              <Button variant="secondary" size="sm" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={handleNext}>
              {isLast ? 'Get started' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  )
}
