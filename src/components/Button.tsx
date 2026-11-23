import Link from 'next/link'
import clsx from 'clsx'

const variantStyles = {
  primary:
    'bg-[#23362b] font-semibold text-[#f7f1de] shadow-md ring-1 ring-[#b08d37]/60 hover:bg-[#2e4438] active:bg-[#23362b] active:text-[#f7f1de]/70',
  secondary:
    'bg-[#fffdf4] font-medium text-[#23362b] ring-1 ring-[#e0d5b8] hover:ring-[#b08d37] active:bg-[#f7f1de] active:text-[#23362b]/60',
}

type ButtonProps = {
  variant?: keyof typeof variantStyles
} & (
  | (React.ComponentPropsWithoutRef<'button'> & { href?: undefined })
  | React.ComponentPropsWithoutRef<typeof Link>
)

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  className = clsx(
    'inline-flex items-center gap-2 justify-center rounded-full py-2.5 px-5 text-sm outline-offset-2 transition active:transition-none',
    variantStyles[variant],
    className,
  )

  return typeof props.href === 'undefined' ? (
    <button className={className} {...props} />
  ) : (
    <Link className={className} {...props} />
  )
}
