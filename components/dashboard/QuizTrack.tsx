import type { Quiz, TrackInfo } from '@/lib/types'
import QuizCard from './QuizCard'

const TRACK_EMOJI: Record<string, string> = {
    python: '🐍',
    codebase: '🏗️',
    'ai-ml': '🤖',
    production: '🚀',
}

export default function QuizTrack({
    track,
    quizzes,
}: {
    track: TrackInfo
    quizzes: Quiz[]
}) {
    if (quizzes.length === 0) return null

    return (
        <section className="mb-6 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            {/* Track header */}
            <div className="flex items-center gap-3 mb-5">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-xl`}
                    style={{ background: 'rgba(0,0,0,0.04)' }}>
                    {TRACK_EMOJI[track.id] ?? '📚'}
                </div>
                <div>
                    <h2 className="text-base font-bold text-gray-900">{track.label}</h2>
                    <p className="text-xs text-gray-500">{track.description}</p>
                </div>
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}
                </span>
            </div>

            {/* Quiz cards */}
            <div className={`grid gap-4 ${quizzes.length <= 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : quizzes.length === 4
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}>
                {quizzes.map(quiz => (
                    <QuizCard key={quiz.id} quiz={quiz} />
                ))}
            </div>
        </section>
    )
}