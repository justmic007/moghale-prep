import type { Quiz } from '@/lib/types'

const quiz: Quiz = {
    id: 'python-2b',
    title: 'Python Advanced',
    subtitle: 'Part 2 — Async, Concurrency, Pydantic & Production Patterns',
    description:
        'Master async Python, concurrency patterns, Pydantic validation, FastAPI internals, and production-grade Python patterns used in the AutoResearch backend.',
    track: 'python',
    part: '2b',
    projectId: 'autoresearch',
    passMark: 70,
    estimatedMinutes: 25,
    prerequisites: ['python-2a'],
    questions: [
        {
            id: 'p2b-q1',
            number: 1,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'FastAPI — Pydantic Models',
            question: 'Why does FastAPI use Pydantic BaseModel for request/response bodies?',
            code: `class ResearchRequest(BaseModel):
    query: str

class ResearchResponse(BaseModel):
    thread_id: str
    query: str
    report: str
    quality_score: dict
    subtasks: list[str]
    duration_seconds: float
    metrics: list[dict]

@app.post("/research", response_model=ResearchResponse)
def research(req: ResearchRequest):
    ...`,
            answers: [
                { id: 'a', text: 'Pydantic is required by FastAPI — no alternative exists', isCorrect: false },
                { id: 'b', text: 'Pydantic validates incoming data at runtime, serialises responses, and auto-generates OpenAPI/Swagger documentation from the type hints', isCorrect: true },
                { id: 'c', text: 'Pydantic only affects how data is displayed in logs', isCorrect: false },
                { id: 'd', text: 'BaseModel makes the class JSON serialisable only', isCorrect: false },
            ],
            explanation:
                'Pydantic BaseModel does three critical things: 1) Validates incoming request data (if query is missing or not a string, returns 422 Unprocessable Entity automatically). 2) Serialises response data to JSON. 3) Generates OpenAPI schema for /docs Swagger UI. This is why FastAPI\'s /docs shows your exact request/response shapes.',
            wrongAnswerExplanations: {
                a: 'FastAPI supports TypedDict and dataclasses too, but Pydantic is the recommended choice.',
                c: 'Pydantic validates data — incorrect data raises ValidationError, not just a log message.',
                d: 'Pydantic does much more than JSON serialisation — validation and schema generation are equally important.',
            },
            tradeoff:
                'Pydantic v2: 5-50x faster than v1, Rust-based core, strict mode available. TypedDict: no runtime validation, lightweight. dataclass: no validation, no JSON schema. For API boundaries where external data enters your system (HTTP requests), runtime validation with Pydantic is worth the overhead.',
            codeReference: 'autoresearch-backend/app/main.py',
        },
        {
            id: 'p2b-q2',
            number: 2,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'FastAPI — HTTPException',
            question: 'What HTTP status code does this return and why?',
            code: `@app.post("/research", response_model=ResearchResponse)
def research(req: ResearchRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    thread_id = str(uuid.uuid4())
    try:
        result = run_research(query=req.query, thread_id=thread_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))`,
            answers: [
                { id: 'a', text: '200 OK for empty query, 500 for all errors', isCorrect: false },
                { id: 'b', text: '400 Bad Request for empty query (client error), 500 Internal Server Error for pipeline failures (server error)', isCorrect: true },
                { id: 'c', text: 'Both raise 500 errors', isCorrect: false },
                { id: 'd', text: 'HTTPException always returns 404', isCorrect: false },
            ],
            explanation:
                'HTTP status codes encode who is responsible for the error. 400 Bad Request = the client sent invalid data (empty query is the client\'s fault). 500 Internal Server Error = the server failed to process a valid request (pipeline crash is the server\'s fault). This distinction is critical for API consumers to know whether to retry or fix their request.',
            wrongAnswerExplanations: {
                a: '400 is specifically for client errors — invalid input, not server failures.',
                c: 'Using 500 for client errors (empty query) would mislead API consumers into thinking the server is broken.',
                d: 'HTTPException accepts any status_code — 400, 403, 404, 422, 500, etc.',
            },
            tradeoff:
                '400 (client error) tells the caller "fix your request". 500 (server error) tells the caller "try again later". Correct status codes enable proper retry logic in clients — they retry 5xx errors but not 4xx. Using wrong codes breaks client retry logic.',
            codeReference: 'autoresearch-backend/app/main.py',
        },
        {
            id: 'p2b-q3',
            number: 3,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'UUID — uuid4',
            question: 'Why does AutoResearch use uuid.uuid4() for thread IDs?',
            code: `import uuid
thread_id = str(uuid.uuid4())
# Example: "33e17709-70db-4363-b756-c495ab6fc670"`,
            answers: [
                { id: 'a', text: 'uuid4 generates sequential IDs for easy sorting', isCorrect: false },
                { id: 'b', text: 'uuid4 generates random 128-bit IDs — statistically guaranteed unique across all servers without coordination', isCorrect: true },
                { id: 'c', text: 'uuid4 is faster than uuid1', isCorrect: false },
                { id: 'd', text: 'UUIDs are required by Redis for key storage', isCorrect: false },
            ],
            explanation:
                'UUID4 generates a random 128-bit identifier. The probability of collision is 1 in 2^122 — effectively zero. Crucially, no central coordinator is needed — any server can generate unique IDs independently. This enables horizontal scaling without a shared ID counter. The thread_id becomes the Redis key for job persistence.',
            wrongAnswerExplanations: {
                a: 'uuid4 is random — not sequential. uuid1 uses timestamp+MAC address and IS roughly sequential.',
                c: 'uuid4 requires a random number generator. uuid1 just reads the clock — potentially faster but reveals system info.',
                d: 'Redis accepts any string key — UUIDs are used for uniqueness, not Redis requirements.',
            },
            tradeoff:
                'uuid4 (random): no coordination, no info leakage, not sortable. uuid7 (timestamp-based, new): sortable, still globally unique, better for database indexing. uuid1 (timestamp+MAC): reveals machine identity and creation time — privacy concern. For job IDs, uuid4 is standard.',
            codeReference: 'autoresearch-backend/app/main.py',
        },
        {
            id: 'p2b-q4',
            number: 4,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'CORS — Cross-Origin Resource Sharing',
            question: 'Why does the FastAPI backend need CORSMiddleware when the frontend is on Vercel?',
            code: `app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)`,
            answers: [
                { id: 'a', text: 'CORS is required for all FastAPI applications', isCorrect: false },
                { id: 'b', text: 'Browsers block JavaScript requests to a different origin (domain/port). The Vercel frontend at autoresearch.vercel.app cannot call the Render backend at onrender.com without CORS headers', isCorrect: true },
                { id: 'c', text: 'CORS enables compression of HTTP responses', isCorrect: false },
                { id: 'd', text: 'Without CORS, the backend only accepts IPv4 connections', isCorrect: false },
            ],
            explanation:
                'Browsers enforce the Same-Origin Policy — a JavaScript fetch() to a different domain is blocked by default. The server must explicitly allow cross-origin requests by returning CORS headers (Access-Control-Allow-Origin). allow_origins=["*"] allows all origins. The browser sends an OPTIONS "preflight" request first — CORSMiddleware handles that automatically.',
            wrongAnswerExplanations: {
                a: 'CORS is only needed when browsers make cross-origin requests. Server-to-server calls (curl, Python requests) are not affected.',
                c: 'Compression is handled by gzip middleware, not CORS.',
                d: 'CORS is a browser security policy, not a network protocol restriction.',
            },
            tradeoff:
                'allow_origins=["*"]: easy, insecure — any website can call your API. allow_origins=["https://autoresearch.vercel.app"]: restricts to only your frontend. For production, always restrict to specific origins. The current "*" is acceptable for a demo but should be tightened before going to production with real users.',
            codeReference: 'autoresearch-backend/app/main.py',
        },
        {
            id: 'p2b-q5',
            number: 5,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'Redis — setex and TTL',
            question: 'What does setex do and why is TTL important for job storage?',
            code: `TTL_SECONDS = 86400  # 24 hours

def save_job(thread_id: str, state: dict) -> None:
    payload = {
        "thread_id": thread_id,
        "query": state.get("query", ""),
        "report": state.get("report", ""),
        # ...
    }
    _client.setex(_key(thread_id), TTL_SECONDS, json.dumps(payload))`,
            answers: [
                { id: 'a', text: 'setex sets a value that can never be deleted', isCorrect: false },
                { id: 'b', text: 'setex sets a key with an expiry (TTL). After TTL_SECONDS the key is automatically deleted by Redis — prevents unlimited storage growth', isCorrect: true },
                { id: 'c', text: 'setex is faster than set() for large values', isCorrect: false },
                { id: 'd', text: 'setex requires the key to already exist', isCorrect: false },
            ],
            explanation:
                'setex(key, ttl_seconds, value) is equivalent to SET + EXPIRE. After 86,400 seconds (24 hours), Redis automatically deletes the key. Without TTL, every research job would accumulate in Redis forever, exhausting the free tier\'s 256MB limit. TTL is essential for ephemeral data like cached API responses and session data.',
            wrongAnswerExplanations: {
                a: 'The opposite — setex explicitly sets an expiry time.',
                c: 'setex has the same performance as set() — it just adds automatic expiry.',
                d: 'setex creates the key if it does not exist, or overwrites if it does.',
            },
            tradeoff:
                'Short TTL: saves memory, users lose history. Long TTL: better user experience, more storage. 24 hours is appropriate for research job history — users unlikely to revisit jobs older than a day. For user account data, use no TTL (persist forever) or very long TTLs.',
            codeReference: 'autoresearch-backend/app/memory/redis_state.py',
        },
        {
            id: 'p2b-q6',
            number: 6,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Redis — Key Namespacing',
            question: 'Why does AutoResearch prefix all Redis keys with "autoresearch:"?',
            code: `NAMESPACE = "autoresearch"

def _key(thread_id: str) -> str:
    return f"{NAMESPACE}:job:{thread_id}"

# Results in keys like:
# "autoresearch:job:33e17709-70db-4363-b756-c495ab6fc670"`,
            answers: [
                { id: 'a', text: 'Redis requires a namespace prefix for all keys', isCorrect: false },
                { id: 'b', text: 'Namespacing prevents key collisions when multiple apps share the same Redis instance — Upstash free tier is shared with the receipt assistant app', isCorrect: true },
                { id: 'c', text: 'Longer key names are faster to look up', isCorrect: false },
                { id: 'd', text: 'The colon character has special meaning in Redis', isCorrect: false },
            ],
            explanation:
                'The Upstash Redis instance is shared between multiple apps. Without namespacing, if the receipt assistant also stores a key named "job:123", it would overwrite AutoResearch\'s job. "autoresearch:job:*" is an isolated namespace. Redis has no built-in namespace feature — prefixing is the standard convention. Colons are just convention (KEYS "autoresearch:*" works for pattern matching).',
            wrongAnswerExplanations: {
                a: 'Redis has no required namespace prefix — it is a convention.',
                c: 'Key length has negligible effect on lookup performance (O(1) hash table).',
                d: 'Colons have no special Redis meaning — they are just a common separator convention.',
            },
            tradeoff:
                'Flat keys ("job:123"): shorter, collision risk with other apps. Namespaced keys ("app:resource:id"): collision-safe, self-documenting, slightly longer. In production with a dedicated Redis, namespacing is still recommended for clarity. For shared Redis, it is essential.',
            codeReference: 'autoresearch-backend/app/memory/redis_state.py',
        },
        {
            id: 'p2b-q7',
            number: 7,
            type: 'code',
            difficulty: 'advanced',
            topic: 'FastAPI — StreamingResponse',
            question: 'Why does the streaming endpoint return StreamingResponse with a generator?',
            code: `@app.post("/research/stream")
def research_stream(req: ResearchRequest):
    thread_id = str(uuid.uuid4())

    return StreamingResponse(
        stream_research(query=req.query, thread_id=thread_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )`,
            answers: [
                { id: 'a', text: 'StreamingResponse is required for all POST endpoints', isCorrect: false },
                { id: 'b', text: 'StreamingResponse sends each chunk to the client as the generator yields it — enabling real-time SSE. The generator pauses between agents allowing the client to update UI progressively', isCorrect: true },
                { id: 'c', text: 'StreamingResponse compresses the response body', isCorrect: false },
                { id: 'd', text: 'StreamingResponse is needed because the response exceeds 1MB', isCorrect: false },
            ],
            explanation:
                'StreamingResponse accepts any iterable (including generators). As stream_research() yields each SSE event string, FastAPI immediately sends it as an HTTP chunk. The client receives "planner done" 2 seconds in, "search done" 5 seconds in, etc. Without streaming, the client would wait 30+ seconds with no feedback.',
            wrongAnswerExplanations: {
                a: 'StreamingResponse is only needed when you want to send data progressively.',
                c: 'Compression is a separate middleware concern.',
                d: 'Streaming is about real-time delivery, not response size.',
            },
            tradeoff:
                'StreamingResponse: real-time updates, complex error handling (errors mid-stream), harder to test. Regular Response: simple, easy error handling, all-or-nothing. X-Accel-Buffering: no disables nginx buffering which would collect chunks before sending — critical for SSE to work through reverse proxies.',
            codeReference: 'autoresearch-backend/app/main.py',
        },
        {
            id: 'p2b-q8',
            number: 8,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'asyncio vs sync FastAPI',
            question: 'The AutoResearch FastAPI endpoints use def not async def. What is the implication?',
            code: `# Sync endpoint
@app.post("/research")
def research(req: ResearchRequest):    # def, not async def
    result = run_research(...)         # blocking call
    return ResearchResponse(...)

# vs async endpoint
@app.post("/research/async")
async def research_async(req: ResearchRequest):
    result = await run_research_async(...)
    return ResearchResponse(...)`,
            answers: [
                { id: 'a', text: 'Sync endpoints are deprecated in FastAPI', isCorrect: false },
                { id: 'b', text: 'FastAPI runs sync def endpoints in a thread pool to avoid blocking the event loop. This is correct since run_research() makes blocking HTTP calls', isCorrect: true },
                { id: 'c', text: 'Sync endpoints cannot handle concurrent requests', isCorrect: false },
                { id: 'd', text: 'async def is always faster for all endpoints', isCorrect: false },
            ],
            explanation:
                'FastAPI runs sync def endpoints in a threadpool (via anyio.run_sync_in_worker_thread). This prevents the single event loop thread from blocking while waiting for the 30-second research pipeline. Multiple requests can be handled concurrently. If we used async def but called blocking functions inside, it would block the entire event loop.',
            wrongAnswerExplanations: {
                a: 'Sync endpoints are fully supported and often correct.',
                c: 'FastAPI handles concurrency correctly by running sync endpoints in threads.',
                d: 'async def is faster only when all called functions are also async. Mixing async def with sync/blocking calls is worse than using sync def.',
            },
            tradeoff:
                'Use async def when: all I/O uses async libraries (httpx, asyncpg, motor). Use sync def when: using sync libraries (requests, psycopg2, groq SDK). Mixing async def with sync blocking calls starves the event loop. The AutoResearch codebase correctly uses sync def since all provider SDKs are synchronous.',
            codeReference: 'autoresearch-backend/app/main.py',
        },
        {
            id: 'p2b-q9',
            number: 9,
            type: 'code',
            difficulty: 'advanced',
            topic: 'Pydantic — validation',
            question: 'What happens if a client sends this malformed request to the AutoResearch API?',
            code: `# Client sends:
POST /research
{"query": 12345}  # number instead of string

# FastAPI endpoint:
@app.post("/research", response_model=ResearchResponse)
def research(req: ResearchRequest):
    ...

class ResearchRequest(BaseModel):
    query: str`,
            answers: [
                { id: 'a', text: '12345 is coerced to the string "12345" silently', isCorrect: false },
                { id: 'b', text: 'Pydantic v2 in strict mode raises 422. In default mode, it coerces 12345 to "12345"', isCorrect: true },
                { id: 'c', text: 'A 500 Internal Server Error is returned', isCorrect: false },
                { id: 'd', text: 'The request succeeds with query = None', isCorrect: false },
            ],
            explanation:
                'Pydantic v2 default mode (lax): coerces compatible types (int → str). Strict mode: raises ValidationError for wrong types. FastAPI returns 422 Unprocessable Entity with detailed validation errors. The behaviour depends on your Pydantic model config. In production, strict mode is safer — unexpected coercions can mask bugs.',
            wrongAnswerExplanations: {
                a: 'This is actually what happens in Pydantic v2 lax mode — it does coerce. But it is worth knowing and potentially disabling.',
                c: '500 would indicate a server bug. 422 is for validation failures — the correct status.',
                d: 'Pydantic never silently sets fields to None when data is provided.',
            },
            tradeoff:
                'Lax mode (default): developer-friendly, accepts compatible types. Strict mode (model_config = ConfigDict(strict=True)): rejects any type mismatch. For public APIs, strict mode prevents surprising behaviour. For internal tools, lax mode is convenient.',
            codeReference: 'autoresearch-backend/app/main.py',
        },
        {
            id: 'p2b-q10',
            number: 10,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Concurrency — concurrent.futures results',
            question: 'What is the risk in this parallel search implementation?',
            code: `with ThreadPoolExecutor(max_workers=5) as executor:
    futures = {
        executor.submit(search, subtask, 4): subtask
        for subtask in state["subtasks"]
    }
    for future, subtask in futures.items():
        hits = future.result()  # ← what if this raises?
        results.append({"subtask": subtask, "results": hits})`,
            answers: [
                { id: 'a', text: 'future.result() blocks indefinitely', isCorrect: false },
                { id: 'b', text: 'If any Tavily search fails, future.result() re-raises the exception and the entire search agent fails — remaining futures are not processed', isCorrect: true },
                { id: 'c', text: 'futures.items() order is not guaranteed — results may be mismatched', isCorrect: false },
                { id: 'd', text: 'max_workers=5 limits to 5 subtasks maximum', isCorrect: false },
            ],
            explanation:
                'future.result() blocks until the future completes, then returns the result OR raises the exception from the worker thread. If subtask 1 fails, the exception propagates and subtasks 2-5 results are abandoned. The @retry decorator on search() mitigates this by retrying once before raising.',
            wrongAnswerExplanations: {
                a: 'future.result() has an optional timeout parameter. Without it, it waits until done or exception.',
                c: 'Dictionary insertion order is preserved in Python 3.7+ — the dict comprehension preserves subtask order.',
                d: 'max_workers=5 means up to 5 concurrent threads — it does not limit the number of tasks you can submit.',
            },
            tradeoff:
                'Fail-fast (current): one subtask failure fails all. Robust: wrap future.result() in try/except and continue with partial results. For a research app, partial results are better than no results. Production improvement: try/except around future.result() and append empty results for failed subtasks.',
            codeReference: 'autoresearch-backend/app/agents/search.py',
        },
        {
            id: 'p2b-q11',
            number: 11,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Pydantic — response_model filtering',
            question: 'What does response_model=ResearchResponse do that returning a plain dict would not?',
            code: `@app.post("/research", response_model=ResearchResponse)
def research(req: ResearchRequest):
    result = run_research(...)

    # result contains many internal fields:
    # result["subtasks"], result["rag_chunks"],
    # result["search_results"], result["started_at"]...

    return ResearchResponse(
        thread_id=thread_id,
        query=req.query,
        report=result["report"],
        # only selected fields
    )`,
            answers: [
                { id: 'a', text: 'response_model only affects the /docs Swagger UI', isCorrect: false },
                { id: 'b', text: 'response_model validates the response structure and FILTERS OUT any extra fields not in the model — prevents accidentally leaking internal data', isCorrect: true },
                { id: 'c', text: 'response_model compresses the JSON response', isCorrect: false },
                { id: 'd', text: 'response_model is required for all endpoints', isCorrect: false },
            ],
            explanation:
                'response_model does three things: 1) Validates the response matches the schema. 2) Filters out fields not in the model (if you return extra data, it is silently excluded). 3) Generates OpenAPI schema. This prevents accidental data leakage — internal fields like rag_chunks, search_results, started_at are never sent to clients.',
            wrongAnswerExplanations: {
                a: 'response_model affects actual runtime behaviour, not just documentation.',
                c: 'Compression is a separate concern.',
                d: 'response_model is optional — many endpoints return without it.',
            },
            tradeoff:
                'response_model: safe (filters extra data), validated, documented, slightly slower (validation overhead). Plain dict return: faster, flexible, no filtering, risks leaking internal state. For public APIs, always use response_model. For internal services, plain returns are acceptable.',
            codeReference: 'autoresearch-backend/app/main.py',
        },
        {
            id: 'p2b-q12',
            number: 12,
            type: 'code',
            difficulty: 'advanced',
            topic: 'String — strip() and split()',
            question: 'Why does the critic parser call strip() before and after splitting?',
            code: `def _parse_score(raw: str) -> dict:
    raw = raw.strip()                    # ← first strip
    if raw.startswith("\`\`\`"):
        parts = raw.split("\`\`\`")
        raw = parts[1] if len(parts) > 1 else raw
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()                # ← second strip
    try:
        parsed = json.loads(raw)
        if all(k in parsed for k in ["completeness","accuracy","coherence","feedback"]):
            return parsed
    except (json.JSONDecodeError, KeyError):
        pass
    return {"completeness": 7, "accuracy": 7, "coherence": 7,
            "feedback": "Unable to parse critic response"}`,
            answers: [
                { id: 'a', text: 'strip() removes all characters from the string', isCorrect: false },
                { id: 'b', text: 'First strip removes leading/trailing whitespace from the whole response. Second strip removes the newline after the ```json language hint before JSON parsing', isCorrect: true },
                { id: 'c', text: 'strip() is needed to convert bytes to string', isCorrect: false },
                { id: 'd', text: 'Both strip() calls are redundant', isCorrect: false },
            ],
            explanation:
                'LLM responses often have trailing newlines and spaces. First strip cleans the whole response. After splitting on ``` and removing the "json" prefix, there is typically a newline before the actual JSON. Second strip removes that newline. Without it, json.loads would fail because "\\n{..." is not valid JSON syntax.',
            wrongAnswerExplanations: {
                a: 'strip() removes only whitespace (spaces, tabs, newlines) from the start and end.',
                c: 'LLM SDK responses return strings, not bytes.',
                d: 'Both serve different purposes at different points in the parsing chain.',
            },
            tradeoff:
                'Defensive LLM output parsing is essential in production. Models routinely add markdown fences, language hints, thinking tags, preambles, and trailing whitespace even when instructed not to. Robust parsers handle all these cases and fall back gracefully rather than crashing.',
            codeReference: 'autoresearch-backend/app/agents/critic.py',
        },
        {
            id: 'p2b-q13',
            number: 13,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'numpy — cosine similarity',
            question: 'How does the AutoResearch embedder calculate cosine similarity between embeddings?',
            code: `import numpy as np

def _cosine(a: list[float], b: list[float]) -> float:
    a, b = np.array(a), np.array(b)
    norm = np.linalg.norm(a) * np.linalg.norm(b)
    return float(np.dot(a, b) / norm) if norm > 0 else 0.0`,
            answers: [
                { id: 'a', text: 'Cosine similarity measures the straight-line distance between two vectors', isCorrect: false },
                { id: 'b', text: 'Cosine similarity measures the angle between two vectors — 1.0 means identical direction (same meaning), 0 means perpendicular (unrelated), -1 means opposite', isCorrect: true },
                { id: 'c', text: 'np.dot() divides the vectors element-wise', isCorrect: false },
                { id: 'd', text: 'norm > 0 check prevents division by zero for non-zero vectors only', isCorrect: false },
            ],
            explanation:
                'Cosine similarity = dot_product / (magnitude_a * magnitude_b). np.dot(a,b) = sum of element-wise products. np.linalg.norm() = vector magnitude (√(x²+y²+z²...)). The result is 1.0 for identical vectors, 0 for perpendicular, -1 for opposite. For text embeddings, higher cosine similarity means more semantically related content.',
            wrongAnswerExplanations: {
                a: 'That describes Euclidean distance. Cosine similarity measures angle, not distance.',
                c: 'np.dot(a,b) is dot product = Σ(aᵢ × bᵢ). Element-wise multiplication without sum is np.multiply(a,b).',
                d: 'norm > 0 prevents division by zero for the ZERO vector (all zeros). A zero vector has no direction — similarity is undefined, returned as 0.',
            },
            tradeoff:
                'Cosine similarity: angle-based, scale-invariant (a 2x longer document with same content has same score), range -1 to 1. Euclidean distance: magnitude-sensitive, larger vectors score differently. Dot product: faster (no normalisation), biased toward longer documents. For semantic search, cosine similarity is standard.',
            codeReference: 'autoresearch-backend/app/tools/embedder.py',
        },
        {
            id: 'p2b-q14',
            number: 14,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'numpy — array operations',
            question: 'What does np.array() do and why is it needed for cosine similarity?',
            code: `# Python list
a = [0.1, 0.3, -0.2, 0.8]  # embedding vector

# NumPy array
a_np = np.array(a)

# Operations on numpy array
dot = np.dot(a_np, b_np)      # vectorised dot product
norm = np.linalg.norm(a_np)   # vector magnitude`,
            answers: [
                { id: 'a', text: 'np.array() just copies the list — no performance benefit', isCorrect: false },
                { id: 'b', text: 'np.array() creates a contiguous memory block enabling vectorised C operations on all elements simultaneously — 10-100x faster than Python loops for large embedding vectors', isCorrect: true },
                { id: 'c', text: 'np.dot() only works with numpy arrays, not Python lists', isCorrect: false },
                { id: 'd', text: 'NumPy arrays cannot contain negative floats', isCorrect: false },
            ],
            explanation:
                'NumPy arrays store data in contiguous C memory blocks and use BLAS/LAPACK libraries for vectorised operations. np.dot(a, b) for 768-dimensional embedding vectors runs in C at SIMD speed — much faster than a Python for loop. np.linalg.norm uses the same vectorised approach. This is why NumPy is essential for ML operations.',
            wrongAnswerExplanations: {
                a: 'The memory layout and operation speed are fundamentally different.',
                c: 'np.dot() actually accepts Python lists and converts them — but conversion adds overhead.',
                d: 'NumPy arrays support all numeric types including negative floats.',
            },
            tradeoff:
                'NumPy: fast, C memory, requires conversion from Python objects, not JSON serialisable. Python lists: slower math, JSON serialisable, native Python. The embedder converts to NumPy for computation, then returns Python lists (which are JSON serialisable for API responses).',
            codeReference: 'autoresearch-backend/app/tools/embedder.py',
        },
        {
            id: 'p2b-q15',
            number: 15,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Python — __all__ and module exports',
            question: 'What is the purpose of __all__ in a Python module?',
            code: `# app/agents/__init__.py
__all__ = ['planner', 'search', 'rag', 'writer', 'critic']

# Or without __all__:
# from app.agents import *  would import everything`,
            answers: [
                { id: 'a', text: '__all__ is required for all Python packages', isCorrect: false },
                { id: 'b', text: '__all__ defines what names are exported when someone does "from module import *" — it is the module\'s public API declaration', isCorrect: true },
                { id: 'c', text: '__all__ speeds up import statements', isCorrect: false },
                { id: 'd', text: '__all__ prevents external code from accessing the module', isCorrect: false },
            ],
            explanation:
                'Without __all__, "from module import *" imports all names not starting with _. With __all__, it imports only the listed names. This lets module authors define a public API explicitly. Even without import *, __all__ serves as documentation of intended public names.',
            wrongAnswerExplanations: {
                a: '__all__ is optional. Most modules work fine without it.',
                c: '__all__ has no effect on import speed.',
                d: '__all__ does not restrict access — you can still import unlisted names explicitly.',
            },
            tradeoff:
                'With __all__: explicit public API, prevents accidental import of internals. Without __all__: everything is implicitly public, simpler but less controlled. The AutoResearch agent modules do not use __all__ because the workflow.py imports each agent explicitly by name.',
        },
        {
            id: 'p2b-q16',
            number: 16,
            type: 'code',
            difficulty: 'expert',
            topic: 'Typing — Union and pipe syntax',
            question: 'What is the difference between these two type hints?',
            code: `# Python 3.9 and earlier
from typing import Union, Optional
def load_job(thread_id: str) -> Union[dict, None]:
    ...

# Python 3.10+ syntax
def load_job(thread_id: str) -> dict | None:
    ...

# AutoResearch uses:
def load_job(thread_id: str) -> dict | None:
    raw = _client.get(_key(thread_id))
    return json.loads(raw) if raw else None`,
            answers: [
                { id: 'a', text: 'dict | None is invalid Python syntax', isCorrect: false },
                { id: 'b', text: 'They are semantically identical. dict | None is Python 3.10+ shorthand for Union[dict, None] which equals Optional[dict]', isCorrect: true },
                { id: 'c', text: 'Union[dict, None] allows more types than dict | None', isCorrect: false },
                { id: 'd', text: '| means bitwise OR and changes the return type', isCorrect: false },
            ],
            explanation:
                'PEP 604 (Python 3.10) introduced the | operator for union types. dict | None, Union[dict, None], and Optional[dict] are all equivalent at both static analysis and runtime. The | syntax is cleaner and is the modern standard. The AutoResearch codebase uses it throughout.',
            wrongAnswerExplanations: {
                a: 'dict | None is valid Python 3.10+ syntax (PEP 604).',
                c: 'All three are semantically identical.',
                d: '| in type hints is the union operator, not bitwise OR. In type annotations it creates a Union type.',
            },
            tradeoff:
                'dict | None: clean, modern (Python 3.10+). Optional[dict]: works Python 3.5+, explicit "optional" intent. Union[dict, None]: verbose, works Python 3.5+. If your codebase must support Python 3.8/3.9, use Optional[] or Union[]. For Python 3.10+, use the | syntax.',
            codeReference: 'autoresearch-backend/app/memory/redis_state.py',
        },
        {
            id: 'p2b-q17',
            number: 17,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Python — slots',
            question: 'When would you use __slots__ in a Python class and what is the tradeoff?',
            code: `# Without __slots__ — each instance has a __dict__
class AgentMetrics:
    def __init__(self, agent, latency_ms, tokens_used):
        self.agent = agent
        self.latency_ms = latency_ms
        self.tokens_used = tokens_used

# With __slots__ — no __dict__, fixed attributes
class AgentMetrics:
    __slots__ = ('agent', 'latency_ms', 'tokens_used')
    def __init__(self, agent, latency_ms, tokens_used):
        self.agent = agent
        self.latency_ms = latency_ms
        self.tokens_used = tokens_used`,
            answers: [
                { id: 'a', text: '__slots__ adds type checking at runtime', isCorrect: false },
                { id: 'b', text: '__slots__ removes the per-instance __dict__ — reduces memory by 40-50% and speeds up attribute access when creating thousands of instances', isCorrect: true },
                { id: 'c', text: '__slots__ prevents all attribute access on the class', isCorrect: false },
                { id: 'd', text: '__slots__ is required for TypedDict compatibility', isCorrect: false },
            ],
            explanation:
                'Every Python object has a __dict__ (a dictionary) to store instance attributes — this adds ~200-400 bytes overhead per instance. __slots__ replaces __dict__ with a fixed C-level descriptor for each attribute. For classes instantiated millions of times (like ML batch processing), this memory saving is significant.',
            wrongAnswerExplanations: {
                a: '__slots__ has no type checking — it only restricts which attributes can be set.',
                c: '__slots__ restricts which new attributes can be added dynamically, not attribute reading.',
                d: 'TypedDict is a separate concept with no __slots__ relationship.',
            },
            tradeoff:
                '__slots__: 40-50% less memory per instance, faster attribute access, cannot add new attributes dynamically, no pickling by default. Regular __dict__: flexible, can add attributes dynamically, slightly more memory. In the AutoResearch pipeline, AgentMetrics is created 5 times per request — negligible difference. For ML batch jobs creating millions of objects, __slots__ is important.',
        },
        {
            id: 'p2b-q18',
            number: 18,
            type: 'code',
            difficulty: 'expert',
            topic: 'Python — deepcopy vs shallow copy',
            question: 'What is the difference between shallow and deep copy for the ResearchState?',
            code: `import copy

state = {
    "query": "fusion",
    "subtasks": ["subtask1", "subtask2"],
    "metrics": [{"agent": "planner", "latency_ms": 2.1}]
}

shallow = state.copy()       # or {**state}
deep    = copy.deepcopy(state)

# Modify nested structure
shallow["subtasks"].append("subtask3")
deep["subtasks"].append("subtask3")

print(state["subtasks"])  # After shallow: ?
print(state["subtasks"])  # After deep: ?`,
            answers: [
                { id: 'a', text: 'Both produce ["subtask1", "subtask2"] — copies are independent', isCorrect: false },
                { id: 'b', text: 'After shallow copy mutation: ["subtask1", "subtask2", "subtask3"]. After deep copy mutation: ["subtask1", "subtask2"] — deep copy is truly independent', isCorrect: true },
                { id: 'c', text: 'Both produce ["subtask1", "subtask2", "subtask3"]', isCorrect: false },
                { id: 'd', text: 'Shallow copy raises an error when appending', isCorrect: false },
            ],
            explanation:
                'Shallow copy ({**state} or .copy()) creates a new dict but the values are still references to the same objects. state["subtasks"] and shallow["subtasks"] point to the SAME list. Mutating shallow["subtasks"] mutates the original. deepcopy() recursively copies all nested objects — completely independent.',
            wrongAnswerExplanations: {
                a: 'Shallow copy is only independent at the top level — nested objects are shared.',
                c: 'Deep copy creates truly independent nested objects.',
                d: 'append() works normally on shallow copied lists.',
            },
            tradeoff:
                'Shallow copy: fast, memory-efficient, sufficient when nested objects are immutable (strings, tuples, numbers). Deep copy: slower, more memory, necessary when nested objects will be mutated. The AutoResearch {**state, "metrics": state["metrics"] + [metric]} pattern creates a new list for metrics each time — avoiding the shallow copy mutation issue.',
            codeReference: 'autoresearch-backend/app/agents/planner.py',
        },
        {
            id: 'p2b-q19',
            number: 19,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Python — importlib and dynamic imports',
            question: 'The AutoResearch agents use lazy imports inside functions. What does Python do on the second call to the same provider?',
            code: `def _try_groq(context: str) -> tuple[str, int]:
    from groq import Groq      # Called 1st time: loads groq module
    client = Groq(api_key=GROQ_API_KEY)
    ...

# Pipeline calls _try_groq twice (writer + critic)
# Second import of groq — what happens?`,
            answers: [
                { id: 'a', text: 'The groq module is loaded from disk again — slower on second call', isCorrect: false },
                { id: 'b', text: 'Python caches loaded modules in sys.modules — the second import returns the cached module instantly with no disk I/O', isCorrect: true },
                { id: 'c', text: 'Python raises ImportError on duplicate imports', isCorrect: false },
                { id: 'd', text: 'Each function call creates a new module instance', isCorrect: false },
            ],
            explanation:
                'Python\'s import system caches every loaded module in sys.modules (a dict mapping module name → module object). Any subsequent "from groq import Groq" checks sys.modules first and returns the cached module in O(1) time. No disk I/O occurs. This is why lazy imports inside functions are safe performance-wise after the first call.',
            wrongAnswerExplanations: {
                a: 'Module loading from disk only happens on the FIRST import. sys.modules caching makes subsequent imports free.',
                c: 'Python explicitly allows and expects re-imports — they are no-ops after the first load.',
                d: 'Python uses a single module instance per interpreter — shared by all code that imports it.',
            },
            tradeoff:
                'sys.modules caching means imports are idempotent after the first load. The cost of a lazy import on first call is the same as a top-level import — you just delay when it happens. Top-level: pay at startup. Lazy: pay on first use. For rarely-used providers in a fallback chain, lazy is better.',
        },
        {
            id: 'p2b-q20',
            number: 20,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Python — typing at runtime',
            question: 'What does "from __future__ import annotations" do and when is it useful?',
            code: `# Without future annotations
class ResearchState(TypedDict):
    quality_score: Optional[QualityScore]  # QualityScore must be defined above

# With future annotations
from __future__ import annotations
class ResearchState(TypedDict):
    quality_score: Optional[QualityScore]  # QualityScore can be defined below!

class QualityScore(TypedDict):
    completeness: int
    ...`,
            answers: [
                { id: 'a', text: 'It imports annotations from the future Python version', isCorrect: false },
                { id: 'b', text: 'It makes all annotations strings at runtime (lazy evaluation) — enabling forward references where a class references another class defined later in the file', isCorrect: true },
                { id: 'c', text: 'It enables runtime type checking', isCorrect: false },
                { id: 'd', text: 'It is required for Python 3.11+', isCorrect: false },
            ],
            explanation:
                'Without this import, Python evaluates type annotations immediately — QualityScore must be defined before it appears in a type hint. With "from __future__ import annotations", all annotations are stored as strings (not evaluated). This allows forward references (class A references class B defined later) and speeds up module loading slightly.',
            wrongAnswerExplanations: {
                a: 'It is a backport of Python 3.10+ annotation behaviour to earlier versions.',
                c: 'Runtime type checking requires Pydantic or beartype — __future__ annotations makes types lazy, not validated.',
                d: 'It is optional in Python 3.11 and was planned to become default in 3.12 but was postponed.',
            },
            tradeoff:
                'With lazy annotations: forward references work, faster module load, annotations are strings at runtime (get_type_hints() needed to resolve). Without: annotations evaluated immediately, clearer at runtime, forward references require string literals ("QualityScore"). The AutoResearch codebase structures TypedDicts so QualityScore is defined before ResearchState — avoiding the need for this import.',
            codeReference: 'autoresearch-backend/app/graph/state.py',
        },
    ],
}

export default quiz