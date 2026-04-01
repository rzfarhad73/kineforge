import { useState } from 'react'

import { TUTORIAL_STORAGE_KEY } from './Tutorial.data'

export function useTutorialState() {
  const seen =
    typeof window !== 'undefined' && localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true'
  return useState(!seen)
}
