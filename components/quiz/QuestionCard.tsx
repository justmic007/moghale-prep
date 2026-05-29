'use client'

import type { Question, Answer } from '@/lib/types'
import DifficultyBadge from '@/components/shared/DifficultyBadge'
import CodeBlock from '@/components/shared/CodeBlock'

interface Props {
    question: Question
    selectedAnswer: string | null
    onSelect: (answerId: string) => void
    submitted: boolean
}

export default function QuestionCard({
    question,
    selectedAnswer,
    onSelect,
    submitted,
}: Props) {
    function getAnswerClass(answer: Answer): string {
        const base = 'w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm'

        if (!submitted) {
            if (selectedAnswer === answer.id) {
                return `${base} border-indigo-500 bg-indigo-50 text-indigo-900`
            }
            return `${base} border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50`
        }

        // After submission
        if (answer.isCorrect) {
            return `${base} border-green-500 bg-green-50 text-green-900`
        }
        if (selectedAnswer === answer.id && !answer.isCorrect) {
            return `${base} border-red-400 bg-red-50 text-red-900`
        }
        return `${base} border-gray-100 bg-gray-50 text-gray-400`
    }

    function getAnswerIcon(answer: Answer): string {
        if (!submitted) return ''
        if (answer.isCorrect) return '✓ '
        if (selectedAnswer === answer.id && !answer.isCorrect) return '✗ '
        return ''
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            {/* Meta */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <DifficultyBadge difficulty={question.difficulty} />
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {question.topic}
                </span>
                {question.type === 'code' && (
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        Code
                    </span>
                )}
            </div>

            {/* Question */}
            <p className="text-gray-900 font-medium mb-4 leading-relaxed">
                {question.question}
            </p>

            {/* Code snippet */}
            {question.code && <CodeBlock code={question.code} />}

            {/* Answers */}
            <div className="space-y-2 mt-5">
                {question.answers.map(answer => (
                    <button
                        key={answer.id}
                        onClick={() => !submitted && onSelect(answer.id)}
                        disabled={submitted}
                        className={getAnswerClass(answer)}
                    >
                        <span className="font-mono text-xs mr-2 uppercase text-gray-400">
                            {answer.id})
                        </span>
                        <span className="font-medium text-xs text-gray-500 mr-1">
                            {getAnswerIcon(answer)}
                        </span>
                        {answer.text}
                    </button>
                ))}
            </div>
        </div>
    )
}