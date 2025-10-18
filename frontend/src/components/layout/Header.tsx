
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuth } from '@/hooks/useAuth'
import { Leaf, Menu, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login')
  const { user, signOut } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Solutions', href: '/solutions' },
    { name: 'Map Tool', href: '/map-tool' },
  ]

  const openLoginModal = () => {
    setAuthModalView('login')
    setAuthModalOpen(true)
  }

  const openSignupModal = () => {
    setAuthModalView('signup')
    setAuthModalOpen(true)
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
      <div className="neurocrop-container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-6">
            <Link to="/" className="flex items-center gap-2 hover-scale">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <Leaf className="w-6 h-6 animate-pulse-gentle" />
              </div>
              <span className="text-xl font-bold tracking-tight">NeuroCrop</span>
            </Link>
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      px-3 py-2 text-sm rounded-lg transition-all duration-300
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-foreground/70 hover:text-foreground hover:bg-muted'}
                    `}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:scale-105 transition-transform">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src="" alt={user.email || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer">
                      Saved Crops
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={openLoginModal} className="animated-link">
                  Sign in
                </Button>
                <Button variant="default" onClick={openSignupModal} className="button-animated">
                  Get Started
                </Button>
              </>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setIsMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`
          fixed inset-0 z-50 bg-background/90 backdrop-blur-lg transform transition-all duration-300 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">NeuroCrop</span>
          </Link>
          <button
            type="button"
            className="rounded-md p-1"
            onClick={() => setIsMenuOpen(false)}
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-6 flow-root px-6">
          <div className="space-y-1 py-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block py-3 text-base font-medium text-foreground hover:bg-muted px-3 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-border/30 py-6">
            {user ? (
              <>
                <Link
                  to="/account"
                  className="block py-3 text-base font-medium text-foreground hover:bg-muted px-3 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Account
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-3 h-auto text-base font-medium text-foreground hover:bg-muted rounded-lg"
                  onClick={() => {
                    signOut()
                    setIsMenuOpen(false)
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsMenuOpen(false)
                    openLoginModal()
                  }}
                >
                  Sign in
                </Button>
                <Button
                  className="w-full button-animated"
                  onClick={() => {
                    setIsMenuOpen(false)
                    openSignupModal()
                  }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultView={authModalView}
      />
    </header>
  )
}
