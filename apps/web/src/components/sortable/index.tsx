import type { UseDraggableArguments } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type React from 'react'
import { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

interface SortableProps extends UseDraggableArguments {
  children: React.ReactNode
  className?: string
}
export const Sortable = (props: SortableProps) => {
  const { children, className, ...args } = props
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable(args)

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition]
  )

  return (
    <div
      className={twMerge(
        'cursor-grabbing focus-visible:outline-0 focus-visible:border-0 select-none',
        className
      )}
      style={style}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  )
}
