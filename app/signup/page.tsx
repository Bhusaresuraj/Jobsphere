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
import { CheckCircle2, Github, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useUserStore } from '@/store/useUserStore'

export default function SignupPage() {
  const router = useRouter()
  const { setUser, setTokens } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "candidate",
    phone_number: "",
    experience_level: "mid",
    industry: "Tech",
    job_role: "Software Engineer",
    timezone: "UTC"
  })
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    try {
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone_number: formData.phone_number,
        experience_level: formData.experience_level,
        industry: formData.industry,
        job_role: formData.job_role,
        timezone: formData.timezone
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'omit',
        body: JSON.stringify(signupData),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || data.detail || 'Failed to create account')
      }

      // Extract tokens and user data
      const accessToken = data.tokens?.access || data.access
      const refreshToken = data.tokens?.refresh || data.refresh
      const userData = data.user

      if (!accessToken || !refreshToken || !userData) {
        throw new Error('Invalid response data')
      }

      // Store in localStorage
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('userData', JSON.stringify(userData))

      // Update the store
      setUser(userData)
      setTokens(accessToken, refreshToken)

      // Navigate to dashboard after successful signup
      router.push('/dashboard')
    } catch (err) {
      console.error('Error details:', err)
      setError(err instanceof Error ? err.message : 'Failed to create account')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/50 py-12">
      <div className="container grid flex-1 items-center justify-center gap-12 px-4 md:grid-cols-2 md:gap-16 lg:max-w-6xl lg:gap-20">
        <div className="hidden flex-col space-y-4 md:flex">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Get Started</div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Create Your JobSphere Account</h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Join thousands of job seekers who have improved their interview skills and landed their dream jobs with
            JobSphere.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>AI-powered mock interviews</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>Real-time feedback on your responses</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>Detailed performance analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>Personalized improvement recommendations</span>
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex flex-col space-y-2 text-center md:hidden">
            <h1 className="text-2xl font-bold">Create an Account</h1>
            <p className="text-sm text-muted-foreground">Enter your information to get started</p>
          </div>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="oauth">Social Signup</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle>Sign Up with Email</CardTitle>
                  <CardDescription>Create an account to start your interview preparation journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Column 1 */}
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          name="username"
                          placeholder="johndoe"
                          value={formData.username}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* Column 1 */}
                      <div className="space-y-2">
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input
                          id="phone_number"
                          name="phone_number"
                          placeholder="1234567890"
                          value={formData.phone_number}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                          required
                        >
                          <option value="candidate">Candidate</option>
                          <option value="recruiter">Recruiter</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      {/* Column 1 */}
                      <div className="space-y-2">
                        <Label htmlFor="experience_level">Experience Level</Label>
                        <select
                          id="experience_level"
                          name="experience_level"
                          value={formData.experience_level}
                          onChange={handleChange}
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                          required
                        >
                          <option value="entry">Entry Level</option>
                          <option value="mid">Mid Level</option>
                          <option value="senior">Senior Level</option>
                        </select>
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <select
                          id="industry"
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                          required
                        >
                          <option value="Tech">Tech</option>
                          <option value="Finance">Finance</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Education">Education</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Column 1 */}
                      <div className="space-y-2">
                        <Label htmlFor="job_role">Job Role</Label>
                        <Input
                          id="job_role"
                          name="job_role"
                          placeholder="Software Engineer"
                          value={formData.job_role}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <select
                          id="timezone"
                          name="timezone"
                          value={formData.timezone}
                          onChange={handleChange}
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                          required
                        >
                          <option value="UTC">UTC</option>
                          <option value="EST">EST</option>
                          <option value="PST">PST</option>
                          <option value="IST">IST</option>
                        </select>
                      </div>

                      {/* Column 1 */}
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Full width elements */}
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" required />
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the{" "}
                        <Link href="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                      Log in
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="oauth">
              <Card>
                <CardHeader>
                  <CardTitle>Sign Up with Social Accounts</CardTitle>
                  <CardDescription>Choose your preferred social signup method</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.36 14.8c-.22.2-.5.31-.78.31-.34 0-.66-.14-.9-.4l-3.13-3.3-3.13 3.3c-.24.26-.56.4-.9.4-.28 0-.56-.11-.78-.31-.43-.4-.45-1.07-.05-1.5L11.8 12l-3.11-3.3c-.4-.43-.38-1.1.05-1.5.43-.4 1.1-.38 1.5.05L12 9.16l1.76-1.91c.4-.43 1.07-.45 1.5-.05.43.4.45 1.07.05 1.5L12.2 12l3.11 3.3c.4.43.38 1.1-.05 1.5z"
                      />
                    </svg>
                    Sign up with Google
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Github className="mr-2 h-4 w-4" />
                    Sign up with GitHub
                  </Button>
                  <Button variant="outline" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"
                      />
                    </svg>
                    Sign up with Facebook
                  </Button>
                  <Button variant="outline" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M19.03 8.03c-.1-.9-.48-1.7-1.04-2.31.56-.6.94-1.4 1.04-2.31.06-.5-.34-.94-.84-.94-.37 0-.69.24-.81.59-.2.59-.77 1.01-1.42 1.01s-1.22-.42-1.42-1.01c-.12-.35-.44-.59-.81-.59-.5 0-.9.44-.84.94.1.9.48 1.71 1.04 2.31-.56.61-.94 1.4-1.04 2.31-.06.5.34.94.84.94.37 0 .69-.24.81-.59.2-.59.77-1.01 1.42-1.01s1.22.42 1.42 1.01c.12.35.44.59.81.59.5 0 .9-.44.84-.94zM7.88 3.39c.25-.32.64-.39.94-.14.3.25.36.71.11 1.03-.3.4-.47.89-.47 1.42 0 .53.17 1.02.47 1.42.25.32.2.78-.11 1.03-.3.25-.69.18-.94-.14-.52-.68-.83-1.5-.83-2.31 0-.81.31-1.63.83-2.31z"
                      />
                    </svg>
                    Sign up with LinkedIn
                  </Button>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Separator />
                  <div className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                      Log in
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

