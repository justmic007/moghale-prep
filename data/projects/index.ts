import autoresearchAgent from './autoresearch-agent'
// import receiptAssistant from './receipt-assistant'  ← add later
// import retailPlatform   from './retail-platform'    ← add later

import type { Project } from '@/lib/types'

export const projects: Project[] = [
    autoresearchAgent,
    // receiptAssistant,
    // retailPlatform,
]

export function getProject(id: string): Project | undefined {
    return projects.find(p => p.id === id)
}