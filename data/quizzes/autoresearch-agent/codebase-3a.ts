import type { Quiz } from '@/lib/types'

const quiz: Quiz = {
    id: 'autoresearch-3a',
    title: 'AutoResearch Codebase',
    subtitle: 'Part 1 — Architecture, State Machine & Agent Pipeline',
    description:
        'Deep dive into how the AutoResearch system is architected: LangGraph state machines, agent design patterns, the 5-agent pipeline, and how every component connects.',
    track: 'codebase',
    part: '3a',
    projectId: 'autoresearch',
    passMark: 70,
    estimatedMinutes: 25,
    prerequisites: ['python-2b'],
    questions: [
        {
            id: 'ar3a-q1',
            number: 1,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'System Architecture',
            question: 'What are the 5 agents in the AutoResearch pipeline and in what order do they run?',
            answers: [
                { id: 'a', text: 'Search → Planner → RAG → Writer → Critic', isCorrect: false },
                { id: 'b', text: 'Planner → Search → RAG → Writer → Critic', isCorrect: true },
                { id: 'c', text: 'Planner → RAG → Search → Writer → Critic', isCorrect: false },
                { id: 'd', text: 'Planner → Search → Writer → RAG → Critic', isCorrect: false },
            ],
            explanation:
                'The pipeline flows logically: Planner decomposes the query into subtasks → Search retrieves web results for each subtask → RAG embeds and retrieves the most relevant chunks → Writer synthesises the report from all gathered context → Critic scores the report and optionally triggers revision. RAG must come after Search because it operates on Search results.',
            wrongAnswerExplanations: {
                a: 'Search cannot run before Planner — Planner creates the subtasks that Search uses.',
                c: 'RAG cannot run before Search — RAG embeds and retrieves from Search results.',
                d: 'RAG must run before Writer — Writer needs the retrieved context chunks.',
            },
            tradeoff:
                'Sequential pipeline: simple, each agent gets full context from previous agents. Parallel pipeline: faster but harder to implement (agents would need to be independent). The sequential design is correct here because each agent depends on the previous agent\'s output.',
            codeReference: 'autoresearch-backend/app/graph/workflow.py',
        },
        {
            id: 'ar3a-q2',
            number: 2,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'LangGraph — StateGraph',
            question: 'What does build_graph() do and why is StateGraph used instead of a simple function call chain?',
            code: `def build_graph() -> StateGraph:
    graph = StateGraph(ResearchState)

    graph.add_node("planner", planner.run)
    graph.add_node("search",  search.run)
    graph.add_node("rag",     rag.run)
    graph.add_node("writer",  writer.run)
    graph.add_node("critic",  critic.run)

    graph.set_entry_point("planner")
    graph.add_edge("planner", "search")
    graph.add_edge("search",  "rag")
    graph.add_edge("rag",     "writer")
    graph.add_edge("writer",  "critic")

    graph.add_conditional_edges(
        "critic",
        _should_revise,
        {"revise": "writer", "done": END},
    )
    return graph`,
            answers: [
                { id: 'a', text: 'StateGraph is just a fancy way to call functions in sequence', isCorrect: false },
                { id: 'b', text: 'StateGraph enables conditional branching (revision loop), state checkpointing, and visualisation of the agent flow as a directed graph', isCorrect: true },
                { id: 'c', text: 'StateGraph is required for async agent execution', isCorrect: false },
                { id: 'd', text: 'StateGraph prevents agents from running more than once', isCorrect: false },
            ],
            explanation:
                'StateGraph models the pipeline as a directed graph with nodes (agents) and edges (transitions). The key benefit over function chaining is: 1) Conditional edges (critic → revise or done). 2) Checkpointing via MemorySaver. 3) Observable state at each node. 4) Potential parallel node execution. 5) Graph is inspectable/visualisable.',
            wrongAnswerExplanations: {
                a: 'A simple function chain cannot implement conditional branching or checkpointing.',
                c: 'StateGraph works with sync functions (def not async def).',
                d: 'add_conditional_edges allows the writer to be called twice (initial + revision) — StateGraph enables this.',
            },
            tradeoff:
                'StateGraph: structured, observable, supports branching, more setup. Simple function chain: less code, no branching, no checkpointing. For a pipeline with a revision loop, StateGraph is the right tool. For a strictly linear 3-step process, function chaining would be simpler.',
            codeReference: 'autoresearch-backend/app/graph/workflow.py',
        },
        {
            id: 'ar3a-q3',
            number: 3,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'LangGraph — Conditional Edges',
            question: 'What does _should_revise() decide and when does the writer run twice?',
            code: `def _should_revise(state: ResearchState) -> str:
    score = state.get("quality_score")
    revisions = state.get("revision_count", 0)
    if score and score["total"] < QUALITY_THRESHOLD and revisions <= MAX_REVISIONS:
        return "revise"
    return "done"

# Config:
QUALITY_THRESHOLD = 20  # out of 30
MAX_REVISIONS = 1`,
            answers: [
                { id: 'a', text: 'Writer always runs twice for better quality', isCorrect: false },
                { id: 'b', text: 'Writer runs twice only when: quality score < 20/30 AND revision_count ≤ 1. After one revision, the pipeline always exits regardless of new score', isCorrect: true },
                { id: 'c', text: 'Writer runs twice when the report is shorter than 500 words', isCorrect: false },
                { id: 'd', text: '_should_revise is called before the critic runs', isCorrect: false },
            ],
            explanation:
                '_should_revise is the conditional edge function called AFTER critic. It returns "revise" → LangGraph routes back to writer. It returns "done" → LangGraph routes to END. The revisions <= MAX_REVISIONS guard prevents infinite loops — even if the revised report also scores < 20, the pipeline exits after 1 revision.',
            wrongAnswerExplanations: {
                a: 'Running twice unconditionally would double latency and token costs unnecessarily.',
                c: 'Length is not a factor — only the critic\'s quality score.',
                d: '_should_revise runs as the conditional edge function AFTER the critic agent outputs its quality_score.',
            },
            tradeoff:
                'More revisions = higher quality ceiling but more latency and cost. Zero revisions = fastest but no quality improvement. One revision is a good balance — catches obviously poor first drafts without unbounded cost. In production, you might make MAX_REVISIONS configurable per user tier.',
            codeReference: 'autoresearch-backend/app/graph/workflow.py',
        },
        {
            id: 'ar3a-q4',
            number: 4,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Agent Pattern — run() signature',
            question: 'Every AutoResearch agent has the same function signature. Why is this important?',
            code: `# Every agent:
def run(state: ResearchState) -> ResearchState:
    # reads from state
    # does work
    # returns NEW state with added data

# Planner:
def run(state: ResearchState) -> ResearchState:
    ...
    return {**state, "subtasks": subtasks, "metrics": [...]}

# Writer:
def run(state: ResearchState) -> ResearchState:
    ...
    return {**state, "report": report, "metrics": [...]}`,
            answers: [
                { id: 'a', text: 'It is just a coincidence — each agent could have any signature', isCorrect: false },
                { id: 'b', text: 'LangGraph requires each node function to accept and return the state type. The uniform signature makes agents interchangeable and the graph composable', isCorrect: true },
                { id: 'c', text: 'The signature enforces that agents run in sequence', isCorrect: false },
                { id: 'd', text: 'TypedDict requires all functions to have the same signature', isCorrect: false },
            ],
            explanation:
                'LangGraph StateGraph nodes must be functions that take the state and return state updates. The uniform (state) → state signature is a contract: any function matching this shape can be a node. This enables easy addition of new agents, testing agents in isolation, and swapping implementations without changing the graph structure.',
            wrongAnswerExplanations: {
                a: 'The uniform signature is a deliberate architectural decision enabling composability.',
                c: 'Execution order is determined by add_edge(), not the function signature.',
                d: 'TypedDict has no requirements on function signatures.',
            },
            tradeoff:
                'Uniform interface: testable in isolation (pass any state dict), composable, follows functional programming principles. Specialised interfaces: each agent could receive only its specific inputs but then the graph structure would need to know each agent\'s specific dependencies — tightly coupled.',
            codeReference: 'autoresearch-backend/app/agents/planner.py',
        },
        {
            id: 'ar3a-q5',
            number: 5,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'Planner Agent — JSON output',
            question: 'Why does the Planner use response_format={"type": "json_object"} on Groq?',
            code: `response = client.chat.completions.create(
    model=GROQ_MODEL,
    messages=[
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": f"Research question: {query}"},
    ],
    temperature=0.1,
    max_tokens=512,
    response_format={"type": "json_object"},  # ← this
)`,
            answers: [
                { id: 'a', text: 'json_object makes responses faster', isCorrect: false },
                { id: 'b', text: 'json_object mode forces the model to output valid JSON — preventing markdown fences and ensuring json.loads() never fails on the response', isCorrect: true },
                { id: 'c', text: 'json_object compresses the response', isCorrect: false },
                { id: 'd', text: 'json_object is required for all Groq calls', isCorrect: false },
            ],
            explanation:
                'Without json_object mode, models often wrap JSON in markdown fences (```json...```) even when instructed not to. json_object mode is a hard constraint — the model MUST produce valid JSON or the API returns an error. Combined with temperature=0.1 (near-deterministic), this makes the Planner\'s output reliable for json.loads().',
            wrongAnswerExplanations: {
                a: 'json_object mode adds a constraint that may slightly slow generation.',
                c: 'json_object is about output format, not compression.',
                d: 'json_object is optional but recommended for structured output.',
            },
            tradeoff:
                'json_object mode: reliable parsing, slightly constrained creativity. No json_object: flexible output but requires robust parsing (strip fences, handle edge cases). The planner and critic both use json_object because they need structured data. The writer does NOT use it because it produces free-form markdown prose.',
            codeReference: 'autoresearch-backend/app/agents/planner.py',
        },
        {
            id: 'ar3a-q6',
            number: 6,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Search Agent — ThreadPoolExecutor',
            question: 'The search agent uses ThreadPoolExecutor. What is the dict comprehension doing here?',
            code: `with ThreadPoolExecutor(max_workers=5) as executor:
    futures = {
        executor.submit(search, subtask, 4): subtask
        for subtask in state["subtasks"]
    }
    for future, subtask in futures.items():
        hits = future.result()
        results.append({"subtask": subtask, "results": hits})`,
            answers: [
                { id: 'a', text: 'The dict maps futures to results', isCorrect: false },
                { id: 'b', text: 'The dict maps Future objects to their subtask string — preserving which subtask each future belongs to so results can be correctly associated after parallel completion', isCorrect: true },
                { id: 'c', text: 'The dict prevents duplicate subtasks', isCorrect: false },
                { id: 'd', text: 'executor.submit returns the result immediately', isCorrect: false },
            ],
            explanation:
                'executor.submit() submits a task to the thread pool and returns a Future object immediately (non-blocking). The dict {future: subtask} is crucial — it maps each Future back to its original subtask string. When iterating futures.items(), we get both the Future (to call .result()) and the subtask name (to label the results correctly).',
            wrongAnswerExplanations: {
                a: 'The dict maps futures TO subtasks (the keys are futures, values are subtasks).',
                c: 'Deduplication is not the purpose — the subtasks list from the Planner is already unique.',
                d: 'executor.submit() returns a Future (a promise), not the result. .result() blocks until the future completes.',
            },
            tradeoff:
                'dict {future: subtask}: preserves association, O(1) lookup. list [future] then enumerate: loses association. list [(future, subtask)]: also works but dict is cleaner. Using a dict is a common pattern for tracking parallel tasks with their metadata.',
            codeReference: 'autoresearch-backend/app/agents/search.py',
        },
        {
            id: 'ar3a-q7',
            number: 7,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'RAG Agent — embed and retrieve',
            question: 'What is the RAG agent actually doing in the pipeline?',
            code: `def run(state: ResearchState) -> ResearchState:
    # Flatten search results into text chunks
    chunks = _flatten_results(state["search_results"])

    # Store chunks in memory store
    embed_and_store(state["thread_id"], chunks)

    # Retrieve most relevant chunks for the query
    rag_chunks = retrieve(state["query"], state["thread_id"])

    return {**state, "rag_chunks": rag_chunks, ...}`,
            answers: [
                { id: 'a', text: 'RAG fetches more web results', isCorrect: false },
                { id: 'b', text: 'RAG takes all search result content, stores it, then retrieves the MOST RELEVANT chunks for the original query — filtering signal from noise before the writer sees it', isCorrect: true },
                { id: 'c', text: 'RAG compresses the search results', isCorrect: false },
                { id: 'd', text: 'RAG translates results into different languages', isCorrect: false },
            ],
            explanation:
                'RAG (Retrieval Augmented Generation) here takes search results (potentially 20-40 chunks of text), embeds them using Gemini or keyword matching, then retrieves only the TOP_K most semantically relevant chunks for the original query. The Writer only receives the best 5 chunks — not all raw search results. This improves report quality and reduces token usage.',
            wrongAnswerExplanations: {
                a: 'Search results are already fetched by the Search agent. RAG re-ranks them.',
                c: 'RAG is about relevance ranking, not compression.',
                d: 'Language translation is not part of the pipeline.',
            },
            tradeoff:
                'More RAG chunks (TOP_K=10): more context for writer, higher token cost. Fewer chunks (TOP_K=3): focused context, lower cost, may miss relevant info. Current TOP_K=5 is balanced. Semantic retrieval (embeddings) is more accurate than keyword matching but requires the embedding API to be available.',
            codeReference: 'autoresearch-backend/app/agents/rag.py',
        },
        {
            id: 'ar3a-q8',
            number: 8,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Writer Agent — context building',
            question: 'Why does _build_context() limit each search result to 250 characters?',
            code: `def _build_context(state: ResearchState) -> str:
    lines = [f"Research question: {state['query']}\\n"]
    lines.append("--- Retrieved context (RAG) ---")
    for chunk in state["rag_chunks"][:3]:
        lines.append(chunk[:400])               # ← limit RAG chunks

    lines.append("\\n--- Search results ---")
    for item in state["search_results"]:
        for r in item["results"][:2]:
            lines.append(f"  [{r['title']}] {r['url']}")
            lines.append(f"  {r['content'][:250]}")  # ← limit content
    return "\\n".join(lines)`,
            answers: [
                { id: 'a', text: 'The writer cannot process more than 250 characters', isCorrect: false },
                { id: 'b', text: 'Limiting content reduces the total context size — fitting within model context windows, reducing token costs, and preventing the writer from being overwhelmed with redundant text', isCorrect: true },
                { id: 'c', text: '250 characters is the minimum needed for quality reports', isCorrect: false },
                { id: 'd', text: 'The Tavily API only returns 250 characters', isCorrect: false },
            ],
            explanation:
                'Without limits, a research query with 5 subtasks × 4 results × full content could be 50,000+ tokens. Most free tier models have 8,192-32,768 token limits. Truncating to 250 chars per result reduces context to ~3,000-5,000 tokens — well within limits. This is the retrieval-heavy vs LLM-heavy tradeoff: the quality of evidence selection matters more than the quantity.',
            wrongAnswerExplanations: {
                a: 'Models can process thousands of tokens — the limit is about cost and focus, not capability.',
                c: '250 chars is enough to capture the key information from a search snippet.',
                d: 'Tavily returns full article content — the truncation is done explicitly in the codebase.',
            },
            tradeoff:
                'More context: potentially richer report, higher token cost, may confuse model with redundant info. Less context: focused report, cheaper, may miss nuances. The 250/400 char limits are tunable constants. A production system might adjust these based on query complexity.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'ar3a-q9',
            number: 9,
            type: 'code',
            difficulty: 'advanced',
            topic: 'Critic Agent — quality scoring',
            question: 'The Critic scores on 3 dimensions. How is the revision decision made?',
            code: `# Critic output example:
score = QualityScore(
    completeness=8,
    accuracy=7,
    coherence=9,
    total=24,        # 8+7+9
    feedback="Add more primary source citations"
)

# Revision trigger:
QUALITY_THRESHOLD = 20  # total out of 30

def _should_revise(state):
    score = state.get("quality_score")
    if score and score["total"] < QUALITY_THRESHOLD:
        return "revise"
    return "done"`,
            answers: [
                { id: 'a', text: 'Revision triggers when any single dimension scores below 7', isCorrect: false },
                { id: 'b', text: 'Revision triggers when total score < 20/30 (66%). Score of 24/30 does NOT trigger revision', isCorrect: true },
                { id: 'c', text: 'Revision always triggers on the first attempt', isCorrect: false },
                { id: 'd', text: 'Revision triggers when feedback contains the word "insufficient"', isCorrect: false },
            ],
            explanation:
                'The threshold is on the TOTAL score (sum of all 3 dimensions), not individual dimensions. 20/30 = 66% — reports scoring 20 or above are considered acceptable. Score of 24/30 > 20, so no revision. Score of 18/30 < 20, triggers revision. The feedback text is passed back to the Writer as context for improvement.',
            wrongAnswerExplanations: {
                a: 'Individual dimension scores are not checked separately for revision.',
                c: 'First attempt revision would be wasteful — the Critic decides based on actual quality.',
                d: 'Revision is purely numerical — not based on text analysis of the feedback.',
            },
            tradeoff:
                'Higher threshold (25/30): more revisions = higher quality but more cost and latency. Lower threshold (15/30): fewer revisions = faster but lower quality floor. 20/30 (66%) is a practical minimum quality bar. In production, this could be per-query configurable based on user tier.',
            codeReference: 'autoresearch-backend/app/agents/critic.py',
        },
        {
            id: 'ar3a-q10',
            number: 10,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'State Management — metrics accumulation',
            question: 'Why does every agent use state["metrics"] + [metric] instead of state["metrics"].append(metric)?',
            code: `# Every agent returns:
return {
    **state,
    "metrics": state["metrics"] + [metric],  # ← creates new list
    # NOT: state["metrics"].append(metric)   # ← mutates in place
}`,
            answers: [
                { id: 'a', text: 'append() does not work with TypedDict', isCorrect: false },
                { id: 'b', text: '+ creates a new list — preserving immutability. append() mutates the shared list which could corrupt state if LangGraph processes nodes concurrently', isCorrect: true },
                { id: 'c', text: 'append() is slower than + for small lists', isCorrect: false },
                { id: 'd', text: 'LangGraph requires all state values to be replaced, not mutated', isCorrect: false },
            ],
            explanation:
                'state["metrics"] + [metric] creates a brand new list. state["metrics"].append(metric) mutates the existing list in-place. If two agents could run concurrently and both call append() on the same list, you get a race condition — unpredictable ordering and potentially lost metrics. The immutable pattern avoids this entirely.',
            wrongAnswerExplanations: {
                a: 'append() works on any Python list regardless of how it is stored.',
                c: 'For small lists (5 items), performance is identical. The reason is correctness, not speed.',
                d: 'LangGraph works with both — but immutable updates are the recommended pattern for safety.',
            },
            tradeoff:
                'Immutable update (+ new list): safe for concurrent access, creates garbage for GC, follows functional patterns. Mutable update (append): slightly more memory-efficient, risky for concurrent access. With 5 sequential agents each appending 1 metric, the performance difference is negligible — immutability wins.',
            codeReference: 'autoresearch-backend/app/agents/planner.py',
        },
        {
            id: 'ar3a-q11',
            number: 11,
            type: 'code',
            difficulty: 'advanced',
            topic: 'Provider fallback — print logging',
            question: 'Why does each provider attempt use print() for logging instead of the logging module?',
            code: `for name, fn in providers:
    try:
        result, tok = fn(context)
        if result and len(result.strip()) > 100:
            print(f"[writer] using {name}")   # ← print, not logging.info
            break
    except Exception as e:
        print(f"[writer] {name} failed ({type(e).__name__}: {e}) — trying next")
        continue`,
            answers: [
                { id: 'a', text: 'print() is always preferable to logging', isCorrect: false },
                { id: 'b', text: 'print() is quick for development/demo. A production system should use logging.getLogger(__name__) for structured log levels, log aggregation, and filtering', isCorrect: true },
                { id: 'c', text: 'The logging module does not work with FastAPI', isCorrect: false },
                { id: 'd', text: 'print() is required by Render for log visibility', isCorrect: false },
            ],
            explanation:
                'The current print() approach is pragmatic for a demo/early-stage app — Render and most platforms capture stdout. However, production systems should use the logging module: logging.info("[writer] using {name}") and logging.error("[writer] {name} failed", exc_info=True). This enables log levels (DEBUG/INFO/WARNING/ERROR), structured logging (JSON for log aggregation), and log filtering.',
            wrongAnswerExplanations: {
                a: 'print() is fine for scripts and demos but lacks features needed at scale.',
                c: 'FastAPI works seamlessly with the logging module — uvicorn\'s logging config integrates automatically.',
                d: 'Render captures both print() (stdout) and logging (stderr by default) — no preference.',
            },
            tradeoff:
                'print(): simple, always visible in stdout, no configuration. logging module: log levels, handlers (file/cloud), structured JSON output, performance (no-op for disabled levels), standard library. For production with thousands of requests/day, structured logging enables debugging, alerting, and observability.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'ar3a-q12',
            number: 12,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'MemorySaver — LangGraph checkpointing',
            question: 'Why does AutoResearch use MemorySaver instead of RedisSaver for LangGraph checkpointing?',
            code: `def get_compiled_graph():
    graph = build_graph()
    return graph.compile(checkpointer=MemorySaver())
    # Not: RedisSaver.from_conn_string(REDIS_URL)`,
            answers: [
                { id: 'a', text: 'MemorySaver is faster than RedisSaver', isCorrect: false },
                { id: 'b', text: 'The RedisSaver API changed in newer LangGraph versions causing compatibility issues. MemorySaver is used as a pragmatic solution — checkpointing to Redis is a planned upgrade', isCorrect: true },
                { id: 'c', text: 'MemorySaver persists data to disk automatically', isCorrect: false },
                { id: 'd', text: 'LangGraph does not support Redis checkpointing', isCorrect: false },
            ],
            explanation:
                'MemorySaver stores state in Python memory — lost when the process restarts. RedisSaver would persist state between restarts, enabling job resumption after crashes. The switch was made when the langgraph-checkpoint-redis package API changed. In production, RedisSaver is superior: crashed jobs can be resumed, state is inspectable externally.',
            wrongAnswerExplanations: {
                a: 'MemorySaver is faster (no network call) but at the cost of durability.',
                c: 'MemorySaver stores ONLY in RAM — lost on process exit.',
                d: 'LangGraph supports Redis, PostgreSQL, and custom checkpointers.',
            },
            tradeoff:
                'MemorySaver: fast, no dependencies, lost on restart, no inspection. RedisSaver: durable, resumable, inspectable, requires Redis connection. For production with 100+ users/day where the Render server might restart, RedisSaver is essential to avoid lost jobs.',
            codeReference: 'autoresearch-backend/app/graph/workflow.py',
        },
        {
            id: 'ar3a-q13',
            number: 13,
            type: 'code',
            difficulty: 'advanced',
            topic: 'Embedder — semantic vs keyword retrieval',
            question: 'The embedder tries Gemini embeddings first and falls back to keyword matching. When does each trigger?',
            code: `def retrieve(query: str, thread_id: str, top_k: int = TOP_K_RAG_RESULTS) -> list[str]:
    chunks = _store.get(thread_id, [])
    if not chunks:
        return []

    vecs = _embed_batch([query] + chunks)  # Try Gemini

    if vecs is not None:
        # Semantic retrieval using cosine similarity
        query_vec, chunk_vecs = vecs[0], vecs[1:]
        scored = sorted(range(len(chunks)),
                       key=lambda i: _cosine(query_vec, chunk_vecs[i]),
                       reverse=True)
    else:
        # Keyword fallback
        scored = sorted(range(len(chunks)),
                       key=lambda i: _keyword_score(query, chunks[i]),
                       reverse=True)

    return [chunks[i] for i in scored[:top_k]]`,
            answers: [
                { id: 'a', text: 'Keyword is used when the query is short', isCorrect: false },
                { id: 'b', text: 'Semantic (Gemini) is primary. Keyword fallback triggers when Gemini embedding API fails (rate limit, quota, network error) — _embed_batch returns None on any exception', isCorrect: true },
                { id: 'c', text: 'Both run simultaneously and results are merged', isCorrect: false },
                { id: 'd', text: 'Keyword is always used for performance', isCorrect: false },
            ],
            explanation:
                '_embed_batch catches ALL exceptions and returns None on failure. If Gemini quota is exhausted, vecs is None → keyword fallback. This graceful degradation ensures the RAG agent always returns SOME chunks even when the embedding API is down — avoiding a complete pipeline failure.',
            wrongAnswerExplanations: {
                a: 'Query length does not determine the retrieval method.',
                c: 'They are alternatives, not combined.',
                d: 'Semantic retrieval is preferred — keyword is the fallback.',
            },
            tradeoff:
                'Semantic retrieval: understands meaning ("car" matches "automobile"), better quality, requires embedding API. Keyword retrieval: exact word matching only, no semantic understanding, always available. For a production system, cached embeddings (Redis) would eliminate the fallback need.',
            codeReference: 'autoresearch-backend/app/tools/embedder.py',
        },
        {
            id: 'ar3a-q14',
            number: 14,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Stream research — SSE format',
            question: 'What is the exact format of an SSE message and why does it end with \\n\\n?',
            code: `def emit(event: str, data: dict) -> str:
    return f"event: {event}\\ndata: {json.dumps(data)}\\n\\n"

# Produces:
# event: agent_done
# data: {"agent": "planner", "latency": 2189.1}
#
# (blank line signals end of message)`,
            answers: [
                { id: 'a', text: '\\n\\n is just a style convention with no functional purpose', isCorrect: false },
                { id: 'b', text: 'The SSE spec requires a blank line (\\n\\n) to signal the END of one message — the client parser splits on \\n\\n to get complete messages', isCorrect: true },
                { id: 'c', text: '\\n\\n is needed to flush the HTTP buffer', isCorrect: false },
                { id: 'd', text: 'SSE messages must end with \\r\\n\\r\\n not \\n\\n', isCorrect: false },
            ],
            explanation:
                'The Server-Sent Events specification (W3C) defines the message format: "event: TYPE\\ndata: PAYLOAD\\n\\n". The double newline is the message terminator — it tells the browser\'s EventSource parser that this message is complete and ready to dispatch. This is why the frontend api.ts splits on "\\n\\n" to get complete messages before parsing.',
            wrongAnswerExplanations: {
                a: '\\n\\n is a protocol requirement — without it the client never knows when a message ends.',
                c: 'Flushing is controlled by Cache-Control: no-cache and X-Accel-Buffering: no headers.',
                d: 'The SSE spec uses \\n (LF) not \\r\\n (CRLF). Most implementations accept both but \\n is standard.',
            },
            tradeoff:
                'SSE uses a simple text protocol — easy to debug (readable in browser DevTools EventStream tab), works over HTTP/1.1, auto-reconnects if connection drops. WebSockets use a binary framing protocol — more efficient for high-frequency bidirectional messaging but more complex.',
            codeReference: 'autoresearch-backend/app/graph/workflow.py',
        },
        {
            id: 'ar3a-q15',
            number: 15,
            type: 'code',
            difficulty: 'advanced',
            topic: 'initial_state factory',
            question: 'Why does AutoResearch use an initial_state() factory function instead of directly creating the dict?',
            code: `def initial_state(query: str, thread_id: str) -> ResearchState:
    return ResearchState(
        query=query,
        thread_id=thread_id,
        subtasks=[],
        search_results=[],
        rag_chunks=[],
        report="",
        quality_score=None,
        revision_count=0,
        metrics=[],
        started_at=time.time(),
        finished_at=0.0,
    )`,
            answers: [
                { id: 'a', text: 'Factory functions are required by LangGraph', isCorrect: false },
                { id: 'b', text: 'The factory ensures ALL required fields are always initialised with correct default types — preventing KeyError when agents access state fields before they are populated', isCorrect: true },
                { id: 'c', text: 'The factory validates the query string', isCorrect: false },
                { id: 'd', text: 'Factory functions prevent multiple instances being created', isCorrect: false },
            ],
            explanation:
                'Without initial_state(), every caller would need to remember to include all fields. Missing fields would cause KeyError when agents do state["rag_chunks"]. The factory guarantees a complete, correctly typed starting state. It also sets started_at=time.time() for accurate duration measurement.',
            wrongAnswerExplanations: {
                a: 'LangGraph accepts any dict matching the TypedDict shape — factory is not required.',
                c: 'The factory does no validation — it trusts the caller.',
                d: 'Factory functions typically CREATE instances — the opposite of preventing them.',
            },
            tradeoff:
                'Factory function: centralised defaults, consistent state shape, single place to update when state fields change. Direct dict: flexible, no abstraction overhead. When the state TypedDict adds new fields, only the factory needs updating — not every caller.',
            codeReference: 'autoresearch-backend/app/graph/state.py',
        },
        {
            id: 'ar3a-q16',
            number: 16,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Upstash Redis — save_job',
            question: 'Why does save_job() store only selected fields instead of the full LangGraph state?',
            code: `def save_job(thread_id: str, state: dict) -> None:
    payload = {
        "thread_id": thread_id,
        "query":     state.get("query", ""),
        "report":    state.get("report", ""),
        "quality_score": state.get("quality_score"),
        "subtasks":  state.get("subtasks", []),
        "metrics":   state.get("metrics", []),
        "finished_at": state.get("finished_at", 0),
    }
    # NOT: json.dumps(state) — stores everything
    _client.setex(_key(thread_id), TTL_SECONDS, json.dumps(payload))`,
            answers: [
                { id: 'a', text: 'Redis has a 512 byte value limit', isCorrect: false },
                { id: 'b', text: 'The full state includes rag_chunks and search_results (potentially 50KB+). Storing only user-facing fields reduces Redis memory usage and keeps history payloads small for fast retrieval', isCorrect: true },
                { id: 'c', text: 'search_results and rag_chunks are not JSON serialisable', isCorrect: false },
                { id: 'd', text: 'LangGraph state cannot be serialised', isCorrect: false },
            ],
            explanation:
                'The full ResearchState includes search_results (raw HTML snippets from 12+ URLs) and rag_chunks (50+ text chunks) — potentially 50-200KB. Storing this in Redis would exhaust the Upstash free tier (256MB) quickly. The history page only needs: query, report, quality_score, subtasks, metrics — the user-facing data.',
            wrongAnswerExplanations: {
                a: 'Redis values can be up to 512MB — not 512 bytes.',
                c: 'search_results and rag_chunks are plain Python dicts/lists — fully JSON serialisable.',
                d: 'LangGraph state (TypedDict = plain dict) serialises fine with json.dumps().',
            },
            tradeoff:
                'Store full state: enables job resumption, debugging, reprocessing. Store summary: saves memory, faster to load, sufficient for display. For a research app where jobs are one-shot (not resumed), storing the summary is appropriate. A debugging/admin tool might store the full state separately.',
            codeReference: 'autoresearch-backend/app/memory/redis_state.py',
        },
        {
            id: 'ar3a-q17',
            number: 17,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'LangGraph — add_conditional_edges',
            question: 'How exactly does add_conditional_edges implement the revision loop?',
            code: `graph.add_conditional_edges(
    "critic",           # source node
    _should_revise,     # routing function
    {
        "revise": "writer",   # "revise" → go to writer
        "done":   END,        # "done" → exit graph
    },
)`,
            answers: [
                { id: 'a', text: '_should_revise runs before the critic node', isCorrect: false },
                { id: 'b', text: 'After critic completes, LangGraph calls _should_revise(state). Its return value ("revise" or "done") is looked up in the routing dict to determine the next node', isCorrect: true },
                { id: 'c', text: 'The routing dict maps state values to nodes', isCorrect: false },
                { id: 'd', text: 'add_conditional_edges requires the routing function to return a node name directly', isCorrect: false },
            ],
            explanation:
                'After the critic node runs and updates state (adding quality_score), LangGraph automatically calls _should_revise(state). The returned string ("revise" or "done") is used as a key in the routing dict {"revise": "writer", "done": END}. LangGraph routes to the mapped node. This creates the revision loop: critic → _should_revise → writer → critic → _should_revise → END.',
            wrongAnswerExplanations: {
                a: '_should_revise runs AFTER critic — it needs quality_score which critic adds to state.',
                c: 'The dict maps _should_revise return VALUES to NODE NAMES — not state values.',
                d: 'The routing dict indirection is exactly the design — _should_revise returns a logical key, the dict maps it to a node.',
            },
            tradeoff:
                'Conditional edges: declarative, graph is visualisable, routing logic is testable independently. If/else in agent: imperative, harder to visualise, mixes routing with agent logic. LangGraph\'s declarative approach separates concerns cleanly.',
            codeReference: 'autoresearch-backend/app/graph/workflow.py',
        },
        {
            id: 'ar3a-q18',
            number: 18,
            type: 'code',
            difficulty: 'expert',
            topic: 'PostHog — event tracking',
            question: 'What two custom events does AutoResearch track and what properties do they include?',
            code: `// page.tsx — research_started
posthog.capture('research_started', { query })

// page.tsx — research_completed
posthog.capture('research_completed', {
  query:            completeData.query,
  quality_score:    completeData.quality_score?.total,
  duration_seconds: completeData.duration_seconds,
  total_tokens:     completeData.total_tokens,
  thread_id:        completeData.thread_id,
})`,
            answers: [
                { id: 'a', text: 'Only pageview events are tracked — no custom events', isCorrect: false },
                { id: 'b', text: 'research_started (with query) and research_completed (with quality, duration, tokens, thread_id) — enabling funnel analysis of start vs completion rate', isCorrect: true },
                { id: 'c', text: 'Events are tracked server-side in FastAPI only', isCorrect: false },
                { id: 'd', text: 'PostHog tracks clicks automatically — no custom events needed', isCorrect: false },
            ],
            explanation:
                'Two events enable key product metrics: 1) research_started / research_completed ratio = completion rate (how many queries actually finish). 2) quality_score distribution = average report quality across all users. 3) duration_seconds = performance monitoring. 4) total_tokens = cost estimation. These are the metrics you\'d discuss in an engineering interview.',
            wrongAnswerExplanations: {
                a: 'PostHog auto-captures pageviews but the custom events provide product-specific insights.',
                c: 'Events are tracked client-side in the browser — PostHog captures user context (location, device) automatically.',
                d: 'Auto-captured clicks show what users click but not what queries they run or report quality.',
            },
            tradeoff:
                'Client-side tracking: easy, captures user context, can be blocked by ad blockers. Server-side tracking: reliable (cannot be blocked), no user context without manual instrumentation. Hybrid: track key business events server-side (research completed) and UX events client-side (button clicks).',
            codeReference: 'autoresearch-frontend/app/page.tsx',
        },
        {
            id: 'ar3a-q19',
            number: 19,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Tavily — search tool',
            question: 'Why does AutoResearch use Tavily instead of the Google Search API or scraping directly?',
            answers: [
                { id: 'a', text: 'Tavily is free while Google Search API costs money', isCorrect: false },
                { id: 'b', text: 'Tavily is an AI-optimised search API that returns clean, structured content (not raw HTML) already extracted and formatted for LLM consumption — no parsing needed', isCorrect: true },
                { id: 'c', text: 'Google Search API does not support Python', isCorrect: false },
                { id: 'd', text: 'Tavily searches only academic sources', isCorrect: false },
            ],
            explanation:
                'Tavily was built specifically for AI agent workflows. It returns structured results: title, url, content (clean extracted text — not HTML), and a score. Regular search APIs return raw HTML requiring scraping and parsing. The clean content field is immediately usable by LLMs without preprocessing. This is why it is the dominant search tool in LangChain and LangGraph examples.',
            wrongAnswerExplanations: {
                a: 'Tavily has a free tier (1,000 searches/month) but so does Google Custom Search (100/day). Both have paid tiers.',
                c: 'Google Search API has official Python client libraries.',
                d: 'Tavily searches the general web — not limited to academic sources.',
            },
            tradeoff:
                'Tavily: AI-optimised, clean content, simple integration, 1000/month free. SerpAPI: more sources, more expensive. Direct scraping: free but requires maintenance, rate limiting, JavaScript rendering. For AI agent prototyping, Tavily\'s clean structured output is worth the free tier limitation.',
            codeReference: 'autoresearch-backend/app/tools/tavily.py',
        },
        {
            id: 'ar3a-q20',
            number: 20,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'System Design — why not one big LLM call',
            question: 'Why split research into 5 separate agents instead of one large LLM prompt?',
            code: `# One-shot approach (NOT what we do):
response = llm.complete(f"""
Search the web and write a research report about: {query}
""")

# Multi-agent approach (what we do):
# Planner → Search → RAG → Writer → Critic`,
            answers: [
                { id: 'a', text: 'Multiple LLM calls are always cheaper than one large call', isCorrect: false },
                { id: 'b', text: 'Each agent specialises in one task (planning, searching, writing, critiquing) — quality is higher because focused agents outperform one agent trying to do everything simultaneously', isCorrect: true },
                { id: 'c', text: 'The one-shot approach exceeds all model context windows', isCorrect: false },
                { id: 'd', text: 'Multi-agent systems are required by LangGraph', isCorrect: false },
            ],
            explanation:
                'The multi-agent design separates concerns: the Planner focuses only on query decomposition (simple JSON task — small model OK). The Search agent calls Tavily (no LLM needed). The Writer focuses only on synthesis (complex writing — needs strong model). The Critic focuses only on evaluation. Specialisation allows using the right model for each task and enables quality gates between stages.',
            wrongAnswerExplanations: {
                a: 'Multiple calls cost more tokens total than a single call. The benefit is quality and observability, not cost.',
                c: 'Claude Sonnet and Gemini have 200K+ token windows — large enough for one-shot. The issue is quality.',
                d: 'LangGraph supports single-node "graphs" too. Multi-agent is an architectural choice.',
            },
            tradeoff:
                'Multi-agent: higher quality, observable (each step visible), debuggable, more latency, more cost. One-shot: faster, cheaper, simpler but lower quality ceiling and opaque (hard to debug). For a research product where quality matters, multi-agent wins. For a chatbot that answers quick questions, one-shot is appropriate.',
            codeReference: 'autoresearch-backend/app/graph/workflow.py',
        },
    ],
}

export default quiz