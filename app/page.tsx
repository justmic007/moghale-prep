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

  useEffect(() => {
    setStats(getOverallStats())
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="max-w-xl w-full">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Learn by doing
              </h1>
              <p className="text-gray-500 leading-relaxed">
                Every question is grounded in real production code. Understand
                not just what — but why. Built to prepare you for Senior
                Software Engineer and AI Engineer interviews.
              </p>
            </div>

            {/* Stats — only shown after at least one quiz completed */}
            {stats.totalCompleted > 0 && (
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600">
                    {stats.totalCompleted}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {stats.totalPassed}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Passed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-700">
                    {stats.averageScore}%
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Avg Score</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">

        {/* Projects section */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Projects</h2>
            <span className="text-sm text-gray-400">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* Progress prompt or stats */}
        <div className="border-t border-gray-200 mb-10 pt-10">
          {stats.totalCompleted === 0 ? (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-8 flex items-center gap-4">
              <span className="text-3xl">👋</span>
              <div>
                <p className="font-semibold text-indigo-900 text-sm">Start with Python Foundations 1a</p>
                <p className="text-indigo-700 text-xs mt-0.5">
                  Quizzes unlock progressively. Complete each one to advance to the next track.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-8 mb-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600">{stats.totalCompleted}</p>
                <p className="text-xs text-gray-500 mt-0.5">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{stats.totalPassed}</p>
                <p className="text-xs text-gray-500 mt-0.5">Passed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-700">{stats.averageScore}%</p>
                <p className="text-xs text-gray-500 mt-0.5">Avg Score</p>
              </div>
            </div>
          )}
        </div>

        {/* Quiz tracks */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">All Quizzes</h2>
            <span className="text-sm text-gray-400">
              {allQuizzes.length} quizzes · {allQuizzes.length * 20} questions
            </span>
          </div>

          {TRACKS.map((track: TrackInfo) => {
            const trackQuizzes = allQuizzes.filter(q => q.track === track.id)
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