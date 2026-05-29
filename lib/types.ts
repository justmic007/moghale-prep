export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type QuestionType = 'mcq' | 'truefalse' | 'code'

export interface Answer {
    id: string        // 'a' | 'b' | 'c' | 'd'
    text: string
    isCorrect: boolean
}

export interface Question {
    id: string
    number: number
    type: QuestionType
    difficulty: Difficulty
    topic: string
    question: string
    code?: string            // optional code snippet
    answers: Answer[]
    explanation: string      // why the correct answer is right
    wrongAnswerExplanations?: Record<string, string>  // why each wrong answer is wrong
    tradeoff?: string        // real-world tradeoff note
    codeReference?: string   // e.g. "autoresearch-backend/app/agents/planner.py"
}

export interface Quiz {
    id: string               // e.g. 'python-1a'
    title: string
    subtitle: string
    description: string
    track: Track
    part: '1a' | '1b' | '2a' | '2b' | '3a' | '3b' | '4a' | '4b' | '5a' | '5b'
    projectId?: string       // links quiz to a project
    questions: Question[]
    passMark: number         // percentage e.g. 70
    prerequisites?: string[] // quiz IDs that must be passed first
    estimatedMinutes: number
}

export type Track = 'python' | 'ai-ml' | 'codebase' | 'production'

export interface Project {
    id: string
    name: string
    description: string
    stack: string[]
    githubUrl: string
    liveUrl?: string
    quizIds: string[]
    color: string    // tailwind color class e.g. 'from-violet-500'
}

export interface QuizProgress {
    quizId: string
    started: boolean
    completed: boolean
    score: number          // number correct
    total: number
    percentage: number
    passed: boolean
    lastAttempt: string    // ISO date string
    answers: Record<string, string>  // questionId → answerId chosen
}

export interface AppProgress {
    quizzes: Record<string, QuizProgress>
}

export type TrackInfo = {
    id: Track
    label: string
    description: string
    color: string
}

export const TRACKS: TrackInfo[] = [
    {
        id: 'python',
        label: 'Python Track',
        description: 'Foundations to advanced Python patterns',
        color: 'from-blue-500 to-blue-700',
    },
    {
        id: 'codebase',
        label: 'Codebase Track',
        description: 'How AutoResearch is wired together',
        color: 'from-violet-500 to-purple-700',
    },
    {
        id: 'ai-ml',
        label: 'AI/ML Track',
        description: 'LLMs, embeddings, RAG and agents',
        color: 'from-emerald-500 to-green-700',
    },
    {
        id: 'production',
        label: 'Production Track',
        description: 'Deployment, scaling and system design',
        color: 'from-orange-500 to-red-600',
    },
]