'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { getQuiz } from '@/data/quizzes/index'
import { getQuizProgress, resetQuizProgress } from '@/lib/progress'
import type { QuizProgress } from '@/lib/types'
import Link from 'next/link'
import ProgressBar from '@/components/shared/ProgressBar'

export default function ResultsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()
    const quiz = getQuiz(id)
    const [progress, setProgress] = useState<QuizProgress | null>(null)

    useEffect(() => {
        if (!quiz) { router.replace('/'); return }
        const p = getQuizProgress(id)
        if (!p || !p.completed) { router.replace(`/quiz/${id}`); return }
        setProgress(p)
    }, [id, quiz, router])

    if (!quiz || !progress) return null

    const byDifficulty = quiz.questions.reduce(
        (acc, q) => {
            const key = q.difficulty
            const chosen = progress.answers[q.id]
            const correct = q.answers.find(a => a.isCorrect)?.id
            if (!acc[key]) acc[key] = { correct: 0, total: 0 }
            acc[key].total++
            if (chosen === correct) acc[key].correct++
            return acc
        },
        {} as Record<string, { correct: number; total: number }>
    )

    function handleRetake() {
        resetQuizProgress(id)
        router.push(`/quiz/${id}`)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-xl mx-auto px-4 py-10">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                >
                    ← Dashboard
                </Link>

                <div className={`rounded-2xl p-8 text-center mb-6 ${progress.passed
                        ? 'bg-gradient-to-br from-green-400 to-emerald-600'
                        : 'bg-gradient-to-br from-red-400 to-rose-600'
                    } text-white`}>
                    <div className="text-6xl mb-3">{progress.passed ? '🎉' : '📚'}</div>
                    <h1 className="text-2xl font-bold mb-1">
                        {progress.passed ? 'Quiz Passed!' : 'Keep Practising'}
                    </h1>
                    <p className="text-white/80 text-sm mb-4">
                        {quiz.title} — {quiz.subtitle}
                    </p>
                    <div className="text-5xl font-bold mb-1">{progress.percentage}%</div>
                    <p className="text-white/80 text-sm">
                        {progress.score} / {progress.total} correct · Pass mark: {quiz.passMark}%
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-4">Score by difficulty</h2>
                    {Object.entries(byDifficulty).map(([diff, stats]) => (
                        <div key={diff} className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="capitalize text-gray-600">{diff}</span>
                                <span className="font-medium text-gray-900">{stats.correct} / {stats.total}</span>
                            </div>
                            <ProgressBar current={stats.correct} total={stats.total} />
                        </div>
                    ))}
                </div>

                {progress.passed ? (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
                        <p className="text-sm text-indigo-800 font-medium mb-1">✓ Next quiz unlocked</p>
                        <p className="text-xs text-indigo-600">
                            Your progress is saved. Return to the dashboard to continue with the next quiz.
                        </p>
                    </div>
                ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                        <p className="text-sm text-amber-800 font-medium mb-1">
                            Score below {quiz.passMark}% — not passed yet
                        </p>
                        <p className="text-xs text-amber-600">
                            Review the explanations and retake when ready.
                        </p>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={handleRetake}
                        className="flex-1 py-3 px-4 rounded-lg border-2 border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 transition-colors text-sm"
                    >
                        Retake Quiz
                    </button>
                    <Link
                        href="/"
                        className="flex-1 py-3 px-4 rounded-lg bg-indigo-600 text-white font-medium text-center hover:bg-indigo-700 transition-colors text-sm"
                    >
                        Dashboard →
                    </Link>
                </div>
            </div>
        </div>
    )
}