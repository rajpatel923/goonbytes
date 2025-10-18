
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedIconProps extends HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animation?: 'pulse' | 'float' | 'none'
}

const AnimatedIcon = forwardRef<HTMLDivElement, AnimatedIconProps>(
  ({ icon, variant = 'default', size = 'md', animation = 'none', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8 p-1.5',
      md: 'w-12 h-12 p-2.5',
      lg: 'w-16 h-16 p-3',
      xl: 'w-20 h-20 p-4',
    }

    const variantClasses = {
      default: 'bg-muted text-foreground',
      primary: 'bg-primary/10 text-primary',
      secondary: 'bg-secondary/10 text-secondary',
      outline: 'bg-transparent border border-border text-foreground',
    }

    const animationClasses = {
      none: '',
      pulse: 'animate-pulse-gentle',
      float: 'animate-float',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl flex items-center justify-center',
          sizeClasses[size],
          variantClasses[variant],
          animationClasses[animation],
          className
        )}
        {...props}
      >
        {icon}
      </div>
    )
  }
)

AnimatedIcon.displayName = 'AnimatedIcon'

export { AnimatedIcon }
