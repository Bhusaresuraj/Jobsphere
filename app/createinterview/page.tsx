"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/store/useUserStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Loader2, Play, Save } from "lucide-react"
import { 
  InterviewTemplate, 
  INTERVIEW_TYPES, 
  QUESTION_CATEGORIES,
  FEEDBACK_AREAS,
  INTERVIEWER_PERSONAS,
  ACCENT_OPTIONS,
  COMPLEXITY_LEVELS,
  SENIORITY_LEVELS,
  FEEDBACK_DEPTH_OPTIONS,
  INTERVIEWER_STYLES
} from "./types"

// Add this helper component for tag input
const TagInput = ({ value, onChange, placeholder }: { 
  value: string[], 
  onChange: (tags: string[]) => void,
  placeholder: string 
}) => {
  const [input, setInput] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      onChange([...value, input.trim()])
      setInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <span 
            key={tag} 
            className="bg-secondary px-2 py-1 rounded-md text-sm flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-destructive"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  )
}

export default function CreateInterviewPage() {
  const router = useRouter()
  const { accessToken } = useUserStore()
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [config, setConfig] = useState<InterviewTemplate>({
    name: "",
    job_role: "",
    industry: "",
    seniority_level: "Mid-level",
    years_of_experience: 0,
    target_company: "",
    interview_types: [],
    skills: [],
    strengths: [],
    weaknesses: [],
    question_complexity: "basic",
    question_categories: [],
    session_duration: 30,
    num_questions: 10,
    time_pressure: false,
    follow_up_questions: true,
    interruption_simulation: false,
    feedback_depth: "standard",
    feedback_focus_areas: [],
    real_time_feedback: false,
    knowledge_gap_analysis: true,
    resource_integration: true,
    improvement_tracking: true,
    enable_audio_video: true,
    record_session: false,
    enable_transcription: true,
    interviewer_style: "friendly",
    interviewer_persona: "professional",
    accent_language: "standard",
    start_immediately: true,
    is_public: false
  })

  const handleChange = (field: keyof InterviewTemplate, value: any) => {
    if (field === 'years_of_experience' || field === 'num_questions' || field === 'session_duration') {
      // Handle empty string or invalid number input
      const numValue = value === '' ? 0 : Number(value)
      setConfig(prev => ({ ...prev, [field]: isNaN(numValue) ? 0 : numValue }))
    } else {
      setConfig(prev => ({ ...prev, [field]: value }))
    }
  }

  const toggleArrayItem = (field: keyof InterviewTemplate, item: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(item)
        ? (prev[field] as string[]).filter(i => i !== item)
        : [...(prev[field] as string[]), item]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("Submitting form with data:", config) // Debug log

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/interview/templates/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(config),
      })

      console.log("Response status:", response.status) // Debug log

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error:", errorData) // Debug log
        throw new Error(errorData.message || 'Failed to create interview template')
      }

      const data = await response.json()
      console.log("Success response:", data) // Debug log
      router.push(`/interviews/${data.id}`)
    } catch (err) {
      console.error('Creation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create interview template')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create Interview Template</h1>
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="technical">Technical Setup</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Set up the basic parameters for your interview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={config.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter template name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_role">Job Role</Label>
                    <Input
                      id="job_role"
                      value={config.job_role}
                      onChange={(e) => handleChange('job_role', e.target.value)}
                      placeholder="Enter job role"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={config.industry}
                      onChange={(e) => handleChange('industry', e.target.value)}
                      placeholder="Enter industry"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seniority_level">Seniority Level</Label>
                    <Select
                      value={config.seniority_level}
                      onValueChange={(value) => handleChange('seniority_level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select seniority level" />
                      </SelectTrigger>
                      <SelectContent>
                        {SENIORITY_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Interview Types</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {INTERVIEW_TYPES.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={config.interview_types.includes(type)}
                          onCheckedChange={() => toggleArrayItem('interview_types', type)}
                        />
                        <Label htmlFor={`type-${type}`}>{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="years_of_experience">Years of Experience</Label>
                    <Input
                      id="years_of_experience"
                      type="number"
                      value={config.years_of_experience || ''}
                      onChange={(e) => handleChange('years_of_experience', e.target.value)}
                      min="0"
                      max="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target_company">Target Company</Label>
                    <Input
                      id="target_company"
                      value={config.target_company}
                      onChange={(e) => handleChange('target_company', e.target.value)}
                      placeholder="Enter target company"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Required Skills</Label>
                    <p className="text-sm text-muted-foreground">
                      Press Enter to add each skill
                    </p>
                    <TagInput
                      value={config.skills}
                      onChange={(tags) => handleChange('skills', tags)}
                      placeholder="Enter a skill and press Enter"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Strengths to Assess</Label>
                    <p className="text-sm text-muted-foreground">
                      Press Enter to add each strength
                    </p>
                    <TagInput
                      value={config.strengths}
                      onChange={(tags) => handleChange('strengths', tags)}
                      placeholder="Enter a strength and press Enter"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Weaknesses to Assess</Label>
                    <p className="text-sm text-muted-foreground">
                      Press Enter to add each weakness
                    </p>
                    <TagInput
                      value={config.weaknesses}
                      onChange={(tags) => handleChange('weaknesses', tags)}
                      placeholder="Enter a weakness and press Enter"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Question Configuration</CardTitle>
                <CardDescription>Configure the interview questions and format</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="question_complexity">Question Complexity</Label>
                    <Select
                      value={config.question_complexity}
                      onValueChange={(value) => handleChange('question_complexity', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select complexity" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPLEXITY_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="num_questions">Number of Questions</Label>
                    <Input
                      id="num_questions"
                      type="number"
                      value={config.num_questions || ''}
                      onChange={(e) => handleChange('num_questions', e.target.value)}
                      min="1"
                      max="50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session_duration">Session Duration (minutes)</Label>
                    <Input
                      id="session_duration"
                      type="number"
                      value={config.session_duration || ''}
                      onChange={(e) => handleChange('session_duration', e.target.value)}
                      min="15"
                      max="180"
                      step="15"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Question Categories</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {QUESTION_CATEGORIES.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={config.question_categories.includes(category)}
                          onCheckedChange={() => toggleArrayItem('question_categories', category)}
                        />
                        <Label htmlFor={`category-${category}`}>{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Time Pressure</Label>
                      <p className="text-sm text-muted-foreground">Enable strict time limits per question</p>
                    </div>
                    <Switch
                      checked={config.time_pressure}
                      onCheckedChange={(checked) => handleChange('time_pressure', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Follow-up Questions</Label>
                      <p className="text-sm text-muted-foreground">Allow follow-up questions based on responses</p>
                    </div>
                    <Switch
                      checked={config.follow_up_questions}
                      onCheckedChange={(checked) => handleChange('follow_up_questions', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Interruption Simulation</Label>
                      <p className="text-sm text-muted-foreground">Simulate realistic interview interruptions</p>
                    </div>
                    <Switch
                      checked={config.interruption_simulation}
                      onCheckedChange={(checked) => handleChange('interruption_simulation', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Configuration</CardTitle>
                <CardDescription>Configure how feedback will be provided</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="feedback_depth">Feedback Depth</Label>
                  <Select
                    value={config.feedback_depth}
                    onValueChange={(value) => handleChange('feedback_depth', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select feedback depth" />
                    </SelectTrigger>
                    <SelectContent>
                      {FEEDBACK_DEPTH_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Feedback Focus Areas</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {FEEDBACK_AREAS.map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox
                          id={`area-${area}`}
                          checked={config.feedback_focus_areas.includes(area)}
                          onCheckedChange={() => toggleArrayItem('feedback_focus_areas', area)}
                        />
                        <Label htmlFor={`area-${area}`}>{area}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Real-time Feedback</Label>
                      <p className="text-sm text-muted-foreground">Provide feedback during the interview</p>
                    </div>
                    <Switch
                      checked={config.real_time_feedback}
                      onCheckedChange={(checked) => handleChange('real_time_feedback', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Knowledge Gap Analysis</Label>
                      <p className="text-sm text-muted-foreground">Analyze and identify knowledge gaps</p>
                    </div>
                    <Switch
                      checked={config.knowledge_gap_analysis}
                      onCheckedChange={(checked) => handleChange('knowledge_gap_analysis', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Improvement Tracking</Label>
                      <p className="text-sm text-muted-foreground">Track progress across multiple sessions</p>
                    </div>
                    <Switch
                      checked={config.improvement_tracking}
                      onCheckedChange={(checked) => handleChange('improvement_tracking', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Setup Tab */}
          <TabsContent value="technical">
            <Card>
              <CardHeader>
                <CardTitle>Technical Setup</CardTitle>
                <CardDescription>Configure technical aspects of the interview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interviewer_style">Interviewer Style</Label>
                    <Select
                      value={config.interviewer_style}
                      onValueChange={(value) => handleChange('interviewer_style', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select interviewer style" />
                      </SelectTrigger>
                      <SelectContent>
                        {INTERVIEWER_STYLES.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent_language">Accent/Language</Label>
                    <Select
                      value={config.accent_language}
                      onValueChange={(value) => handleChange('accent_language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select accent" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCENT_OPTIONS.map((accent) => (
                          <SelectItem key={accent} value={accent}>
                            {accent.charAt(0).toUpperCase() + accent.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Audio/Video</Label>
                      <p className="text-sm text-muted-foreground">Enable audio/video for the interview</p>
                    </div>
                    <Switch
                      checked={config.enable_audio_video}
                      onCheckedChange={(checked) => handleChange('enable_audio_video', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Record Session</Label>
                      <p className="text-sm text-muted-foreground">Record the interview session</p>
                    </div>
                    <Switch
                      checked={config.record_session}
                      onCheckedChange={(checked) => handleChange('record_session', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Transcription</Label>
                      <p className="text-sm text-muted-foreground">Generate interview transcripts</p>
                    </div>
                    <Switch
                      checked={config.enable_transcription}
                      onCheckedChange={(checked) => handleChange('enable_transcription', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Start Immediately</Label>
                      <p className="text-sm text-muted-foreground">Start interview right after creation</p>
                    </div>
                    <Switch
                      checked={config.start_immediately}
                      onCheckedChange={(checked) => handleChange('start_immediately', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public Template</Label>
                      <p className="text-sm text-muted-foreground">Make this template available to others</p>
                    </div>
                    <Switch
                      checked={config.is_public}
                      onCheckedChange={(checked) => handleChange('is_public', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const tabs = ["basic", "questions", "feedback", "technical"]
              const currentIndex = tabs.indexOf(activeTab)
              if (currentIndex > 0) {
                setActiveTab(tabs[currentIndex - 1])
              }
            }}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {activeTab === "technical" ? (
            <div className="space-x-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Create Template
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={() => {
                const tabs = ["basic", "questions", "feedback", "technical"]
                const currentIndex = tabs.indexOf(activeTab)
                if (currentIndex < tabs.length - 1) {
                  setActiveTab(tabs[currentIndex + 1])
                }
              }}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Debug information */}
      <div className="mt-4 text-sm text-muted-foreground">
        <p>Current Tab: {activeTab}</p>
        {error && (
          <p className="text-destructive">Error: {error}</p>
        )}
      </div>
    </div>
  )
}

