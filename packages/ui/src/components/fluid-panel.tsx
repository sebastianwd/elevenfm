import { motion } from 'motion/react'
import { ComponentProps } from 'react'

import useMeasure from 'react-use-measure'

interface FluidPanelProps extends Omit<ComponentProps<typeof motion.div>, 'animate'> {
  children: React.ReactNode
  className?: string
}

export const FluidPanel = ({ children, className, ...props }: FluidPanelProps) => {
  const [ref, bounds] = useMeasure()

  const { transition, ...rest } = props

  return (
    <motion.div
      transition={{
        type: 'spring',
        bounce: 0.15,
        duration: 0.8,
        ...transition
      }}
      animate={{
        height: bounds.height === 0 ? undefined : bounds.height,
        width: bounds.width === 0 ? undefined : bounds.width
      }}
      {...rest}
    >
      <div ref={ref} className={className}>
        {children}
      </div>
    </motion.div>
  )
}
