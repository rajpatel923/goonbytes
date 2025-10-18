import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

type AuthModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultView?: 'login' | 'signup'
}

// Modal for authentication (login/signup)
export function AuthModal({ open, onOpenChange, defaultView = 'login' }: AuthModalProps) {
  // Track which form is shown
  const [view, setView] = useState<'login' | 'signup'>(defaultView)

  // Switch between login and signup forms
  const toggleView = () => {
    setView(view === 'login' ? 'signup' : 'login')
  }

  // Close modal on successful login/signup
  const handleSuccess = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-sm border border-border/50">
        {view === 'login' ? (
          // Show login form
          <LoginForm onToggleForm={toggleView} onSuccess={handleSuccess} />
        ) : (
          // Show signup form
          <SignupForm onToggleForm={toggleView} onSuccess={handleSuccess} />
        )}
      </DialogContent>
    </Dialog>
  )
}