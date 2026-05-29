import { getQuiz } from '@/data/quizzes/index'
import { notFound } from 'next/navigation'
import QuizRunner from '@/components/quiz/QuizRunner'
import Link from 'next/link'

export default async function QuizPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const quiz = getQuiz(id)
    if (!quiz) notFound()

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                >
                    ← Back to Dashboard
                </Link>

                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            {quiz.track} · {quiz.part}
                        </span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-0.5">{quiz.title}</h1>
                    <p className="text-sm text-gray-500 mb-3">{quiz.subtitle}</p>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{quiz.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                        <span>❓ {quiz.questions.length} questions</span>
                        <span>⏱ ~{quiz.estimatedMinutes} min</span>
                        <span>🎯 Pass mark: {quiz.passMark}%</span>
                        {quiz.prerequisites && quiz.prerequisites.length > 0 && (
                            <span>🔓 Requires: {quiz.prerequisites.join(', ')}</span>
                        )}
                    </div>
                </div>

                <QuizRunner quiz={quiz} />
            </div>
        </div>
    )
}