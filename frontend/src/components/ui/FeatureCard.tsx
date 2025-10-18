
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { AnimatedIcon } from './AnimatedIcon'

interface FeatureCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  icon: React.ReactNode
  delay?: number
}

const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ title, description, icon, delay = 0, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'group p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-md',
          className
        )}
        style={{ animationDelay: `${delay}ms` }}
        {...props}
      >
        <AnimatedIcon 
          icon={icon} 
          variant="primary" 
          size="md" 
          className="mb-4 group-hover:scale-110 transition-transform duration-300"
        />
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    )
  }
)

FeatureCard.displayName = 'FeatureCard'

export { FeatureCard }
