import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

const baseClasses =
  'inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transform-gpu transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:active:scale-100'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 disabled:bg-neutral-400',
  ghost:
    'border border-transparent text-neutral-900 hover:bg-neutral-100 disabled:text-neutral-400',
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={[baseClasses, variantClasses[variant], className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}

