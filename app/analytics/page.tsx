"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BarChart, LineChart, PieChart, TrendingUp, TrendingDown, Clock, Calendar, CheckCircle2 } from "lucide-react"

interface DashboardData {
  templates: any[]
  sessions: any[]
}

export default function AnalyticsPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        if (!accessToken) {
          throw new Error('No access token found')
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/interview/dashboard/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const data = await response.json()
        setDashboardData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Calculate statistics from dashboard data
  const calculateStats = () => {
    if (!dashboardData) return {
      totalTime: 0,
      completedInterviews: 0,
      averageScore: 0,
      totalQuestions: 0
    }

    const completedSessions = dashboardData.sessions.filter(session => session.status === 'completed')
    const totalTime = dashboardData.sessions.reduce((acc, session) => acc + (session.duration_minutes || 0), 0)
    const totalQuestions = dashboardData.sessions.reduce((acc, session) => {
      const questionCount = session.questions?.questions?.length || 0
      return acc + questionCount
    }, 0)

    return {
      totalTime,
      completedInterviews: completedSessions.length,
      averageScore: 78, // Placeholder since score isn't in the API response
      totalQuestions
    }
  }

  const stats = calculateStats()

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-destructive">{error}</div>
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <div className="flex items-center space-x-2">
            <Tabs defaultValue="30days">
              <TabsList>
                <TabsTrigger value="7days">7 days</TabsTrigger>
                <TabsTrigger value="30days">30 days</TabsTrigger>
                <TabsTrigger value="3months">3 months</TabsTrigger>
                <TabsTrigger value="all">All time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Practice Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTime}m</div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedInterviews}</div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-green-600">+8% from last month</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-green-600">+5% from last month</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-green-600">+15% from last month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="improvement">Improvement Areas</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
                <CardDescription>Your interview performance scores over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <LineChart className="h-16 w-16 text-muted-foreground" />
                <span className="ml-4 text-muted-foreground">Performance chart will appear here</span>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Type Performance</CardTitle>
                  <CardDescription>How you perform across different interview types</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground" />
                  <span className="ml-4 text-muted-foreground">Interview type chart will appear here</span>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Question Category Performance</CardTitle>
                  <CardDescription>Your performance by question category</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <PieChart className="h-16 w-16 text-muted-foreground" />
                  <span className="ml-4 text-muted-foreground">Question category chart will appear here</span>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skill Breakdown</CardTitle>
                <CardDescription>Your performance across different interview skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium">Technical Knowledge</div>
                        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Frontend</div>
                      </div>
                      <div className="text-sm text-muted-foreground">85%</div>
                    </div>
                    <Progress value={85} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>Strengths: React, JavaScript, CSS</div>
                      <div>Improve: Performance optimization</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium">Communication</div>
                        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Verbal</div>
                      </div>
                      <div className="text-sm text-muted-foreground">72%</div>
                    </div>
                    <Progress value={72} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>Strengths: Clarity, enthusiasm</div>
                      <div>Improve: Conciseness, filler words</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium">Problem Solving</div>
                        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Algorithms</div>
                      </div>
                      <div className="text-sm text-muted-foreground">78%</div>
                    </div>
                    <Progress value={78} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>Strengths: Logical approach, creativity</div>
                      <div>Improve: Time management, edge cases</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium">Behavioral Questions</div>
                        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">STAR Method</div>
                      </div>
                      <div className="text-sm text-muted-foreground">65%</div>
                    </div>
                    <Progress value={65} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>Strengths: Authenticity, examples</div>
                      <div>Improve: Structure, quantifiable results</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium">System Design</div>
                        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Architecture</div>
                      </div>
                      <div className="text-sm text-muted-foreground">70%</div>
                    </div>
                    <Progress value={70} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>Strengths: Component design, API design</div>
                      <div>Improve: Scalability considerations</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="improvement" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Improvement Areas</CardTitle>
                <CardDescription>Focus on these areas to improve your interview performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">1. Structured Responses (STAR Method)</h3>
                    <p className="text-sm text-muted-foreground">
                      Your behavioral responses could benefit from a more consistent structure. Practice using the
                      Situation, Task, Action, Result format for clearer storytelling.
                    </p>
                    <div className="flex items-center text-sm text-primary mt-2">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      <span>+5% improvement in the last month</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">2. Technical Depth in System Design</h3>
                    <p className="text-sm text-muted-foreground">
                      Your system design answers need more depth on scalability and performance considerations. Focus on
                      trade-offs and specific technologies.
                    </p>
                    <div className="flex items-center text-sm text-primary mt-2">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      <span>+3% improvement in the last month</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">3. Concise Communication</h3>
                    <p className="text-sm text-muted-foreground">
                      Your answers tend to be longer than necessary. Work on being more concise while still providing
                      complete answers.
                    </p>
                    <div className="flex items-center text-sm text-destructive mt-2">
                      <TrendingDown className="mr-2 h-4 w-4" />
                      <span>-2% decline in the last month</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">4. Algorithm Optimization</h3>
                    <p className="text-sm text-muted-foreground">
                      You're good at finding solutions, but need to improve on optimizing for time and space complexity.
                      Practice more medium to hard algorithm questions.
                    </p>
                    <div className="flex items-center text-sm text-primary mt-2">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      <span>+7% improvement in the last month</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Heatmap</CardTitle>
                <CardDescription>Your interview practice activity over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <Calendar className="h-16 w-16 text-muted-foreground" />
                <span className="ml-4 text-muted-foreground">Activity heatmap will appear here</span>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Practice Time Distribution</CardTitle>
                  <CardDescription>How you spend your practice time</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <PieChart className="h-16 w-16 text-muted-foreground" />
                  <span className="ml-4 text-muted-foreground">Time distribution chart will appear here</span>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Activity</CardTitle>
                  <CardDescription>Your practice sessions by day of week</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground" />
                  <span className="ml-4 text-muted-foreground">Weekly activity chart will appear here</span>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

