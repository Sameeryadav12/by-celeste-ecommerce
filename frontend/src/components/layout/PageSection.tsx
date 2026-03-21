import type { ReactNode } from 'react'
import { Container } from './Container'

export function PageSection({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={['py-10 sm:py-12', className].filter(Boolean).join(' ')}>
      <Container>{children}</Container>
    </section>
  )
}

