import type { Quiz, QuizProgress } from '@/lib/types'
import Link from 'next/link'
import ProgressBar from '@/components/shared/ProgressBar'

interface Props {
    quiz: Quiz
    progress: QuizProgress
    onRetake: () => void
}

export default function ScoreCard({ quiz, progress, onRetake }: Props) {
    const byDifficulty = quiz.questions.reduce(
        (acc, q, i) => {
            const key = q.difficulty
            const correct = progress.answers[q.id] === q.answers.find(a => a.isCorrect)?.id
            if (!acc[key]) acc[key] = { correct: 0, total: 0 }
            acc[key].total++
            if (correct) acc[key].correct++
            return acc
        },
        {} as Record<string, { correct: number; total: number }>
    )

    return (
        <div className="max-w-xl mx-auto">
            {/* Result header */}
            <div className={`rounded-2xl p-8 text-center mb-6 ${progress.passed
                    ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white'
                    : 'bg-gradient-to-br from-red-400 to-rose-600 text-white'
                }`}>
                <div className="text-6xl mb-3">{progress.passed ? '🎉' : '📚'}</div>
                <h2 className="text-2xl font-bold mb-1">
                    {progress.passed ? 'Quiz Passed!' : 'Keep Practising'}
                </h2>
                <p className="text-white/80 text-sm mb-4">{quiz.title} — {quiz.subtitle}</p>
                <div className="text-5xl font-bold mb-1">{progress.percentage}%</div>
                <p className="text-white/80 text-sm">
                    {progress.score} / {progress.total} correct · Pass mark: {quiz.passMark}%
                </p>
            </div>

            {/* Breakdown by difficulty */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
                <h3 className="font-semibold text-gray-900 mb-4">Score by difficulty</h3>
                {Object.entries(byDifficulty).map(([diff, stats]) => (
                    <div key={diff} className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize text-gray-600">{diff}</span>
                            <span className="font-medium text-gray-900">
                                {stats.correct}/{stats.total}
                            </span>
                        </div>
                        <ProgressBar current={stats.correct} total={stats.total} />
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={onRetake}
                    className="flex-1 py-3 px-4 rounded-lg border-2 border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
                >
                    Retake Quiz
                </button>
                <Link
                    href="/"
                    className="flex-1 py-3 px-4 rounded-lg bg-indigo-600 text-white font-medium text-center hover:bg-indigo-700 transition-colors"
                >
                    Back to Dashboard
                </Link>
            </div>

            {/* Next quiz hint */}
            {progress.passed && (
                <p className="text-center text-sm text-gray-500 mt-4">
                    ✓ This quiz is now marked as passed — the next quiz in the track is unlocked.
                </p>
            )}
        </div>
    )
}