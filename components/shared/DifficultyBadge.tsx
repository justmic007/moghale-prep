import type { Difficulty } from '@/lib/types'

const CONFIG: Record<Difficulty, { label: string; classes: string }> = {
    beginner: { label: 'Beginner', classes: 'bg-green-100 text-green-800 border-green-200' },
    intermediate: { label: 'Intermediate', classes: 'bg-blue-100 text-blue-800 border-blue-200' },
    advanced: { label: 'Advanced', classes: 'bg-orange-100 text-orange-800 border-orange-200' },
    expert: { label: 'Expert', classes: 'bg-red-100 text-red-800 border-red-200' },
}

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
    const { label, classes } = CONFIG[difficulty]
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${classes}`}>
            {label}
        </span>
    )
}