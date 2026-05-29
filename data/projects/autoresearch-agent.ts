import type { Project } from '@/lib/types'

const autoresearchAgent: Project = {
    id: 'autoresearch',
    name: 'AutoResearch Agent',
    description:
        'A production-grade multi-agent research system. A user query triggers a 5-agent pipeline — Planner, Search, RAG, Writer, Critic — that produces a structured research report with quality scoring, streaming output, and job persistence.',
    stack: [
        'Python', 'FastAPI', 'LangGraph', 'Claude Sonnet',
        'Gemini', 'Groq', 'Tavily', 'ChromaDB', 'Redis',
        'Next.js 15', 'TypeScript', 'Vercel', 'Render',
    ],
    githubUrl: 'https://github.com/justmic007/autoresearch-agent',
    liveUrl: 'https://autoresearch-agent-tt56.onrender.com',
    quizIds: [
        'python-1a', 'python-1b',
        'python-2a', 'python-2b',
        'autoresearch-3a', 'autoresearch-3b',
        'ai-ml-4a', 'ai-ml-4b',
        'production-5a', 'production-5b',
    ],
    color: 'from-violet-500 to-purple-600',
}

export default autoresearchAgent