import type { Question } from '@/lib/types'

export default function ExplanationPanel({
    question,
    selectedAnswerId,
}: {
    question: Question
    selectedAnswerId: string
}) {
    const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId)
    const correctAnswer = question.answers.find(a => a.isCorrect)
    const isCorrect = selectedAnswer?.isCorrect ?? false

    return (
        <div className={`rounded-xl border-2 p-5 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
            }`}>
            {/* Result header */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
                <div>
                    <p className="font-bold text-gray-900">
                        {isCorrect ? 'Correct!' : 'Not quite'}
                    </p>
                    {!isCorrect && correctAnswer && (
                        <p className="text-sm text-gray-600">
                            Correct answer: <span className="font-medium">{correctAnswer.id.toUpperCase()}) {correctAnswer.text}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Main explanation */}
            <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    💡 Why
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">{question.explanation}</p>
            </div>

            {/* Wrong answer explanations */}
            {!isCorrect && question.wrongAnswerExplanations?.[selectedAnswerId] && (
                <div className="mb-4 p-3 bg-white/60 rounded-lg border border-red-200">
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
                        ⚠️ Why not {selectedAnswerId.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {question.wrongAnswerExplanations[selectedAnswerId]}
                    </p>
                </div>
            )}

            {/* Tradeoff */}
            {question.tradeoff && (
                <div className="mb-4 p-3 bg-white/60 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                        🔄 Tradeoff
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">{question.tradeoff}</p>
                </div>
            )}

            {/* Code reference */}
            {question.codeReference && (
                <div className="p-3 bg-white/60 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        📁 See in codebase
                    </p>
                    <code className="text-xs text-gray-600 font-mono">{question.codeReference}</code>
                </div>
            )}
        </div>
    )
}