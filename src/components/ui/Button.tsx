import Link from 'next/link'
import { type ReactNode } from 'react'
import type { ButtonVariant, ButtonSize } from '@/types'

interface ButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
  ariaLabel?: string
  external?: boolean
}

const variantClass: Record<ButtonVariant, string> = {
  primary:        'btn-primary',
  environmental:  'btn-environmental',
  secondary:      'btn-secondary',
  ghost:          'btn-ghost',
  cyan:           'btn-cyan',
  'outline-green': 'btn-outline-green',
  soft:           'btn-soft',
  tertiary:       'btn-soft',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  ariaLabel,
  external = false,
}: ButtonProps) {
  const classes = [
    variantClass[variant],
    sizeClass[size],
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (href) {
    return external ? (
      <a
        href={href}
        className={classes}
        aria-label={ariaLabel}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ) : (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}
