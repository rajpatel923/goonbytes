import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Mail } from 'lucide-react'

// LoginForm component handles user sign-in
export function LoginForm({ onToggleForm, onSuccess }: { onToggleForm: () => void, onSuccess?: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()

  // Handles form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setIsLoading(true)
      await signIn(email, password) // Attempt sign-in
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
        <h1 className="text-3xl font-bold tracking-tighter">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to your Vigilant account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="transition-all duration-200"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Button variant="link" className="px-0 font-normal h-auto" type="button">
              Forgot password?
            </Button>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="transition-all duration-200"
          />
        </div>
        <Button type="submit" className="w-full button-animated" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Button variant="link" onClick={onToggleForm} className="p-0 h-auto font-normal animated-link">
            Sign up
          </Button>
        </p>
      </div>
    </div>
  )
}