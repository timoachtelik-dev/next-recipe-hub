import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-gray-300 focus-visible:ring-gray-300 focus-visible:ring-[3px] aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500",
  {
    variants: {
      variant: {
        default: "bg-gray-900 text-white hover:bg-gray-800",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40 dark:bg-red-600",
        outline:
          "border bg-white shadow-xs hover:bg-gray-100 hover:text-gray-900",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost:
          "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-200",
        link: "text-gray-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
