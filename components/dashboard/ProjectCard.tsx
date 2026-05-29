import type { Project } from '@/lib/types'

const PROJECT_EMOJI: Record<string, string> = {
    autoresearch: '🤖',
    'receipt-assistant': '🧾',
    'retail-platform': '🛍️',
}

export default function ProjectCard({
    project,
    active = false,
    onClick,
}: {
    project: Project
    active?: boolean
    onClick?: () => void
}) {
    const emoji = PROJECT_EMOJI[project.id] ?? '📦'

    return (
        <div
            onClick={onClick}
            className={`
        rounded-xl border-2 bg-white transition-all duration-200 cursor-pointer
        ${active
                    ? 'border-indigo-500 shadow-lg shadow-indigo-100'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
      `}
        >
            <div className={`h-1.5 bg-gradient-to-r ${project.color} rounded-t-xl`} />

            <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{emoji}</span>
                    <div>
                        <h2 className="font-bold text-gray-900 text-base leading-tight">
                            {project.name}
                        </h2>
                        {active && (
                            <span className="inline-block mt-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                                Viewing quizzes ↓
                            </span>
                        )}
                    </div>
                </div>

                <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2">
                    {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.stack.slice(0, 6).map(tech => (
                        <span key={tech} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {tech}
                        </span>
                    ))}
                    {project.stack.length > 6 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-400 rounded-full">
                            +{project.stack.length - 6} more
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span>📚 {project.quizIds.length} quizzes</span>
                    <span>🎯 {project.quizIds.length * 20} questions</span>
                </div>

                <div className="flex gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                    <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        GitHub
                    </a>
                    {project.liveUrl && (
                        <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Live App
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}
