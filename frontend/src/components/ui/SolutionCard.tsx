
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SolutionCardProps extends HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode
  title: string
  description: string
  delay?: number
}

const SolutionCard = forwardRef<HTMLDivElement, SolutionCardProps>(
  ({ icon, title, description, delay = 0, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'group relative overflow-hidden p-6 rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300',
          'animate-fade-in opacity-0',
          className
        )}
        style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
        {...props}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1 text-primary">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-16 h-16 bg-primary/5 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-500"></div>
      </div>
    )
  }
)

SolutionCard.displayName = 'SolutionCard'

export { SolutionCard }
