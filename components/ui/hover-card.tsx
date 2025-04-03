"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface HoverCardProps {
  className?: string
  children: React.ReactNode
}

export function HoverCard({ className, children }: HoverCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2 }}
    >
      <Card className={className}>{children}</Card>
    </motion.div>
  )
}

export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle }

