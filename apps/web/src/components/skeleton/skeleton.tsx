import { twMerge } from 'tailwind-merge'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        'pointer-events-none animate-pulse rounded-md bg-neutral-300/10',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
