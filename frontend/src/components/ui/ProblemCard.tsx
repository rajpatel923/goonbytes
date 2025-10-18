
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ProblemCardProps extends HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode
  title: string
  description: string
  delay?: number
}

const ProblemCard = forwardRef<HTMLDivElement, ProblemCardProps>(
  ({ icon, title, description, delay = 0, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'group relative overflow-hidden p-6 rounded-2xl border border-destructive/20 bg-card/50 backdrop-blur-sm hover:border-destructive/30 transition-all duration-300',
          'animate-fade-in opacity-0',
          className
        )}
        style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
        {...props}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1 text-destructive">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-16 h-16 bg-destructive/5 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-500"></div>
      </div>
    )
  }
)

ProblemCard.displayName = 'ProblemCard'

export { ProblemCard }
