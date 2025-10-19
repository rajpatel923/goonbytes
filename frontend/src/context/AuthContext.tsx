
import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User, Provider } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

type AuthContextType = {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithSocial: (provider: Provider) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[AuthContext] Initializing auth...');
    
    // Guard against missing Supabase configuration
    if (!supabase) {
      console.error('[AuthContext] Supabase client not available');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('[AuthContext] Error getting session:', error);
        }
        console.log('[AuthContext] Initial session:', session ? 'logged in' : 'logged out');
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch((err) => {
        console.error('[AuthContext] Failed to get session:', err);
        setLoading(false);
      });

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log('[AuthContext] Auth state changed:', _event);
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => {
        console.log('[AuthContext] Cleaning up auth subscription');
        subscription.unsubscribe();
      }
    } catch (err) {
      console.error('[AuthContext] Error setting up auth listener:', err);
      setLoading(false);
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        throw error
      }
      
      toast.success('Signed in successfully')
    } catch (error: any) {
      toast.error(error.message || 'Error signing in')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({ email, password })
      
      if (error) {
        throw error
      }
      
      toast.success('Account created! Please check your email to confirm your account.')
    } catch (error: any) {
      toast.error(error.message || 'Error creating account')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithSocial = async (provider: Provider) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: window.location.origin
        }
      })
      
      if (error) {
        throw error
      }
    } catch (error: any) {
      toast.error(error.message || `Error signing in with ${provider}`)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
    } catch (error: any) {
      toast.error(error.message || 'Error signing out')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signInWithSocial, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
