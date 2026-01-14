"use client"

import * as React from "react"
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion"
import { cn } from "@/lib/utils"

export interface SwipeAction {
  icon: React.ReactNode
  label: string
  onClick: () => void
  className?: string
}

interface SwipeableCardProps {
  children: React.ReactNode
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  className?: string
  actionWidth?: number
  threshold?: number
  disabled?: boolean
}

const ACTION_WIDTH = 72
const SWIPE_THRESHOLD = 0.4

export function SwipeableCard({
  children,
  leftActions = [],
  rightActions = [],
  className,
  actionWidth = ACTION_WIDTH,
  threshold = SWIPE_THRESHOLD,
  disabled = false,
}: SwipeableCardProps) {
  const x = useMotionValue(0)
  const [isDragging, setIsDragging] = React.useState(false)

  const leftActionsWidth = leftActions.length * actionWidth
  const rightActionsWidth = rightActions.length * actionWidth

  // Transform for left actions (revealed when swiping right)
  const leftActionsX = useTransform(x, [0, leftActionsWidth], [-leftActionsWidth, 0])
  const leftActionsOpacity = useTransform(x, [0, leftActionsWidth * 0.5], [0, 1])

  // Transform for right actions (revealed when swiping left)
  const rightActionsX = useTransform(x, [-rightActionsWidth, 0], [0, rightActionsWidth])
  const rightActionsOpacity = useTransform(x, [-rightActionsWidth * 0.5, 0], [1, 0])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    const velocity = info.velocity.x
    const offset = info.offset.x

    // Determine if we should snap open or closed
    if (offset > 0 && leftActions.length > 0) {
      // Swiping right - reveal left actions
      if (offset > leftActionsWidth * threshold || velocity > 500) {
        animate(x, leftActionsWidth, { type: "spring", stiffness: 500, damping: 30 })
      } else {
        animate(x, 0, { type: "spring", stiffness: 500, damping: 30 })
      }
    } else if (offset < 0 && rightActions.length > 0) {
      // Swiping left - reveal right actions
      if (Math.abs(offset) > rightActionsWidth * threshold || velocity < -500) {
        animate(x, -rightActionsWidth, { type: "spring", stiffness: 500, damping: 30 })
      } else {
        animate(x, 0, { type: "spring", stiffness: 500, damping: 30 })
      }
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 })
    }
  }

  const closeActions = () => {
    animate(x, 0, { type: "spring", stiffness: 500, damping: 30 })
  }

  const handleActionClick = (action: SwipeAction) => {
    action.onClick()
    closeActions()
  }

  // Calculate drag constraints
  const dragConstraints = {
    left: rightActions.length > 0 ? -rightActionsWidth : 0,
    right: leftActions.length > 0 ? leftActionsWidth : 0,
  }

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* Left actions (revealed on swipe right) */}
      {leftActions.length > 0 && (
        <motion.div
          className="absolute inset-y-0 left-0 flex"
          style={{ x: leftActionsX, opacity: leftActionsOpacity }}
        >
          {leftActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-white font-medium text-xs",
                action.className
              )}
              style={{ width: actionWidth }}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Right actions (revealed on swipe left) */}
      {rightActions.length > 0 && (
        <motion.div
          className="absolute inset-y-0 right-0 flex"
          style={{ x: rightActionsX, opacity: rightActionsOpacity }}
        >
          {rightActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-white font-medium text-xs",
                action.className
              )}
              style={{ width: actionWidth }}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Main draggable content */}
      <motion.div
        drag={disabled ? false : "x"}
        dragConstraints={dragConstraints}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={cn(
          "relative bg-card touch-pan-y",
          isDragging && "cursor-grabbing"
        )}
      >
        {children}
      </motion.div>
    </div>
  )
}
