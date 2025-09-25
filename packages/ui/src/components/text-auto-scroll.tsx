import { motion, useAnimate, useMotionTemplate, useMotionValue, useTransform } from 'motion/react'
import type React from 'react'
import { useRef } from 'react'
import { cn } from '../utils/cn'

interface TextAutoScrollProps extends React.ComponentProps<typeof motion.div> {
  text: string
  className?: string
  speed?: keyof typeof timePerChar
  pauseOnHover?: boolean
  ellipsis?: boolean
}

const timePerChar = {
  slow: 0.05,
  normal: 0.02,
  fast: 0.01
} as const

// space between the end of the text and the edge to avoid showing the gradient mask
const SCROLL_OFFSET = 8

export const TextAutoScroll = (props: TextAutoScrollProps) => {
  const { text, className, speed = 'normal', pauseOnHover = true, ellipsis = true, ...rest } = props

  const [scope, animate] = useAnimate<React.ComponentRef<typeof motion.p>>()

  const currentAnimation = useRef<ReturnType<Awaited<typeof animate>>>(null)

  const maskSize = useMotionValue(ellipsis ? 0 : 6)

  const onHoverStart = async () => {
    if (!scope.current) return

    if (currentAnimation.current && pauseOnHover) {
      currentAnimation.current.pause()
      return
    }

    const textWidth = scope.current.scrollWidth
    const textHeight = scope.current.clientHeight
    const visibleTextWidth = scope.current.offsetWidth

    const isOverflowing = textWidth > visibleTextWidth
    if (!isOverflowing) return

    const scrollDistance = textWidth - visibleTextWidth + SCROLL_OFFSET

    maskSize.set(Math.round(textHeight / 5)) // arbitrary

    await animate(scope.current, {
      overflow: 'visible'
    })

    const duration = timePerChar[speed] * scrollDistance

    currentAnimation.current = animate([
      [
        scope.current,
        {
          x: -scrollDistance
        },
        {
          ease: 'linear',
          duration
        }
      ],
      [
        scope.current,
        {
          x: 0
        },
        {
          ease: 'linear',
          at: '+1',
          duration
        }
      ]
    ])

    await currentAnimation.current

    animate(scope.current, {
      overflow: 'hidden'
    })

    currentAnimation.current = null
  }

  const onHoverEnd = () => {
    if (currentAnimation.current) {
      currentAnimation.current.play()

      return
    }
  }

  return (
    <motion.div
      {...rest}
      className={cn('relative -mx-1.5 overflow-hidden', className)}
      style={{
        maskImage: useMotionTemplate`linear-gradient(90deg,transparent 0,#000 ${maskSize}px,#000 calc(100% - ${useTransform(maskSize, (v) => v * 2)}px),transparent)`
      }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
    >
      <motion.p className={cn('truncate px-1.5 will-change-transform', !ellipsis && '!overflow-visible')} ref={scope}>
        {text}
      </motion.p>
    </motion.div>
  )
}
