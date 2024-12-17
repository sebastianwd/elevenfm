import { twMerge } from 'tailwind-merge'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        'animate-pulse rounded-md bg-neutral-300/10 pointer-events-none',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }