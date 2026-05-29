import type { Quiz, TrackInfo } from '@/lib/types'
import QuizCard from './QuizCard'

export default function QuizTrack({
    track,
    quizzes,
}: {
    track: TrackInfo
    quizzes: Quiz[]
}) {
    if (quizzes.length === 0) return null

    return (
        <section className="mb-10 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
                <div className={`h-8 w-1 rounded-full bg-gradient-to-b ${track.color}`} />
                <div>
                    <h2 className="text-lg font-bold text-gray-900">{track.label}</h2>
                    <p className="text-sm text-gray-500">{track.description}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map(quiz => (
                    <QuizCard key={quiz.id} quiz={quiz} />
                ))}
            </div>
        </section>
    )
}