'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Quiz, QuizProgress } from '@/lib/types'
import { saveQuizProgress, getQuizProgress, resetQuizProgress } from '@/lib/progress'
import QuestionCard from './QuestionCard'
import ExplanationPanel from './ExplanationPanel'
import ProgressBar from '@/components/shared/ProgressBar'

const DRAFT_KEY = (quizId: string) => `moghale_draft_${quizId}`

interface DraftState {
    currentIdx: number
    answers: Record<string, string>
    submitted: Record<string, boolean>
}

export default function QuizRunner({ quiz }: { quiz: Quiz }) {
    const router = useRouter()
    const totalQ = quiz.questions.length

    const [currentIdx, setCurrentIdx] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [submitted, setSubmitted] = useState<Record<string, boolean>>({})
    const [selected, setSelected] = useState<string | null>(null)
    const [resumed, setResumed] = useState(false)

    const question = quiz.questions[currentIdx]
    const isFirst = currentIdx === 0
    const isLast = currentIdx === totalQ - 1
    const isSubmitted = submitted[question.id] ?? false
    const answeredCount = Object.keys(answers).length
    const skippedCount = totalQ - answeredCount

    // ── Restore draft on mount ──────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return
        const raw = localStorage.getItem(DRAFT_KEY(quiz.id))
        if (!raw) return
        try {
            const draft: DraftState = JSON.parse(raw)
            setCurrentIdx(draft.currentIdx)
            setAnswers(draft.answers)
            setSubmitted(draft.submitted)
            setSelected(draft.answers[quiz.questions[draft.currentIdx]?.id] ?? null)
            setResumed(true)
        } catch {
            localStorage.removeItem(DRAFT_KEY(quiz.id))
        }
    }, [quiz.id, quiz.questions])

    // ── Save draft on every change ──────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return
        const draft: DraftState = { currentIdx, answers, submitted }
        localStorage.setItem(DRAFT_KEY(quiz.id), JSON.stringify(draft))
    }, [currentIdx, answers, submitted, quiz.id])

    function handleSelect(answerId: string) {
        if (isSubmitted) return
        setSelected(answerId)
    }

    function handleSubmit() {
        if (!selected) return
        setSubmitted(prev => ({ ...prev, [question.id]: true }))
        setAnswers(prev => ({ ...prev, [question.id]: selected }))
    }

    function handleSkip() {
        if (isSubmitted) return
        // Move to next without recording an answer
        if (!isLast) {
            goToIndex(currentIdx + 1)
        } else {
            // On last question, skip = finish with current answers
            finishQuiz(answers)
        }
    }

    function handleNext() {
        if (isLast) {
            finishQuiz(answers)
        } else {
            goToIndex(currentIdx + 1)
        }
    }

    function handlePrev() {
        if (!isFirst) goToIndex(currentIdx - 1)
    }

    function goToIndex(idx: number) {
        setCurrentIdx(idx)
        const targetQuestion = quiz.questions[idx]
        setSelected(answers[targetQuestion.id] ?? null)
    }

    function finishQuiz(finalAnswers: Record<string, string>) {
        const score = quiz.questions.filter(q => {
            const correct = q.answers.find(a => a.isCorrect)?.id
            return finalAnswers[q.id] === correct
        }).length

        const percentage = Math.round((score / totalQ) * 100)
        const passed = percentage >= quiz.passMark

        const qp: QuizProgress = {
            quizId: quiz.id,
            started: true,
            completed: true,
            score,
            total: totalQ,
            percentage,
            passed,
            lastAttempt: new Date().toISOString(),
            answers: finalAnswers,
        }

        saveQuizProgress(qp)

        // Clear draft
        localStorage.removeItem(DRAFT_KEY(quiz.id))

        router.push(`/quiz/${quiz.id}/results`)
    }

    function handleStartFresh() {
        localStorage.removeItem(DRAFT_KEY(quiz.id))
        resetQuizProgress(quiz.id)
        setCurrentIdx(0)
        setAnswers({})
        setSubmitted({})
        setSelected(null)
        setResumed(false)
    }

    return (
        <div className="max-w-2xl mx-auto">

            {/* Resume banner */}
            {resumed && (
                <div className="mb-4 flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 text-sm">
                    <span className="text-indigo-800">
                        ↩ Resuming from question {currentIdx + 1}
                    </span>
                    <button
                        onClick={handleStartFresh}
                        className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                        Start fresh
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="mb-5">
                <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{quiz.title}</span>
                    <span>{currentIdx + 1} / {totalQ}</span>
                </div>
                <ProgressBar
                    current={answeredCount}
                    total={totalQ}
                />
                {skippedCount > 0 && answeredCount > 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                        {skippedCount} question{skippedCount !== 1 ? 's' : ''} skipped
                    </p>
                )}
            </div>

            {/* Question */}
            <div className="mb-4">
                <QuestionCard
                    question={question}
                    selectedAnswer={selected}
                    onSelect={handleSelect}
                    submitted={isSubmitted}
                />
            </div>

            {/* Explanation */}
            {isSubmitted && selected && (
                <div className="mb-5">
                    <ExplanationPanel
                        question={question}
                        selectedAnswerId={selected}
                    />
                </div>
            )}

            {/* Navigation controls */}
            <div className="flex gap-2">
                {/* Previous */}
                <button
                    onClick={handlePrev}
                    disabled={isFirst}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${isFirst
                            ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    ← Prev
                </button>

                {/* Submit / Next / Finish */}
                {!isSubmitted ? (
                    <>
                        <button
                            onClick={handleSubmit}
                            disabled={!selected}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors ${selected
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Submit Answer
                        </button>
                        <button
                            onClick={handleSkip}
                            className="px-4 py-3 rounded-lg border border-gray-300 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Skip
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleNext}
                        className="flex-1 py-3 px-4 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
                    >
                        {isLast ? 'See Results →' : 'Next →'}
                    </button>
                )}
            </div>

            {/* Question dots navigator */}
            <div className="flex flex-wrap gap-1.5 mt-5 justify-center">
                {quiz.questions.map((q, i) => {
                    const isAnswered = answers[q.id] !== undefined
                    const isCurrent = i === currentIdx
                    const correct = q.answers.find(a => a.isCorrect)?.id
                    const isCorrect = answers[q.id] === correct

                    return (
                        <button
                            key={q.id}
                            onClick={() => goToIndex(i)}
                            title={`Question ${i + 1}`}
                            className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${isCurrent
                                    ? 'ring-2 ring-indigo-500 ring-offset-1 bg-indigo-600 text-white'
                                    : isAnswered
                                        ? isCorrect
                                            ? 'bg-green-500 text-white'
                                            : 'bg-red-400 text-white'
                                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                }`}
                        >
                            {i + 1}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}