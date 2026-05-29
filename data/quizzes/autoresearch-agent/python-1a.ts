import type { Quiz } from '@/lib/types'

const quiz: Quiz = {
    id: 'python-1a',
    title: 'Python Foundations',
    subtitle: 'Part 1 — Data Types, Variables & Control Flow',
    description:
        'Master the building blocks of Python: data types, variables, operators, truthiness, and control flow. Every question maps to patterns you will see in production Python code.',
    track: 'python',
    part: '1a',
    projectId: 'autoresearch',
    passMark: 70,
    estimatedMinutes: 20,
    prerequisites: [],
    questions: [
        {
            id: 'p1a-q1',
            number: 1,
            type: 'mcq',
            difficulty: 'beginner',
            topic: 'Data Types',
            question: 'Which of these is an immutable data type in Python?',
            answers: [
                { id: 'a', text: 'list', isCorrect: false },
                { id: 'b', text: 'dict', isCorrect: false },
                { id: 'c', text: 'tuple', isCorrect: true },
                { id: 'd', text: 'set', isCorrect: false },
            ],
            explanation:
                'A tuple is immutable — once created, its elements cannot be changed. This makes tuples hashable and usable as dictionary keys, unlike lists.',
            wrongAnswerExplanations: {
                a: 'Lists are mutable — you can append, remove, or change elements after creation.',
                b: 'Dicts are mutable — keys and values can be added, removed, or updated.',
                d: 'Sets are mutable — you can add and discard elements. frozenset is the immutable version.',
            },
            tradeoff:
                'Use tuples when data should never change (e.g. RGB colours, coordinates). Use lists when you need to modify the collection. Tuples use ~15% less memory than equivalent lists.',
        },
        {
            id: 'p1a-q2',
            number: 2,
            type: 'code',
            difficulty: 'beginner',
            topic: 'Variables & References',
            question: 'What does this code print?',
            code: `x = [1, 2, 3]
y = x
y.append(4)
print(x)`,
            answers: [
                { id: 'a', text: '[1, 2, 3]', isCorrect: false },
                { id: 'b', text: '[1, 2, 3, 4]', isCorrect: true },
                { id: 'c', text: 'Error', isCorrect: false },
                { id: 'd', text: '[4]', isCorrect: false },
            ],
            explanation:
                'In Python, assignment copies the reference, not the object. Both x and y point to the same list in memory. Appending to y modifies the shared list, so x also reflects the change.',
            wrongAnswerExplanations: {
                a: 'This would be correct only if y = x[:] or y = x.copy() was used to create an independent copy.',
                c: 'There is no error here. Both variables are valid references to the same list.',
                d: 'y.append(4) adds to the existing list, it does not replace it.',
            },
            tradeoff:
                'Use y = x.copy() for a shallow copy, or copy.deepcopy(x) for nested structures. In the AutoResearch codebase, LangGraph state uses TypedDict which is returned as a new dict on each update to avoid this mutation issue.',
            codeReference: 'autoresearch-backend/app/graph/state.py',
        },
        {
            id: 'p1a-q3',
            number: 3,
            type: 'mcq',
            difficulty: 'beginner',
            topic: 'Truthiness',
            question: 'Which of these values is falsy in Python?',
            answers: [
                { id: 'a', text: '"False"', isCorrect: false },
                { id: 'b', text: '[]', isCorrect: true },
                { id: 'c', text: '1', isCorrect: false },
                { id: 'd', text: '"0"', isCorrect: false },
            ],
            explanation:
                'An empty list [] is falsy in Python. Falsy values include: False, None, 0, 0.0, "", [], {}, set(), and any object whose __bool__ returns False.',
            wrongAnswerExplanations: {
                a: '"False" is a non-empty string — all non-empty strings are truthy, even the string "False".',
                c: '1 is truthy. Only 0 and 0.0 are falsy among numbers.',
                d: '"0" is a non-empty string and therefore truthy.',
            },
            tradeoff:
                'Using truthiness directly (if my_list:) is more Pythonic than (if len(my_list) > 0:) and handles None safely. In the AutoResearch writer agent, "if result and len(result.strip()) > 100:" checks both truthiness and minimum length.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'p1a-q4',
            number: 4,
            type: 'code',
            difficulty: 'beginner',
            topic: 'String Formatting',
            question: 'What is the output of this code?',
            code: `name = "Micah"
score = 24
print(f"  {name:<10} {score:>5}/30")`,
            answers: [
                { id: 'a', text: '  Micah      24/30', isCorrect: false },
                { id: 'b', text: '  Micah          24/30', isCorrect: false },
                { id: 'c', text: '  Micah        24/30', isCorrect: true },
                { id: 'd', text: 'Error: invalid format spec', isCorrect: false },
            ],
            explanation:
                'f-string format spec: {name:<10} left-aligns "Micah" in a 10-char field (padded with spaces on right). {score:>5} right-aligns 24 in a 5-char field. So "Micah     " + "   24" + "/30".',
            wrongAnswerExplanations: {
                a: 'Close but the spacing is slightly off — the right-align on score adds spaces before it.',
                b: 'Too many spaces — the fields are 10 and 5 chars respectively.',
                d: 'This is valid Python f-string syntax — < means left-align, > means right-align.',
            },
            tradeoff:
                'f-strings are fastest and most readable. .format() is compatible with older code. % formatting is legacy. The AutoResearch printer.py uses this exact pattern to align the agent metrics table.',
            codeReference: 'autoresearch-backend/app/utils/printer.py',
        },
        {
            id: 'p1a-q5',
            number: 5,
            type: 'mcq',
            difficulty: 'beginner',
            topic: 'is vs ==',
            question: 'What is the difference between "is" and "==" in Python?',
            answers: [
                { id: 'a', text: 'They are identical — both check value equality', isCorrect: false },
                { id: 'b', text: '"is" checks identity (same object in memory), "==" checks value equality', isCorrect: true },
                { id: 'c', text: '"==" checks identity, "is" checks value equality', isCorrect: false },
                { id: 'd', text: '"is" only works for integers', isCorrect: false },
            ],
            explanation:
                '"is" checks whether two variables point to the exact same object in memory (identity). "==" checks whether two objects have the same value. Two different list objects with the same contents will be == but not "is".',
            wrongAnswerExplanations: {
                a: 'They are NOT identical. a = [1,2]; b = [1,2]; a == b is True but a is b is False.',
                c: 'This is reversed — "is" is identity, "==" is equality.',
                d: '"is" works for all objects. Python caches small integers (-5 to 256) so "is" may appear to work for them, but this is an implementation detail you should never rely on.',
            },
            tradeoff:
                'Always use "==" for value comparison. Only use "is" for comparing against None (if x is None:) or singletons. "is None" is actually faster than "== None" and is the Pythonic convention.',
        },
        {
            id: 'p1a-q6',
            number: 6,
            type: 'code',
            difficulty: 'beginner',
            topic: 'Control Flow',
            question: 'What does this code print?',
            code: `for i in range(5):
    if i == 3:
        break
    if i % 2 == 0:
        continue
    print(i)`,
            answers: [
                { id: 'a', text: '1\n3', isCorrect: false },
                { id: 'b', text: '0\n2', isCorrect: false },
                { id: 'c', text: '1', isCorrect: true },
                { id: 'd', text: '1\n2', isCorrect: false },
            ],
            explanation:
                'i=0: even → continue (skip). i=1: odd, no break → print(1). i=2: even → continue. i=3: break exits loop entirely. So only 1 is printed.',
            wrongAnswerExplanations: {
                a: 'i=3 triggers break before print(3) can execute.',
                b: 'Even numbers are skipped by continue before they reach print.',
                d: 'i=2 is even so continue skips it before printing.',
            },
            tradeoff:
                'break exits the entire loop. continue skips to the next iteration. pass does nothing (placeholder). In the AutoResearch fallback chains, "continue" is used to skip failed providers and try the next one.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'p1a-q7',
            number: 7,
            type: 'mcq',
            difficulty: 'beginner',
            topic: 'Functions',
            question: 'What is a default parameter value in Python? Which line is correct?',
            code: `# Option A
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}"

# Option B
def greet(greeting="Hello", name):
    return f"{greeting}, {name}"`,
            answers: [
                { id: 'a', text: 'Option A — default params must come after non-default params', isCorrect: true },
                { id: 'b', text: 'Option B — order does not matter', isCorrect: false },
                { id: 'c', text: 'Both are valid', isCorrect: false },
                { id: 'd', text: 'Neither is valid — default params are not allowed', isCorrect: false },
            ],
            explanation:
                'In Python, parameters with default values must always come after parameters without defaults. Option B raises a SyntaxError: "non-default argument follows default argument".',
            wrongAnswerExplanations: {
                b: 'Order absolutely matters. Non-default args must come first.',
                c: 'Option B raises a SyntaxError at definition time.',
                d: 'Default parameters are completely valid and very common in Python.',
            },
            tradeoff:
                'Default mutable arguments (like def fn(x=[]) ) are a famous Python gotcha — the default list is created once and shared across all calls. Always use None as default and create the mutable object inside the function body.',
        },
        {
            id: 'p1a-q8',
            number: 8,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'List Comprehensions',
            question: 'What does this list comprehension produce?',
            code: `results = [x**2 for x in range(10) if x % 2 == 0]
print(results)`,
            answers: [
                { id: 'a', text: '[0, 4, 16, 36, 64]', isCorrect: true },
                { id: 'b', text: '[1, 9, 25, 49, 81]', isCorrect: false },
                { id: 'c', text: '[0, 1, 4, 9, 16, 25, 36, 49, 64, 81]', isCorrect: false },
                { id: 'd', text: '[4, 16, 36, 64, 100]', isCorrect: false },
            ],
            explanation:
                'range(10) = 0..9. Filter: only even numbers (0,2,4,6,8). Transform: square each. Results: 0²=0, 2²=4, 4²=16, 6²=36, 8²=64.',
            wrongAnswerExplanations: {
                b: 'These are squares of odd numbers (1,3,5,7,9).',
                c: 'This would be [x**2 for x in range(10)] without the filter.',
                d: 'These would include 10²=100, but range(10) stops at 9.',
            },
            tradeoff:
                'List comprehensions are faster than equivalent for-loops and more readable for simple transformations. For complex logic (multiple conditions, side effects), a regular for-loop is clearer. Generator expressions (parentheses instead of brackets) are memory-efficient for large datasets.',
        },
        {
            id: 'p1a-q9',
            number: 9,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Exception Handling',
            question: 'In this try/except block from the AutoResearch codebase, what is the purpose of catching a broad Exception?',
            code: `for name, fn in providers:
    try:
        result, tok = fn(context)
        if result and len(result.strip()) > 100:
            report = result
            break
    except Exception as e:
        print(f"[writer] {name} failed ({type(e).__name__}: {e})")
        continue`,
            answers: [
                { id: 'a', text: 'It is bad practice and should use specific exceptions', isCorrect: false },
                { id: 'b', text: 'It intentionally catches all provider failures so the loop continues to the next provider without crashing', isCorrect: true },
                { id: 'c', text: 'It silently swallows errors and hides bugs', isCorrect: false },
                { id: 'd', text: 'Exception is the only way to catch API errors', isCorrect: false },
            ],
            explanation:
                'In a multi-provider fallback chain, catching broad Exception is intentional and correct. Each provider can fail with different exception types (APITimeoutError, RateLimitError, ConnectionError, etc). We log the failure with type(e).__name__ for visibility, then continue to the next provider. Swallowing silently would be bad — here we log it.',
            wrongAnswerExplanations: {
                a: 'Specific exceptions are better when you know what to expect. Here we deliberately handle any failure mode from any of 12+ providers.',
                c: 'The error is not swallowed — it is printed with the exception type and message for debugging.',
                d: 'Many exception types exist for API errors. broad Exception catches them all deliberately here.',
            },
            tradeoff:
                'Broad Exception: catches everything, risks hiding unexpected bugs. Specific exceptions (except RateLimitError, except TimeoutError): more precise, misses unexpected failures. The right choice depends on whether you need the code to keep running despite failures (fallback chains) or stop and alert (critical code paths).',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'p1a-q10',
            number: 10,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Dictionary Operations',
            question: 'What is the difference between dict.get() and dict[]?',
            code: `config = {"model": "gemini-2.0-flash"}

# Option A
value = config["temperature"]

# Option B
value = config.get("temperature", 0.1)`,
            answers: [
                { id: 'a', text: 'They behave identically', isCorrect: false },
                { id: 'b', text: 'Option A raises KeyError if key missing; Option B returns the default value', isCorrect: true },
                { id: 'c', text: 'Option A is faster so should always be preferred', isCorrect: false },
                { id: 'd', text: '.get() is only for optional dictionary keys', isCorrect: false },
            ],
            explanation:
                'dict["key"] raises KeyError if the key does not exist. dict.get("key", default) returns the default value (or None if no default given) when the key is missing. Option B is safer when a key may not always be present.',
            wrongAnswerExplanations: {
                a: 'They behave differently when the key is missing — A crashes, B returns the default.',
                c: 'Option A is marginally faster but crashing is never preferable to a safe default.',
                d: '.get() works on any key — it is just safer because it never raises KeyError.',
            },
            tradeoff:
                'Use dict[key] when the key MUST exist — if it is missing that is a bug and you want to know. Use dict.get(key, default) when the key is optional. In config.py, os.getenv() uses the same pattern — returns None or default when env var is not set.',
            codeReference: 'autoresearch-backend/app/config.py',
        },
        {
            id: 'p1a-q11',
            number: 11,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'Unpacking',
            question: 'What does this code print?',
            code: `a, *b, c = [1, 2, 3, 4, 5]
print(a, b, c)`,
            answers: [
                { id: 'a', text: '1 [2, 3, 4] 5', isCorrect: true },
                { id: 'b', text: '1 2 5', isCorrect: false },
                { id: 'c', text: '1 (2, 3, 4) 5', isCorrect: false },
                { id: 'd', text: 'SyntaxError', isCorrect: false },
            ],
            explanation:
                'The * operator in unpacking collects the "rest" into a list. a gets the first element (1), c gets the last (5), and *b collects everything in between as a list [2, 3, 4].',
            wrongAnswerExplanations: {
                b: '*b collects ALL remaining items, not just one.',
                c: '*b produces a list, not a tuple.',
                d: 'This is valid Python 3 extended unpacking syntax.',
            },
            tradeoff:
                'Extended unpacking is very readable and avoids manual indexing. It is used in the AutoResearch codebase in lines like: result, tok = fn(context) where the function returns a tuple of exactly two values.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'p1a-q12',
            number: 12,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'None and Optional',
            question: 'What is the correct way to check if a variable is None?',
            code: `quality_score = None

# Which check is most Pythonic and correct?
# A
if quality_score == None:
    pass

# B
if not quality_score:
    pass

# C
if quality_score is None:
    pass`,
            answers: [
                { id: 'a', text: 'Option A — == None', isCorrect: false },
                { id: 'b', text: 'Option B — not quality_score', isCorrect: false },
                { id: 'c', text: 'Option C — is None', isCorrect: true },
                { id: 'd', text: 'All three are identical', isCorrect: false },
            ],
            explanation:
                '"is None" is the correct Pythonic way. None is a singleton — there is exactly one None object in Python. "is" checks identity which is faster and semantically correct. PEP 8 explicitly recommends "is None" over "== None".',
            wrongAnswerExplanations: {
                a: '"== None" works but violates PEP 8 and can be overridden by __eq__ methods.',
                b: '"not quality_score" is True for None, 0, [], "", and other falsy values — it does not distinguish between None and an empty list or zero.',
                d: 'They are not identical — Option B catches falsy values other than None.',
            },
            tradeoff:
                'In the AutoResearch state.py, quality_score: Optional[QualityScore] uses the typing Optional pattern. Checking "if state.get(quality_score) is not None" is precise — it only triggers when a score actually exists, not when it is zero or empty.',
            codeReference: 'autoresearch-backend/app/graph/state.py',
        },
        {
            id: 'p1a-q13',
            number: 13,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'Dict Comprehensions',
            question: 'What does this dict comprehension produce?',
            code: `agents = ["planner", "search", "rag", "writer", "critic"]
status = {agent: "idle" for agent in agents}
print(status["writer"])`,
            answers: [
                { id: 'a', text: '"idle"', isCorrect: true },
                { id: 'b', text: 'KeyError', isCorrect: false },
                { id: 'c', text: 'None', isCorrect: false },
                { id: 'd', text: '["idle"]', isCorrect: false },
            ],
            explanation:
                'The dict comprehension creates {"planner": "idle", "search": "idle", ...} for all agents. "writer" is in the list so status["writer"] returns "idle".',
            wrongAnswerExplanations: {
                b: '"writer" is in the agents list so the key exists.',
                c: 'dict["key"] returns the value, not None — use .get() to get None on missing keys.',
                d: 'The value is the string "idle", not a list.',
            },
            tradeoff:
                'This is exactly the pattern used in the AutoResearch Next.js frontend for initialising pipeline state: const initialPipeline = {planner: "idle", search: "idle", ...}. Same concept, different language.',
            codeReference: 'autoresearch-frontend/app/page.tsx',
        },
        {
            id: 'p1a-q14',
            number: 14,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'os.environ vs os.getenv',
            question: 'In config.py, why are some keys loaded with os.environ[] and others with os.getenv()?',
            code: `# Required — crashes if missing
ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]

# Optional — defaults to empty string if missing
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")`,
            answers: [
                { id: 'a', text: 'They are identical — just two ways to write the same thing', isCorrect: false },
                { id: 'b', text: 'os.environ[] raises KeyError if missing; os.getenv() returns None or a default — used to distinguish required vs optional config', isCorrect: true },
                { id: 'c', text: 'os.getenv() is newer and should always be used', isCorrect: false },
                { id: 'd', text: 'os.environ[] only works on Linux', isCorrect: false },
            ],
            explanation:
                'os.environ["KEY"] raises KeyError immediately if the env var is not set — this is intentional for required keys like ANTHROPIC_API_KEY. If it is missing the app should crash loudly at startup. os.getenv("KEY", default) returns the default silently — used for optional providers like OPENROUTER_API_KEY which the system can live without.',
            wrongAnswerExplanations: {
                a: 'They differ in how they handle missing keys — one crashes, one returns a default.',
                c: 'Both are in the standard library since Python 2. Neither is newer.',
                d: 'Both work on all platforms.',
            },
            tradeoff:
                'Fail fast (os.environ[]) vs graceful degradation (os.getenv()). Required API keys should fail at startup so you know immediately. Optional fallback providers should degrade silently. This is a classic availability vs correctness tradeoff.',
            codeReference: 'autoresearch-backend/app/config.py',
        },
        {
            id: 'p1a-q15',
            number: 15,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'Generator Expressions',
            question: 'What is the key difference between these two?',
            code: `# Option A — list comprehension
total = sum([m.get("tokens_used", 0) for m in metrics])

# Option B — generator expression
total = sum(m.get("tokens_used", 0) for m in metrics)`,
            answers: [
                { id: 'a', text: 'Option A is always faster', isCorrect: false },
                { id: 'b', text: 'Option B uses less memory — it generates values one at a time without building the full list', isCorrect: true },
                { id: 'c', text: 'They are identical in every way', isCorrect: false },
                { id: 'd', text: 'Option B is only valid in Python 3.10+', isCorrect: false },
            ],
            explanation:
                'A generator expression (parentheses or no brackets) produces values lazily — one at a time. The list comprehension builds the entire list in memory first. For sum(), the generator is more memory-efficient because sum() only needs one value at a time.',
            wrongAnswerExplanations: {
                a: 'For functions like sum() that consume one item at a time, the generator is at least as fast and uses less memory.',
                c: 'Memory usage differs significantly for large datasets.',
                d: 'Generator expressions have been available since Python 2.4.',
            },
            tradeoff:
                'Generator expressions: lower memory, cannot be reused, no indexing. List comprehensions: higher memory, reusable, supports indexing. This exact pattern appears in workflow.py to sum token counts.',
            codeReference: 'autoresearch-backend/app/graph/workflow.py',
        },
        {
            id: 'p1a-q16',
            number: 16,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Mutable Default Arguments',
            question: 'What is the output of calling buggy_append() three times with no arguments?',
            code: `def buggy_append(item=1, lst=[]):
    lst.append(item)
    return lst

print(buggy_append())
print(buggy_append())
print(buggy_append())`,
            answers: [
                { id: 'a', text: '[1]\n[1]\n[1]', isCorrect: false },
                { id: 'b', text: '[1]\n[1, 1]\n[1, 1, 1]', isCorrect: true },
                { id: 'c', text: 'Error on second call', isCorrect: false },
                { id: 'd', text: '[1]\n[]\n[]', isCorrect: false },
            ],
            explanation:
                'This is one of Python\'s most famous gotchas. Default argument values are evaluated ONCE when the function is defined, not each time it is called. The same list object is reused across all calls. Each call mutates and returns the same persistent list.',
            wrongAnswerExplanations: {
                a: 'The list is not reset on each call — it is the same object every time.',
                c: 'No error occurs — Python happily mutates the shared default list.',
                d: 'The list persists and grows across calls.',
            },
            tradeoff:
                'The fix: use None as default and create inside the function: def safe_append(item=1, lst=None): if lst is None: lst = []. This is why production code almost always uses None as default for mutable parameters.',
        },
        {
            id: 'p1a-q17',
            number: 17,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Walrus Operator',
            question: 'What does the walrus operator := do in Python 3.8+?',
            code: `# Without walrus
data = get_data()
if data:
    process(data)

# With walrus
if data := get_data():
    process(data)`,
            answers: [
                { id: 'a', text: 'It is just syntax sugar with no real benefit', isCorrect: false },
                { id: 'b', text: 'It assigns a value and evaluates it in a single expression, reducing redundant calls', isCorrect: true },
                { id: 'c', text: 'It creates a copy of the data', isCorrect: false },
                { id: 'd', text: 'It only works inside while loops', isCorrect: false },
            ],
            explanation:
                'The walrus operator := assigns and returns the value in one expression. It avoids calling get_data() twice (once to check, once to use) and keeps the variable in scope after the if block. It is particularly useful in while loops and comprehensions.',
            wrongAnswerExplanations: {
                a: 'For expensive operations like API calls, avoiding the double call is a real performance and correctness benefit.',
                c: 'It assigns the same object, not a copy.',
                d: 'It works in if conditions, while loops, and comprehensions.',
            },
            tradeoff:
                'Walrus improves efficiency when the same value is needed for both the condition and the body. However, overuse makes code harder to read. PEP 572 recommends using it sparingly — only when it meaningfully simplifies the code.',
        },
        {
            id: 'p1a-q18',
            number: 18,
            type: 'code',
            difficulty: 'advanced',
            topic: 'enumerate and zip',
            question: 'What does this code print?',
            code: `agents = ["planner", "search", "writer"]
latencies = [2.1, 3.4, 15.2]

for i, (agent, ms) in enumerate(zip(agents, latencies), start=1):
    print(f"{i}. {agent}: {ms}s")`,
            answers: [
                { id: 'a', text: '0. planner: 2.1s\n1. search: 3.4s\n2. writer: 15.2s', isCorrect: false },
                { id: 'b', text: '1. planner: 2.1s\n2. search: 3.4s\n3. writer: 15.2s', isCorrect: true },
                { id: 'c', text: 'TypeError: cannot unpack', isCorrect: false },
                { id: 'd', text: '1. (planner, 2.1)\n2. (search, 3.4)\n3. (writer, 15.2)', isCorrect: false },
            ],
            explanation:
                'zip() pairs agents and latencies together. enumerate(start=1) adds a counter starting at 1. The tuple unpacking (agent, ms) destructures each zip pair. Result: numbered pairs with agents and their latencies.',
            wrongAnswerExplanations: {
                a: 'enumerate(start=1) starts at 1, not 0.',
                c: 'The unpacking is valid — enumerate yields (index, item) and each zip item is a tuple, so (i, (agent, ms)) is valid nested unpacking.',
                d: 'The (agent, ms) destructuring extracts both values from the tuple.',
            },
            tradeoff:
                'enumerate() avoids manual counter variables (no i = 0; i += 1). zip() avoids manual index access (no agents[i]). Both together make parallel iteration clean and Pythonic. This pattern is used in benchmark.py to display metrics tables.',
            codeReference: 'autoresearch-backend/app/eval/benchmark.py',
        },
        {
            id: 'p1a-q19',
            number: 19,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Python Keywords — all 35',
            question: 'Which of these is NOT a Python keyword?',
            answers: [
                { id: 'a', text: 'nonlocal', isCorrect: false },
                { id: 'b', text: 'yield', isCorrect: false },
                { id: 'c', text: 'interface', isCorrect: true },
                { id: 'd', text: 'global', isCorrect: false },
            ],
            explanation:
                '"interface" is NOT a Python keyword — it comes from Java and TypeScript. Python has no interface keyword; it uses abstract base classes (ABC) or duck typing instead. The 35 Python keywords include: False, None, True, and, as, assert, async, await, break, class, continue, def, del, elif, else, except, finally, for, from, global, if, import, in, is, lambda, nonlocal, not, or, pass, raise, return, try, while, with, yield.',
            wrongAnswerExplanations: {
                a: 'nonlocal IS a Python keyword — used to reference variables in an enclosing (non-global) scope.',
                b: 'yield IS a Python keyword — used to make a generator function.',
                d: 'global IS a Python keyword — used to declare that a variable refers to the global scope.',
            },
            tradeoff:
                'Python deliberately has no interface keyword. Instead: duck typing ("if it walks like a duck..."), abstract base classes (from abc import ABC, abstractmethod), and Protocol (from typing import Protocol) for structural subtyping. This is a philosophical difference from Java/TypeScript.',
        },
        {
            id: 'p1a-q20',
            number: 20,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Type Hints — TypedDict',
            question: 'Why does AutoResearch use TypedDict for ResearchState instead of a regular class or dataclass?',
            code: `class ResearchState(TypedDict):
    query: str
    thread_id: str
    subtasks: list[str]
    report: str
    quality_score: Optional[QualityScore]
    metrics: list[AgentMetrics]`,
            answers: [
                { id: 'a', text: 'TypedDict is just documentation — it adds no real value over a regular dict', isCorrect: false },
                { id: 'b', text: 'LangGraph requires the state to be a plain dict for serialisation and checkpointing. TypedDict gives type safety without changing the runtime dict behaviour', isCorrect: true },
                { id: 'c', text: 'dataclass would work equally well here', isCorrect: false },
                { id: 'd', text: 'TypedDict prevents all runtime type errors', isCorrect: false },
            ],
            explanation:
                'LangGraph\'s StateGraph requires a plain Python dict as state — not a class instance. TypedDict creates a type that IS a dict at runtime but gives type checker (mypy/pyright) visibility of the expected keys and their types. This gives the best of both worlds: dict compatibility for LangGraph internals + IDE type safety for developers.',
            wrongAnswerExplanations: {
                a: 'TypedDict provides real value at development time — IDEs can autocomplete keys, type checkers catch mistakes, and it serves as documentation.',
                c: 'A dataclass instance is NOT a dict — LangGraph cannot serialise it the same way for checkpointing.',
                d: 'TypedDict is a static type hint only — Python does not enforce types at runtime unless you use runtime validation libraries like Pydantic.',
            },
            tradeoff:
                'TypedDict: dict-compatible, no runtime overhead, static type hints only. Pydantic BaseModel: validates at runtime, not dict-compatible, heavier. dataclass: class instance, not dict, supports methods. FastAPI uses Pydantic for request/response bodies precisely because it needs runtime validation.',
            codeReference: 'autoresearch-backend/app/graph/state.py',
        },
    ],
}

export default quiz