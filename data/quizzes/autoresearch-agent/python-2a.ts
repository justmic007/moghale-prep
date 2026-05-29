import type { Quiz } from '@/lib/types'

const quiz: Quiz = {
    id: 'python-2a',
    title: 'Python Advanced',
    subtitle: 'Part 1 — Decorators, Generators, Closures & Functional Tools',
    description:
        'Master advanced Python patterns used in production codebases: decorators, generators, closures, functools, and the patterns that make the AutoResearch backend work.',
    track: 'python',
    part: '2a',
    projectId: 'autoresearch',
    passMark: 70,
    estimatedMinutes: 25,
    prerequisites: ['python-1b'],
    questions: [
        {
            id: 'p2a-q1',
            number: 1,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Decorators — Basics',
            question: 'What is a decorator in Python?',
            code: `def timer(func):
    def wrapper(*args, **kwargs):
        t0 = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {(time.time()-t0)*1000:.1f}ms")
        return result
    return wrapper

@timer
def run_planner(state):
    ...`,
            answers: [
                { id: 'a', text: 'A special comment that documents a function', isCorrect: false },
                { id: 'b', text: 'A function that takes a function and returns a modified version of it', isCorrect: true },
                { id: 'c', text: 'A class that inherits from another class', isCorrect: false },
                { id: 'd', text: 'A Python keyword that creates read-only variables', isCorrect: false },
            ],
            explanation:
                'A decorator is a higher-order function — it takes a function as input and returns a new function (wrapper) that adds behaviour before/after the original. @timer is syntactic sugar for run_planner = timer(run_planner). The wrapper preserves the original function\'s interface via *args, **kwargs.',
            wrongAnswerExplanations: {
                a: 'That describes docstrings ("""..."""). Decorators modify behaviour.',
                c: 'That describes class inheritance.',
                d: 'Python has no read-only keyword — use properties or __slots__ for that.',
            },
            tradeoff:
                'Decorators add behaviour (logging, timing, retrying, caching) without modifying the original function. This follows the Open/Closed Principle — open for extension, closed for modification. The tenacity @retry decorator on Tavily search is exactly this pattern.',
            codeReference: 'autoresearch-backend/app/tools/tavily.py',
        },
        {
            id: 'p2a-q2',
            number: 2,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'Decorators — @retry from tenacity',
            question: 'What happens when the Tavily search fails on the first attempt?',
            code: `@retry(
    stop=stop_after_attempt(2),
    wait=wait_exponential(multiplier=1, min=2, max=6)
)
def search(query: str, max_results: int = 5) -> list[dict]:
    response = _client.search(query=query, max_results=max_results)
    return [{"title": r.get("title"), ...} for r in response.get("results", [])]`,
            answers: [
                { id: 'a', text: 'The exception propagates immediately to the caller', isCorrect: false },
                { id: 'b', text: 'tenacity catches the exception, waits 2 seconds, then retries once. If the second attempt also fails, the exception propagates', isCorrect: true },
                { id: 'c', text: 'The function returns an empty list on failure', isCorrect: false },
                { id: 'd', text: 'tenacity retries indefinitely until success', isCorrect: false },
            ],
            explanation:
                'stop=stop_after_attempt(2) means maximum 2 total attempts (1 retry). wait=wait_exponential(multiplier=1, min=2, max=6) waits at least 2s between attempts, doubling each time up to 6s. After all attempts are exhausted, the last exception is re-raised to the caller.',
            wrongAnswerExplanations: {
                a: 'Without @retry the exception would propagate immediately. @retry gives it a second chance.',
                c: 'tenacity does not change the return value — it retries the function as-is.',
                d: 'stop=stop_after_attempt(2) explicitly limits total attempts to 2.',
            },
            tradeoff:
                'More retries = higher chance of eventual success but slower failure detection. Fewer retries = faster failure detection but misses transient errors. 2 attempts is a good balance for external API calls. Exponential backoff avoids hammering a rate-limited API.',
            codeReference: 'autoresearch-backend/app/tools/tavily.py',
        },
        {
            id: 'p2a-q3',
            number: 3,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Generators — yield',
            question: 'What type does a function with "yield" return when called?',
            code: `def stream_research(query: str, thread_id: str):
    state = initial_state(query, thread_id)
    state = planner.run(state)
    yield emit("agent_done", {"agent": "planner"})
    state = search.run(state)
    yield emit("agent_done", {"agent": "search"})
    # ...

# What is the type of this?
result = stream_research("What is fusion?", "abc-123")`,
            answers: [
                { id: 'a', text: 'str — the first yielded string', isCorrect: false },
                { id: 'b', text: 'None — the function body does not execute yet', isCorrect: false },
                { id: 'c', text: 'generator object — no code has run yet', isCorrect: true },
                { id: 'd', text: 'list — all yielded strings collected', isCorrect: false },
            ],
            explanation:
                'Calling a generator function does NOT execute any code. It returns a generator object immediately. Code only runs when you iterate the generator (for item in result: or next(result)). This is called lazy evaluation — computation is deferred until needed.',
            wrongAnswerExplanations: {
                a: 'No yield has executed yet at this point — the function body has not run at all.',
                b: 'None is returned by regular functions with no return. Generator functions return a generator object.',
                d: 'A list comprehension [x for x in ...] produces a list. Generator functions produce a generator.',
            },
            tradeoff:
                'Generator (lazy): executes on demand, memory efficient, cannot restart. List (eager): executes immediately, reusable, higher memory. FastAPI\'s StreamingResponse accepts a generator — each yield sends data to the client immediately, enabling real-time agent progress updates.',
            codeReference: 'autoresearch-backend/app/graph/workflow.py',
        },
        {
            id: 'p2a-q4',
            number: 4,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'Generator — for loop consumption',
            question: 'How does the Next.js frontend consume the SSE generator from the backend?',
            code: `// lib/api.ts — frontend SSE consumer
export async function* streamResearch(query: string) {
  const response = await fetch(\`\${API_URL}/research/stream\`, {
    method: 'POST', body: JSON.stringify({ query })
  })
  const reader = response.body.getReader()
  // reads chunks and yields parsed SSE events
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    // parse and yield each SSE event
    yield { event: eventType, data: JSON.parse(dataLine) }
  }
}

// page.tsx — consuming the generator
for await (const { event, data } of streamResearch(query)) {
  if (event === 'agent_done') setAgentStatus(data.agent, 'done')
  if (event === 'complete') setResult(data)
}`,
            answers: [
                { id: 'a', text: 'The frontend downloads all events then processes them', isCorrect: false },
                { id: 'b', text: 'for await...of iterates an async generator — each iteration waits for the next yielded value from the stream, processing events as they arrive', isCorrect: true },
                { id: 'c', text: 'The frontend polls the backend every second for updates', isCorrect: false },
                { id: 'd', text: 'WebSockets are used for bidirectional streaming', isCorrect: false },
            ],
            explanation:
                'The backend Python generator yields SSE events. FastAPI\'s StreamingResponse sends each yield as an HTTP chunk. The frontend reads chunks using the Streams API (reader.read()). The async generator function* in TypeScript yields parsed events. for await...of processes each event as it arrives — this creates the real-time pipeline animation.',
            wrongAnswerExplanations: {
                a: 'Downloading all events defeats the purpose of streaming.',
                c: 'SSE is server-push — the client does not poll. The server sends events when ready.',
                d: 'SSE is unidirectional (server to client). WebSockets are bidirectional. SSE is simpler and sufficient here.',
            },
            tradeoff:
                'SSE: unidirectional, HTTP/1.1 compatible, auto-reconnect built-in, simpler. WebSockets: bidirectional, requires upgrade handshake, more complex. For displaying AI agent progress to a user, SSE is the right choice — the client only needs to receive, not send.',
            codeReference: 'autoresearch-frontend/lib/api.ts',
        },
        {
            id: 'p2a-q5',
            number: 5,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Closures — LEGB Rule',
            question: 'What is the LEGB rule and which scope does Python check first?',
            code: `# Which x does each print() access?
x = "global"

def outer():
    x = "enclosing"
    def inner():
        x = "local"
        print(x)  # which x?
    inner()
    print(x)  # which x?

outer()
print(x)  # which x?`,
            answers: [
                { id: 'a', text: 'All three print "global"', isCorrect: false },
                { id: 'b', text: 'local, enclosing, global', isCorrect: true },
                { id: 'c', text: 'local, local, local', isCorrect: false },
                { id: 'd', text: 'global, global, global', isCorrect: false },
            ],
            explanation:
                'LEGB = Local → Enclosing → Global → Built-in. Python searches scopes in this order, taking the first match. inner() has x="local" in Local scope. outer() has x="enclosing" in its Local (Enclosing to inner). The module level has x="global". Each scope is isolated.',
            wrongAnswerExplanations: {
                a: 'Local and enclosing definitions shadow the global x.',
                c: 'Each function has its own local scope — outer() does not see inner()\'s x.',
                d: 'Local definitions take priority over global.',
            },
            tradeoff:
                'Avoid shadowing global variables with local names — it creates confusion. Use "global x" to modify a global from inside a function, or "nonlocal x" to modify an enclosing scope variable. The AutoResearch config.py defines all config at module (global) scope intentionally so all agents can import them.',
            codeReference: 'autoresearch-backend/app/config.py',
        },
        {
            id: 'p2a-q6',
            number: 6,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'functools.lru_cache',
            question: 'How would you add caching to the Gemini embedding function to avoid re-embedding the same text?',
            code: `# Current — embeds every time
def _embed_batch(texts: list[str]) -> list[list[float]] | None:
    from google import genai
    client = genai.Client(api_key=GEMINI_API_KEY)
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=texts,
    )
    return [e.values for e in result.embeddings]

# How would you cache this?`,
            answers: [
                { id: 'a', text: '@functools.lru_cache() directly — lists are hashable', isCorrect: false },
                { id: 'b', text: 'Convert texts list to a tuple (hashable) and use @lru_cache on the tuple version', isCorrect: true },
                { id: 'c', text: '@lru_cache does not work with external API calls', isCorrect: false },
                { id: 'd', text: 'Store results in a global dict manually', isCorrect: false },
            ],
            explanation:
                '@lru_cache requires all arguments to be hashable (usable as dict keys). Lists are not hashable — tuples are. Convert to tuple: @lru_cache(maxsize=128) def _embed_cached(texts: tuple[str, ...]). Then call _embed_cached(tuple(texts)). lru_cache maintains a Least Recently Used cache of the last N results.',
            wrongAnswerExplanations: {
                a: 'Lists are mutable and therefore not hashable — lru_cache will raise TypeError.',
                c: '@lru_cache works with any function — it just caches based on argument values. The key insight is that the same text always produces the same embedding.',
                d: 'Manual dict caching works but @lru_cache is cleaner, thread-safe, and has built-in LRU eviction.',
            },
            tradeoff:
                'lru_cache: automatic eviction, thread-safe, simple. Manual dict: full control, can persist to Redis, no memory limit. For a production system, embedding results should be cached in Redis or ChromaDB (persistent) not just lru_cache (in-memory, lost on restart).',
            codeReference: 'autoresearch-backend/app/tools/embedder.py',
        },
        {
            id: 'p2a-q7',
            number: 7,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'functools.partial',
            question: 'How could functools.partial simplify the AutoResearch provider chain?',
            code: `from functools import partial
from openai import OpenAI

# Without partial — repetitive
def _try_mistral(context):
    client = OpenAI(base_url="https://api.mistral.ai/v1", api_key=MISTRAL_API_KEY)
    return _call_api(client, MISTRAL_MODEL, context)

def _try_cerebras(context):
    client = OpenAI(base_url="https://api.cerebras.ai/v1", api_key=CEREBRAS_API_KEY)
    return _call_api(client, CEREBRAS_MODEL, context)

# With partial — cleaner
_call_mistral = partial(_call_openai_compat,
    base_url="https://api.mistral.ai/v1",
    api_key=MISTRAL_API_KEY,
    model=MISTRAL_MODEL)`,
            answers: [
                { id: 'a', text: 'partial() creates a subclass of the function', isCorrect: false },
                { id: 'b', text: 'partial() creates a new callable with some arguments pre-filled, reducing repetition when the same function is called with mostly the same arguments', isCorrect: true },
                { id: 'c', text: 'partial() runs the function immediately with the given arguments', isCorrect: false },
                { id: 'd', text: 'partial() is only useful for class methods', isCorrect: false },
            ],
            explanation:
                'functools.partial(func, **fixed_kwargs) creates a new callable where the specified arguments are permanently pre-set. Calling _call_mistral(context) is equivalent to _call_openai_compat(base_url=..., api_key=..., model=..., context=context). It eliminates boilerplate without changing the function\'s behaviour.',
            wrongAnswerExplanations: {
                a: 'partial() wraps a function, not subclasses it.',
                c: 'partial() defers execution — it creates a callable, not a result.',
                d: 'partial() works with any callable — functions, methods, lambdas.',
            },
            tradeoff:
                'partial(): standard library, clear intent, reusable. Lambda: more concise for simple cases but captures variables by reference (closure bug risk). Named wrapper functions: most readable, most lines of code. The AutoResearch codebase uses named functions for clarity.',
        },
        {
            id: 'p2a-q8',
            number: 8,
            type: 'code',
            difficulty: 'advanced',
            topic: 'Context Managers — __enter__ and __exit__',
            question: 'What must a class implement to be used as a context manager with "with"?',
            code: `class RedisConnection:
    def __init__(self, url):
        self.url = url
        self.client = None

    def __enter__(self):
        self.client = redis.from_url(self.url)
        return self.client

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.client.close()
        return False  # don't suppress exceptions

# Usage:
with RedisConnection(REDIS_URL) as client:
    client.set("key", "value")`,
            answers: [
                { id: 'a', text: '__init__ and __del__', isCorrect: false },
                { id: 'b', text: '__enter__ and __exit__', isCorrect: true },
                { id: 'c', text: '__open__ and __close__', isCorrect: false },
                { id: 'd', text: '__start__ and __stop__', isCorrect: false },
            ],
            explanation:
                '__enter__ is called when entering the "with" block — it sets up the resource and returns it (assigned to the "as" variable). __exit__ is called on exit — whether normal, exception, or return. exc_type/val/tb are None on normal exit, populated on exception. Returning False from __exit__ re-raises any exception.',
            wrongAnswerExplanations: {
                a: '__del__ is a destructor but is not guaranteed to be called and cannot suppress exceptions.',
                c: 'Python has no __open__/__close__ protocol.',
                d: 'Python has no __start__/__stop__ protocol.',
            },
            tradeoff:
                'Return True from __exit__ to suppress exceptions (swallow errors). Return False to propagate them. The AutoResearch Redis client uses redis.from_url() directly without a context manager — for a long-lived connection this is fine, but for per-request connections, context managers ensure cleanup.',
            codeReference: 'autoresearch-backend/app/memory/redis_state.py',
        },
        {
            id: 'p2a-q9',
            number: 9,
            type: 'mcq',
            difficulty: 'advanced',
            topic: '@property decorator',
            question: 'What does @property enable in Python?',
            code: `class AgentConfig:
    def __init__(self, model: str, timeout: int):
        self._model = model
        self._timeout = timeout

    @property
    def model(self):
        return self._model

    @model.setter
    def model(self, value):
        if not isinstance(value, str):
            raise TypeError("model must be a string")
        self._model = value`,
            answers: [
                { id: 'a', text: 'Creates a static class variable', isCorrect: false },
                { id: 'b', text: 'Allows method calls to look like attribute access, with optional validation on get/set', isCorrect: true },
                { id: 'c', text: 'Makes the attribute read-only permanently', isCorrect: false },
                { id: 'd', text: '@property is required for all class attributes', isCorrect: false },
            ],
            explanation:
                '@property makes model() callable as config.model (no parentheses). @model.setter intercepts config.model = "new_value" and runs validation. This encapsulates implementation details — callers use attribute syntax while the class controls access logic.',
            wrongAnswerExplanations: {
                a: '@staticmethod creates static methods. @property creates computed attributes.',
                c: 'Without a setter, the property IS read-only. But you can add a setter for validated writes.',
                d: '@property is optional — use it when you need computed values or validation on attribute access.',
            },
            tradeoff:
                '@property: clean attribute syntax, validation, computed values, backward compatible. Public attribute: simpler, no overhead, no encapsulation. Use @property when you need to add validation later without breaking callers — changing a public attribute to a property is backward compatible.',
        },
        {
            id: 'p2a-q10',
            number: 10,
            type: 'code',
            difficulty: 'advanced',
            topic: 'Comprehensions — nested and conditional',
            question: 'What does this nested comprehension from the provider chain produce?',
            code: `seen = set()
unique = []
for name, fn in providers:
    if name not in seen:
        seen.add(name)
        unique.append((name, fn))

# Equivalent one-liner?`,
            answers: [
                { id: 'a', text: 'unique = list(set(providers))', isCorrect: false },
                { id: 'b', text: 'Cannot be done with a comprehension — requires side effects (seen.add)', isCorrect: true },
                { id: 'c', text: 'unique = [p for p in providers if p not in unique]', isCorrect: false },
                { id: 'd', text: 'unique = {name: fn for name, fn in providers}.items()', isCorrect: false },
            ],
            explanation:
                'This deduplication pattern requires mutating "seen" as a side effect during iteration. Pure comprehensions have no side effects — they cannot maintain state between iterations. The for loop is correct here. Option D (dict comprehension) would deduplicate by key, but dictionaries do not preserve insertion order in Python < 3.7 (they do in 3.7+).',
            wrongAnswerExplanations: {
                a: 'set() loses ordering and functions are not hashable (cannot be in a set).',
                c: 'if p not in unique would check the partial list at each step — O(n²) and would fail on tuples with functions.',
                d: 'This would work for Python 3.7+ (dicts are ordered) but returns dict_items not a list of tuples.',
            },
            tradeoff:
                'Use comprehensions for pure transformations/filters. Use explicit loops for stateful operations (deduplication, accumulation). The AutoResearch writer uses this exact deduplication pattern to prevent the same provider appearing twice in the chain when revision mode prepends it.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'p2a-q11',
            number: 11,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Abstract Base Classes',
            question: 'How could AutoResearch use ABC to enforce a consistent provider interface?',
            code: `from abc import ABC, abstractmethod

class LLMProvider(ABC):
    @abstractmethod
    def generate(self, system: str, prompt: str) -> tuple[str, int]:
        """Returns (response_text, token_count)"""
        pass

class GeminiProvider(LLMProvider):
    def generate(self, system: str, prompt: str) -> tuple[str, int]:
        # Gemini implementation
        ...

class GroqProvider(LLMProvider):
    pass  # Forgot to implement generate()

p = GroqProvider()  # What happens?`,
            answers: [
                { id: 'a', text: 'GroqProvider is created successfully and generate() returns None', isCorrect: false },
                { id: 'b', text: 'TypeError at instantiation: "Can\'t instantiate abstract class GroqProvider without implementing generate"', isCorrect: true },
                { id: 'c', text: 'Python calls the parent\'s abstractmethod implementation', isCorrect: false },
                { id: 'd', text: 'A warning is printed but the class works normally', isCorrect: false },
            ],
            explanation:
                'ABC prevents instantiation of any class that has unimplemented @abstractmethod methods. This is a compile-time (actually runtime-at-instantiation) contract enforcement — any class that inherits from LLMProvider MUST implement generate(). This would make the AutoResearch provider pattern more robust and self-documenting.',
            wrongAnswerExplanations: {
                a: 'ABC raises TypeError before __init__ runs — you cannot create the instance at all.',
                c: '@abstractmethod has no implementation to call — it is a pure interface declaration.',
                d: 'Python raises an error, not a warning.',
            },
            tradeoff:
                'ABC: enforces interface at instantiation, clear contract, IDE support. Duck typing: more flexible, no enforcement, simpler. Protocol (typing): structural subtyping, checked by mypy not at runtime. The AutoResearch codebase uses duck typing (provider functions just need to match the signature) which is valid but ABC would catch missing implementations earlier.',
        },
        {
            id: 'p2a-q12',
            number: 12,
            type: 'code',
            difficulty: 'advanced',
            topic: 'dataclasses vs TypedDict',
            question: 'Why is AgentMetrics defined as TypedDict instead of a dataclass?',
            code: `# Current — TypedDict
class AgentMetrics(TypedDict):
    agent: str
    latency_ms: float
    tokens_used: int

# Alternative — dataclass
@dataclass
class AgentMetrics:
    agent: str
    latency_ms: float
    tokens_used: int

# LangGraph state:
class ResearchState(TypedDict):
    metrics: list[AgentMetrics]`,
            answers: [
                { id: 'a', text: 'TypedDict is faster than dataclass', isCorrect: false },
                { id: 'b', text: 'TypedDict instances ARE plain dicts at runtime — JSON serialisable, compatible with LangGraph state, and directly usable with dict operations', isCorrect: true },
                { id: 'c', text: 'dataclass cannot store float values', isCorrect: false },
                { id: 'd', text: 'TypedDict supports inheritance; dataclass does not', isCorrect: false },
            ],
            explanation:
                'A TypedDict instance is literally a plain Python dict at runtime. AgentMetrics(agent="planner", latency_ms=2.1, tokens_used=174) creates {"agent": "planner", "latency_ms": 2.1, "tokens_used": 174}. This is directly JSON serialisable (json.dumps()), directly usable in LangGraph state, and directly iterable with .items(). A dataclass instance is a class object — it needs extra work to serialise.',
            wrongAnswerExplanations: {
                a: 'TypedDict adds no runtime overhead — it is just a dict.',
                c: 'Dataclasses support all Python types including float.',
                d: 'Both support inheritance.',
            },
            tradeoff:
                'TypedDict: dict-compatible, no methods, no runtime validation, JSON-ready. dataclass: has methods, __repr__, __eq__, optional frozen (immutable), not a dict. Pydantic: runtime validation, serialisation helpers, heavier. Use TypedDict for data flowing through systems that expect dicts (LangGraph, JSON APIs). Use dataclass for domain objects with behaviour.',
            codeReference: 'autoresearch-backend/app/graph/state.py',
        },
        {
            id: 'p2a-q13',
            number: 13,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'map() and filter()',
            question: 'What is the modern Pythonic equivalent of map() and filter()?',
            code: `metrics = [
    {"agent": "planner", "tokens_used": 174},
    {"agent": "search",  "tokens_used": 0},
    {"agent": "writer",  "tokens_used": 3122},
]

# Old style
total = sum(map(lambda m: m["tokens_used"], metrics))

# Modern style
total = sum(m["tokens_used"] for m in metrics)

# filter old style
llm_metrics = list(filter(lambda m: m["tokens_used"] > 0, metrics))

# Modern style
llm_metrics = [m for m in metrics if m["tokens_used"] > 0]`,
            answers: [
                { id: 'a', text: 'map() and filter() are deprecated and should not be used', isCorrect: false },
                { id: 'b', text: 'Generator expressions replace map() and list comprehensions replace filter() — both are more readable in Python', isCorrect: true },
                { id: 'c', text: 'map() is faster so should always be preferred', isCorrect: false },
                { id: 'd', text: 'They are identical in performance and readability', isCorrect: false },
            ],
            explanation:
                'In Python, list comprehensions and generator expressions are generally preferred over map()/filter() for readability. sum(m["tokens_used"] for m in metrics) reads as English. map(lambda m: m["tokens_used"], metrics) requires mentally parsing a lambda. Both work correctly — it is a style preference with Python community consensus favouring comprehensions.',
            wrongAnswerExplanations: {
                a: 'map() and filter() are NOT deprecated — they are in the standard library. Just less commonly used in modern Python.',
                c: 'Performance is nearly identical for most use cases.',
                d: 'Readability differs significantly — comprehensions read more naturally.',
            },
            tradeoff:
                'map()/filter(): functional programming style, lazy (returns iterators in Python 3), familiar to JS/Java developers. Comprehensions: Pythonic, readable, can combine map+filter in one expression. For complex transformations, comprehensions win on readability.',
            codeReference: 'autoresearch-backend/app/graph/workflow.py',
        },
        {
            id: 'p2a-q14',
            number: 14,
            type: 'code',
            difficulty: 'advanced',
            topic: '__repr__ and __str__',
            question: 'What is the difference between __repr__ and __str__ in Python?',
            code: `class QualityScore:
    def __init__(self, completeness, accuracy, coherence):
        self.total = completeness + accuracy + coherence

    def __repr__(self):
        return f"QualityScore(total={self.total})"

    def __str__(self):
        return f"Quality: {self.total}/30"

score = QualityScore(8, 7, 9)
print(str(score))   # ?
print(repr(score))  # ?`,
            answers: [
                { id: 'a', text: 'Both print "QualityScore(total=24)"', isCorrect: false },
                { id: 'b', text: 'str() prints "Quality: 24/30". repr() prints "QualityScore(total=24)"', isCorrect: true },
                { id: 'c', text: 'str() prints "QualityScore(total=24)". repr() prints "Quality: 24/30"', isCorrect: false },
                { id: 'd', text: 'Both print "Quality: 24/30"', isCorrect: false },
            ],
            explanation:
                '__str__ is for human-readable output — used by print(), str(), f-strings. __repr__ is for developer/debugging output — used by repr(), in the REPL, and when __str__ is not defined. Convention: __repr__ should ideally return a string that could recreate the object.',
            wrongAnswerExplanations: {
                a: 'print() uses __str__, not __repr__.',
                c: 'These are reversed — __str__ is for users, __repr__ is for developers.',
                d: 'repr() specifically calls __repr__, not __str__.',
            },
            tradeoff:
                'Always define __repr__ for custom classes — it makes debugging much easier. Define __str__ only when you need user-friendly output that differs from the debug representation. If only __repr__ is defined, str() falls back to __repr__.',
        },
        {
            id: 'p2a-q15',
            number: 15,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Metaclasses and class creation',
            question: 'What is a metaclass in Python and when would you encounter one?',
            answers: [
                { id: 'a', text: 'A class that cannot be instantiated', isCorrect: false },
                { id: 'b', text: 'A class whose instances are classes — it controls how classes themselves are created, used by frameworks like Pydantic, SQLAlchemy, and ABC', isCorrect: true },
                { id: 'c', text: 'A class with only static methods', isCorrect: false },
                { id: 'd', text: 'A class that inherits from multiple parent classes', isCorrect: false },
            ],
            explanation:
                'In Python, everything is an object — including classes. type is the default metaclass (type of all classes). Custom metaclasses intercept class creation to add behaviour. Pydantic uses metaclasses to automatically generate validators. SQLAlchemy uses them to map class attributes to database columns. FastAPI uses them for automatic OpenAPI schema generation.',
            wrongAnswerExplanations: {
                a: 'That describes abstract classes (ABC). Metaclasses are different.',
                c: 'That describes utility classes. Static methods and metaclasses are unrelated.',
                d: 'That describes multiple inheritance. Metaclasses control class creation itself.',
            },
            tradeoff:
                'Metaclasses are powerful but complex — "if you wonder whether you need a metaclass, you don\'t" (Tim Peters). In most cases, class decorators or __init_subclass__ achieve the same goals with less complexity. You encounter metaclasses as a USER in FastAPI (Pydantic BaseModel) and SQLAlchemy ORM, even if you never write one.',
        },
        {
            id: 'p2a-q16',
            number: 16,
            type: 'code',
            difficulty: 'expert',
            topic: 'Async generators',
            question: 'The frontend lib/api.ts uses an async generator. What is async function* in TypeScript/Python?',
            code: `# Python equivalent of the TS async generator
async def stream_research_async(query: str):
    async for chunk in make_streaming_request(query):
        event_type, data = parse_sse(chunk)
        yield {"event": event_type, "data": data}

# TypeScript (from your frontend)
async function* streamResearch(query: string) {
    const reader = response.body.getReader()
    while (true) {
        const { done, value } = await reader.read()
        if (done) break
        yield { event: eventType, data: JSON.parse(dataLine) }
    }
}`,
            answers: [
                { id: 'a', text: 'async generators are just regular generators that can also use await', isCorrect: false },
                { id: 'b', text: 'async generators combine asynchronous I/O (await) with lazy value production (yield) — each yield can pause for async operations before producing the next value', isCorrect: true },
                { id: 'c', text: 'async and yield cannot be used in the same function', isCorrect: false },
                { id: 'd', text: 'async generators automatically run in a thread pool', isCorrect: false },
            ],
            explanation:
                'An async generator (async def + yield) can both await async operations AND lazily yield values. This is perfect for streaming — await reader.read() waits for the next HTTP chunk, then yield sends the parsed event to the consumer. The consumer uses "async for" or "for await...of" (TypeScript) to iterate.',
            wrongAnswerExplanations: {
                a: 'That is technically true but undersells the power — the combination enables streaming async I/O patterns.',
                c: 'async and yield are completely compatible in Python 3.6+ and TypeScript.',
                d: 'async is cooperative concurrency (event loop), not thread-based.',
            },
            tradeoff:
                'Regular generator: sync only. Async generator: works with async I/O. Regular async function: returns one value. The frontend uses an async generator because reading from a network stream (reader.read()) is inherently async — you must await each chunk.',
            codeReference: 'autoresearch-frontend/lib/api.ts',
        },
        {
            id: 'p2a-q17',
            number: 17,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Python GIL',
            question: 'Why does Python\'s GIL (Global Interpreter Lock) not significantly affect the AutoResearch parallel search?',
            code: `# Parallel Tavily searches using threads
with ThreadPoolExecutor(max_workers=5) as executor:
    futures = {executor.submit(search, subtask, 4): subtask
               for subtask in state["subtasks"]}`,
            answers: [
                { id: 'a', text: 'The GIL is disabled when using ThreadPoolExecutor', isCorrect: false },
                { id: 'b', text: 'The GIL only blocks CPU-bound work. HTTP requests (I/O-bound) release the GIL while waiting — so 5 threads can truly run concurrently during network I/O', isCorrect: true },
                { id: 'c', text: 'Python 3.12 removed the GIL entirely', isCorrect: false },
                { id: 'd', text: 'ThreadPoolExecutor runs in a separate Python interpreter', isCorrect: false },
            ],
            explanation:
                'The GIL prevents multiple Python threads from executing Python bytecode simultaneously — it affects CPU-bound tasks. But during I/O operations (HTTP requests, file reads, sleep), the GIL is released, allowing other threads to run. Since Tavily searches are network calls (I/O-bound), threads genuinely run in parallel despite the GIL.',
            wrongAnswerExplanations: {
                a: 'The GIL cannot be disabled for regular CPython threads.',
                c: 'Python 3.12 introduced experimental no-GIL mode (PEP 703) but it is not the default.',
                d: 'All Python threads share the same interpreter and GIL.',
            },
            tradeoff:
                'For I/O-bound tasks (HTTP, database, file): threads work well despite GIL. For CPU-bound tasks (matrix math, image processing): use multiprocessing (separate processes, separate GILs) or NumPy/PyTorch which release the GIL internally. This is why ML frameworks use C extensions — they release the GIL during computation.',
            codeReference: 'autoresearch-backend/app/agents/search.py',
        },
        {
            id: 'p2a-q18',
            number: 18,
            type: 'code',
            difficulty: 'expert',
            topic: 'Type Hints — Callable and tuple',
            question: 'What does this type hint mean in the provider chain?',
            code: `providers: list[tuple[str, callable]] = [
    ("groq-scout",  lambda q: _try_groq(q, GROQ_MODEL_FAST)),
    ("groq-qwen3",  lambda q: _try_groq(q, GROQ_MODEL_QWEN)),
    ("groq-70b",    lambda q: _try_groq(q, GROQ_MODEL)),
    ("static-fallback", _static_fallback),
]`,
            answers: [
                { id: 'a', text: 'A list of strings', isCorrect: false },
                { id: 'b', text: 'A list where each element is a tuple of (provider_name: str, provider_function: callable)', isCorrect: true },
                { id: 'c', text: 'callable is not a valid type hint', isCorrect: false },
                { id: 'd', text: 'tuple[str, callable] means a tuple of any length containing strings and callables', isCorrect: false },
            ],
            explanation:
                'list[tuple[str, callable]] means: a list where each element is a 2-tuple whose first element is a str (provider name) and second is a callable (any function, lambda, or method). This is the fallback chain data structure — iterate it and call each fn until one succeeds.',
            wrongAnswerExplanations: {
                a: 'It is a list of tuples, not strings.',
                c: 'callable is a valid type hint in Python (from builtins). More precise: Callable[[str], tuple[str, int]].',
                d: 'tuple[str, callable] with exactly two items means a fixed-length 2-tuple. tuple[str, ...] with ellipsis means variable length.',
            },
            tradeoff:
                'callable is valid but imprecise — it does not specify argument types. More precise: Callable[[str], tuple[str, int]] — a function taking a str and returning (str, int). Precise type hints help IDEs catch bugs but add verbosity. Production code often uses callable for simplicity when the signature is obvious from context.',
            codeReference: 'autoresearch-backend/app/agents/planner.py',
        },
        {
            id: 'p2a-q19',
            number: 19,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Memory Management — del and gc',
            question: 'When should you explicitly use del in Python?',
            code: `# The LangGraph state can grow large during a research job
# Should we del intermediate state after each agent?

state = planner.run(state)
# del old_state?  # Is this necessary?
state = search.run(state)`,
            answers: [
                { id: 'a', text: 'Always del variables when done — Python does not manage memory automatically', isCorrect: false },
                { id: 'b', text: 'Rarely needed — Python\'s reference counter frees memory when an object\'s reference count drops to zero. del is only needed to release large objects before they go out of scope naturally', isCorrect: true },
                { id: 'c', text: 'del is required for TypedDict objects', isCorrect: false },
                { id: 'd', text: 'del raises an error if the variable is still referenced elsewhere', isCorrect: false },
            ],
            explanation:
                'Python uses reference counting + cyclic garbage collector. When a variable goes out of scope or is reassigned, the reference count drops. At zero, memory is freed immediately. del explicitly removes a name binding and decrements the reference count. Useful for: releasing large objects (ML models, large arrays) before they would naturally go out of scope in a long-running function.',
            wrongAnswerExplanations: {
                a: 'Python absolutely manages memory automatically — del is optional.',
                c: 'TypedDict objects are plain dicts — no special handling needed.',
                d: 'del removes the NAME from the namespace. If other references exist, the object stays alive.',
            },
            tradeoff:
                'In the AutoResearch pipeline, each agent creates a new state dict (~10KB). With 5 agents plus revision, peak memory is ~100KB of state — trivial. del is not needed here. For ML pipelines loading 7GB model weights, del model followed by gc.collect() is critical for GPU memory management.',
        },
        {
            id: 'p2a-q20',
            number: 20,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Protocol — structural subtyping',
            question: 'What is typing.Protocol and how does it differ from ABC?',
            code: `from typing import Protocol

class WriterProvider(Protocol):
    def generate(self, system: str, context: str) -> tuple[str, int]:
        ...

# Does GeminiProvider satisfy WriterProvider?
class GeminiProvider:
    def generate(self, system: str, context: str) -> tuple[str, int]:
        # Gemini implementation
        return report, tokens

# No inheritance needed!
def run_writer(provider: WriterProvider, context: str):
    return provider.generate(SYSTEM, context)

run_writer(GeminiProvider(), context)  # Type checker: OK?`,
            answers: [
                { id: 'a', text: 'TypeError — GeminiProvider does not inherit from WriterProvider', isCorrect: false },
                { id: 'b', text: 'Valid — Protocol uses structural subtyping. Any class with a matching generate() method satisfies WriterProvider regardless of inheritance', isCorrect: true },
                { id: 'c', text: 'Protocol is identical to ABC', isCorrect: false },
                { id: 'd', text: 'Protocol only works with dataclasses', isCorrect: false },
            ],
            explanation:
                'Protocol implements structural subtyping (duck typing + type checker support). If GeminiProvider has a generate() method with the matching signature, it satisfies WriterProvider — no explicit inheritance needed. This is how Python\'s duck typing works, but now with type checker support. ABC requires explicit inheritance (class GeminiProvider(ABC)). Protocol does not.',
            wrongAnswerExplanations: {
                a: 'No inheritance is required for Protocol — structural matching is enough.',
                c: 'ABC: nominal subtyping (must inherit). Protocol: structural subtyping (must have matching interface). Fundamentally different.',
                d: 'Protocol works with any class.',
            },
            tradeoff:
                'Protocol: flexible, no coupling, works with third-party classes you cannot modify. ABC: enforced at instantiation, clear hierarchy, explicit. The AutoResearch provider functions satisfy an implicit protocol (each takes context: str and returns tuple[str, int]) — formalising this with Protocol would improve type safety without requiring changes to existing providers.',
        },
    ],
}

export default quiz