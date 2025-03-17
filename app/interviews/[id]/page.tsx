"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mic,
  MicOff,
  Pause,
  Play,
  ThumbsDown,
  ThumbsUp,
  X,
  Upload,
} from "lucide-react"
import { useUserStore } from "@/store/useUserStore"
import { Skeleton } from "@/components/ui/skeleton"

interface Template {
  id: number
  name: string
  job_role: string
  industry: string
  seniority_level: string
  years_of_experience: number
  target_company: string
  interview_types: string[]
  skills: string[]
  strengths: string[]
  weaknesses: string[]
  question_complexity: string
  question_categories: string[]
  session_duration: number
  num_questions: number
  questions: {
    questions: string[]
  }
}

interface ParsedQuestion {
  mainQuestion: string
  followUpQuestion: string
}

interface InterviewData {
  questions: {
    questions: string[]
  }
  duration_minutes: number
  template: Template
  id: number // Added for session ID
}

interface QuestionAnalysis {
  score: number
  strengths: string[]
  question_analysis: string
  areas_for_improvement: string[]
  relevance_to_question: string
  question_alignment_score: number
}

interface AnalysisData {
  analysis_data: {
    [key: string]: QuestionAnalysis
  }
  overall_score: number
  strengths: { [key: string]: string }
  weaknesses: { [key: string]: string }
}

