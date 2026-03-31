import type React from 'react'

export interface LinkItem {
  label: string
  href: string
  icon: React.ReactNode
  external?: boolean
}
