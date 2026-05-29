import type { Quiz } from '@/lib/types'

const quiz: Quiz = {
    id: 'autoresearch-3b',
    title: 'AutoResearch Codebase',
    subtitle: 'Part 2 — Frontend, Deployment, Providers & Production',
    description:
        'Deep dive into the Next.js 15 frontend, SSE streaming, multi-provider fallbacks, Vercel/Render deployment, and the production decisions behind the AutoResearch system.',
    track: 'codebase',
    part: '3b',
    projectId: 'autoresearch',
    passMark: 70,
    estimatedMinutes: 25,
    prerequisites: ['autoresearch-3a'],
    questions: [
        {
            id: 'ar3b-q1',
            number: 1,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Frontend — Next.js App Router',
            question: 'Why does the AutoResearch frontend use "use client" at the top of page.tsx?',
            code: `'use client'

import { useState, useRef, useCallback } from 'react'
// ...

export default function Home() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  // ...
}`,
            answers: [
                { id: 'a', text: '"use client" is required for all Next.js pages', isCorrect: false },
                { id: 'b', text: '"use client" opts this component into client-side rendering — required because it uses useState, useRef, and browser APIs (localStorage, fetch) which cannot run on the server', isCorrect: true },
                { id: 'c', text: '"use client" disables server-side rendering for performance', isCorrect: false },
                { id: 'd', text: '"use client" is needed to import React hooks', isCorrect: false },
            ],
            explanation:
                'Next.js 13+ App Router defaults to Server Components (render on server, no JS sent to client). Server Components cannot use React hooks (useState, useEffect), browser APIs, or event handlers. "use client" marks the component as a Client Component — it runs in the browser with full access to React hooks and browser APIs like fetch and localStorage.',
            wrongAnswerExplanations: {
                a: 'Many Next.js pages are Server Components by default — "use client" is only needed when browser APIs are required.',
                c: '"use client" does not disable SSR — it enables client-side interactivity.',
                d: 'React hooks are available in client components — "use client" is what enables them in Next.js App Router.',
            },
            tradeoff:
                'Server Components: faster initial load, no JS bundle, cannot use hooks or browser APIs. Client Components: interactive, can use hooks/browser APIs, larger JS bundle. Best practice: keep as much as possible as Server Components, only use "use client" for interactive parts.',
            codeReference: 'autoresearch-frontend/app/page.tsx',
        },
        {
            id: 'ar3b-q2',
            number: 2,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'Frontend — SSE parser',
            question: 'Why does the SSE parser split on "\\n\\n" (double newline) instead of "\\n" (single newline)?',
            code: `// lib/api.ts
buffer += decoder.decode(value, { stream: true })

// Split on double newline — gets COMPLETE messages
const messages = buffer.split('\\n\\n')
buffer = messages.pop() || ''  // keep incomplete last message

for (const message of messages) {
  // parse event: and data: lines from complete message
}`,
            answers: [
                { id: 'a', text: 'Double newline is just a style preference', isCorrect: false },
                { id: 'b', text: 'The SSE spec uses \\n\\n to end each message. Splitting on \\n\\n gets complete messages — splitting on \\n would get individual lines and require reassembling across chunks', isCorrect: true },
                { id: 'c', text: 'Single \\n splits are too slow', isCorrect: false },
                { id: 'd', text: 'JSON data lines contain single \\n characters', isCorrect: false },
            ],
            explanation:
                'A single SSE message spans multiple lines: "event: agent_done\\ndata: {...}\\n\\n". Splitting on \\n gives individual lines out of order across network chunks. Splitting on \\n\\n gives complete messages regardless of how chunks arrive. The buffer pattern keeps the last incomplete message for the next chunk.',
            wrongAnswerExplanations: {
                a: 'It directly follows the SSE specification for message boundaries.',
                c: 'Performance is identical — this is about correctness.',
                d: 'The JSON data is on a single line (json.dumps produces compact JSON without newlines).',
            },
            tradeoff:
                'This was the key bug fix in the AutoResearch frontend — the original single-\\n parser failed when event: and data: arrived in different network chunks. The \\n\\n approach is robust regardless of chunk boundaries.',
            codeReference: 'autoresearch-frontend/lib/api.ts',
        },
        {
            id: 'ar3b-q3',
            number: 3,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Frontend — pipeline animation',
            question: 'How does the pipeline animation know when to light up each agent?',
            code: `// page.tsx
for await (const { event, data } of streamResearch(query)) {
  if (event === 'agent_done') {
    const d = data as AgentDoneEvent
    setAgentStatus(d.agent, 'done')     // ← light up completed agent

    const idx = AGENTS.indexOf(d.agent)
    if (idx < AGENTS.length - 1) {
      setAgentStatus(AGENTS[idx + 1], 'active')  // ← activate next agent
    }
  }
  if (event === 'complete') {
    setResult(data as ResearchResult)
    setLoading(false)
  }
}`,
            answers: [
                { id: 'a', text: 'A timer fires every 5 seconds to advance the animation', isCorrect: false },
                { id: 'b', text: 'Each agent_done SSE event from the backend triggers the UI update — the animation is driven by actual agent completion times, not a timer', isCorrect: true },
                { id: 'c', text: 'The frontend polls the backend every second for agent status', isCorrect: false },
                { id: 'd', text: 'All agents light up simultaneously when the query is submitted', isCorrect: false },
            ],
            explanation:
                'The backend yields an agent_done event after each agent completes. The frontend receives it via SSE and immediately calls setAgentStatus(d.agent, "done") — turning that agent dark. It then activates the NEXT agent. This creates authentic real-time animation driven by actual processing times — not fake progress.',
            wrongAnswerExplanations: {
                a: 'Timer-based animations are fake — the actual pipeline timing drives the UI here.',
                c: 'SSE is server-push — no polling needed.',
                d: 'Each agent lights up only when the previous one reports done.',
            },
            tradeoff:
                'Real-time SSE-driven animation: authentic, shows actual progress, requires streaming backend. Timer-based animation: simpler, works with any backend, misleading if actual timing differs. The real-time approach is more technically impressive and more honest to the user.',
            codeReference: 'autoresearch-frontend/app/page.tsx',
        },
        {
            id: 'ar3b-q4',
            number: 4,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Frontend — Tailwind CSS production bug',
            question: 'Why were dynamic Tailwind classes causing the Writer pipeline card to show the wrong colour in production?',
            code: `// BROKEN in production — dynamic class not in Tailwind's build:
className={\`\${status === 'active' ? 'bg-[#ede8dc]' : ''}\`}

// FIXED — inline style always works:
style={status === 'active' ? { background: '#ede8dc' } : {}}`,
            answers: [
                { id: 'a', text: 'Inline styles are always preferred over Tailwind classes', isCorrect: false },
                { id: 'b', text: 'Tailwind\'s build scans source files for class names. Dynamically constructed class strings are not detected — Tailwind purges them from the production CSS bundle', isCorrect: true },
                { id: 'c', text: 'bg-[#ede8dc] is not a valid Tailwind class', isCorrect: false },
                { id: 'd', text: 'The bug only appears in Safari', isCorrect: false },
            ],
            explanation:
                'Tailwind uses static analysis at build time to find all used class names. A dynamically constructed string like `bg-[${color}]` is not recognised as a class name — Tailwind cannot know what value the variable will have at runtime. The class is purged from the CSS bundle. Using inline styles bypasses Tailwind entirely — they are processed by the browser directly.',
            wrongAnswerExplanations: {
                a: 'Tailwind classes are preferred for consistency — inline styles are the fallback for dynamic values.',
                c: 'bg-[#ede8dc] is a valid Tailwind arbitrary value class — the issue is dynamic construction, not the class itself.',
                d: 'This bug affects all browsers since it is a build-time issue.',
            },
            tradeoff:
                'Tailwind classes: tree-shaken, consistent, smaller CSS. Inline styles: always work, can be dynamic, not tree-shaken, cannot use Tailwind variants (hover:, focus:, responsive). The fix is correct — use inline styles for values that depend on runtime state.',
            codeReference: 'autoresearch-frontend/app/page.tsx',
        },
        {
            id: 'ar3b-q5',
            number: 5,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'Frontend — localStorage history',
            question: 'How does the history page know which jobs belong to the current user without authentication?',
            code: `// page.tsx — save to localStorage after complete event
const historyItem = {
  thread_id: completeData.thread_id,
  query:     completeData.query,
  quality_score: completeData.quality_score?.total ?? 0,
  finished_at: Math.floor(Date.now() / 1000),
}
const existing = JSON.parse(
  localStorage.getItem('autoresearch_history') || '[]'
)
existing.unshift(historyItem)
localStorage.setItem(
  'autoresearch_history',
  JSON.stringify(existing.slice(0, 50))  // keep last 50
)`,
            answers: [
                { id: 'a', text: 'The backend tags jobs with the user\'s IP address', isCorrect: false },
                { id: 'b', text: 'localStorage is per-browser, per-origin — each user\'s browser stores only their own thread_ids. The backend still has all jobs in Redis but the frontend only shows locally stored ones', isCorrect: true },
                { id: 'c', text: 'Jobs are stored in a cookie shared across devices', isCorrect: false },
                { id: 'd', text: 'The backend generates a unique user ID on first visit', isCorrect: false },
            ],
            explanation:
                'localStorage is isolated per browser and per origin (domain). User A\'s browser stores their thread_ids, User B\'s browser stores theirs. When loading history, the frontend fetches job details from Redis using the stored thread_ids. The backend does not need to know about users — the frontend manages the association.',
            wrongAnswerExplanations: {
                a: 'IP addresses change (mobile networks, VPNs) and are not reliable user identifiers.',
                c: 'Cookies are sent to the server and could be shared — localStorage is strictly client-side.',
                d: 'No user ID generation — the thread_id IS the job identifier, not a user identifier.',
            },
            tradeoff:
                'localStorage: private per-device, no auth needed, lost if browser data cleared. Database with auth: persistent across devices, requires sign-up friction, more complex. For a demo/personal tool, localStorage is appropriate. For a product with multiple devices, authentication is needed.',
            codeReference: 'autoresearch-frontend/app/page.tsx',
        },
        {
            id: 'ar3b-q6',
            number: 6,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Deployment — Render vs Vercel split',
            question: 'Why is the backend on Render and the frontend on Vercel instead of both on the same platform?',
            answers: [
                { id: 'a', text: 'Vercel and Render are owned by the same company', isCorrect: false },
                { id: 'b', text: 'Vercel optimises for Next.js/static frontends. Render runs persistent Python processes. Vercel serverless functions have execution limits that would kill a 30-second research pipeline', isCorrect: true },
                { id: 'c', text: 'The backend requires a GPU which Vercel does not offer', isCorrect: false },
                { id: 'd', text: 'Both platforms are identical — the split is arbitrary', isCorrect: false },
            ],
            explanation:
                'Vercel serverless functions timeout at 10-60 seconds (hobby plan: 10s). The AutoResearch pipeline takes 25-35 seconds. Vercel would kill the request mid-stream. Render runs a persistent server process — no timeout for long-running requests. Additionally, Vercel is optimised for edge functions and static assets, while Render is optimised for always-on backend services.',
            wrongAnswerExplanations: {
                a: 'They are competing companies.',
                c: 'AutoResearch uses API calls to LLM providers — no local GPU needed.',
                d: 'The split is a deliberate technical decision based on each platform\'s strengths.',
            },
            tradeoff:
                'Split deployment: best tool for each job, slightly more complex setup. Single platform: simpler management. Railway and Fly.io support both frontend and backend but with more configuration. The Vercel + Render split is the most common pattern in the Next.js + Python ecosystem.',
            codeReference: 'autoresearch-frontend/.env.local',
        },
        {
            id: 'ar3b-q7',
            number: 7,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'Deployment — PORT environment variable',
            question: 'Why does the Dockerfile use ${PORT:-8000} instead of hardcoding port 8000?',
            code: `# Dockerfile
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port \${PORT:-8000}"]`,
            answers: [
                { id: 'a', text: 'Port 8000 is already taken on all servers', isCorrect: false },
                { id: 'b', text: 'Render (and most cloud platforms) inject a PORT environment variable. The app must bind to that port. ${PORT:-8000} uses Render\'s PORT if set, otherwise defaults to 8000 locally', isCorrect: true },
                { id: 'c', text: 'uvicorn cannot run on port 8000', isCorrect: false },
                { id: 'd', text: 'The sh -c wrapper is needed for all Docker commands', isCorrect: false },
            ],
            explanation:
                '${PORT:-8000} is bash parameter expansion: use $PORT if set, else use 8000. Render dynamically assigns ports and injects PORT=10000 (or similar). If you hardcode port 8000 and Render expects 10000, the health check fails ("No open port detected") and deployment fails. This was the actual deployment bug we fixed.',
            wrongAnswerExplanations: {
                a: 'Port 8000 is commonly available — this is about Render\'s port assignment behaviour.',
                c: 'uvicorn can bind to any available port.',
                d: 'sh -c is needed specifically to enable shell variable expansion (${PORT}) in Docker CMD.',
            },
            tradeoff:
                'Dynamic port (${PORT:-8000}): required for Render/Heroku/Railway. Fixed port (8000): simpler but breaks on platforms that assign ports dynamically. Always use ${PORT:-DEFAULT} for cloud deployments.',
            codeReference: 'autoresearch-backend/Dockerfile',
        },
        {
            id: 'ar3b-q8',
            number: 8,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Multi-provider — provider health test',
            question: 'What does the test_providers.py script reveal that unit tests would not catch?',
            code: `def test(name: str, fn):
    t0 = time.time()
    try:
        response = fn()
        latency = round((time.time() - t0) * 1000)
        results[name] = f"✅  {response[:30]:<30} {latency}ms"
    except Exception as e:
        latency = round((time.time() - t0) * 1000)
        results[name] = f"❌  {type(e).__name__}: {str(e)[:50]} ({latency}ms)"`,
            answers: [
                { id: 'a', text: 'Unit tests are always more thorough than integration tests', isCorrect: false },
                { id: 'b', text: 'Real provider availability, actual latency, current rate limit status, and correct API credentials — things mocks cannot verify', isCorrect: true },
                { id: 'c', text: 'test_providers.py only tests network connectivity', isCorrect: false },
                { id: 'd', text: 'Unit tests cannot test Python functions', isCorrect: false },
            ],
            explanation:
                'Unit tests with mocked API clients verify code logic but cannot reveal: whether NVIDIA NIM is currently timing out, whether Gemini quota is exhausted, whether API keys are valid and have correct permissions, or actual latency numbers. test_providers.py is an integration/smoke test that validates the real external dependencies.',
            wrongAnswerExplanations: {
                a: 'Unit tests are faster and more isolated — integration tests are broader. Neither is always more thorough.',
                c: 'It tests actual API calls end-to-end — model names, authentication, response parsing.',
                d: 'Unit tests absolutely test Python functions — typically with mocked dependencies.',
            },
            tradeoff:
                'Unit tests (mocked): fast, reproducible, no network, tests logic. Integration tests (real APIs): slow, network-dependent, tests actual integration, catches real failures. Run unit tests in CI/CD, run test_providers.py before deploying to catch provider issues.',
            codeReference: 'autoresearch-backend/app/utils/test_providers.py',
        },
        {
            id: 'ar3b-q9',
            number: 9,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Multi-provider — timeout strategy',
            question: 'Why is TIMEOUT=20s for Writer but TIMEOUT=25s for Planner and Critic?',
            code: `# writer.py
TIMEOUT = 20  # fast fail — many fallback providers available

# planner.py and critic.py
TIMEOUT = 25  # slightly more patience — JSON output is simple`,
            answers: [
                { id: 'a', text: 'Writer generates longer text so needs more time', isCorrect: false },
                { id: 'b', text: 'Writer has 8+ fallback providers — fast timeout means quickly moving to the next provider. Planner/Critic have fewer fallbacks — slightly more patience before giving up on a provider', isCorrect: true },
                { id: 'c', text: 'The timeout difference is an error', isCorrect: false },
                { id: 'd', text: 'Shorter timeouts improve response quality', isCorrect: false },
            ],
            explanation:
                'With 8 Writer fallback providers, hitting a 20s timeout on NVIDIA and moving to SambaNova costs 20s but still succeeds. With only 4 Planner fallbacks, a 25s timeout gives slower providers more time before abandoning them. The overall strategy: more fallbacks → shorter timeouts (fail fast). Fewer fallbacks → longer timeouts (be patient).',
            wrongAnswerExplanations: {
                a: 'Longer output generation takes more time but the timeout is about provider response start, not generation completion.',
                c: 'The difference is intentional — it reflects the different fallback chain depths.',
                d: 'Timeout length has no effect on output quality.',
            },
            tradeoff:
                'Short timeout (10s): fast failure detection, moves to fallback quickly, may abandon slow-but-working providers. Long timeout (60s): patient with slow providers, may leave users waiting unnecessarily. The right value depends on how many fallbacks you have and what user experience you want.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'ar3b-q10',
            number: 10,
            type: 'code',
            difficulty: 'advanced',
            topic: 'Frontend — marked() markdown rendering',
            question: 'Why does the report use dangerouslySetInnerHTML with marked() instead of a React component?',
            code: `// page.tsx
<div
  className="bg-white border p-8 report-content"
  dangerouslySetInnerHTML={{
    __html: marked(reportToShow) as string
  }}
/>`,
            answers: [
                { id: 'a', text: 'React cannot render text content', isCorrect: false },
                { id: 'b', text: 'The report is a markdown string from the LLM. marked() converts it to HTML. dangerouslySetInnerHTML injects raw HTML — React cannot render markdown natively', isCorrect: true },
                { id: 'c', text: 'dangerouslySetInnerHTML is required for all div elements', isCorrect: false },
                { id: 'd', text: 'marked() is a React component that accepts markdown', isCorrect: false },
            ],
            explanation:
                'The Writer agent returns markdown text (## headings, ** bold **, - bullets). React renders text literally — it would show "## Executive Summary" as text, not an HTML heading. marked() converts markdown to HTML string. dangerouslySetInnerHTML={__html: htmlString} injects that HTML. The "dangerously" name warns about XSS risk — safe here because the content comes from our own LLM, not user input.',
            wrongAnswerExplanations: {
                a: 'React absolutely renders text — it renders markdown as literal text characters.',
                c: 'dangerouslySetInnerHTML is only needed when injecting raw HTML strings.',
                d: 'marked() is a JavaScript library that converts markdown to HTML strings.',
            },
            tradeoff:
                'dangerouslySetInnerHTML: renders rich HTML from markdown, XSS risk if source is untrusted. React-markdown library: safer (sanitises HTML), component-based but heavier dependency. Since report content comes from our LLM (not user input), dangerouslySetInnerHTML is acceptable.',
            codeReference: 'autoresearch-frontend/app/page.tsx',
        },
        {
            id: 'ar3b-q11',
            number: 11,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'NEXT_PUBLIC_ prefix',
            question: 'Why does the API URL env var have the NEXT_PUBLIC_ prefix?',
            code: `# .env.local
NEXT_PUBLIC_API_URL=https://autoresearch-agent-tt56.onrender.com

# In code:
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'`,
            answers: [
                { id: 'a', text: 'NEXT_PUBLIC_ is required for all environment variables', isCorrect: false },
                { id: 'b', text: 'Without NEXT_PUBLIC_ prefix, env vars are server-side only and undefined in browser JavaScript. The prefix tells Next.js to embed the value in the client-side bundle', isCorrect: true },
                { id: 'c', text: 'NEXT_PUBLIC_ encrypts the value for security', isCorrect: false },
                { id: 'd', text: 'The prefix is required for Vercel deployment', isCorrect: false },
            ],
            explanation:
                'Next.js environment variables are server-side by default — accessible in API routes and getServerSideProps but NOT in browser code. Adding NEXT_PUBLIC_ tells the Next.js build to inline the value into the JavaScript bundle sent to browsers. The value becomes part of the static build — visible to anyone who inspects the JavaScript.',
            wrongAnswerExplanations: {
                a: 'Only vars that need browser access require NEXT_PUBLIC_.',
                c: 'NEXT_PUBLIC_ does the opposite of encrypting — it makes the value public.',
                d: 'The prefix is a Next.js convention, not Vercel-specific.',
            },
            tradeoff:
                'NEXT_PUBLIC_: accessible in browser, embedded in public bundle (never put secrets here). Without prefix: secure (server only), inaccessible in client-side code. NEVER put API keys in NEXT_PUBLIC_ vars — they become public. The API_URL is safe to expose (it is the Render URL, not a secret).',
            codeReference: 'autoresearch-frontend/.env.local',
        },
        {
            id: 'ar3b-q12',
            number: 12,
            type: 'code',
            difficulty: 'advanced',
            topic: 'Instrumentation — PostHog init',
            question: 'Why is PostHog initialised in instrumentation-client.ts instead of in a component?',
            code: `// instrumentation-client.ts (Next.js 15.3+)
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: '2026-01-30'
})`,
            answers: [
                { id: 'a', text: 'PostHog can only be initialised in TypeScript files', isCorrect: false },
                { id: 'b', text: 'instrumentation-client.ts runs once when the app loads in the browser, before any components mount — ensuring PostHog is ready to capture events from the very first interaction', isCorrect: true },
                { id: 'c', text: 'Initialising in a component would cause multiple PostHog instances', isCorrect: false },
                { id: 'd', text: 'instrumentation-client.ts is required by the PostHog SDK', isCorrect: false },
            ],
            explanation:
                'Next.js 15.3+ introduced instrumentation-client.ts as the standard place for browser-side initialisation code that should run once before any React rendering. Compared to initialising in a useEffect in layout.tsx, this approach runs earlier and more reliably. It also avoids the "init called multiple times" warning from PostHog when components re-render.',
            wrongAnswerExplanations: {
                a: 'PostHog can be initialised in any JavaScript/TypeScript file.',
                c: 'PostHog handles duplicate init calls gracefully but instrumentation-client.ts is the cleaner approach.',
                d: 'PostHog documentation suggests multiple approaches — this is the Next.js 15.3+ recommended way.',
            },
            tradeoff:
                'instrumentation-client.ts: runs once, early, clean. useEffect in layout: runs after hydration, component lifecycle dependent. For analytics that must capture the very first pageview, instrumentation-client.ts is more reliable.',
            codeReference: 'autoresearch-frontend/instrumentation-client.ts',
        },
        {
            id: 'ar3b-q13',
            number: 13,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Render — free tier cold start',
            question: 'Why does the AutoResearch backend sometimes take 30+ seconds to respond on the first request?',
            answers: [
                { id: 'a', text: 'The first research query is always more complex', isCorrect: false },
                { id: 'b', text: 'Render free tier spins down after 15 minutes of inactivity. The first request triggers a cold start — the container must boot before handling the request', isCorrect: true },
                { id: 'c', text: 'Python takes 30 seconds to import all modules', isCorrect: false },
                { id: 'd', text: 'The Tavily API has a 30-second warmup period', isCorrect: false },
            ],
            explanation:
                'Render\'s free tier uses spin-down to save resources. After 15 minutes of no traffic, the container is stopped. The next request triggers: container start → Python process boot → FastAPI startup → request handling. This adds 20-50 seconds. Subsequent requests are fast (container is warm). The fix: upgrade to paid tier, or use a cron job to ping /health every 10 minutes.',
            wrongAnswerExplanations: {
                a: 'Query complexity affects agent processing time, not server startup time.',
                c: 'Python imports for AutoResearch take 1-2 seconds, not 30.',
                d: 'Tavily has no warmup period.',
            },
            tradeoff:
                'Free tier (spin down): zero cost, cold start latency. Paid tier ($7/month): always on, instant response, no cold starts. For a demo/portfolio project, cold starts are acceptable. For a production app with real users, the paid tier is worth it.',
        },
        {
            id: 'ar3b-q14',
            number: 14,
            type: 'code',
            difficulty: 'advanced',
            topic: 'Config — os.environ fail fast',
            question: 'What happens at startup if TAVILY_API_KEY is missing from the environment?',
            code: `# config.py
TAVILY_API_KEY = os.environ["TAVILY_API_KEY"]   # ← KeyError if missing
GROQ_API_KEY   = os.environ["GROQ_API_KEY"]     # ← KeyError if missing

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")  # ← safe default`,
            answers: [
                { id: 'a', text: 'The app starts normally and returns errors only when Tavily is called', isCorrect: false },
                { id: 'b', text: 'KeyError is raised when config.py is imported at startup — the app crashes immediately before handling any requests', isCorrect: true },
                { id: 'c', text: 'TAVILY_API_KEY is set to None automatically', isCorrect: false },
                { id: 'd', text: 'The app retries loading the env var every 5 seconds', isCorrect: false },
            ],
            explanation:
                'os.environ["KEY"] raises KeyError immediately if the key is missing. Since config.py is imported at startup (when FastAPI boots), the crash happens before any requests are handled. This is intentional — fail fast at startup is better than mysterious failures during a user\'s request 10 minutes later. The Render logs will show the exact missing variable.',
            wrongAnswerExplanations: {
                a: 'Deferred failure makes debugging harder — the error would appear in the middle of user requests.',
                c: 'os.environ[] never silently sets to None — that is os.getenv() behaviour.',
                d: 'Python has no automatic retry for env var loading.',
            },
            tradeoff:
                'Fail fast (os.environ[]): immediate clear error at startup, easy to diagnose. Fail late (os.getenv()): app starts but fails mysteriously later. Required API keys should always use os.environ[]. Optional fallback providers should use os.getenv("", "") — they degrade gracefully.',
            codeReference: 'autoresearch-backend/app/config.py',
        },
        {
            id: 'ar3b-q15',
            number: 15,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Multi-provider — deduplication',
            question: 'Why does the Writer deduplicate the provider list with a seen set?',
            code: `# In revision mode, deepseek is prepended
providers = [("deepseek-r1", _try_deepseek)]  # revision first
providers.append(("gemini", _try_gemini))
providers.append(("nvidia-deepseek", _try_nvidia_deepseek))  # might duplicate
# ...

# Deduplicate preserving order
seen = set()
unique = []
for name, fn in providers:
    if name not in seen:
        seen.add(name)
        unique.append((name, fn))`,
            answers: [
                { id: 'a', text: 'Duplicate providers would cause API errors', isCorrect: false },
                { id: 'b', text: 'On revision pass, deepseek is both prepended AND in the regular chain — without deduplication it would be tried twice, wasting time and API quota', isCorrect: true },
                { id: 'c', text: 'The seen set limits the providers to 5', isCorrect: false },
                { id: 'd', text: 'Deduplication is required by the OpenAI SDK', isCorrect: false },
            ],
            explanation:
                'On first attempt: providers = [gemini, nvidia-deepseek, ...]. On revision: providers = [deepseek-r1, gemini, nvidia-deepseek, ...]. If nvidia-deepseek was also added for revision (because it is a good reasoning model), it could appear twice. Deduplication ensures each provider is tried exactly once per request — preserving insertion order (first occurrence wins).',
            wrongAnswerExplanations: {
                a: 'Duplicate providers would work but waste time and quota.',
                c: 'The seen set deduplicates by name — it does not limit count.',
                d: 'Deduplication is purely a design choice.',
            },
            tradeoff:
                'The deduplication pattern using a set + list preserves insertion order while removing duplicates. This is a common Python pattern when you need ordered deduplication (dict.fromkeys() also works in Python 3.7+: list(dict.fromkeys(items))).',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'ar3b-q16',
            number: 16,
            type: 'code',
            difficulty: 'expert',
            topic: 'Static fallback — graceful degradation',
            question: 'What is the philosophy behind the static_fallback provider in each agent?',
            code: `# writer.py
def _static_fallback(context: str) -> tuple[str, int]:
    report = (
        "## Executive Summary\\n"
        "Report generation encountered provider limitations.\\n\\n"
        "## Key Findings\\n"
        "- All AI writing providers are temporarily rate-limited\\n"
        "- Search and retrieval completed successfully\\n"
        "- Please retry in a few minutes\\n\\n"
        "## Sources\\n"
        "Sources retrieved but report synthesis unavailable."
    )
    return report, 0

# planner.py
def _static_fallback(query: str) -> tuple[list[str], int]:
    q = query.strip().rstrip("?")
    return [
        f"{q} overview definition and background",
        f"{q} key facts current state and developments",
        f"{q} analysis implications and future outlook",
    ], 0`,
            answers: [
                { id: 'a', text: 'Static fallbacks are a sign of poor architecture', isCorrect: false },
                { id: 'b', text: 'Static fallbacks ensure the pipeline ALWAYS completes — no user ever sees an unhandled exception. The pipeline degrades gracefully: partial results > no results > error', isCorrect: true },
                { id: 'c', text: 'Static fallbacks are only used in development', isCorrect: false },
                { id: 'd', text: 'Static fallbacks replace the need for error handling', isCorrect: false },
            ],
            explanation:
                'Graceful degradation is a production engineering principle: the system should degrade to a less functional but usable state rather than failing completely. The writer static fallback returns a structured (but empty) report — the pipeline completes, the Critic can still score it, the frontend still renders something. The planner static fallback generates basic subtasks from the query — Search still runs with meaningful queries.',
            wrongAnswerExplanations: {
                a: 'Static fallbacks are a sign of mature defensive engineering.',
                c: 'Static fallbacks are most important in production — that is where real failures happen.',
                d: 'Static fallbacks ARE error handling — the last line of defence.',
            },
            tradeoff:
                'Static fallback: always succeeds, communicates the issue to the user, allows pipeline to complete. Hard failure: simpler code, clear error, no misleading partial results. For a user-facing product, graceful degradation improves experience. For internal data pipelines, hard failures may be preferable to detect problems early.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'ar3b-q17',
            number: 17,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'useCallback — React performance',
            question: 'Why does page.tsx wrap setAgentStatus with useCallback?',
            code: `const setAgentStatus = useCallback(
  (agent: string, status: 'active' | 'done') => {
    setPipeline(prev => ({ ...prev, [agent]: status }))
  },
  []  // empty deps — function never changes
)`,
            answers: [
                { id: 'a', text: 'useCallback is required for functions that call setState', isCorrect: false },
                { id: 'b', text: 'useCallback memoises the function — without it, a new function is created on every render, potentially causing unnecessary re-renders in child components that receive it as a prop', isCorrect: true },
                { id: 'c', text: 'useCallback makes the function run faster', isCorrect: false },
                { id: 'd', text: 'useCallback prevents the function from being called during SSR', isCorrect: false },
            ],
            explanation:
                'Without useCallback, setAgentStatus is recreated on every re-render (new function reference). In this specific case, setAgentStatus is not passed as a prop to child components — so useCallback has no performance benefit here. It is defensive coding. The real benefit of useCallback is when the function is passed to child components with React.memo, preventing unnecessary re-renders.',
            wrongAnswerExplanations: {
                a: 'setState functions can be called from any function — useCallback is not required.',
                c: 'useCallback adds slight overhead (memoisation check). It optimises parent→child re-renders, not function execution speed.',
                d: 'useCallback is a runtime React hook — it has no SSR implications.',
            },
            tradeoff:
                'useCallback: memoises function reference, prevents child re-renders, slight overhead. No useCallback: new function each render, may cause child re-renders if passed as prop. Rule of thumb: use useCallback when passing functions to React.memo components or including in useEffect dependency arrays.',
            codeReference: 'autoresearch-frontend/app/page.tsx',
        },
        {
            id: 'ar3b-q18',
            number: 18,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'TypeScript — as const',
            question: 'What does "as const" do in the AGENTS array and why does it matter for indexOf()?',
            code: `const AGENTS = [
  'planner', 'search', 'rag', 'writer', 'critic'
] as const

// Type without as const:  string[]
// Type with as const:     readonly ["planner","search","rag","writer","critic"]

// Usage:
const idx = AGENTS.indexOf(d.agent as typeof AGENTS[number])`,
            answers: [
                { id: 'a', text: 'as const prevents the array from being modified', isCorrect: false },
                { id: 'b', text: 'as const narrows the type from string[] to a readonly tuple of literal types — TypeScript knows the exact values, enabling type-safe indexOf() and AGENTS[number] type unions', isCorrect: true },
                { id: 'c', text: 'as const is required for arrays used in for loops', isCorrect: false },
                { id: 'd', text: 'as const converts the array to a JavaScript const', isCorrect: false },
            ],
            explanation:
                'Without as const, AGENTS is string[] — TypeScript only knows it contains strings. With as const, TypeScript knows the exact values: readonly ["planner","search","rag","writer","critic"]. typeof AGENTS[number] = "planner" | "search" | "rag" | "writer" | "critic". This enables type-checking that d.agent must be one of these exact strings.',
            wrongAnswerExplanations: {
                a: 'JavaScript const prevents reassignment of the variable, not mutation of the array. as const is a TypeScript type assertion.',
                c: 'as const has no runtime effect — it is TypeScript-only.',
                d: 'The array is already const (JavaScript) — as const is about TypeScript\'s type inference.',
            },
            tradeoff:
                'as const: precise types, type-safe usage, slightly more verbose. Plain array: inferred as string[], simpler. For config arrays used extensively with TypeScript\'s type system (union types, typeof), as const is worth it.',
            codeReference: 'autoresearch-frontend/app/page.tsx',
        },
        {
            id: 'ar3b-q19',
            number: 19,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'React — key prop in lists',
            question: 'Why does the pipeline render use both agent and index in the key prop?',
            code: `{AGENTS.map((agent, i) => {
  const status = pipeline[agent]
  return (
    <div
      key={\`\${agent}-\${i}\`}  // ← agent name + index
      className="flex-1 py-3 text-center"
      style={agentBg(status)}
    >`,
            answers: [
                { id: 'a', text: 'React requires both name and index in every key', isCorrect: false },
                { id: 'b', text: 'Using just index as key causes issues when list order changes. Using agent name alone is sufficient here since agent names are unique — the index is redundant but harmless', isCorrect: true },
                { id: 'c', text: 'The combined key prevents the animation from flickering', isCorrect: false },
                { id: 'd', text: 'key props must always include the array index', isCorrect: false },
            ],
            explanation:
                'React uses key to identify which elements changed, were added, or removed. Using only the array index (key={i}) causes bugs when items are reordered — React reuses DOM elements based on position, not identity. Using the agent name (key={agent}) is correct and sufficient since agent names are unique. Adding the index is redundant here but does not cause bugs.',
            wrongAnswerExplanations: {
                a: 'React only requires key to be unique among siblings — the format is up to you.',
                c: 'Animation is controlled by CSS transitions, not key props.',
                d: 'Using only index as key is actually an anti-pattern for dynamic lists.',
            },
            tradeoff:
                'String key (agent name): stable, correct for reordering. Index key: simple but wrong for lists that change order. UUID key: most unique, needed for lists where items can be deleted and re-added. For the AGENTS array which never changes, any unique key works.',
            codeReference: 'autoresearch-frontend/app/page.tsx',
        },
        {
            id: 'ar3b-q20',
            number: 20,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'System Design — what would you change at scale',
            question: 'If AutoResearch needed to handle 10,000 queries/day, what is the most critical architectural change?',
            answers: [
                { id: 'a', text: 'Switch from Python to Node.js for performance', isCorrect: false },
                { id: 'b', text: 'Add a job queue (Redis Queue or Celery) to decouple HTTP request acceptance from pipeline execution — preventing connection timeouts and enabling horizontal scaling', isCorrect: true },
                { id: 'c', text: 'Use a faster database than Redis', isCorrect: false },
                { id: 'd', text: 'Increase MAX_REVISIONS to 3 for better quality', isCorrect: false },
            ],
            explanation:
                'Currently, the HTTP request stays open for the entire 30-second pipeline. At 10,000 queries/day (~7/minute), holding 7 concurrent 30-second HTTP connections is manageable. But at higher scale, you need: 1) Accept request, return job_id immediately (202 Accepted). 2) Queue the job in Redis/Celery. 3) Workers process jobs asynchronously. 4) Client polls or subscribes for results. This enables horizontal scaling and prevents timeout issues.',
            wrongAnswerExplanations: {
                a: 'Python with FastAPI handles thousands of requests/second — language is not the bottleneck.',
                c: 'Redis is fast enough for this scale. The bottleneck is LLM API rate limits, not the database.',
                d: 'More revisions increase cost and latency — the opposite of what you want at scale.',
            },
            tradeoff:
                'Synchronous pipeline (current): simple, real-time streaming, single server. Async job queue: scalable, resilient to failures, no streaming (polling instead), more infrastructure. At 10K queries/day, async queuing is necessary. At 100/day, the synchronous approach is simpler and sufficient.',
            codeReference: 'autoresearch-backend/app/main.py',
        },
    ],
}

export default quiz