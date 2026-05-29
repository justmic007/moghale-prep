'use client'

import Link from 'next/link'
import type { Quiz } from '@/lib/types'
import { getQuizProgress, isQuizUnlocked } from '@/lib/progress'
import DifficultyBadge from '@/components/shared/DifficultyBadge'

const TRACK_COLORS: Record<string, string> = {
    python: 'border-blue-200 hover:border-blue-400',
    codebase: 'border-violet-200 hover:border-violet-400',
    'ai-ml': 'border-emerald-200 hover:border-emerald-400',
    production: 'border-orange-200 hover:border-orange-400',
}

const TRACK_BADGE: Record<string, string> = {
    python: 'bg-blue-50 text-blue-700',
    codebase: 'bg-violet-50 text-violet-700',
    'ai-ml': 'bg-emerald-50 text-emerald-700',
    production: 'bg-orange-50 text-orange-700',
}

export default function QuizCard({ quiz }: { quiz: Quiz }) {
    const progress = getQuizProgress(quiz.id)
    const unlocked = isQuizUnlocked(quiz.id, quiz.prerequisites ?? [])
    const pct = progress ? progress.percentage : 0
    const completed = progress?.completed ?? false
    const passed = progress?.passed ?? false

    const borderClass = TRACK_COLORS[quiz.track] ?? 'border-gray-200 hover:border-gray-400'

    return (
        <div className={`
      relative rounded-xl border-2 bg-white transition-all duration-200
      ${unlocked ? `${borderClass} shadow-sm hover:shadow-md` : 'border-gray-100 opacity-60'}
    `}>
            {/* Lock overlay */}
            {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 z-10">
                    <div className="text-center">
                        <span className="text-3xl">🔒</span>
                        <p className="text-xs text-gray-500 mt-1">
                            Complete prerequisites first
                        </p>
                    </div>
                </div>
            )}

            <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TRACK_BADGE[quiz.track]}`}>
                            {quiz.track.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">{quiz.part.toUpperCase()}</span>
                    </div>
                    {completed && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {passed ? '✓ Passed' : '✗ Failed'}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 mb-1">{quiz.title}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{quiz.subtitle}</p>

                {/* Stats row */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span>❓ {quiz.questions.length} questions</span>
                    <span>⏱ ~{quiz.estimatedMinutes} min</span>
                    <span>🎯 Pass: {quiz.passMark}%</span>
                </div>

                {/* Progress bar */}
                {completed && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Score</span>
                            <span className="font-medium">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${passed ? 'bg-green-500' : 'bg-red-400'
                                    }`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* CTA button */}
                {unlocked ? (
                    <Link
                        href={`/quiz/${quiz.id}`}
                        className="block w-full text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        {completed ? 'Retake' : 'Start Quiz →'}
                    </Link>
                ) : (
                    <button
                        disabled
                        className="block w-full text-center py-2 px-4 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                    >
                        Locked
                    </button>
                )}
            </div>
        </div>
    )
}