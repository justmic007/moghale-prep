import type { Quiz } from '@/lib/types'

const quiz: Quiz = {
    id: 'python-1b',
    title: 'Python Foundations',
    subtitle: 'Part 2 — Functions, Modules, Errors & Builtins',
    description:
        'Deep dive into Python functions, imports, error handling, and the most important built-in functions. Every question is grounded in patterns from real production Python code.',
    track: 'python',
    part: '1b',
    projectId: 'autoresearch',
    passMark: 70,
    estimatedMinutes: 20,
    prerequisites: ['python-1a'],
    questions: [
        {
            id: 'p1b-q1',
            number: 1,
            type: 'mcq',
            difficulty: 'beginner',
            topic: 'Imports',
            question: 'What is the difference between "import os" and "from os import getenv"?',
            answers: [
                { id: 'a', text: 'They are identical', isCorrect: false },
                { id: 'b', text: '"import os" loads the whole module; "from os import getenv" imports only one name into the current namespace', isCorrect: true },
                { id: 'c', text: '"from os import getenv" is slower', isCorrect: false },
                { id: 'd', text: '"import os" only works at the top of the file', isCorrect: false },
            ],
            explanation:
                '"import os" makes the os module available — you access functions as os.getenv(). "from os import getenv" imports just that name into the local namespace — you call getenv() directly. The module is loaded identically in both cases (Python caches modules).',
            wrongAnswerExplanations: {
                a: 'The namespace differs — "import os" requires os.getenv(), "from os import" allows getenv() directly.',
                c: 'Both approaches load the same underlying module — performance is identical.',
                d: 'Imports can appear anywhere in Python, including inside functions (lazy imports), though top-level is conventional.',
            },
            tradeoff:
                'Use "import module" for clarity when using many items from a module. Use "from module import x" for frequently used single names. Avoid "from module import *" — it pollutes the namespace and makes code harder to understand. The AutoResearch agents use lazy imports inside functions (from groq import Groq) to avoid loading unused provider SDKs at startup.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'p1b-q2',
            number: 2,
            type: 'code',
            difficulty: 'beginner',
            topic: 'Functions — *args and **kwargs',
            question: 'What does this function print when called as shown?',
            code: `def show_config(*args, **kwargs):
    print("args:", args)
    print("kwargs:", kwargs)

show_config("gemini", "groq", model="llama-3.3-70b", timeout=30)`,
            answers: [
                { id: 'a', text: 'args: ("gemini", "groq")\nkwargs: {"model": "llama-3.3-70b", "timeout": 30}', isCorrect: true },
                { id: 'b', text: 'args: ["gemini", "groq"]\nkwargs: {"model": "llama-3.3-70b", "timeout": 30}', isCorrect: false },
                { id: 'c', text: 'Error: too many arguments', isCorrect: false },
                { id: 'd', text: 'args: "gemini", "groq"\nkwargs: model="llama-3.3-70b"', isCorrect: false },
            ],
            explanation:
                '*args collects positional arguments as a TUPLE (not list). **kwargs collects keyword arguments as a DICT. "gemini" and "groq" are positional, so they go into args. model= and timeout= are keyword arguments, so they go into kwargs.',
            wrongAnswerExplanations: {
                b: '*args is a tuple, not a list. The parentheses () vs [] distinction matters.',
                c: '*args and **kwargs accept any number of arguments — that is their purpose.',
                d: 'args and kwargs are always a tuple and dict respectively, displayed with proper Python syntax.',
            },
            tradeoff:
                '*args and **kwargs are heavily used in the AutoResearch codebase for building flexible API call wrappers. The _call_openai_compatible function uses **kwargs to pass provider-specific options without modifying the function signature.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'p1b-q3',
            number: 3,
            type: 'mcq',
            difficulty: 'beginner',
            topic: 'Return Values',
            question: 'What does a Python function return if it has no return statement?',
            answers: [
                { id: 'a', text: '0', isCorrect: false },
                { id: 'b', text: 'False', isCorrect: false },
                { id: 'c', text: 'None', isCorrect: true },
                { id: 'd', text: 'An empty string ""', isCorrect: false },
            ],
            explanation:
                'Every Python function returns None if there is no return statement, or if the return statement has no value (just "return"). This is different from void in other languages — None is an actual object.',
            wrongAnswerExplanations: {
                a: 'Functions do not return 0 by default — that is C/C++ behaviour.',
                b: 'None and False are different objects. bool(None) is False but None is not False.',
                d: 'Empty string is falsy but distinct from None.',
            },
            tradeoff:
                'Always explicitly return values you intend to use. Relying on implicit None return makes code harder to read. In the AutoResearch agents, every run() function explicitly returns a new state dict — never relies on implicit None.',
        },
        {
            id: 'p1b-q4',
            number: 4,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'Context Managers — with',
            question: 'Why does AutoResearch use "with" for the ThreadPoolExecutor?',
            code: `with ThreadPoolExecutor(max_workers=5) as executor:
    futures = {
        executor.submit(search, subtask, 4): subtask
        for subtask in state["subtasks"]
    }
    for future, subtask in futures.items():
        hits = future.result()`,
            answers: [
                { id: 'a', text: 'Just a style choice — works the same without "with"', isCorrect: false },
                { id: 'b', text: '"with" ensures the executor is properly shut down and threads are cleaned up even if an exception occurs', isCorrect: true },
                { id: 'c', text: '"with" makes the code run faster', isCorrect: false },
                { id: 'd', text: 'ThreadPoolExecutor only works inside a "with" block', isCorrect: false },
            ],
            explanation:
                'Context managers implement __enter__ and __exit__. ThreadPoolExecutor.__exit__ calls executor.shutdown(wait=True) — it waits for all submitted tasks to complete and releases thread resources. Without "with", you must manually call shutdown() or risk resource leaks.',
            wrongAnswerExplanations: {
                a: 'Without "with", if an exception occurs before shutdown(), threads may be left running and memory leaked.',
                c: 'Context managers do not affect speed — they ensure cleanup.',
                d: 'You can use executor = ThreadPoolExecutor() and manually shutdown(), but "with" is the recommended pattern.',
            },
            tradeoff:
                '"with" (context manager): automatic cleanup, safe on exceptions, readable. Manual try/finally: more control, more verbose. Always prefer context managers for resources (files, connections, thread pools, database sessions) — they prevent resource leaks.',
            codeReference: 'autoresearch-backend/app/agents/search.py',
        },
        {
            id: 'p1b-q5',
            number: 5,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'f-strings — Advanced',
            question: 'What does this f-string produce?',
            code: `provider = "groq"
latency = 1593.7
tokens = 174
print(f"  {provider:<12} {latency:>9.0f}ms   {tokens:>8}")`,
            answers: [
                { id: 'a', text: '  groq         1594ms        174', isCorrect: true },
                { id: 'b', text: '  groq 1593.7ms 174', isCorrect: false },
                { id: 'c', text: '  groq         1593.7ms      174', isCorrect: false },
                { id: 'd', text: 'Error: invalid format', isCorrect: false },
            ],
            explanation:
                '{provider:<12} left-aligns in 12 chars. {latency:>9.0f}ms right-aligns in 9 chars with 0 decimal places (rounds 1593.7 to 1594). {tokens:>8} right-aligns in 8 chars.',
            wrongAnswerExplanations: {
                b: 'Format specs control alignment and decimal places — .0f rounds to 0 decimal places.',
                c: '.0f means zero decimal places, so 1593.7 becomes 1594.',
                d: 'This is valid f-string format specification.',
            },
            tradeoff:
                'This exact pattern is used in the AutoResearch printer.py and benchmark.py to create aligned output tables. Format specs (<, >, ^) make terminal output readable without external libraries. For complex reporting, consider rich or tabulate libraries.',
            codeReference: 'autoresearch-backend/app/utils/printer.py',
        },
        {
            id: 'p1b-q6',
            number: 6,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Closures',
            question: 'What is a closure in Python and why does the AutoResearch writer use lambda functions that can cause a bug?',
            code: `# Potential bug — lambda captures variable by reference
providers = []
for model in ["gpt-4", "claude", "gemini"]:
    providers.append((model, lambda c: call_api(c, model)))

# All lambdas will use the LAST value of model ("gemini")`,
            answers: [
                { id: 'a', text: 'A closure captures variable values at the time of creation', isCorrect: false },
                { id: 'b', text: 'A closure captures variable REFERENCES not values — the lambda will use whatever model is at call time, not creation time', isCorrect: true },
                { id: 'c', text: 'Lambdas cannot be used inside loops', isCorrect: false },
                { id: 'd', text: 'This code raises a SyntaxError', isCorrect: false },
            ],
            explanation:
                'Closures capture variables by reference, not value. When all lambdas are created in the loop, they all reference the same variable "model". By the time they are called, the loop has finished and "model" is "gemini". This is why the AutoResearch writer.py uses named functions instead of lambdas in the provider list.',
            wrongAnswerExplanations: {
                a: 'This is the common misconception — closures capture references, not values.',
                c: 'Lambdas can be used in loops — but you must be aware of the closure behaviour.',
                d: 'The code is syntactically valid — the bug is runtime behaviour.',
            },
            tradeoff:
                'Fix 1: Use default argument to capture value: lambda c, m=model: call_api(c, m). Fix 2: Use named functions. Fix 3: Use functools.partial. The AutoResearch codebase avoids this by using named functions (_try_gemini, _try_groq) rather than lambdas with captured variables.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'p1b-q7',
            number: 7,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'String Methods',
            question: 'What does this string processing code return?',
            code: `raw = "\`\`\`json\n{\"subtasks\": [\"a\", \"b\"]}\n\`\`\`"
if raw.startswith("\`\`\`"):
    parts = raw.split("\`\`\`")
    raw = parts[1] if len(parts) > 1 else raw
    if raw.startswith("json"):
        raw = raw[4:]
    raw = raw.strip()
print(raw)`,
            answers: [
                { id: 'a', text: '{"subtasks": ["a", "b"]}', isCorrect: true },
                { id: 'b', text: '```json\n{"subtasks": ["a", "b"]}\n```', isCorrect: false },
                { id: 'c', text: 'json\n{"subtasks": ["a", "b"]}', isCorrect: false },
                { id: 'd', text: 'Error: invalid escape', isCorrect: false },
            ],
            explanation:
                'This is the exact markdown fence stripping logic from the AutoResearch agents. 1) Check if wrapped in ``` fences. 2) Split on ``` to get inner content. 3) Strip the "json" language hint. 4) Strip whitespace. Result: clean JSON string.',
            wrongAnswerExplanations: {
                b: 'The code explicitly strips the fences.',
                c: '"json" prefix is stripped by raw = raw[4:] (skip first 4 chars).',
                d: 'The backticks are valid Python string characters.',
            },
            tradeoff:
                'LLMs often wrap JSON responses in markdown code fences even when instructed not to. Robust parsing must handle both clean JSON and fenced JSON. This defensive parsing is critical for production AI systems — always sanitise LLM output before parsing.',
            codeReference: 'autoresearch-backend/app/agents/planner.py',
        },
        {
            id: 'p1b-q8',
            number: 8,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'sorted() and key parameter',
            question: 'How does this sort work in redis_state.py?',
            code: `return sorted(jobs, key=lambda x: x["finished_at"] or 0, reverse=True)`,
            answers: [
                { id: 'a', text: 'Sorts alphabetically by finished_at string', isCorrect: false },
                { id: 'b', text: 'Sorts by finished_at timestamp descending (newest first), using 0 if finished_at is None', isCorrect: true },
                { id: 'c', text: 'Sorts by multiple keys simultaneously', isCorrect: false },
                { id: 'd', text: 'Creates a new sorted dict', isCorrect: false },
            ],
            explanation:
                'sorted() with key= extracts a comparison value from each element. lambda x: x["finished_at"] or 0 gets the timestamp, defaulting to 0 if None. reverse=True gives descending order (newest first). Returns a new sorted list.',
            wrongAnswerExplanations: {
                a: 'finished_at is a Unix timestamp (float), not a string.',
                c: 'key= extracts a single value per element. For multiple keys, use a tuple: key=lambda x: (x["a"], x["b"]).',
                d: 'sorted() works on any iterable and returns a list, not a dict.',
            },
            tradeoff:
                'sorted() returns a new list (non-destructive). list.sort() sorts in place (destructive, faster for large lists). Use sorted() when you need the original preserved. Use sort() when you are done with the original order.',
            codeReference: 'autoresearch-backend/app/memory/redis_state.py',
        },
        {
            id: 'p1b-q9',
            number: 9,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'any() and all()',
            question: 'What do any() and all() return in these examples?',
            code: `prereqs = ["python-1a", "python-1b"]
progress = {"python-1a": {"passed": True}, "python-1b": {"passed": False}}

result_all = all(progress.get(p, {}).get("passed") for p in prereqs)
result_any = any(progress.get(p, {}).get("passed") for p in prereqs)`,
            answers: [
                { id: 'a', text: 'result_all = True, result_any = True', isCorrect: false },
                { id: 'b', text: 'result_all = False, result_any = True', isCorrect: true },
                { id: 'c', text: 'result_all = False, result_any = False', isCorrect: false },
                { id: 'd', text: 'Error: NoneType not iterable', isCorrect: false },
            ],
            explanation:
                'all() returns True only if EVERY element is truthy. python-1b has passed=False so all() is False. any() returns True if AT LEAST ONE element is truthy. python-1a has passed=True so any() is True.',
            wrongAnswerExplanations: {
                a: 'python-1b has passed=False so all() cannot be True.',
                c: 'python-1a has passed=True so any() is True.',
                d: '.get() returns None for missing keys, which is falsy but not an error in any()/all().',
            },
            tradeoff:
                'any() and all() short-circuit — they stop as soon as the result is determined. all() stops on the first False. any() stops on the first True. This makes them efficient for large sequences. This exact pattern is used in progress.ts isQuizUnlocked() function.',
            codeReference: 'moghale-prep/lib/progress.ts',
        },
        {
            id: 'p1b-q10',
            number: 10,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'try/except/finally',
            question: 'What is printed by this code?',
            code: `def save_to_redis(data):
    try:
        result = redis_client.set("key", data)
        return result
    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        print("Cleanup complete")

val = save_to_redis("test")
print(f"Result: {val}")`,
            answers: [
                { id: 'a', text: 'Cleanup complete\nResult: True', isCorrect: true },
                { id: 'b', text: 'Result: True\nCleanup complete', isCorrect: false },
                { id: 'c', text: 'Cleanup complete only runs on error', isCorrect: false },
                { id: 'd', text: 'finally blocks prevent the return value from being returned', isCorrect: false },
            ],
            explanation:
                'The finally block ALWAYS runs — whether the try succeeded, failed, or returned. It runs before the function actually returns to the caller. So "Cleanup complete" prints first, then the function returns True, then "Result: True" prints.',
            wrongAnswerExplanations: {
                b: 'finally executes before the return value is passed to the caller.',
                c: 'finally runs unconditionally — success or failure.',
                d: 'finally does not block the return value — it just runs first.',
            },
            tradeoff:
                'Use finally for guaranteed cleanup (close files, release connections, log completion). In the AutoResearch streaming endpoint, finally would ensure the response is properly closed even if an agent throws an exception mid-stream.',
        },
        {
            id: 'p1b-q11',
            number: 11,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Generators — yield',
            question: 'Why does stream_research() use "yield" instead of returning a list of events?',
            code: `def stream_research(query: str, thread_id: str):
    # Each agent fires an event as it completes
    state = planner.run(state)
    yield emit("agent_done", {"agent": "planner", ...})

    state = search.run(state)
    yield emit("agent_done", {"agent": "search", ...})
    # ... continues for each agent`,
            answers: [
                { id: 'a', text: 'yield is just a preference — return would work identically', isCorrect: false },
                { id: 'b', text: 'yield makes stream_research a generator — it sends each event to the client immediately as each agent completes rather than waiting for all 5 agents to finish', isCorrect: true },
                { id: 'c', text: 'yield is required by FastAPI for streaming responses', isCorrect: false },
                { id: 'd', text: 'yield uses less memory than return', isCorrect: false },
            ],
            explanation:
                'A generator function (using yield) pauses and sends a value to the caller each time yield is reached. For SSE streaming, this means the client receives the "planner done" event immediately after the Planner finishes — it does not wait 30+ seconds for all agents to complete. This is what makes the frontend pipeline animation work in real time.',
            wrongAnswerExplanations: {
                a: 'return would collect all events first then send them all at once — no real-time updates.',
                c: 'FastAPI accepts any iterable for StreamingResponse, but yield is what enables real-time streaming.',
                d: 'Memory efficiency is a secondary benefit — the primary benefit is real-time delivery.',
            },
            tradeoff:
                'Generator (yield): real-time streaming, lower memory, cannot retry. List (return): all-or-nothing, reusable, easier to debug. For user experience, real-time streaming of AI agent progress is significantly better — users see activity rather than a blank spinner.',
            codeReference: 'autoresearch-backend/app/graph/workflow.py',
        },
        {
            id: 'p1b-q12',
            number: 12,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Type Hints — Optional and Union',
            question: 'What does Optional[QualityScore] mean in the ResearchState TypedDict?',
            code: `from typing import Optional

class ResearchState(TypedDict):
    quality_score: Optional[QualityScore]`,
            answers: [
                { id: 'a', text: 'The field is optional and can be omitted from the dict entirely', isCorrect: false },
                { id: 'b', text: 'Optional[X] is equivalent to Union[X, None] — the value can be QualityScore OR None', isCorrect: true },
                { id: 'c', text: 'Optional means the type hint is just a suggestion', isCorrect: false },
                { id: 'd', text: 'Optional fields are automatically set to None if missing', isCorrect: false },
            ],
            explanation:
                'Optional[QualityScore] is exactly equivalent to Union[QualityScore, None]. It means the value can be either a QualityScore dict or None. In the state, quality_score starts as None (no score yet) and becomes a QualityScore after the Critic agent runs. This models the concept of "not yet computed".',
            wrongAnswerExplanations: {
                a: 'In TypedDict, Optional means the VALUE can be None, not that the KEY can be absent. To make a key truly optional in TypedDict, use total=False.',
                c: 'Type hints are checked by static analysers (mypy, pyright) — they are not just documentation.',
                d: 'Python does not automatically set values — you must initialise them explicitly in initial_state().',
            },
            tradeoff:
                'Python 3.10+ allows X | None syntax instead of Optional[X]. Both mean the same thing. Optional is explicit and readable. The newer | syntax is more concise. Production code often uses Optional for clarity since many developers still work with Python 3.8/3.9.',
            codeReference: 'autoresearch-backend/app/graph/state.py',
        },
        {
            id: 'p1b-q13',
            number: 13,
            type: 'code',
            difficulty: 'advanced',
            topic: 'Dictionary Spreading — **state',
            question: 'Why do all AutoResearch agent run() functions return {**state, "subtasks": subtasks} instead of modifying state directly?',
            code: `# Pattern used in every agent:
return {
    **state,
    "subtasks": subtasks,
    "metrics": state["metrics"] + [metric],
}`,
            answers: [
                { id: 'a', text: 'It is just style — modifying state["subtasks"] = subtasks would work the same', isCorrect: false },
                { id: 'b', text: '**state creates a shallow copy with specific keys overridden — LangGraph requires immutable state updates to track changes and enable checkpointing', isCorrect: true },
                { id: 'c', text: '** is required syntax for TypedDict updates', isCorrect: false },
                { id: 'd', text: 'It prevents the original state from being garbage collected', isCorrect: false },
            ],
            explanation:
                '{**state, "key": new_value} creates a NEW dict with all of state\'s keys, plus the overridden values. LangGraph\'s state machine is built around immutable state transitions — each agent returns a new state rather than mutating the shared one. This enables proper diff tracking, checkpointing, and concurrent execution.',
            wrongAnswerExplanations: {
                a: 'Directly mutating state["subtasks"] would break LangGraph\'s change detection and could cause issues with concurrent agents.',
                c: '**spreading is standard Python dict syntax, not TypedDict-specific.',
                d: 'Python\'s garbage collector handles memory — this is about immutability patterns.',
            },
            tradeoff:
                'Immutable state (new dict each time): safe for concurrent access, enables undo/replay, more memory. Mutable state (modify in place): less memory, simpler code, dangerous in concurrent systems. LangGraph follows the functional/immutable pattern used in Redux (JavaScript) and Elm.',
            codeReference: 'autoresearch-backend/app/agents/planner.py',
        },
        {
            id: 'p1b-q14',
            number: 14,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'hasattr and getattr',
            question: 'Why does the AutoResearch embedder use hasattr()?',
            code: `tokens = response.usage_metadata.total_token_count \
    if response.usage_metadata else 0`,
            answers: [
                { id: 'a', text: 'hasattr() is faster than try/except', isCorrect: false },
                { id: 'b', text: 'Different AI provider responses have different structures — usage_metadata may not exist on all responses, and checking prevents AttributeError', isCorrect: true },
                { id: 'c', text: 'usage_metadata is deprecated', isCorrect: false },
                { id: 'd', text: 'It converts the attribute to an integer', isCorrect: false },
            ],
            explanation:
                'Different providers return different response structures. Gemini has response.usage_metadata but other providers may not. Checking truthiness (if response.usage_metadata) handles both AttributeError and None cases gracefully. The pattern is defensive programming for heterogeneous API responses.',
            wrongAnswerExplanations: {
                a: 'Performance is not the reason — correctness is.',
                c: 'usage_metadata is specific to the Google Gemini SDK — not deprecated.',
                d: 'The conditional expression returns the integer value or 0, but hasattr itself does not convert anything.',
            },
            tradeoff:
                'EAFP (Easier to Ask Forgiveness than Permission) — try/except: more Pythonic, handles unexpected cases. LBYL (Look Before You Leap) — hasattr/if: more explicit, clearer intent. Python generally prefers EAFP, but for simple attribute checks, the conditional is more readable.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'p1b-q15',
            number: 15,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'time module',
            question: 'How does AutoResearch measure agent latency precisely?',
            code: `def run(state: ResearchState) -> ResearchState:
    t0 = time.time()
    # ... agent work ...
    latency_ms = (time.time() - t0) * 1000
    metric = AgentMetrics(
        agent="planner",
        latency_ms=round(latency_ms, 1),
    )`,
            answers: [
                { id: 'a', text: 'time.time() returns the current time in milliseconds', isCorrect: false },
                { id: 'b', text: 'time.time() returns seconds since epoch as a float. Subtracting start from end gives elapsed seconds. Multiplying by 1000 converts to milliseconds', isCorrect: true },
                { id: 'c', text: 'time.time() pauses execution for timing', isCorrect: false },
                { id: 'd', text: 'round(latency_ms, 1) is needed to prevent negative values', isCorrect: false },
            ],
            explanation:
                'time.time() returns a float representing seconds since the Unix epoch (Jan 1 1970). Capturing t0 before work and t1 after, then (t1 - t0) * 1000 gives milliseconds elapsed. round(x, 1) gives one decimal place precision.',
            wrongAnswerExplanations: {
                a: 'time.time() returns seconds (float), not milliseconds. time.time_ns() returns nanoseconds.',
                c: 'time.sleep() pauses execution. time.time() just reads the clock.',
                d: 'round() is for display precision, not preventing negatives. Negative would only happen if clocks went backwards (NTP sync).',
            },
            tradeoff:
                'time.time(): wall clock time, affected by system clock changes. time.perf_counter(): high-resolution monotonic timer, best for benchmarking. time.process_time(): CPU time only (excludes I/O wait). For measuring API call latency (which includes network I/O), time.time() is appropriate.',
        },
        {
            id: 'p1b-q16',
            number: 16,
            type: 'code',
            difficulty: 'advanced',
            topic: 'json module',
            question: 'What does json.dumps() do and why is it used in the SSE emit function?',
            code: `def emit(event: str, data: dict) -> str:
    return f"event: {event}\\ndata: {json.dumps(data)}\\n\\n"`,
            answers: [
                { id: 'a', text: 'json.dumps() saves the dict to a JSON file', isCorrect: false },
                { id: 'b', text: 'json.dumps() serialises a Python dict to a JSON string — needed because SSE sends text, not Python objects', isCorrect: true },
                { id: 'c', text: 'json.dumps() compresses the data', isCorrect: false },
                { id: 'd', text: 'json.dumps() and str(data) produce identical output', isCorrect: false },
            ],
            explanation:
                'SSE (Server-Sent Events) is a text protocol — it can only send strings over HTTP. json.dumps() serialises the Python dict to a JSON string that can be transmitted as text and then parsed back by the JavaScript frontend using JSON.parse().',
            wrongAnswerExplanations: {
                a: 'json.dump() (no s) writes to a file. json.dumps() (with s) returns a string.',
                c: 'json.dumps() does not compress — use gzip/zlib for compression.',
                d: 'str({"key": "value"}) produces {"key": "value"} with single quotes — invalid JSON. json.dumps produces {"key": "value"} with double quotes — valid JSON.',
            },
            tradeoff:
                'json.dumps() vs str(): always use json.dumps() for data that will be parsed as JSON. str() uses Python repr format which is not valid JSON (single quotes, Python-specific types). json.dumps(data, default=str) handles non-serialisable types by converting them to strings.',
            codeReference: 'autoresearch-backend/app/graph/workflow.py',
        },
        {
            id: 'p1b-q17',
            number: 17,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Decorators — @retry',
            question: 'How does the @retry decorator from tenacity work on the Tavily search function?',
            code: `from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=2, max=6))
def search(query: str, max_results: int = 5) -> list[dict]:
    response = _client.search(query=query, max_results=max_results)
    return [...]`,
            answers: [
                { id: 'a', text: '@retry runs the function in a separate thread', isCorrect: false },
                { id: 'b', text: '@retry wraps the function — on exception, it waits then retries up to 2 times with exponential backoff (2s, then up to 6s between attempts)', isCorrect: true },
                { id: 'c', text: '@retry caches the result so the function is only called once', isCorrect: false },
                { id: 'd', text: 'Decorators modify the source code of the function', isCorrect: false },
            ],
            explanation:
                'A decorator is a function that takes a function and returns a modified version. @retry wraps search() so that on any exception: attempt 1 fails → wait 2s → attempt 2. If attempt 2 also fails, the exception propagates. wait_exponential doubles the wait time between retries up to max=6s. This handles transient Tavily API failures.',
            wrongAnswerExplanations: {
                a: 'Decorators do not run functions in threads — that requires ThreadPoolExecutor or asyncio.',
                c: 'That would be @lru_cache or @cache — caching decorators.',
                d: 'Decorators wrap functions at runtime — they do not modify source code.',
            },
            tradeoff:
                'Exponential backoff: increasingly longer waits prevent overwhelming a rate-limited API. Fixed retry delay: simpler but may hit rate limits again immediately. No retry: fails fast but loses transient successes. 2 attempts is conservative — too many retries increase latency for the user.',
            codeReference: 'autoresearch-backend/app/tools/tavily.py',
        },
        {
            id: 'p1b-q18',
            number: 18,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Lazy Imports',
            question: 'Why do the AutoResearch agent functions import provider SDKs INSIDE the function body rather than at the top of the file?',
            code: `def _try_groq(context: str) -> tuple[str, int]:
    from groq import Groq         # ← inside function, not top of file
    client = Groq(api_key=GROQ_API_KEY)
    ...

def _try_mistral(context: str) -> tuple[str, int]:
    from openai import OpenAI     # ← lazy import
    client = OpenAI(base_url="https://api.mistral.ai/v1", ...)`,
            answers: [
                { id: 'a', text: 'It is a mistake — imports should always be at the top', isCorrect: false },
                { id: 'b', text: 'Lazy imports mean the SDK is only loaded if that provider is actually called — saving startup time and memory if a provider is never used', isCorrect: true },
                { id: 'c', text: 'Inside-function imports are faster to execute', isControls: false, isCorrect: false },
                { id: 'd', text: 'It prevents circular import errors', isCorrect: false },
            ],
            explanation:
                'With 12 providers, importing all SDKs at module level would load and initialise every client even if only one is used. Lazy imports inside functions only load the SDK when that specific provider is called. This reduces cold start time on Render and saves ~50-200MB of memory if most fallbacks are never triggered.',
            wrongAnswerExplanations: {
                a: 'PEP 8 recommends top-level imports generally, but lazy imports are valid for optional/heavy dependencies.',
                c: 'The first call is slower (import overhead), subsequent calls use Python\'s module cache and are fast.',
                d: 'Circular imports are a different problem — lazy imports can help but that is not the reason here.',
            },
            tradeoff:
                'Top-level imports: faster after first call, clear dependencies, PEP 8 compliant. Lazy imports: faster startup, lower memory if unused, harder to see all dependencies at a glance. Use lazy imports for optional heavy dependencies (ML models, rarely-used SDKs) and top-level for always-used core modules.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'p1b-q19',
            number: 19,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Concurrency — ThreadPoolExecutor vs asyncio',
            question: 'The AutoResearch search agent uses ThreadPoolExecutor for parallel Tavily calls. Why not asyncio?',
            code: `with ThreadPoolExecutor(max_workers=5) as executor:
    futures = {executor.submit(search, subtask, 4): subtask
               for subtask in state["subtasks"]}`,
            answers: [
                { id: 'a', text: 'asyncio is harder to write so threads were chosen for simplicity', isCorrect: false },
                { id: 'b', text: 'The Tavily SDK uses synchronous (blocking) HTTP calls. asyncio requires async-native code. ThreadPoolExecutor runs blocking calls in parallel without rewriting the SDK', isCorrect: true },
                { id: 'c', text: 'ThreadPoolExecutor is always faster than asyncio', isCorrect: false },
                { id: 'd', text: 'asyncio cannot make HTTP requests', isCorrect: false },
            ],
            explanation:
                'asyncio requires the called code to be async — either using await or async-native libraries. The Tavily SDK is synchronous. To run 5 synchronous HTTP calls in parallel without rewriting the SDK, ThreadPoolExecutor is correct — each call runs in its own thread. asyncio would require switching to httpx or aiohttp with await.',
            wrongAnswerExplanations: {
                a: 'The technical reason (sync SDK) is the real driver — not simplicity.',
                c: 'asyncio is generally more efficient for I/O-bound tasks with many concurrent operations. For 5 concurrent calls, the difference is negligible.',
                d: 'asyncio absolutely can make HTTP requests — with async libraries like httpx, aiohttp.',
            },
            tradeoff:
                'ThreadPoolExecutor: works with sync code, actual OS threads, GIL-limited for CPU tasks but fine for I/O. asyncio: more efficient for thousands of concurrent I/O operations, requires async-native code throughout. For 5 parallel search calls, threads are perfectly adequate.',
            codeReference: 'autoresearch-backend/app/agents/search.py',
        },
        {
            id: 'p1b-q20',
            number: 20,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Production Python — dotenv and 12-Factor App',
            question: 'Why does config.py call load_dotenv() and what happens in production on Render?',
            code: `from dotenv import load_dotenv
load_dotenv()

GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]`,
            answers: [
                { id: 'a', text: 'load_dotenv() is required for os.environ to work', isCorrect: false },
                { id: 'b', text: 'load_dotenv() reads .env file and loads vars into os.environ locally. In production (Render), the vars are already in the environment — load_dotenv() is a no-op but harmless', isCorrect: true },
                { id: 'c', text: 'load_dotenv() must be called before every os.environ access', isCorrect: false },
                { id: 'd', text: '.env files are pushed to GitHub and loaded in production', isCorrect: false },
            ],
            explanation:
                'python-dotenv reads .env file (which is in .gitignore) and populates os.environ with its values. Locally, developers use .env files. In production (Render, Vercel), env vars are set directly in the platform dashboard — os.environ already contains them. load_dotenv() calls load_dotenv(override=False) by default so it does not overwrite existing env vars.',
            wrongAnswerExplanations: {
                a: 'os.environ works independently of dotenv — it reads from the process environment which the OS sets.',
                c: 'load_dotenv() only needs to be called once at startup, not before each access.',
                d: '.env files should NEVER be committed to git — they contain secrets. .gitignore excludes them.',
            },
            tradeoff:
                'The 12-Factor App methodology (12factor.net) mandates storing config in environment variables — not config files, not hardcoded. This makes the same code work locally (.env) and in production (platform env vars) without any code changes. This is considered best practice for all production applications.',
            codeReference: 'autoresearch-backend/app/config.py',
        },
    ],
}

export default quiz