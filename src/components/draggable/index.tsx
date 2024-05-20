import { useDraggable, type UseDraggableArguments } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import React, { useMemo } from 'react'

interface DraggableProps extends UseDraggableArguments {
  children: React.ReactNode
  className?: string
}

export const Draggable = (props: DraggableProps) => {
  const { children, className, ...args } = props
  const { attributes, listeners, setNodeRef, transform } = useDraggable(args)

  const style = useMemo(
    () => ({
      transform: CSS.Translate.toString(transform),
      cursor: 'grab',
    }),
    [transform]
  )

  return (
    <div
      className={className}
      style={style}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  )
}
