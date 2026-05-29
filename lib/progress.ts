import type { AppProgress, QuizProgress } from './types'

const STORAGE_KEY = 'moghale_prep_progress'

export function getProgress(): AppProgress {
    if (typeof window === 'undefined') return { quizzes: {} }
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : { quizzes: {} }
    } catch {
        return { quizzes: {} }
    }
}

export function saveProgress(progress: AppProgress): void {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
        console.error('[progress] Failed to save to localStorage')
    }
}

export function getQuizProgress(quizId: string): QuizProgress | null {
    const progress = getProgress()
    return progress.quizzes[quizId] ?? null
}

export function saveQuizProgress(quizProgress: QuizProgress): void {
    const progress = getProgress()
    progress.quizzes[quizProgress.quizId] = quizProgress
    saveProgress(progress)
}

export function resetQuizProgress(quizId: string): void {
    const progress = getProgress()
    delete progress.quizzes[quizId]
    saveProgress(progress)
}

export function resetAllProgress(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
}

export function isQuizUnlocked(quizId: string, prerequisites: string[]): boolean {
    if (!prerequisites || prerequisites.length === 0) return true
    const progress = getProgress()
    return prerequisites.every(prereqId => {
        const p = progress.quizzes[prereqId]
        return p?.passed === true
    })
}

export function getOverallStats(): {
    totalCompleted: number
    totalPassed: number
    averageScore: number
} {
    const progress = getProgress()
    const quizzes = Object.values(progress.quizzes)
    const completed = quizzes.filter(q => q.completed)
    const passed = quizzes.filter(q => q.passed)
    const avgScore = completed.length > 0
        ? completed.reduce((sum, q) => sum + q.percentage, 0) / completed.length
        : 0

    return {
        totalCompleted: completed.length,
        totalPassed: passed.length,
        averageScore: Math.round(avgScore),
    }
}