import { Globe, Keyboard, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'

import { KeyboardShortcuts } from '../KeyboardShortcuts'
import { FooterButton, FooterLink, FooterWrapper, GitHubIcon, IconWrapper, LinkedInIcon } from './Footer.styles'
import type { LinkItem } from './Footer.types'

const links: LinkItem[] = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/rezaei-farhad/',
    icon: <LinkedInIcon />,
    external: true,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/rzfarhad73',
    icon: <GitHubIcon />,
    external: true,
  },
  {
    label: 'Email',
    href: 'mailto:farhadrezaie73@gmail.com',
    icon: <Mail />,
  },
  {
    label: 'Website',
    href: 'https://farhad-rezaei.com',
    icon: <Globe />,
    external: true,
  },
]

export function Footer() {
  const [showShortcuts, setShowShortcuts] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === '?') {
        e.preventDefault()
        setShowShortcuts((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <FooterWrapper>
      <span className="text-fg-secondary">Built by Farhad Rezaei</span>
      {links.map(({ label, href, icon, external }) => (
        <FooterLink
          key={label}
          href={href}
          aria-label={label}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          <IconWrapper>{icon}</IconWrapper>
          <span className="hidden sm:inline">{label}</span>
        </FooterLink>
      ))}
      <FooterButton
        onClick={() => setShowShortcuts(true)}
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts"
      >
        <Keyboard className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Shortcuts</span>
      </FooterButton>
      <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </FooterWrapper>
  )
}
