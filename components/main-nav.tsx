"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { BrainCircuit, Menu, LogOut, Settings, CreditCard } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useUserStore } from '@/store/useUserStore'

export function MainNav() {
  const router = useRouter()
  const { user, setUser, setTokens } = useUserStore()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  // Check authentication status using both store and tokens
  React.useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      const userData = localStorage.getItem('userData')
      
      if (accessToken && refreshToken && userData) {
        try {
          const parsedUserData = JSON.parse(userData)
          // Update the store if it's not already set
          if (!user) {
            setUser(parsedUserData)
            setTokens(accessToken, refreshToken)
          }
          setIsLoggedIn(true)
        } catch (e) {
          console.error('Failed to parse user data:', e)
          // Clear everything if parsing fails
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('userData')
          setIsLoggedIn(false)
        }
      } else {
        setIsLoggedIn(false)
      }
    }

    // Check immediately and also whenever user state changes
    checkAuth()
    
    // Add event listener for storage changes
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [user, setUser, setTokens])

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/features",
      label: "Features",
      active: pathname === "/features",
    },
    {
      href: "/pricing",
      label: "Pricing",
      active: pathname === "/pricing",
    },
  ]

  const authenticatedRoutes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
    },
    {
      href: "/interviews",
      label: "Interviews",
      active: pathname === "/interviews" || pathname.startsWith("/interviews/"),
    },
    {
      href: "/analytics",
      label: "Analytics",
      active: pathname === "/analytics",
    },
    {
      href: "/settings",
      label: "Settings",
      active: pathname === "/settings",
    },
  ]

  const displayedRoutes = isLoggedIn ? authenticatedRoutes : routes

  const handleSignOut = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userData')
    useUserStore.setState({ user: null, accessToken: null, refreshToken: null })
    setIsLoggedIn(false)
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="mr-6 flex items-center space-x-2">
            <BrainCircuit className="h-6 w-6" />
            <span className="font-bold">JobSphere</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {displayedRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  route.active ? "text-foreground" : "text-foreground/60",
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {/* Desktop Authentication UI */}
            <div className="hidden md:flex items-center space-x-2">
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-1 px-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {user?.username.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="ml-1">Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-medium">{user?.username || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings/subscription" className="cursor-pointer flex items-center">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Subscription</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer flex items-center text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>

            <ModeToggle />

            {/* Mobile Menu Button */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[350px] pr-0">
                <SheetHeader className="mb-4">
                  <SheetTitle className="flex items-center">
                    <BrainCircuit className="h-5 w-5 mr-2" />
                    JobSphere
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile User Info (if logged in) */}
                {isLoggedIn && (
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2 px-1">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {user?.username.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user?.username || 'User'}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <Separator className="my-4" />
                  </div>
                )}

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-4 px-1">
                  {displayedRoutes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "flex items-center text-base py-1",
                        route.active ? "text-foreground font-medium" : "text-foreground/60 hover:text-foreground",
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {route.label}
                    </Link>
                  ))}

                  {/* Mobile Authentication Links */}
                  {isLoggedIn ? (
                    <>
                      <Separator className="my-2" />
                      <Link
                        href="/"
                        className="flex items-center text-base py-1 text-destructive"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Link>
                    </>
                  ) : (
                    <>
                      <Separator className="my-2" />
                      <div className="flex flex-col gap-2 mt-2">
                        <Button asChild variant="outline" onClick={() => setIsMenuOpen(false)}>
                          <Link href="/login">Sign In</Link>
                        </Button>
                        <Button asChild onClick={() => setIsMenuOpen(false)}>
                          <Link href="/signup">Sign Up</Link>
                        </Button>
                      </div>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </div>
    </header>
  )
}