export default function InterviewPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const { accessToken } = useUserStore()
  const [params, setParams] = useState<{ id: string } | null>(null) // State for resolved params
  const [template, setTemplate] = useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes in seconds
  const [isPaused, setIsPaused] = useState(true)
  const [feedback, setFeedback] = useState<null | {
    score: number
    strengths: string[]
    improvements: string[]
    transcript: string
  }>(null)
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null)
  const [audioFiles, setAudioFiles] = useState<{ [key: number]: File }>({})
  const [interviewSessionId, setInterviewSessionId] = useState<number | null>(null)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false)

  // Resolve paramsPromise
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await paramsPromise
        setParams(resolvedParams)
      } catch (err) {
        console.error('Error resolving params:', err)
        setError('Failed to resolve interview parameters')
        setIsLoading(false)
      }
    }
    resolveParams()
  }, [paramsPromise])

  // Fetch template data
  useEffect(() => {
    if (!params) return // Wait until params are resolved

    const fetchTemplate = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/interview/templates/${params.id}/`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch template')
        }

        const data: Template = await response.json()
        setTemplate(data)
        setTimeRemaining(data.session_duration * 60)
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Failed to load interview template')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplate()
  }, [params, accessToken])

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (!isPaused && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0) {
      handleNextQuestion()
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isPaused, timeRemaining])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'audio/wav') {
      setAudioFiles(prev => ({
        ...prev,
        [currentQuestion]: file
      }))
      setIsRecording(true)
    } else {
      setError('Please upload a .wav audio file')
    }
  }

  const submitRecordings = async () => {
    try {
      setIsAnalysisLoading(true)
      if (!interviewSessionId) {
        throw new Error('No interview session ID found')
      }

      const formData = new FormData()
      formData.append('session_id', interviewSessionId.toString())
      Object.entries(audioFiles).forEach(([_, file]) => {
        formData.append('audio_files', file)
      })

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/interview/interviews/submit/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to submit recordings: ${response.status}`)
      }

      await fetchAnalysis(interviewSessionId)
      setIsSubmitted(true)
    } catch (err) {
      console.error('Error submitting recordings:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit recordings')
    } finally {
      setIsAnalysisLoading(false)
    }
  }

  const handleNextQuestion = () => {
    if (template && currentQuestion < template.num_questions) {
      setCurrentQuestion((prev) => prev + 1)
      setTimeRemaining(120)
      setIsPaused(true)
    } else {
      setIsSubmitted(true)
      setIsAnalysisLoading(true)
      submitRecordings()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion((prev) => prev - 1)
      setTimeRemaining(120)
      setIsRecording(false)
      setIsPaused(true)
      setFeedback(null)
    }
  }

  const startInterview = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/interview/interviews/start/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            template_id: Number(params?.id),
            job_role: template?.job_role || '',
            industry: template?.industry || '',
            is_timed: true,
            difficulty_level: 'medium'
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to start interview')
      }

      const data: InterviewData = await response.json()
      setInterviewSessionId(data.id)
      setInterviewData(data)
      setIsInterviewStarted(true)
      setTimeRemaining(data.duration_minutes * 60)
      setCurrentQuestion(1)
    } catch (err) {
      console.error('Error starting interview:', err)
      setError('Failed to start interview')
    }
  }

  const fetchAnalysis = async (sessionId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/interview/interviews/${sessionId}/analysis/`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch analysis')
      }

      const data: AnalysisData = await response.json()
      setAnalysisData(data)
    } catch (err) {
      console.error('Error fetching analysis:', err)
      setError('Failed to load interview analysis')
    }
  }

  const AnalysisSkeletonLoader = () => {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>

              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>
            </div>

            <div>
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-2 w-full" />
                          </div>
                          <div>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-2 w-full" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!params || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (error || !template) {
    return <div className="text-destructive">{error || 'Template not found'}</div>
  }

  const questions = (isInterviewStarted && interviewData ? interviewData.questions.questions : template.questions.questions)
  const parsedQuestions = parseQuestions(questions)

  return (
    <div className="container py-8">
      {!isSubmitted ? (
        <>
          <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={() => window.history.back()} className="mr-4">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Interviews
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{template.name}</h1>
              <p className="text-muted-foreground">{template.job_role} - {template.industry}</p>
            </div>
            {!isInterviewStarted && (
              <Button 
                onClick={startInterview} 
                className="ml-4"
                variant="default"
              >
                Start Interview
              </Button>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>
                        Question {currentQuestion} of {template.num_questions}
                      </CardTitle>
                      <CardDescription>{template.job_role} Interview</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${isPaused ? "bg-muted" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"}`}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(timeRemaining)}</span>
                      </div>
                      {!isPaused && (
                        <Button variant="ghost" size="sm" onClick={() => setIsRecording(false)}>
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-lg">{parsedQuestions[currentQuestion - 1]?.mainQuestion}</div>
                    <div className="text-sm text-muted-foreground">
                      Follow-up: {parsedQuestions[currentQuestion - 1]?.followUpQuestion}
                    </div>
                  </div>

                  <div className="flex justify-center items-center h-40 bg-muted rounded-lg mb-4">
                    {audioFiles[currentQuestion] ? (
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <CheckCircle2 className="h-12 w-12 text-primary" />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          File uploaded: {audioFiles[currentQuestion].name}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Upload a .wav file for this question</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center space-x-4">
                    <input
                      type="file"
                      accept=".wav"
                      onChange={handleFileUpload}
                      className="hidden"
                      id={`file-upload-${currentQuestion}`}
                    />
                    <Button 
                      variant={audioFiles[currentQuestion] ? "destructive" : "default"} 
                      onClick={() => {
                        if (audioFiles[currentQuestion]) {
                          const newFiles = { ...audioFiles }
                          delete newFiles[currentQuestion]
                          setAudioFiles(newFiles)
                          setIsRecording(false)
                        } else {
                          document.getElementById(`file-upload-${currentQuestion}`)?.click()
                        }
                      }} 
                      className="w-40"
                      disabled={!isInterviewStarted}
                    >
                      {audioFiles[currentQuestion] ? (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Remove File
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {isInterviewStarted ? "Upload Answer" : "Start Interview First"}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestion === 1}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button onClick={handleNextQuestion}>
                    {currentQuestion === template.num_questions ? (
                      isRecording ? "Stop and Finish" : "Submit Interview"
                    ) : (
                      <>
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {feedback && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Feedback</CardTitle>
                    <CardDescription>Analysis of your response to Question {currentQuestion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Overall Score</h3>
                          <span className="text-sm font-medium">{feedback.score}%</span>
                        </div>
                        <Progress value={feedback.score} className="h-2" />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h3 className="font-medium flex items-center text-green-600 mb-2">
                            <ThumbsUp className="mr-2 h-4 w-4" />
                            Strengths
                          </h3>
                          <ul className="space-y-1">
                            {feedback.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600 mt-0.5" />
                                <span className="text-sm">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h3 className="font-medium flex items-center text-amber-600 mb-2">
                            <ThumbsDown className="mr-2 h-4 w-4" />
                            Areas for Improvement
                          </h3>
                          <ul className="space-y-1">
                            {feedback.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle2 className="mr-2 h-4 w-4 text-amber-600 mt-0.5" />
                                <span className="text-sm">{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Transcript</h3>
                        <div className="p-3 bg-muted rounded-md text-sm">{feedback.transcript}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Interview Progress</CardTitle>
                  <CardDescription>
                    {template.seniority_level} {template.job_role} Interview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {parsedQuestions.map((question, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div
                            className={`flex items-center ${currentQuestion === index + 1 ? "text-primary font-medium" : index + 1 < currentQuestion ? "text-muted-foreground" : "text-muted-foreground"}`}
                          >
                            <div
                              className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs ${
                                currentQuestion === index + 1
                                  ? "bg-primary text-primary-foreground"
                                  : index + 1 < currentQuestion
                                    ? "bg-primary/20 text-primary"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <span className="text-sm truncate max-w-[200px]">
                              {question.mainQuestion.length > 40 
                                ? `${question.mainQuestion.substring(0, 40)}...` 
                                : question.mainQuestion}
                            </span>
                          </div>
                          {index + 1 < currentQuestion && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </div>
                        {index < parsedQuestions.length - 1 && <div className="ml-3 border-l border-muted h-4"></div>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Interview Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Use the STAR Method</h3>
                      <p className="text-sm text-muted-foreground">
                        Structure your answers with Situation, Task, Action, and Result for clarity.
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Be Specific</h3>
                      <p className="text-sm text-muted-foreground">
                        Use concrete examples and metrics to demonstrate your impact.
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Watch Your Pace</h3>
                      <p className="text-sm text-muted-foreground">
                        Speak clearly and at a moderate pace. Avoid rushing through answers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {isAnalysisLoading ? "Analyzing Interview..." : "Interview Analysis"}
            </h1>
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              disabled={isAnalysisLoading}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Interviews
            </Button>
          </div>

          {isAnalysisLoading ? (
            <AnalysisSkeletonLoader />
          ) : (
            analysisData && (
              <Card>
                <CardHeader>
                  <CardTitle>Overall Performance</CardTitle>
                  <CardDescription>Analysis of your interview responses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Overall Score</h3>
                        <span className="text-sm font-medium">{analysisData.overall_score}%</span>
                      </div>
                      <Progress value={analysisData.overall_score} className="h-2" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="font-medium flex items-center text-green-600 mb-2">
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          Strengths
                        </h3>
                        <ul className="space-y-1">
                          {Object.entries(analysisData.strengths).map(([key, value], index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">
                                <strong className="capitalize">{key}:</strong> {value}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-medium flex items-center text-amber-600 mb-2">
                          <ThumbsDown className="mr-2 h-4 w-4" />
                          Areas for Improvement
                        </h3>
                        <ul className="space-y-1">
                          {Object.entries(analysisData.weaknesses).map(([key, value], index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle2 className="mr-2 h-4 w-4 text-amber-600 mt-0.5" />
                              <span className="text-sm">
                                <strong className="capitalize">{key}:</strong> {value}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-4">Question-wise Analysis</h3>
                      <div className="space-y-4">
                        {Object.entries(analysisData.analysis_data).map(([questionNum, data]) => (
                          <Card key={questionNum}>
                            <CardHeader>
                              <CardTitle className="text-base">Question {questionNum}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">Score</h4>
                                    <Progress value={data.score} className="h-2" />
                                    <span className="text-sm text-muted-foreground">{data.score}%</span>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">Question Alignment</h4>
                                    <Progress value={data.question_alignment_score} className="h-2" />
                                    <span className="text-sm text-muted-foreground">{data.question_alignment_score}%</span>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Strengths</h4>
                                    <ul className="space-y-1">
                                      {data.strengths.map((strength, idx) => (
                                        <li key={idx} className="flex items-start">
                                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600 mt-0.5" />
                                          <span className="text-sm">{strength}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Areas for Improvement</h4>
                                    <ul className="space-y-1">
                                      {data.areas_for_improvement.map((area, idx) => (
                                        <li key={idx} className="flex items-start">
                                          <CheckCircle2 className="mr-2 h-4 w-4 text-amber-600 mt-0.5" />
                                          <span className="text-sm">{area}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="bg-muted p-3 rounded-md">
                                    <h4 className="text-sm font-medium mb-1">Question Analysis</h4>
                                    <p className="text-sm">{data.question_analysis}</p>
                                  </div>

                                  <div className="bg-muted p-3 rounded-md">
                                    <h4 className="text-sm font-medium mb-1">Relevance to Question</h4>
                                    <p className="text-sm">{data.relevance_to_question}</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  )
}

const parseQuestions = (questions: string[]): ParsedQuestion[] => {
  const parsedQuestions: ParsedQuestion[] = []
  
  // Skip the first and last elements as they are intro and outro text
  const relevantQuestions = questions.slice(1, -1)
  
  let currentQuestion: Partial<ParsedQuestion> = {}
  let isProcessingQuestion = false
  
  relevantQuestions.forEach(line => {
    // Skip empty lines or separator lines
    if (!line.trim() || line.trim() === '---' || line.trim() === '-') {
      return
    }

    // Check for section headers and skip them
    if (line.startsWith('###') || line.match(/^(Technical|Behavioral|Situational|Problem-solving|Competency-based|Cultural Fit) Questions?:?$/i)) {
      if (currentQuestion.mainQuestion) {
        if (!currentQuestion.followUpQuestion) {
          currentQuestion.followUpQuestion = "No follow-up question provided."
        }
        parsedQuestions.push(currentQuestion as ParsedQuestion)
        currentQuestion = {}
      }
      isProcessingQuestion = false
      return
    }

    // Handle numbered questions with various formats
    const numberedQuestionMatch = line.match(/^(\d+\.)?\s*\*?\*?(Q(uestion)?:|Tell me about|Describe|Explain|Imagine|Suppose|Can you|What|How)/i)
    if (numberedQuestionMatch) {
      if (currentQuestion.mainQuestion) {
        if (!currentQuestion.followUpQuestion) {
          currentQuestion.followUpQuestion = "No follow-up question provided."
        }
        parsedQuestions.push(currentQuestion as ParsedQuestion)
        currentQuestion = {}
      }
      isProcessingQuestion = true
    }

    // Extract main question
    if (isProcessingQuestion || line.includes('**Q:**') || line.includes('**Question:**') || line.match(/^\d+\.\s*\*\*.*?\*\*:/)) {
      let questionText = line
      
      // Remove numbering and formatting
      questionText = questionText.replace(/^\d+\.\s*/, '')
      questionText = questionText.replace(/\*\*Q:\*\*\s*/, '')
      questionText = questionText.replace(/\*\*Question:\*\*\s*/, '')
      questionText = questionText.replace(/^[-*]\s*/, '')
      questionText = questionText.replace(/\*\*/g, '')
      
      if (!currentQuestion.mainQuestion) {
        currentQuestion.mainQuestion = questionText.trim()
      }
    }

    // Extract follow-up question with various formats
    const followUpPatterns = [
      /\*\*Follow-up:\*\*\s*(.*)/i,
      /\*Follow-up:\*\s*(.*)/i,
      /Follow-up:\s*(.*)/i,
      /- \*\*Follow-up\*\*:\s*(.*)/i,
      /\*\*Follow-up Question:\*\*\s*(.*)/i
    ]

    for (const pattern of followUpPatterns) {
      const match = line.match(pattern)
      if (match) {
        currentQuestion.followUpQuestion = match[1].trim()
        break
      }
    }
  })

  // Add the last question if it exists
  if (currentQuestion.mainQuestion) {
    if (!currentQuestion.followUpQuestion) {
      currentQuestion.followUpQuestion = "No follow-up question provided."
    }
    parsedQuestions.push(currentQuestion as ParsedQuestion)
  }

  return parsedQuestions
}