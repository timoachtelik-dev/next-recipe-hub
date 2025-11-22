"use client"

import { useTheme } from "next-themes"
import type { CSSProperties } from "react"
import { Toaster as Sonner, ToasterProps } from "sonner"

import { cn } from "@/lib/utils"

const baseToastClassNames = {
  toast:
    "bg-white/95 text-slate-900 dark:bg-zinc-900/90 dark:text-zinc-50 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xl backdrop-blur-md rounded-xl gap-1 px-4 py-3",
  title: "text-sm font-semibold",
  description: "text-sm text-slate-600 dark:text-zinc-300",
  closeButton:
    "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors",
  actionButton: "text-sm font-medium",
}

const themeStyle = {
  "--normal-bg": "var(--popover)",
  "--normal-text": "var(--popover-foreground)",
  "--normal-border": "var(--border)",
} as CSSProperties

const Toaster = ({
  toastOptions,
  position = "top-center",
  closeButton = true,
  offset = "1.5rem",
  className,
  style,
  ...props
}: ToasterProps) => {
  const { theme = "system" } = useTheme()

  const mergedToastOptions: ToasterProps["toastOptions"] = {
    ...toastOptions,
    classNames: {
      ...baseToastClassNames,
      ...(toastOptions?.classNames ?? {}),
    },
  }

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={position}
      closeButton={closeButton}
      offset={offset}
      className={cn("toaster group", className)}
      style={{ ...themeStyle, ...style }}
      toastOptions={mergedToastOptions}
      {...props}
    />
  )
}

export { Toaster }
