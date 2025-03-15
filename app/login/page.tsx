"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrainCircuit, Github, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { setAuthData } from '@/utils/auth'
import { useUserStore } from '@/store/useUserStore'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { setUser, setTokens } = useUserStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const loginData = {
        email,
        password,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'omit',
        body: JSON.stringify(loginData),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Store in localStorage
        localStorage.setItem('accessToken', data.access)
        localStorage.setItem('refreshToken', data.refresh)
        localStorage.setItem('userData', JSON.stringify(data.user))
        
        // Update store
        setUser(data.user)
        setTokens(data.access, data.refresh)
        
        router.push('/dashboard')
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Invalid email or password')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Failed to login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail("demo@jobsphere.com")
    setPassword("password123")
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/50 py-12">
      <div className="container grid flex-1 items-center justify-center gap-12 px-4 md:grid-cols-2 md:gap-16 lg:max-w-6xl lg:gap-20">
        <div className="hidden flex-col space-y-4 md:flex">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Welcome back</div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Login to Your JobSphere Account
          </h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Continue your interview preparation journey and track your progress towards landing your dream job.
          </p>
          <div className="flex items-center space-x-4">
            <BrainCircuit className="h-12 w-12 text-primary" />
            <div>
              <div className="text-xl font-bold">JobSphere</div>
              <div className="text-sm text-muted-foreground">AI-Powered Interview Preparation</div>
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex flex-col space-y-2 text-center md:hidden">
            <h1 className="text-2xl font-bold">Login to JobSphere</h1>
            <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
          </div>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="oauth">Social Login</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle>Login with Email</CardTitle>
                  <CardDescription>Enter your email and password to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </form>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" onClick={handleDemoLogin}>
                      Use Demo Credentials
                    </Button>
                    <p className="mt-2 text-xs text-center text-muted-foreground">
                      Demo: demo@jobsphere.com / password123
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-sm text-center text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-primary hover:underline">
                      Sign up
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="oauth">
              <Card>
                <CardHeader>
                  <CardTitle>Login with Social Accounts</CardTitle>
                  <CardDescription>Choose your preferred social login method</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.36 14.8c-.22.2-.5.31-.78.31-.34 0-.66-.14-.9-.4l-3.13-3.3-3.13 3.3c-.24.26-.56.4-.9.4-.28 0-.56-.11-.78-.31-.43-.4-.45-1.07-.05-1.5L11.8 12l-3.11-3.3c-.4-.43-.38-1.1.05-1.5.43-.4 1.1-.38 1.5.05L12 9.16l1.76-1.91c.4-.43 1.07-.45 1.5-.05.43.4.45 1.07.05 1.5L12.2 12l3.11 3.3c.4.43.38 1.1-.05 1.5z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Github className="mr-2 h-4 w-4" />
                    Continue with GitHub
                  </Button>
                  <Button variant="outline" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"
                      />
                    </svg>
                    Continue with Facebook
                  </Button>
                  <Button variant="outline" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M19.03 8.03c-.1-.9-.48-1.7-1.04-2.31.56-.6.94-1.4 1.04-2.31.06-.5-.34-.94-.84-.94-.37 0-.69.24-.81.59-.2.59-.77 1.01-1.42 1.01s-1.22-.42-1.42-1.01c-.12-.35-.44-.59-.81-.59-.5 0-.9.44-.84.94.1.9.48 1.71 1.04 2.31-.56.61-.94 1.4-1.04 2.31-.06.5.34.94.84.94.37 0 .69-.24.81-.59.2-.59.77-1.01 1.42-1.01s1.22.42 1.42 1.01c.12.35.44.59.81.59.5 0 .9-.44.84-.94zM7.88 3.39c.25-.32.64-.39.94-.14.3.25.36.71.11 1.03-.3.4-.47.89-.47 1.42 0 .53.17 1.02.47 1.42.25.32.2.78-.11 1.03-.3.25-.69.18-.94-.14-.52-.68-.83-1.5-.83-2.31 0-.81.31-1.63.83-2.31z"
                      />
                    </svg>
                    Continue with LinkedIn
                  </Button>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Separator />
                  <div className="text-sm text-center text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-primary hover:underline">
                      Sign up
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

