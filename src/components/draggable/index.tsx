import { useDraggable, type UseDraggableArguments } from '@dnd-kit/core'
import React from 'react'

interface DraggableProps extends UseDraggableArguments {
  children: React.ReactNode
  className?: string
}

export const Draggable = (props: DraggableProps) => {
  const { children, className, ...args } = props
  const { attributes, listeners, setNodeRef } = useDraggable(args)

  return (
    <div className={className} ref={setNodeRef} {...listeners} {...attributes}>
      {children}
    </div>
  )
}
