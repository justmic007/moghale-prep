import python1a from './autoresearch-agent/python-1a'
import python1b from './autoresearch-agent/python-1b'
import python2a from './autoresearch-agent/python-2a'
import python2b from './autoresearch-agent/python-2b'
import autoresearch3a from './autoresearch-agent/codebase-3a'
import autoresearch3b from './autoresearch-agent/codebase-3b'
import aiml4a from './autoresearch-agent/ai-ml-4a'
import aiml4b from './autoresearch-agent/ai-ml-4b'
import production5a from './autoresearch-agent/production-5a'
import production5b from './autoresearch-agent/production-5b'

import type { Quiz } from '@/lib/types'

export const allQuizzes: Quiz[] = [
    python1a,
    python1b,
    python2a,
    python2b,
    autoresearch3a,
    autoresearch3b,
    aiml4a,
    aiml4b,
    production5a,
    production5b,
]

export function getQuiz(id: string): Quiz | undefined {
    return allQuizzes.find(q => q.id === id)
}

export function getQuizzesByTrack(track: string): Quiz[] {
    return allQuizzes.filter(q => q.track === track)
}

export function getQuizzesByProject(projectId: string): Quiz[] {
    return allQuizzes.filter(q => q.projectId === projectId)
}