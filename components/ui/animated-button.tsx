"use client"

import type React from "react"

import { type ButtonHTMLAttributes, forwardRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children: React.ReactNode
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ variant = "default", size = "default", className, children, ...props }, ref) => {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
        <Button ref={ref} variant={variant} size={size} className={cn(className)} {...props}>
          {children}
        </Button>
      </motion.div>
    )
  },
)

AnimatedButton.displayName = "AnimatedButton"

