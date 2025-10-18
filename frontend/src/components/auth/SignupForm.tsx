import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

// Signup form component
export function SignupForm({ onToggleForm, onSuccess }: { onToggleForm: () => void, onSuccess?: () => void }) {
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()

  // Handles form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setIsLoading(true)
      await signUp(email, password) // Call sign up logic
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-scale-in">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter">Create your account</h1>
        <p className="text-muted-foreground">Sign up to start using NeuroCrop</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="transition-all duration-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="transition-all duration-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="transition-all duration-200"
          />
        </div>
        <Button type="submit" className="w-full button-animated" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {/* Toggle to sign in form */}
          Already have an account?{' '}
          <Button variant="link" onClick={onToggleForm} className="p-0 h-auto font-normal animated-link">
            Sign in
          </Button>
        </p>
      </div>
    </div>
  )
}