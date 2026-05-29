'use client'

import { useEffect, useState } from 'react'
import { allQuizzes } from '@/data/quizzes/index'
import { projects } from '@/data/projects/index'
import { TRACKS, type TrackInfo } from '@/lib/types'
import { getOverallStats } from '@/lib/progress'
import ProjectCard from '@/components/dashboard/ProjectCard'
import QuizTrack from '@/components/dashboard/QuizTrack'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalPassed: 0,
    averageScore: 0,
  })
  const [activeProject, setActiveProject] = useState<string | null>(null)

  useEffect(() => {
    setStats(getOverallStats())
  }, [])

  const selectedProject = projects.find(p => p.id === activeProject)

  const filteredQuizzes = activeProject
    ? allQuizzes.filter(q => q.projectId === activeProject ||
      selectedProject?.quizIds.includes(q.id))
    : allQuizzes

  const totalMinutes = allQuizzes.reduce((sum, q) => sum + q.estimatedMinutes, 0)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="max-w-2xl">
            <p className="text-indigo-600 font-semibold text-sm mb-2 tracking-wide uppercase">
              Interview Preparation
            </p>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
              Learn by doing
            </h1>
            <p className="text-gray-500 leading-relaxed text-base max-w-lg">
              Questions grounded in real production code — not just <em>what</em> but <em>why</em>.
              Prepare for Senior Software Engineer and AI Engineer interviews.
            </p>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-lg">📚</span>
                <span><strong className="text-gray-800">{allQuizzes.length}</strong> quizzes</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-lg">🎯</span>
                <span><strong className="text-gray-800">{allQuizzes.length * 20}</strong> questions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-lg">⏱</span>
                <span><strong className="text-gray-800">~{totalMinutes}</strong> min total</span>
              </div>
              {stats.totalCompleted > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-lg">✅</span>
                  <span>
                    <strong className="text-gray-800">{stats.totalPassed}</strong>/{stats.totalCompleted} passed
                    &nbsp;·&nbsp;
                    <strong className="text-indigo-600">{stats.averageScore}%</strong> avg
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">

        {/* Getting started prompt — only shown before first quiz */}
        {stats.totalCompleted === 0 && (
          <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-xl">👆</span>
            <p className="text-sm text-indigo-800">
              <strong>Start with Python Foundations 1a</strong> — quizzes unlock progressively as you complete each one.
            </p>
          </div>
        )}

        {/* Projects */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Projects</h2>
            {activeProject && (
              <button
                onClick={() => setActiveProject(null)}
                className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                ← Show all quizzes
              </button>
            )}
          </div>
          <div className={`grid gap-4 ${projects.length === 1
            ? 'grid-cols-1 max-w-sm'
            : projects.length === 2
              ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                active={activeProject === project.id}
                onClick={() =>
                  setActiveProject(
                    activeProject === project.id ? null : project.id
                  )
                }
              />
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-10" />

        {/* Quiz tracks */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              {activeProject
                ? `${selectedProject?.name} — Quizzes`
                : 'All Quizzes'}
            </h2>
            <span className="text-sm text-gray-400">
              {filteredQuizzes.length} quizzes · {filteredQuizzes.length * 20} questions
            </span>
          </div>

          {TRACKS.map((track: TrackInfo) => {
            const trackQuizzes = filteredQuizzes.filter(q => q.track === track.id)
            if (trackQuizzes.length === 0) return null
            return (
              <QuizTrack
                key={track.id}
                track={track}
                quizzes={trackQuizzes}
              />
            )
          })}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-gray-400">
          <span>MoghaleProp · Built from real production code</span>
          <a
            href="https://github.com/justmic007/autoresearch-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 transition-colors"
          >
            GitHub →
          </a>
        </div>
      </footer>
    </div>
  )
}
