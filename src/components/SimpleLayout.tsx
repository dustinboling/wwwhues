import { Container } from '@/components/Container'

export function SimpleLayout({
  title,
  intro,
  children,
}: {
  title: string
  intro: string
  children?: React.ReactNode
}) {
  return (
    <Container className="mt-12 sm:mt-16">
      <header className="d-packet rounded-[1.75rem] px-6 py-10 sm:px-10 sm:py-12">
        <div className="d-rule w-28" aria-hidden="true">
          <i />
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#23362b] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[#3d4f42]">
          {intro}
        </p>
      </header>
      {children && <div className="mt-14 sm:mt-16">{children}</div>}
    </Container>
  )
}
