'use client'

import { Link } from 'next/link'

interface ButtonProps {
  children: React.ReactNode
  href?: string
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  className?: string
}

export default function Button({ children, href, variant = 'primary', onClick, className = '' }: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900 shadow-lg hover:shadow-xl',
    secondary: 'bg-white text-gray-900 border-2 border-gray-900 hover:bg-gray-50 focus:ring-gray-900'
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  )
}

