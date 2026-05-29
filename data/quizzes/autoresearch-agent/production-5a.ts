import type { Quiz } from '@/lib/types'

const quiz: Quiz = {
    id: 'production-5a',
    title: 'Production Systems',
    subtitle: 'Part 1 — API Design, Redis, Docker & Deployment',
    description:
        'Senior-level production engineering: API design patterns, Redis in production, Docker best practices, and the infrastructure decisions behind deploying AutoResearch to Render and Vercel.',
    track: 'production',
    part: '5a',
    projectId: 'autoresearch',
    passMark: 70,
    estimatedMinutes: 25,
    prerequisites: ['ai-ml-4b'],
    questions: [
        {
            id: 'pr5a-q1',
            number: 1,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'REST API — HTTP Methods',
            question: 'AutoResearch uses POST /research instead of GET /research?query=... Why?',
            code: `# GET (not used)
GET /research?query=Tell+me+about+Enugu+water+crisis

# POST (used)
POST /research
Body: {"query": "Tell me about Enugu water crisis"}`,
            answers: [
                { id: 'a', text: 'POST is always faster than GET', isCorrect: false },
                { id: 'b', text: 'GET requests are cached by browsers/CDNs and have URL length limits (~2000 chars). POST sends data in the body — safe for long queries, not cached, semantically correct for actions that trigger side effects (job creation)', isCorrect: true },
                { id: 'c', text: 'GET requests cannot include a body', isCorrect: false },
                { id: 'd', text: 'POST is required for streaming responses', isCorrect: false },
            ],
            explanation:
                'REST semantics: GET = retrieve, safe, idempotent, cacheable. POST = create/action, not safe, not idempotent. Creating a research job is a side effect (creates a job in Redis) — POST is semantically correct. GET queries are cached — research results change with time (news). URL length limits would truncate long queries. POST body has no length limit.',
            wrongAnswerExplanations: {
                a: 'HTTP method has minimal performance impact — content and network latency dominate.',
                c: 'GET CAN include a body (technically) but it is discouraged and often ignored by proxies.',
                d: 'StreamingResponse works with any HTTP method.',
            },
            tradeoff:
                'GET: bookmarkable, cacheable, shareable URLs. POST: private, not cached, body for complex data. The /research/stream endpoint uses POST — streaming from GET endpoints has inconsistent browser support.',
            codeReference: 'autoresearch-backend/app/main.py',
        },
        {
            id: 'pr5a-q2',
            number: 2,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'HTTP Status Codes',
            question: 'What status code should the /jobs endpoint return when Redis is unavailable?',
            code: `@app.get("/jobs")
def list_jobs():
    try:
        jobs = get_all_jobs()  # queries Redis
        return jobs
    except Exception as e:
        # What status code?`,
            answers: [
                { id: 'a', text: '404 Not Found', isCorrect: false },
                { id: 'b', text: '503 Service Unavailable — the server is up but a dependency (Redis) is down', isCorrect: true },
                { id: 'c', text: '500 Internal Server Error', isCorrect: false },
                { id: 'd', text: '200 OK with an empty list', isCorrect: false },
            ],
            explanation:
                '503 Service Unavailable specifically means "the server is running but cannot handle the request right now" — caused by a downstream dependency (Redis, database) being unavailable. 500 means an unexpected error in server code. 503 tells load balancers and clients "retry later" while 500 suggests a bug. They trigger different retry behaviour in clients.',
            wrongAnswerExplanations: {
                a: '404 means "this resource does not exist" — /jobs exists, it just cannot reach Redis.',
                c: '500 is for unexpected server bugs. 503 is the more precise code for dependency failures.',
                d: 'Returning 200 OK with empty data when an error occurred hides the problem from callers.',
            },
            tradeoff:
                '503 with Retry-After header: tells clients when to retry. 500: generic error, no retry guidance. 200 with error in body: forces clients to check body content, not HTTP status. REST APIs should use HTTP status codes correctly — clients make routing decisions based on them.',
            codeReference: 'autoresearch-backend/app/main.py',
        },
        {
            id: 'pr5a-q3',
            number: 3,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'API — Idempotency',
            question: 'If a client submits the same research query twice (network retry), what happens in AutoResearch?',
            code: `@app.post("/research")
def research(req: ResearchRequest):
    thread_id = str(uuid.uuid4())  # NEW uuid each call
    result = run_research(query=req.query, thread_id=thread_id)
    return ResearchResponse(thread_id=thread_id, ...)`,
            answers: [
                { id: 'a', text: 'The second request uses the cached result from the first', isCorrect: false },
                { id: 'b', text: 'Two separate jobs are created with different thread_ids — the endpoint is NOT idempotent. A network retry creates duplicate work and cost', isCorrect: true },
                { id: 'c', text: 'The server automatically deduplicates identical queries', isCorrect: false },
                { id: 'd', text: 'The second request fails with 429 Rate Limited', isCorrect: false },
            ],
            explanation:
                'Each POST /research call generates a new uuid4() thread_id and runs the full pipeline independently. Idempotency means "calling the same operation multiple times produces the same result". This endpoint is NOT idempotent — retries create duplicate jobs. To make it idempotent: clients could send an idempotency key header; the server would return the existing result if the key was seen before.',
            wrongAnswerExplanations: {
                a: 'There is no query-level deduplication — only thread_id-level lookup.',
                c: 'The server does no deduplication — each request is independent.',
                d: 'No rate limiting is currently implemented.',
            },
            tradeoff:
                'Non-idempotent (current): simple, always runs fresh. Idempotent (Idempotency-Key header): prevents duplicate charges, requires Redis lookup per request. For a paid API, idempotency is essential. For a free demo, acceptable. Stripe, PayPal, and Twilio all require idempotency keys for POST operations.',
            codeReference: 'autoresearch-backend/app/main.py',
        },
        {
            id: 'pr5a-q4',
            number: 4,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Redis — Data Structures',
            question: 'AutoResearch stores research jobs as Redis strings (JSON). What other Redis data structures exist and when would they apply?',
            code: `# Current: STRING (JSON blob)
redis.setex("autoresearch:job:abc123", TTL, json.dumps(payload))

# Alternatives:
# HASH:  redis.hset("job:abc123", mapping={...})
# LIST:  redis.lpush("job:queue", job_id)
# SET:   redis.sadd("user:jobs", job_id)
# ZSET:  redis.zadd("jobs:by_time", {job_id: timestamp})`,
            answers: [
                { id: 'a', text: 'All Redis data structures are interchangeable', isCorrect: false },
                { id: 'b', text: 'HASH: partial field updates without JSON parse. LIST: job queue (FIFO). SET: unique user job IDs. ZSET: sort jobs by timestamp/score. STRING (current): simplest, good for small complete objects', isCorrect: true },
                { id: 'c', text: 'Redis only supports strings', isCorrect: false },
                { id: 'd', text: 'ZSET is always the best choice for complex objects', isCorrect: false },
            ],
            explanation:
                'Redis data structures have specific strengths: STRING: simple get/set, good for JSON blobs. HASH: atomic field updates (update just status without reading the whole object). LIST: O(1) push/pop — perfect for job queues. SET: unique membership checking. ZSET (sorted set): leaderboards, time-ordered data. For AutoResearch: the JSON blob approach is correct — jobs are always read whole.',
            wrongAnswerExplanations: {
                a: 'Each structure has different time complexities and atomic operations.',
                c: 'Redis supports String, Hash, List, Set, Sorted Set, and more (Streams, HyperLogLog).',
                d: 'ZSET adds complexity without benefit for the current use case.',
            },
            tradeoff:
                'STRING+JSON: simple, atomic read, no partial updates. HASH: partial atomic updates (set just the report field), slightly more complex queries. For AutoResearch jobs (always read entirely), STRING+JSON is optimal. For a user profile with frequent partial updates (last_seen, score), HASH is better.',
            codeReference: 'autoresearch-backend/app/memory/redis_state.py',
        },
        {
            id: 'pr5a-q5',
            number: 5,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Docker — Multi-stage builds',
            question: 'The AutoResearch Dockerfile does not use multi-stage builds. What would a multi-stage build add?',
            code: `# Current single-stage:
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["sh", "-c", "uvicorn app.main:app --port \${PORT:-8000}"]

# Multi-stage (improvement):
FROM python:3.11-slim AS builder
RUN pip install -r requirements.txt
# ...build artifacts...

FROM python:3.11-slim AS runtime
COPY --from=builder /app .
# No build tools in final image`,
            answers: [
                { id: 'a', text: 'Multi-stage builds run the app in parallel', isCorrect: false },
                { id: 'b', text: 'Multi-stage builds separate build dependencies from runtime — the final image only contains what is needed to run, not build tools (gcc, pip, etc.) — reducing image size by 30-70%', isCorrect: true },
                { id: 'c', text: 'Multi-stage builds are required for Python applications', isCorrect: false },
                { id: 'd', text: 'Multi-stage builds speed up container startup', isCorrect: false },
            ],
            explanation:
                'The current python:3.11-slim image includes pip, setuptools, and build tools. A multi-stage build: Stage 1 (builder): install all build dependencies and compile. Stage 2 (runtime): copy only the compiled artifacts — no pip, no gcc. Result: smaller image (~100-200MB saved), smaller attack surface, faster pulls. For Render free tier, smaller images deploy faster.',
            wrongAnswerExplanations: {
                a: 'Multi-stage builds reduce image size, not execution parallelism.',
                c: 'Multi-stage builds are optional — they are a best practice, not a requirement.',
                d: 'Container startup time is affected by image layers but multi-stage primarily reduces size.',
            },
            tradeoff:
                'Multi-stage: smaller image (faster deploys, less bandwidth), more complex Dockerfile. Single-stage: simpler, slightly larger image. For the AutoResearch free tier Render deployment, a smaller image is beneficial — faster cold starts.',
            codeReference: 'autoresearch-backend/Dockerfile',
        },
        {
            id: 'pr5a-q6',
            number: 6,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Docker — Health checks',
            question: 'What does the Docker health check do in docker-compose.yml?',
            code: `services:
  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 3`,
            answers: [
                { id: 'a', text: 'It tests Redis every 5 seconds and restarts it if it fails 3 times', isCorrect: false },
                { id: 'b', text: 'It marks the container as "healthy" only after redis-cli ping succeeds — other containers with depends_on: redis: condition: service_healthy wait for this before starting', isCorrect: true },
                { id: 'c', text: 'Health checks are only used in production Kubernetes deployments', isCorrect: false },
                { id: 'd', text: 'The health check runs redis-cli ping on the host machine', isCorrect: false },
            ],
            explanation:
                'Docker health checks enable service orchestration. Without health checks, a container starts when the process launches — but Redis may take 2-3 seconds to fully initialise. depends_on without health checks just waits for the container to start, not for Redis to be ready. With service_healthy condition, dependent services wait until Redis passes the health check.',
            wrongAnswerExplanations: {
                a: 'Docker does not automatically restart containers on health check failure by default — that requires restart policies.',
                c: 'Health checks work in docker-compose for local development too.',
                d: 'The health check runs INSIDE the container (CMD is container-scoped).',
            },
            tradeoff:
                'With health checks: reliable startup ordering, slightly slower initial start. Without: faster starts but race conditions on startup (app starts before database is ready). Always add health checks for databases and message queues.',
            codeReference: 'autoresearch-backend/docker-compose.yml',
        },
        {
            id: 'pr5a-q7',
            number: 7,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Redis — Connection pooling',
            question: 'The AutoResearch Redis client connects on every request. What does connection pooling add?',
            code: `# Current — new connection per module import
import redis
_client = redis.from_url(UPSTASH_REDIS_URL)

# With connection pool (improvement):
pool = redis.ConnectionPool.from_url(UPSTASH_REDIS_URL, max_connections=10)
_client = redis.Redis(connection_pool=pool)`,
            answers: [
                { id: 'a', text: 'Connection pooling increases the maximum number of Redis databases', isCorrect: false },
                { id: 'b', text: 'A connection pool maintains persistent TCP connections to Redis — reusing them instead of creating a new TCP connection for each operation. Reduces per-operation latency by ~5-10ms', isCorrect: true },
                { id: 'c', text: 'The current approach (module-level client) already uses connection pooling automatically', isCorrect: false },
                { id: 'd', text: 'Connection pooling is only needed for PostgreSQL, not Redis', isCorrect: false },
            ],
            explanation:
                'Actually, redis-py\'s redis.from_url() DOES create a connection pool by default (default max_connections=50). Each Redis operation borrows a connection from the pool, uses it, and returns it. TCP connection creation takes ~5-10ms — pooling avoids this overhead. The current code is fine — the improvement would be explicit pool configuration for monitoring.',
            wrongAnswerExplanations: {
                a: 'Connection pools manage connections, not database count.',
                c: 'This is actually TRUE — redis.from_url() creates an implicit pool.',
                d: 'Connection pooling benefits any persistent connection database.',
            },
            tradeoff:
                'Large pool: more concurrent Redis operations, more open TCP connections (memory). Small pool: fewer connections, potential blocking when all connections in use. For AutoResearch\'s load, the default pool (50 connections) is more than sufficient.',
            codeReference: 'autoresearch-backend/app/memory/redis_state.py',
        },
        {
            id: 'pr5a-q8',
            number: 8,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Upstash Redis — serverless Redis',
            question: 'Why use Upstash Redis instead of a self-hosted Redis or ElastiCache?',
            answers: [
                { id: 'a', text: 'Upstash is always faster than self-hosted Redis', isCorrect: false },
                { id: 'b', text: 'Upstash is serverless Redis — no server to manage, free tier (10,000 commands/day), pay-per-command pricing, and works from any cloud region without VPC setup', isCorrect: true },
                { id: 'c', text: 'Upstash is the only Redis provider compatible with Python', isCorrect: false },
                { id: 'd', text: 'Upstash removes the need for Redis authentication', isCorrect: false },
            ],
            explanation:
                'Upstash provides Redis-as-a-service with a serverless billing model: free up to 10,000 commands/day, $0.0001/command after. No server provisioning, no VPC, accessible from any cloud (Render + Vercel + local). For AutoResearch, each research job uses ~3 Redis commands (SET + GET jobs) — well within free tier. Compare: AWS ElastiCache starts at $15/month.',
            wrongAnswerExplanations: {
                a: 'Upstash adds network latency vs local Redis. For a free tier demo app, this is acceptable.',
                c: 'Redis works with Python, Node.js, Go, and any language with a Redis client.',
                d: 'Upstash uses TLS and authentication — the connection string includes credentials.',
            },
            tradeoff:
                'Upstash: zero ops, free tier, per-command cost at scale. Self-hosted Redis: free at scale, requires ops, faster (no external network hop). AWS ElastiCache: managed, expensive, requires VPC. For a solo developer demo, Upstash free tier is ideal. For production scale, self-hosted is cheaper.',
            codeReference: 'autoresearch-backend/app/config.py',
        },
        {
            id: 'pr5a-q9',
            number: 9,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'FastAPI — Middleware',
            question: 'What is the execution order when a request hits the AutoResearch API?',
            code: `# app/main.py — middleware registration order
app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)

@app.post("/research/stream")
def research_stream(req: ResearchRequest):
    ...`,
            answers: [
                { id: 'a', text: 'Route handler runs first, then middleware processes the response', isCorrect: false },
                { id: 'b', text: 'Request: CORS middleware → route handler. Response: route handler → CORS middleware (adds headers). Middleware wraps the handler like nested functions', isCorrect: true },
                { id: 'c', text: 'Middleware and route handlers run simultaneously', isCorrect: false },
                { id: 'd', text: 'Middleware is only executed on error responses', isCorrect: false },
            ],
            explanation:
                'FastAPI middleware uses an onion model: request passes through middleware layers before reaching the handler, response passes back through in reverse order. CORS middleware: on request → checks Origin header. On response → adds Access-Control-Allow-Origin header. Multiple middlewares are applied in reverse registration order (last registered = outermost).',
            wrongAnswerExplanations: {
                a: 'Middleware processes BOTH request (before handler) and response (after handler).',
                c: 'Execution is synchronous and sequential.',
                d: 'Middleware processes every request and response, not just errors.',
            },
            tradeoff:
                'Middleware: cross-cutting concerns (auth, CORS, logging, rate limiting) without modifying route handlers. Dependencies (FastAPI Depends): request-scoped, can access route parameters. Middleware: simpler for global concerns. Use middleware for: CORS, auth headers, request logging. Use Depends for: per-route auth, database sessions.',
            codeReference: 'autoresearch-backend/app/main.py',
        },
        {
            id: 'pr5a-q10',
            number: 10,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Render — Environment Variables',
            question: 'Why must environment variables be set in the Render dashboard AND in .env.local?',
            code: `# .env.local (local development)
GEMINI_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...

# Render dashboard (production)
# Same keys set through the UI, NOT from .env.local`,
            answers: [
                { id: 'a', text: '.env.local is automatically uploaded to Render on deploy', isCorrect: false },
                { id: 'b', text: '.env.local is in .gitignore — it is NEVER committed to git. Render deploys from git and cannot access .env.local. Render\'s env vars are injected at runtime separately', isCorrect: true },
                { id: 'c', text: 'Render reads .env.local from the Docker container', isCorrect: false },
                { id: 'd', text: 'They serve the same purpose — setting them in both is redundant', isCorrect: false },
            ],
            explanation:
                '.env.local is a LOCAL ONLY file — intentionally in .gitignore. It should never be committed to git (contains API keys). Render deploys from git — it has no access to .env.local. Render\'s environment variables are set through the dashboard and injected into the container at runtime. This separation is a security best practice: secrets never enter version control.',
            wrongAnswerExplanations: {
                a: '.env.local is explicitly excluded from git via .gitignore.',
                c: 'Docker containers inherit environment from the host (Render) environment, not files.',
                d: 'They serve different environments: .env.local = local dev, Render dashboard = production.',
            },
            tradeoff:
                'The 12-Factor App methodology: store config in environment, never in code. .env.local is a development convenience. Production secrets go in the platform\'s secret management (Render env vars, AWS SSM, HashiCorp Vault). NEVER commit secrets to git — even in a private repo.',
        },
        {
            id: 'pr5a-q11',
            number: 11,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'CI/CD — GitHub deployment flow',
            question: 'What happens step-by-step when you run "git push origin main" for AutoResearch?',
            code: `# What gets triggered:
git push origin main`,
            answers: [
                { id: 'a', text: 'Nothing — you must manually trigger deploys', isCorrect: false },
                { id: 'b', text: 'GitHub receives the push → notifies Render (backend) and Vercel (frontend) via webhooks → both platforms pull the latest code, build, and deploy automatically', isCorrect: true },
                { id: 'c', text: 'Only the frontend deploys — backend requires manual trigger', isCorrect: false },
                { id: 'd', text: 'GitHub Actions automatically runs tests before deploying', isCorrect: false },
            ],
            explanation:
                'Both Render and Vercel are connected to the GitHub repo with webhooks. On push to main: 1) GitHub sends a webhook to Render and Vercel. 2) Both pull the latest code. 3) Render builds the Docker container and deploys the backend. 4) Vercel builds the Next.js app and deploys the frontend. This is continuous deployment (CD) — every push to main deploys automatically.',
            wrongAnswerExplanations: {
                a: 'Both Render and Vercel support automatic deployment from GitHub.',
                c: 'Both deploy on every push to main once configured.',
                d: 'AutoResearch has no GitHub Actions workflow — tests are run manually.',
            },
            tradeoff:
                'Auto-deploy on every push: fast iteration, risk of deploying broken code. Require manual approval: safer, slower. Best practice: auto-deploy to preview/staging on every push, require manual promotion to production. AutoResearch deploys directly to production — acceptable for a solo project, risky for a team product.',
        },
        {
            id: 'pr5a-q12',
            number: 12,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'API — Versioning',
            question: 'AutoResearch has no API versioning. What problem does versioning solve and how would you add it?',
            code: `# Current (no versioning):
POST /research
GET /jobs

# With versioning:
POST /v1/research
GET /v1/jobs

# Or header-based:
POST /research
Header: API-Version: 1`,
            answers: [
                { id: 'a', text: 'API versioning is only needed for paid APIs', isCorrect: false },
                { id: 'b', text: 'Versioning allows breaking changes without breaking existing clients — old clients keep using /v1 while new clients use /v2 with new fields/behaviour', isCorrect: true },
                { id: 'c', text: 'API versioning slows down requests', isCorrect: false },
                { id: 'd', text: 'FastAPI does not support API versioning', isCorrect: false },
            ],
            explanation:
                'Without versioning, changing the response format of /research breaks the frontend immediately. With /v1/research and /v2/research: the old frontend continues using v1, the new frontend uses v2 with a different schema. For AutoResearch (single frontend + backend owned by same developer), versioning adds complexity without benefit. For a public API with external consumers, versioning is essential.',
            wrongAnswerExplanations: {
                a: 'Versioning benefits any API with multiple consumers or deployed clients.',
                c: 'Versioning adds only URL routing overhead — negligible.',
                d: 'FastAPI supports versioning via routers: APIRouter(prefix="/v1").',
            },
            tradeoff:
                'URL versioning (/v1/): explicit, cacheable, visible in logs. Header versioning: clean URLs, less discoverable. No versioning: simplest, breaks clients on changes. For a deployed mobile app (cannot force all users to update), versioning is essential. For a single-page web app (always running latest), versioning is optional.',
            codeReference: 'autoresearch-backend/app/main.py',
        },
        {
            id: 'pr5a-q13',
            number: 13,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Security — API Key exposure',
            question: 'Which of these AutoResearch env vars would be most catastrophic if accidentally committed to git?',
            code: `ANTHROPIC_API_KEY=sk-ant-...    # $5-100/month usage
GEMINI_API_KEY=AIzaSy...          # free tier
GROQ_API_KEY=gsk_...             # free tier
UPSTASH_REDIS_URL=rediss://...   # contains password
TAVILY_API_KEY=tvly-...          # $0/1000 searches`,
            answers: [
                { id: 'a', text: 'All are equally catastrophic', isCorrect: false },
                { id: 'b', text: 'ANTHROPIC_API_KEY — attackers can run millions of expensive Claude API calls on your bill. UPSTASH_REDIS_URL — attackers can read/delete all stored research jobs', isCorrect: true },
                { id: 'c', text: 'Only GEMINI_API_KEY matters — Google has better security', isCorrect: false },
                { id: 'd', text: 'None are catastrophic since they can be revoked', isCorrect: false },
            ],
            explanation:
                'Risk assessment: ANTHROPIC_API_KEY — if scraped from a public GitHub repo, bots can rack up $1000s in charges within hours (known attack pattern). UPSTASH_REDIS_URL — attackers access all user research history, can FLUSHALL to delete everything. Free tier keys (Gemini, Groq) have monetary limits but still expose user data patterns. Key rotation takes time — damage can occur before you notice.',
            wrongAnswerExplanations: {
                a: 'Financial keys are more dangerous than free tier keys.',
                c: 'Google security is irrelevant — the threat is unauthorised API usage.',
                d: 'Revocation helps but damage may already be done — bills incurred, data read.',
            },
            tradeoff:
                'Prevention (gitignore, environment variables): the only reliable approach. Detection (GitHub secret scanning, git-secrets): catches accidental commits. Rotation (regular key rotation): limits exposure window. All three layers are recommended for production systems.',
        },
        {
            id: 'pr5a-q14',
            number: 14,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Load testing — capacity planning',
            question: 'Without load testing, how do you estimate AutoResearch\'s maximum concurrent users on Render free tier?',
            code: `# Render free tier specs:
# RAM: 512MB
# CPU: 0.1 vCPU shared
# Network: unlimited

# AutoResearch per-request:
# RAM: ~50MB (state + LLM client)
# Duration: 25-35 seconds
# CPU: minimal (mostly waiting for APIs)`,
            answers: [
                { id: 'a', text: '100 concurrent users — Render free tier is designed for high load', isCorrect: false },
                { id: 'b', text: '~5-10 concurrent users: 512MB / 50MB = ~10 requests in RAM. CPU is the bottleneck at >5 concurrent 30s requests. Provider rate limits (Groq 30 RPM, Gemini 15 RPM) are hit at ~5 concurrent requests', isCorrect: true },
                { id: 'c', text: '1 user only — Render free tier is single-threaded', isCorrect: false },
                { id: 'd', text: 'Unlimited — the bottleneck is network bandwidth', isCorrect: false },
            ],
            explanation:
                '512MB RAM / 50MB per request = 10 requests before OOM. But the real bottleneck is provider rate limits: 5 concurrent 30-second requests = 5 requests/30s × Groq calls = well above Groq\'s 30 RPM limit. For 5 concurrent users each making 3 Groq calls over 30 seconds: 5 × 3 / 0.5min = 30 RPM — exactly at the Groq limit.',
            wrongAnswerExplanations: {
                a: 'Render free tier is designed for hobby projects, not high load.',
                c: 'FastAPI runs with multiple threads via uvicorn workers.',
                d: 'Network bandwidth is not the bottleneck — provider rate limits and memory are.',
            },
            tradeoff:
                'Understanding bottlenecks before load testing is a senior engineering skill. For AutoResearch: provider rate limits hit before RAM, RAM hits before CPU. Solution: job queue to manage concurrency, provider rate limit tracking, horizontal scaling.',
        },
        {
            id: 'pr5a-q15',
            number: 15,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Database — Redis vs PostgreSQL for job storage',
            question: 'Should AutoResearch use Redis or PostgreSQL to store research jobs?',
            answers: [
                { id: 'a', text: 'PostgreSQL is always better than Redis for data storage', isCorrect: false },
                { id: 'b', text: 'Redis is correct here: jobs are ephemeral (24h TTL), accessed by single key (thread_id), no querying needed, and in-memory speed is appropriate. PostgreSQL would be overkill', isCorrect: true },
                { id: 'c', text: 'They are identical for this use case', isCorrect: false },
                { id: 'd', text: 'PostgreSQL is needed for the TTL functionality', isCorrect: false },
            ],
            explanation:
                'The data access pattern determines the right database: AutoResearch jobs are: 1) Written once (job completion). 2) Read by thread_id (exact key lookup). 3) Never queried by content (no "find all jobs about Nigeria"). 4) Automatically expire after 24h (TTL). Redis TTL, O(1) key lookup, and in-memory speed are perfect. PostgreSQL would require: table schema, migrations, indexing, connection pool management, manual TTL simulation — for no benefit.',
            wrongAnswerExplanations: {
                a: 'PostgreSQL is better for complex queries and relations. Redis is better for simple key-value with TTL.',
                c: 'They have different strengths — the access pattern determines the choice.',
                d: 'PostgreSQL can simulate TTL (pg_cron job to DELETE WHERE created_at < NOW() - INTERVAL) but it is not built-in like Redis.',
            },
            tradeoff:
                'Redis: sub-millisecond reads, built-in TTL, in-memory (limited by RAM), no SQL, no ACID. PostgreSQL: SQL queries, ACID, persistent, complex joins, slower. Right tool for the job: Redis for ephemeral cache/jobs, PostgreSQL for business data requiring queries and durability.',
            codeReference: 'autoresearch-backend/app/memory/redis_state.py',
        },
        {
            id: 'pr5a-q16',
            number: 16,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Networking — Render to Upstash latency',
            question: 'AutoResearch backend is on Render (US-East) and Upstash Redis is in US-East-1. If they were on different continents, what would happen?',
            code: `# Each research job makes:
# 1× Redis SET (save job)
# GET /jobs → Redis KEYS + GET each

# Cross-continent latency: ~150-250ms per Redis call
# US-East to US-East: ~1-5ms per Redis call`,
            answers: [
                { id: 'a', text: 'Cross-region deployment has no performance impact', isCorrect: false },
                { id: 'b', text: 'Cross-continent Redis would add 150-250ms per call. For the job history page (potentially 10+ GET calls), this adds 1500-2500ms — a 2.5 second delay just for Redis', isCorrect: true },
                { id: 'c', text: 'Redis automatically selects the nearest node', isCorrect: false },
                { id: 'd', text: 'Upstash automatically deploys globally', isCorrect: false },
            ],
            explanation:
                'Network latency is a function of physical distance. US-East to US-East: ~2-5ms. US-East to EU-West: ~100-150ms. US-East to Singapore: ~200-250ms. For AutoResearch\'s single job save (1 Redis call), even 250ms is acceptable. For the job history page listing 50 jobs, 50 × 250ms = 12.5 seconds — unacceptable. Always deploy your application and its primary database in the same region.',
            wrongAnswerExplanations: {
                a: 'Physical distance creates unavoidable latency — speed of light in fiber.',
                c: 'Standard Redis does not route to the nearest node — Redis Cluster can but with different semantics.',
                d: 'Upstash has a global replication feature (paid) but the free tier uses a single region.',
            },
            tradeoff:
                'Same region: fast, must manually match regions when choosing providers. Multi-region: high availability, complex, expensive. For AutoResearch: always deploy Render, Upstash Redis, and Vercel to the same geographic region.',
            codeReference: 'autoresearch-backend/app/config.py',
        },
        {
            id: 'pr5a-q17',
            number: 17,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Production — Graceful shutdown',
            question: 'If Render stops the AutoResearch server mid-research (deploy, crash), what happens to the in-flight request?',
            code: `# When SIGTERM is received during research:
# 1. New requests rejected (503)
# 2. In-flight requests: ???

# uvicorn config:
# --timeout-graceful-shutdown 30  (default)`,
            answers: [
                { id: 'a', text: 'The research completes and the result is returned normally', isCorrect: false },
                { id: 'b', text: 'uvicorn handles SIGTERM gracefully — waits up to 30s for in-flight requests to complete. If a 30s research query was mid-execution, it may complete just in time or be killed', isCorrect: true },
                { id: 'c', text: 'The request is automatically retried on the new instance', isCorrect: false },
                { id: 'd', text: 'All in-flight requests immediately receive a connection error', isCorrect: false },
            ],
            explanation:
                'uvicorn\'s graceful shutdown: on SIGTERM, stop accepting new connections, wait for in-flight requests to complete (up to timeout). Default timeout-graceful-shutdown=30s. A 30-second research query: if it starts just before SIGTERM, it will be killed. If it is halfway through: depends on timing. The frontend\'s SSE connection would disconnect, showing an error.',
            wrongAnswerExplanations: {
                a: 'There is no guarantee the research completes — it depends on timing.',
                c: 'There is no automatic retry mechanism — the client would need to re-submit.',
                d: 'Graceful shutdown waits for in-flight requests, not immediate kill.',
            },
            tradeoff:
                'Current: best-effort graceful shutdown. Robust: queue jobs in Redis before processing, allow resumption after restart. For a demo, graceful shutdown is sufficient. For production, a job queue (Celery/Redis Queue) enables resumable research jobs.',
        },
        {
            id: 'pr5a-q18',
            number: 18,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Monitoring — Health endpoint best practices',
            question: 'What should the /health endpoint return to be most useful for monitoring?',
            code: `# Current (minimal):
@app.get("/health")
def health():
    return {"status": "ok"}

# Better (deep health check):
@app.get("/health")
def health():
    checks = {
        "status": "ok",
        "redis": check_redis(),
        "tavily": "configured" if TAVILY_API_KEY else "missing",
        "version": "1.2.0",
        "uptime_seconds": time.time() - START_TIME
    }
    status_code = 200 if all(v != "error" for v in checks.values()) else 503
    return JSONResponse(checks, status_code=status_code)`,
            answers: [
                { id: 'a', text: 'The current minimal /health is sufficient for all purposes', isCorrect: false },
                { id: 'b', text: 'Deep health checks verify actual dependencies (Redis connectivity, required env vars) and return 503 when a critical dependency is down — enabling intelligent load balancer routing and alerting', isCorrect: true },
                { id: 'c', text: 'Health endpoints should only return 200 or 404', isCorrect: false },
                { id: 'd', text: 'Deep health checks slow down the application significantly', isCorrect: false },
            ],
            explanation:
                'The current {"status": "ok"} always returns 200 — even if Redis is down. Load balancers use health endpoints to route traffic: if /health returns 503, the load balancer stops sending requests to that instance. Monitoring tools alert on non-200 responses. A deep health check that actually tests Redis connectivity catches production failures before users do.',
            wrongAnswerExplanations: {
                a: 'A /health that always returns 200 is useless for detecting real failures.',
                c: '503 from /health is the correct response when the service cannot serve requests.',
                d: 'A Redis PING takes ~1ms — negligible overhead for a health check.',
            },
            tradeoff:
                'Shallow health (current): always fast, never accurate. Deep health: accurate, depends on checked services, can cause health check failures when Redis is briefly slow. Solution: separate /health/live (always 200 — is the process running?) and /health/ready (checks dependencies — is the service ready to handle traffic?).',
            codeReference: 'autoresearch-backend/app/main.py',
        },
        {
            id: 'pr5a-q19',
            number: 19,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Cost optimisation — token budgeting',
            question: 'How would you implement automatic model downgrade to stay within a monthly cost budget?',
            code: `# Goal: stay under $10/month on AI APIs
# Current: ~$0.21/query on Claude Sonnet 4.6
# Budget: 10 / 0.21 ≈ 47 queries before switching to free models

# How to implement budget tracking?`,
            answers: [
                { id: 'a', text: 'Count queries in a Python variable — loses count on restart', isCorrect: false },
                { id: 'b', text: 'Store cumulative token counts in Redis with monthly reset (INCR autoresearch:tokens:2026-05, TTL = end of month). When budget exceeded, config switches to free tier models', isCorrect: true },
                { id: 'c', text: 'Cost cannot be tracked without a payment processor', isCorrect: false },
                { id: 'd', text: 'Set max_tokens=0 to disable paid providers', isCorrect: false },
            ],
            explanation:
                'Redis INCR is atomic — safe for concurrent token counting. Key: "autoresearch:tokens:YYYY-MM" with TTL set to end of month. On each request: INCRBY tokens_used. In config: check current month\'s usage before selecting provider. If budget exceeded: skip paid providers, go straight to free ones. This is a basic circuit breaker pattern based on budget.',
            wrongAnswerExplanations: {
                a: 'In-memory counters reset on server restart — useless for monthly budgeting.',
                c: 'Token counts from API responses give exact cost data — no payment processor needed.',
                d: 'max_tokens=0 would break all requests.',
            },
            tradeoff:
                'Budget tracking: prevents runaway costs, adds Redis call per request (~1ms overhead). No tracking: simpler, risk of unexpected bills. For a personal project with free tier providers, budget tracking is optional. For a product where users trigger paid API calls, it is essential.',
            codeReference: 'autoresearch-backend/app/memory/redis_state.py',
        },
        {
            id: 'pr5a-q20',
            number: 20,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'System Design — AutoResearch at 1 million users',
            question: 'How would you redesign AutoResearch to handle 1 million queries per day?',
            answers: [
                { id: 'a', text: 'Use a faster programming language like Go or Rust', isCorrect: false },
                { id: 'b', text: 'Job queue (Celery + Redis) for async processing, horizontal scaling (multiple Render instances), caching for identical queries (Redis), dedicated paid LLM API tiers, CDN for static assets, database sharding for job storage', isCorrect: true },
                { id: 'c', text: 'Increase max_workers in ThreadPoolExecutor to 1000', isCorrect: false },
                { id: 'd', text: 'Store all results in localStorage instead of Redis', isCorrect: false },
            ],
            explanation:
                '1M queries/day = ~700/minute = ~12/second. Current architecture: single Render instance, synchronous 30s requests → handles ~2/minute. Required changes: 1) Job queue: accept request instantly, process async. 2) Horizontal scaling: 50+ worker instances. 3) Query caching: identical queries cached in Redis (many users research the same topics). 4) Paid API tiers: Groq paid (no rate limits), Anthropic (quality). 5) Result storage: PostgreSQL (replace Redis for durability at scale).',
            wrongAnswerExplanations: {
                a: 'Python FastAPI handles thousands of requests/second — language is not the bottleneck.',
                c: 'Thread count does not scale horizontally — you still have one server.',
                d: 'localStorage is client-side — useless for server-side job management.',
            },
            tradeoff:
                'At 1M queries/day, the architecture fundamentally changes from synchronous to async, from single-server to distributed. The business model also changes: at $0.21/query on paid APIs, 1M queries = $210,000/month. Free tier models or heavy caching (maybe 60% of queries are duplicate topics) become financially necessary.',
        },
    ],
}

export default quiz