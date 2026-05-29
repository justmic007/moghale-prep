import type { Quiz } from '@/lib/types'

const quiz: Quiz = {
    id: 'ai-ml-4b',
    title: 'AI/ML Engineering',
    subtitle: 'Part 2 — Agents, LangGraph, PyTorch & Production AI',
    description:
        'Advanced AI engineering: agent architectures, LangGraph internals, PyTorch tensors, production observability with LangSmith, and the engineering tradeoffs behind real AI systems.',
    track: 'ai-ml',
    part: '4b',
    projectId: 'autoresearch',
    passMark: 70,
    estimatedMinutes: 25,
    prerequisites: ['ai-ml-4a'],
    questions: [
        {
            id: 'ai4b-q1',
            number: 1,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'PyTorch — Tensors',
            question: 'What is a PyTorch tensor and how does it relate to NumPy arrays?',
            answers: [
                { id: 'a', text: 'Tensors are 3D arrays only (width × height × depth)', isCorrect: false },
                { id: 'b', text: 'Tensors are n-dimensional arrays — like NumPy arrays but with GPU support, automatic differentiation, and deep learning operations. For embeddings, a tensor is a 1D float array of 768 values', isCorrect: true },
                { id: 'c', text: 'PyTorch tensors are slower than NumPy arrays', isCorrect: false },
                { id: 'd', text: 'Tensors can only store integers', isCorrect: false },
            ],
            explanation:
                'Tensors can be any dimensionality: 0D (scalar), 1D (vector), 2D (matrix), 3D+ (batch of embeddings). Key difference from NumPy: tensors can live on GPU (tensor.cuda()), support automatic differentiation (autograd), and have deep learning operations (torch.nn). For AutoResearch embeddings, we use NumPy (simpler, no GPU needed for cosine similarity).',
            wrongAnswerExplanations: {
                a: 'Tensors can have any number of dimensions.',
                c: 'PyTorch and NumPy have similar CPU performance. PyTorch wins on GPU.',
                d: 'Tensors support float32, float16, int64, and many other dtypes.',
            },
            tradeoff:
                'NumPy: mature, broad ecosystem, CPU only, no autograd. PyTorch tensor: GPU support, autograd, deep learning ops, larger dependency. For inference-only embedding similarity (AutoResearch), NumPy is sufficient. For training neural networks or GPU inference, PyTorch is necessary.',
            codeReference: 'autoresearch-backend/app/tools/embedder.py',
        },
        {
            id: 'ai4b-q2',
            number: 2,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'LangSmith — Observability',
            question: 'What does enabling LANGCHAIN_TRACING_V2=true in AutoResearch add to the system?',
            code: `# config.py
LANGCHAIN_TRACING_V2 = os.getenv("LANGCHAIN_TRACING_V2", "false")
LANGCHAIN_PROJECT = os.getenv("LANGCHAIN_PROJECT", "autoresearch-agent")`,
            answers: [
                { id: 'a', text: 'LangSmith tracing makes LangGraph run twice as fast', isCorrect: false },
                { id: 'b', text: 'LangSmith captures every LLM call: input, output, latency, token count, model name — viewable in the LangSmith dashboard for debugging and cost analysis', isCorrect: true },
                { id: 'c', text: 'LangSmith tracing is required for LangGraph to work', isCorrect: false },
                { id: 'd', text: 'LangSmith only traces errors, not successful calls', isCorrect: false },
            ],
            explanation:
                'LangSmith is Anthropic/LangChain\'s observability platform. When LANGCHAIN_TRACING_V2=true, every LLM call in the pipeline is automatically traced and sent to LangSmith. You can see: exact prompts sent to each model, exact responses received, latency per call, token counts, costs. Invaluable for debugging "why did the writer produce a poor report?" and monitoring production quality.',
            wrongAnswerExplanations: {
                a: 'Tracing adds slight overhead (async HTTP calls to LangSmith). It does not speed up execution.',
                c: 'LangGraph works fine without LangSmith — tracing is optional observability.',
                d: 'LangSmith traces ALL calls — successful and failed.',
            },
            tradeoff:
                'LangSmith tracing: full observability, debugging capability, slight latency overhead (~1-5ms per call), data privacy consideration (prompts/responses sent to LangSmith). No tracing: faster, private, blind to production issues. Enable tracing in development and staging; evaluate privacy implications for production.',
            codeReference: 'autoresearch-backend/app/config.py',
        },
        {
            id: 'ai4b-q3',
            number: 3,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Agent — tool use pattern',
            question: 'Tavily is called as a "tool" in the Search agent. How does tool use differ from simply calling a Python function?',
            code: `# AutoResearch — direct function call (not formal tool use)
from app.tools.tavily import search
results = search(subtask, max_results=4)

# Formal tool use (ReAct pattern)
tools = [TavilySearchTool()]
agent = create_react_agent(llm, tools)
response = agent.invoke({"input": query})`,
            answers: [
                { id: 'a', text: 'They are identical — tool use is just a term for function calls', isCorrect: false },
                { id: 'b', text: 'In formal tool use, the LLM DECIDES when and how to call tools. In AutoResearch, the pipeline ALWAYS calls Tavily — the LLM has no choice. This gives more control and predictability', isCorrect: true },
                { id: 'c', text: 'Tool use requires the OpenAI function calling API specifically', isCorrect: false },
                { id: 'd', text: 'Direct function calls are slower than tool use', isCorrect: false },
            ],
            explanation:
                'In formal LLM tool use (function calling), the LLM receives tool definitions and decides whether and how to call them. This is flexible but unpredictable — the LLM might call Tavily twice, skip it, or hallucinate the results. AutoResearch hardcodes the pipeline: Search agent ALWAYS calls Tavily for each subtask. This is deterministic and simpler.',
            wrongAnswerExplanations: {
                a: 'The key difference is who decides: LLM (tool use) vs pipeline (direct call).',
                c: 'Tool use is available from OpenAI, Anthropic, Groq, and others.',
                d: 'Performance is similar — the difference is architectural, not speed.',
            },
            tradeoff:
                'Formal tool use: flexible, LLM adapts to unexpected situations, harder to test. Fixed pipeline: predictable, testable, less flexible. For a research app with well-defined steps, fixed pipeline wins. For an open-ended assistant ("help me plan my trip"), formal tool use enables dynamic tool selection.',
            codeReference: 'autoresearch-backend/app/agents/search.py',
        },
        {
            id: 'ai4b-q4',
            number: 4,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'LangGraph — MemorySaver internals',
            question: 'What does MemorySaver actually store and when is it used by LangGraph?',
            code: `def get_compiled_graph():
    graph = build_graph()
    return graph.compile(checkpointer=MemorySaver())

config = {"configurable": {"thread_id": thread_id}}
result = app.invoke(state, config=config)`,
            answers: [
                { id: 'a', text: 'MemorySaver stores only the final state after the pipeline completes', isCorrect: false },
                { id: 'b', text: 'MemorySaver checkpoints the state after EACH node — enabling inspection of intermediate state and resumption if a node fails', isCorrect: true },
                { id: 'c', text: 'MemorySaver is only used for the revision loop', isCorrect: false },
                { id: 'd', text: 'thread_id is required for MemorySaver to work', isCorrect: false },
            ],
            explanation:
                'After each node (agent) completes, LangGraph calls checkpointer.put(thread_id, state). MemorySaver stores this in a Python dict keyed by thread_id. If a later node fails, you can inspect what the earlier nodes produced. The thread_id in config is how LangGraph identifies which checkpoint to load — enabling multi-turn conversations or job resumption.',
            wrongAnswerExplanations: {
                a: 'MemorySaver stores state after EACH node, not just the final state.',
                c: 'MemorySaver checkpoints after every node in the graph.',
                d: 'thread_id is needed to distinguish different pipeline runs — without it all runs share the same checkpoint.',
            },
            tradeoff:
                'MemorySaver: fast (in-memory), lost on restart. RedisSaver: durable, resumable after crash, requires network. SQLiteSaver: durable, no network, single-process. For a 30-second pipeline, MemorySaver is fine — a crash mid-pipeline is rare and the user just retries.',
            codeReference: 'autoresearch-backend/app/graph/workflow.py',
        },
        {
            id: 'ai4b-q5',
            number: 5,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'LLM — Fine-tuning vs RAG',
            question: 'When would you fine-tune a model instead of using RAG for the AutoResearch writer?',
            answers: [
                { id: 'a', text: 'Fine-tuning is always better than RAG', isCorrect: false },
                { id: 'b', text: 'Fine-tune when: you need a consistent writing style/format, the knowledge is static and known upfront, or you need the model to follow specific output structures reliably. Use RAG when knowledge is dynamic or too large to train on', isCorrect: true },
                { id: 'c', text: 'Fine-tuning should replace RAG for all production systems', isCorrect: false },
                { id: 'd', text: 'Fine-tuning teaches the model new facts it cannot otherwise access', isCorrect: false },
            ],
            explanation:
                'Fine-tuning adjusts model weights to change behaviour/style — it does NOT reliably add new factual knowledge (the model forgets old knowledge). It excels at: consistent output format, specific writing style, domain-specific tasks. For AutoResearch, RAG is better because: research topics are dynamic (new events daily), knowledge is too vast to train on, and source citation is required.',
            wrongAnswerExplanations: {
                a: 'RAG and fine-tuning are complementary tools for different problems.',
                c: 'Both have their place. Fine-tuning for style/behaviour; RAG for dynamic knowledge.',
                d: 'Fine-tuning does not reliably add factual knowledge — it causes catastrophic forgetting. Use RAG for new knowledge.',
            },
            tradeoff:
                'Fine-tuning: consistent style, no retrieval latency, expensive ($50-5000+), static knowledge. RAG: current knowledge, source citation, retrieval overhead, cheaper. Hybrid: fine-tune on your report format + RAG for content = best quality.',
        },
        {
            id: 'ai4b-q6',
            number: 6,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'LLM APIs — Streaming tokens',
            question: 'The AutoResearch backend streams SSE events per AGENT, not per TOKEN. What is token-level streaming and when would you use it?',
            code: `# Current: agent-level events (one per agent completion)
yield emit("agent_done", {"agent": "writer", "report": full_report})

# Token streaming: one event per generated token
for chunk in llm.stream("Write a report about..."):
    yield f"data: {chunk.content}\\n\\n"  # char by char`,
            answers: [
                { id: 'a', text: 'Token streaming is the same as agent streaming', isCorrect: false },
                { id: 'b', text: 'Token streaming sends each generated token as it is produced — the user sees text appear word by word like ChatGPT. Agent streaming sends the complete output when the LLM finishes', isCorrect: true },
                { id: 'c', text: 'Token streaming is only possible with OpenAI models', isCorrect: false },
                { id: 'd', text: 'Token streaming is always better for user experience', isCorrect: false },
            ],
            explanation:
                'ChatGPT\'s word-by-word appearance is token streaming. AutoResearch sends complete agent outputs because: 1) The report needs to be processed as a whole (markdown rendering). 2) The architecture is multi-agent — showing partial output from one agent would confuse users. Token streaming is better for: chatbots, code generation, any case where partial output is immediately useful.',
            wrongAnswerExplanations: {
                a: 'They differ significantly in granularity and user experience.',
                c: 'Token streaming is supported by Groq, Gemini, Anthropic, and most providers.',
                d: 'For a research report that needs complete markdown rendering, token streaming would produce a jarring character-by-character experience.',
            },
            tradeoff:
                'Token streaming: instant feedback, perceived faster, harder to process partial output. Agent streaming (current): clean complete outputs, better for structured content, perceived slower (30s wait for first content). A production improvement: stream tokens from the writer directly so users see the report being written in real-time.',
            codeReference: 'autoresearch-backend/app/graph/workflow.py',
        },
        {
            id: 'ai4b-q7',
            number: 7,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Embeddings — Cosine vs Euclidean',
            question: 'Why is cosine similarity preferred over Euclidean distance for text embeddings?',
            code: `# Cosine similarity (used in AutoResearch)
def _cosine(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Euclidean distance (alternative)
def _euclidean(a, b):
    return np.linalg.norm(np.array(a) - np.array(b))`,
            answers: [
                { id: 'a', text: 'Cosine similarity is faster to compute', isCorrect: false },
                { id: 'b', text: 'Cosine measures the angle between vectors (direction only), not magnitude. A short document and a long document on the same topic have similar angles but different magnitudes — cosine correctly identifies them as similar', isCorrect: true },
                { id: 'c', text: 'Euclidean distance produces negative values which are invalid', isCorrect: false },
                { id: 'd', text: 'Cosine similarity is a standard requirement of embedding APIs', isCorrect: false },
            ],
            explanation:
                '"Water shortage in Enugu" and a 10-paragraph article about water shortages in Enugu have the same DIRECTION in embedding space (same topic) but different MAGNITUDES (different lengths). Cosine similarity = 0.95 (correctly similar). Euclidean distance would be large (different magnitudes → far apart). For semantic similarity, direction matters, not length.',
            wrongAnswerExplanations: {
                a: 'Both are similar computationally — O(n) for n-dimensional vectors.',
                c: 'Euclidean distance is always non-negative (√(sum of squares)).',
                d: 'Many embedding use cases use Euclidean or dot product — cosine is a design choice.',
            },
            tradeoff:
                'Cosine similarity: scale-invariant, range -1 to 1, normalisation required. Euclidean distance: scale-sensitive, range 0 to ∞, intuitive. Dot product: fastest (no normalisation), biased toward longer vectors. For normalised embeddings, cosine ≈ dot product. Gemini and OpenAI embeddings are normalised — dot product is sufficient and faster.',
            codeReference: 'autoresearch-backend/app/tools/embedder.py',
        },
        {
            id: 'ai4b-q8',
            number: 8,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'AI Agents — memory types',
            question: 'AutoResearch has no persistent memory between queries. What types of memory would enhance it?',
            answers: [
                { id: 'a', text: 'AI agents cannot have memory — each query must be independent', isCorrect: false },
                { id: 'b', text: '1) In-context memory (include previous reports in prompt) 2) External memory (Redis/vector DB — retrieve relevant past research) 3) Summary memory (compress past queries into profile)', isCorrect: true },
                { id: 'c', text: 'Memory only helps if the user asks the same question twice', isCorrect: false },
                { id: 'd', text: 'Memory would violate user privacy', isCorrect: false },
            ],
            explanation:
                'Three memory patterns: 1) In-context (short-term): include last N conversations in the system prompt. Limited by context window. 2) External (long-term): embed past research, retrieve relevant chunks at query time (RAG over history). 3) Summary: compress interaction history into a user model ("this user is interested in Nigerian history"). AutoResearch could add: "if user has researched Enugu before, include that context in new Enugu queries".',
            wrongAnswerExplanations: {
                a: 'AI agents absolutely can have memory — ChatGPT, Claude, and others implement it.',
                c: 'Memory helps with follow-up questions ("tell me more about the Ajali scheme" — needs context from previous "Enugu water" research).',
                d: 'Memory with proper consent and privacy controls (user-owned, deletable) is acceptable.',
            },
            tradeoff:
                'No memory: simple, private, each query standalone. Short-term memory: better follow-ups, context window cost. Long-term memory: personalised, persistent, storage cost, privacy complexity. For a demo/portfolio project, no memory is appropriate. For a production research assistant, memory is a key differentiator.',
        },
        {
            id: 'ai4b-q9',
            number: 9,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Cost — token pricing',
            question: 'At $15/million input tokens and $75/million output tokens for Claude Sonnet 4.6, what does one AutoResearch query cost?',
            code: `# Typical AutoResearch query metrics:
# Planner: 300 input + 150 output tokens
# Writer:  4000 input + 1200 output tokens
# Critic:  1500 input + 256 output tokens
# Total:   ~5800 input + ~1600 output tokens`,
            answers: [
                { id: 'a', text: 'Free — Claude Sonnet is free for API users', isCorrect: false },
                { id: 'b', text: 'Approximately $0.21 per query: (5800 × $0.000015) + (1600 × $0.000075) ≈ $0.087 + $0.12 = $0.207', isCorrect: true },
                { id: 'c', text: '$1.50 per query', isCorrect: false },
                { id: 'd', text: '$0.001 per query', isCorrect: false },
            ],
            explanation:
                '5800 input tokens × ($15/1M) = $0.087. 1600 output tokens × ($75/1M) = $0.12. Total ≈ $0.21 per query. At 100 queries/day → ~$21/day → ~$630/month on Claude Sonnet 4.6. This is why the project switched to free providers. Gemini 2.0 Flash: ~$0.001/query. Groq Llama: free tier. The cost difference is 200×.',
            wrongAnswerExplanations: {
                a: 'Claude API has no free tier — it charges per token.',
                c: '$1.50 would require ~10× more tokens.',
                d: '$0.001 is closer to Gemini pricing, not Claude Sonnet.',
            },
            tradeoff:
                'Claude Sonnet 4.6: best quality, ~$0.21/query. Gemini 2.0 Flash: 85% of quality, ~$0.001/query. Groq Llama: 75% of quality, free. The 200× cost difference justifies the architectural complexity of multi-provider fallback chains. For a product with paying users, the quality improvement may justify the cost.',
        },
        {
            id: 'ai4b-q10',
            number: 10,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'LangGraph — state schema',
            question: 'What happens if an agent tries to access a state key that does not exist in ResearchState?',
            code: `class ResearchState(TypedDict):
    query: str
    subtasks: list[str]
    # ... other fields

def run(state: ResearchState) -> ResearchState:
    # Accessing a key that doesn't exist in TypedDict:
    user_id = state["user_id"]  # ← not in schema`,
            answers: [
                { id: 'a', text: 'TypedDict raises TypeError at definition time', isCorrect: false },
                { id: 'b', text: 'KeyError at runtime — TypedDict is only a static type hint. At runtime, accessing a missing key raises KeyError like any dict', isCorrect: true },
                { id: 'c', text: 'The type checker prevents this code from compiling', isCorrect: false },
                { id: 'd', text: 'TypedDict returns None for missing keys', isCorrect: false },
            ],
            explanation:
                'TypedDict provides STATIC type hints — mypy/pyright will warn if you access state["user_id"] because it is not in the schema. But at RUNTIME, TypedDict instances are plain dicts — accessing a missing key raises KeyError. Type checkers are not enforced at runtime unless you use runtime validation.',
            wrongAnswerExplanations: {
                a: 'TypedDict validation is static (build time), not runtime.',
                c: 'Python does not compile — type errors are warnings in IDEs, not compilation errors.',
                d: 'TypedDict does not change dict behaviour — dicts raise KeyError for missing keys.',
            },
            tradeoff:
                'TypedDict: zero runtime overhead (plain dict), IDE support, static checking only. Pydantic: runtime validation (raises ValidationError for wrong types), slower, richer error messages. The choice between them is exactly this tradeoff: AutoResearch values zero overhead for internal state management.',
            codeReference: 'autoresearch-backend/app/graph/state.py',
        },
        {
            id: 'ai4b-q11',
            number: 11,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Groq — LPU hardware',
            question: 'Groq runs Llama 3.3 70B at 300+ tokens/second while GPU-based providers run at 30-80 tokens/second. Why?',
            answers: [
                { id: 'a', text: 'Groq uses a faster version of PyTorch', isCorrect: false },
                { id: 'b', text: 'Groq\'s LPU (Language Processing Unit) is a custom chip designed specifically for transformer inference — deterministic memory access pattern eliminates the memory bandwidth bottleneck that limits GPU inference', isCorrect: true },
                { id: 'c', text: 'Groq uses smaller models with the same accuracy', isCorrect: false },
                { id: 'd', text: 'Groq compresses the model to 4-bit before running inference', isCorrect: false },
            ],
            explanation:
                'GPU inference is memory-bandwidth limited — reading 70B parameters from GPU memory is slow. Groq\'s LPU uses a streaming dataflow architecture: weights are loaded once into on-chip SRAM and computations are pipelined in a deterministic, compiler-optimised way. No memory bottleneck = maximum arithmetic throughput. This is why the Planner runs in 770ms on Groq vs 4000ms on other providers.',
            wrongAnswerExplanations: {
                a: 'Groq does not use PyTorch — it has its own compiler (GroqCompiler) that compiles models to LPU instructions.',
                c: 'Groq runs the same model — accuracy is identical.',
                d: 'Model quantisation can speed up inference but is not the primary Groq advantage.',
            },
            tradeoff:
                'Groq LPU: fast, deterministic latency, limited model selection, rate limits on free tier. NVIDIA GPU: broader model support, flexible memory, slower. The AutoResearch pipeline uses Groq for Planner and Critic (fast, simple tasks) precisely because low latency matters for user experience.',
        },
        {
            id: 'ai4b-q12',
            number: 12,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'SambaNova — RDU hardware',
            question: 'SambaNova runs DeepSeek-V3.2 faster than most providers. What hardware does it use?',
            answers: [
                { id: 'a', text: 'SambaNova uses standard NVIDIA A100 GPUs in a larger cluster', isCorrect: false },
                { id: 'b', text: 'SambaNova\'s RDU (Reconfigurable Dataflow Unit) is a custom AI accelerator with a spatial computing architecture — computation flows through the chip spatially rather than fetching from memory', isCorrect: true },
                { id: 'c', text: 'SambaNova uses distributed CPU inference across 1000s of machines', isCorrect: false },
                { id: 'd', text: 'SambaNova uses FPGAs reprogrammed for each model', isCorrect: false },
            ],
            explanation:
                'SambaNova\'s RDU is a spatial dataflow processor — operations are mapped to physical locations on chip, data flows between them without centralised memory. Like Groq, this eliminates the memory bandwidth bottleneck. The difference: RDU is more flexible (handles different model architectures) while Groq\'s LPU is more specialised for transformer inference.',
            wrongAnswerExplanations: {
                a: 'SambaNova builds its own chips — not GPU clusters.',
                c: 'CPU inference is orders of magnitude slower for 70B+ models.',
                d: 'FPGAs are used by some AI companies but SambaNova uses their custom RDU.',
            },
            tradeoff:
                'Custom AI chips (Groq, SambaNova, Cerebras): fast inference, custom silicon, limited flexibility. NVIDIA GPUs: flexible, broad support, memory bandwidth limited. The trend: as LLM inference demand grows, custom silicon becomes more cost-effective than GPUs for production inference.',
        },
        {
            id: 'ai4b-q13',
            number: 13,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Production AI — rate limit handling',
            question: 'The provider fallback chain catches RateLimitError and moves to the next provider. Is this always the right strategy?',
            code: `except Exception as e:
    print(f"[writer] {name} failed ({type(e).__name__}: {e})")
    continue  # try next provider`,
            answers: [
                { id: 'a', text: 'Yes — always move to the next provider on any error', isCorrect: false },
                { id: 'b', text: 'For rate limits: yes, move to next provider. For AuthenticationError (wrong API key): fix the key, do not retry. For content policy violations: do not retry. Context matters — not all errors are transient', isCorrect: true },
                { id: 'c', text: 'No — always retry the same provider 3 times first', isCorrect: false },
                { id: 'd', text: 'The current implementation is perfect for all error types', isCorrect: false },
            ],
            explanation:
                'Different errors require different responses: RateLimitError (429) → transient → retry/next provider. AuthenticationError (401) → permanent → alert operator, do not retry. ContentPolicyViolation → query-specific → do not retry with same query. Timeout → transient → retry once, then next provider. The current broad Exception catch is pragmatic but could be improved with specific error type handling.',
            wrongAnswerExplanations: {
                a: 'Moving to next provider on AuthenticationError would just fail on all providers with the same wrong key.',
                c: 'Retrying the same rate-limited provider 3 times just wastes time.',
                d: 'Catching broad Exception is a starting point — production systems benefit from specific error handling.',
            },
            tradeoff:
                'Broad Exception catch: simple, handles all cases, may mask bugs. Specific error handling: precise, better debugging, more code. For a demo/portfolio project, broad catch is acceptable. For a production system handling real users, specific error types should trigger specific actions (alert on auth errors, skip on rate limits).',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'ai4b-q14',
            number: 14,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'AI — Evaluation and quality metrics',
            question: 'The Critic scores reports on completeness, accuracy, coherence. What is the weakness of using an LLM to evaluate LLM output?',
            answers: [
                { id: 'a', text: 'LLMs cannot evaluate text quality', isCorrect: false },
                { id: 'b', text: 'LLM-as-judge has known biases: prefers verbose answers, favours fluent-sounding text regardless of accuracy, cannot verify facts against external sources, and models tend to rate their own output highly', isCorrect: true },
                { id: 'c', text: 'The Critic uses too few dimensions', isCorrect: false },
                { id: 'd', text: 'LLM evaluation is identical to human evaluation', isCorrect: false },
            ],
            explanation:
                'LLM-as-judge is widely used but has documented biases: 1) Length bias — longer answers score higher. 2) Fluency bias — grammatically correct but wrong answers score higher than correct but awkward ones. 3) Cannot verify facts against ground truth. 4) Self-consistency bias — models rate outputs similar to their training highly. For AutoResearch, the Critic\'s accuracy score (7/10) is an estimate, not verified.',
            wrongAnswerExplanations: {
                a: 'LLMs can evaluate text quality — they just have systematic biases.',
                c: 'Three dimensions is reasonable. More dimensions would not eliminate the fundamental biases.',
                d: 'Human evaluation is still the gold standard for subjective quality assessment.',
            },
            tradeoff:
                'LLM-as-judge: automated, scales to any volume, fast, biased. Human evaluation: accurate, expensive, slow, does not scale. RAGAS metrics (automated RAG evaluation): fact-checking against retrieved context, less biased. For production, a combination of LLM evaluation + periodic human review is best practice.',
            codeReference: 'autoresearch-backend/app/agents/critic.py',
        },
        {
            id: 'ai4b-q15',
            number: 15,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'MoE — Mixture of Experts',
            question: 'DeepSeek-V3 is a 671B parameter MoE model but runs inference costs comparable to a 37B dense model. How?',
            answers: [
                { id: 'a', text: 'DeepSeek compresses 671B parameters to 37B before inference', isCorrect: false },
                { id: 'b', text: 'Mixture of Experts: only a subset of "expert" layers are activated per token. 671B total parameters but only ~37B activated at inference — full capacity without full compute cost', isCorrect: true },
                { id: 'c', text: 'DeepSeek uses gradient checkpointing to reduce computation', isCorrect: false },
                { id: 'd', text: '671B is a marketing number — the model actually has 37B parameters', isCorrect: false },
            ],
            explanation:
                'MoE models have many "expert" neural network layers but a router selects which experts to activate for each token. DeepSeek-V3: 671B total parameters, but only ~37B active per forward pass. You get the capacity of a 671B model (broad knowledge from many experts) at the inference cost of a ~37B model. This is why SambaNova can serve it at competitive speed.',
            wrongAnswerExplanations: {
                a: 'The full 671B parameters exist in memory — MoE selects which to use, not compress.',
                c: 'Gradient checkpointing is a training technique, not inference.',
                d: '671B is accurate — but only a fraction is activated per token.',
            },
            tradeoff:
                'MoE: capacity of large model + efficiency of small model, but requires loading all 671B into memory (expensive hardware). Dense model: simpler architecture, predictable compute, requires proportionally expensive hardware for large models. For AutoResearch, SambaNova handles the hardware complexity — you just call the API.',
        },
        {
            id: 'ai4b-q16',
            number: 16,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Production — observability pyramid',
            question: 'AutoResearch has PostHog analytics and print() logging. What is the full observability stack a production AI app needs?',
            answers: [
                { id: 'a', text: 'PostHog and print() are sufficient for any production app', isCorrect: false },
                { id: 'b', text: 'Logs (what happened), Metrics (how fast/many), Traces (which path through code), LLM Observability (what prompts/responses), Alerts (when things go wrong)', isCorrect: true },
                { id: 'c', text: 'Production apps only need error logs', isCorrect: false },
                { id: 'd', text: 'PostHog provides all observability needed for AI apps', isCorrect: false },
            ],
            explanation:
                'The observability pyramid for production AI: 1) Logs (structured JSON, not print()) — what happened in each request. 2) Metrics (Prometheus/DataDog) — latency p50/p99, error rates, token usage per minute. 3) Distributed traces (OpenTelemetry) — which code path handled each request. 4) LLM traces (LangSmith) — exact prompts and responses. 5) Business metrics (PostHog) — user behaviour. AutoResearch has #4 (LangSmith, configurable) and #5 (PostHog). Missing: #1, #2, #3.',
            wrongAnswerExplanations: {
                a: 'print() is not structured logging — it cannot be queried, filtered, or alerted on.',
                c: 'Error logs alone cannot help diagnose performance issues or guide optimisation.',
                d: 'PostHog tracks user behaviour events. It does not show server-side performance, error rates, or LLM costs.',
            },
            tradeoff:
                'Full observability stack: complete visibility, complex setup (~20 hours), external service dependencies. Minimal (PostHog only): easy, blind to infrastructure issues. For a demo project, PostHog + LangSmith is appropriate. For a production app with SLAs, the full stack is necessary.',
            codeReference: 'autoresearch-backend/app/config.py',
        },
        {
            id: 'ai4b-q17',
            number: 17,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'AI — context compression',
            question: 'The AutoResearch writer truncates search results to 250 chars. What more sophisticated approaches exist?',
            answers: [
                { id: 'a', text: 'More truncation is the best approach', isCorrect: false },
                { id: 'b', text: 'LLMLingua (selective token pruning), Reranker (select most relevant chunks), Summarisation (compress chunks with a small LLM), Map-Reduce (summarise each source then combine)', isCorrect: true },
                { id: 'c', text: 'Context compression is only needed for models with small context windows', isCorrect: false },
                { id: 'd', text: 'Larger context windows eliminate the need for compression', isCorrect: false },
            ],
            explanation:
                'Advanced context management: 1) LLMLingua: removes unimportant tokens using a small model — 80% compression with 5% quality loss. 2) Reranker (Cohere, BGE): scores each chunk\'s relevance to the query — select top 5 from 30. 3) Map-Reduce: summarise each source independently with a small LLM, then give summaries to the Writer. 4) Contextual RAG: include surrounding text when retrieving a chunk.',
            wrongAnswerExplanations: {
                a: 'Character truncation is naive — it may cut off the most important sentence.',
                c: 'Even with 1M token context, providing focused relevant content produces better reports than flooding with all available text.',
                d: 'Larger context windows reduce the HARD constraint but focused context still produces better quality. "Lost in the middle" problem: LLMs ignore information in the middle of very long contexts.',
            },
            tradeoff:
                'Simple truncation (current): fast, no extra LLM calls, misses relevant info at end. Reranker: better relevance, extra API call (~$0.001). Summarisation: most compressed, 2× extra LLM calls, highest latency. For AutoResearch at its current scale, the current approach is appropriate.',
        },
        {
            id: 'ai4b-q18',
            number: 18,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'AI — Agentic AI engineering interview',
            question: 'In a Senior AI Engineer interview, how would you explain the AutoResearch architecture?',
            answers: [
                { id: 'a', text: '"It calls ChatGPT with a search API"', isCorrect: false },
                { id: 'b', text: '"A multi-agent system using LangGraph StateGraph with 5 specialised agents — Planner, Search, RAG, Writer, Critic — with a conditional revision loop. Production-hardened with 13-provider fallback chains, SSE streaming, Redis persistence, and PostHog observability"', isCorrect: true },
                { id: 'c', text: '"A Python script that makes API calls"', isCorrect: false },
                { id: 'd', text: '"A Next.js app with an AI backend"', isCorrect: false },
            ],
            explanation:
                'A Senior AI Engineer answer names the specific technologies and architectural decisions: LangGraph for state management, the specific agent responsibilities, the conditional edge (revision loop), the engineering challenges solved (multi-provider fallback for cost/reliability), the infrastructure choices (Render/Vercel split, why SSE not WebSockets, why MemorySaver not RedisSaver). Each choice shows deliberate thinking.',
            wrongAnswerExplanations: {
                a: 'This answers fails to demonstrate any engineering depth.',
                c: 'Technically accurate but shows no architectural thinking.',
                d: 'Missing all the meaningful technical decisions.',
            },
            tradeoff:
                'The ability to articulate WHAT was built AND WHY each decision was made is what distinguishes a Senior engineer from a Junior. Every architectural decision in AutoResearch — from TypedDict vs Pydantic to MemorySaver vs RedisSaver — has a reason. Being able to explain those reasons under interview questioning is the goal of this quiz series.',
        },
        {
            id: 'ai4b-q19',
            number: 19,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'AI — Production scaling challenges',
            question: 'AutoResearch queries take 25-35 seconds. If 100 users query simultaneously, what happens?',
            answers: [
                { id: 'a', text: 'The server processes them sequentially — 100th user waits 3500 seconds', isCorrect: false },
                { id: 'b', text: 'FastAPI runs sync endpoints in a thread pool — multiple requests are handled concurrently. But 100 simultaneous 30s queries would hit provider rate limits and exhaust the thread pool', isCorrect: true },
                { id: 'c', text: 'Render automatically scales to 100 servers', isCorrect: false },
                { id: 'd', text: 'The free tier handles 100 concurrent requests easily', isCorrect: false },
            ],
            explanation:
                'FastAPI + uvicorn uses async I/O with a thread pool for sync endpoints. 100 concurrent requests: each gets a thread, threads mostly wait for LLM APIs. With Render free tier (1 vCPU, 512MB RAM), the thread pool is limited (~20 threads). Beyond that: requests queue. More critically: 100 concurrent queries would hit Groq\'s 30 RPM limit and Gemini\'s 15 RPM limit immediately.',
            wrongAnswerExplanations: {
                a: 'FastAPI handles concurrency — it does not process sequentially.',
                c: 'Render free tier does not auto-scale — you need to upgrade and configure autoscaling.',
                d: 'Free tiers are designed for low concurrent usage.',
            },
            tradeoff:
                'For 100 concurrent users: need horizontal scaling (multiple Render instances), a job queue (Celery/Redis Queue), and paid API tiers with higher rate limits. The current architecture handles 1-5 concurrent users well. Scaling to 100+ requires architectural changes beyond the current demo scope.',
        },
        {
            id: 'ai4b-q20',
            number: 20,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'AI — Future improvements',
            question: 'What single improvement would most increase AutoResearch report quality?',
            answers: [
                { id: 'a', text: 'Use a larger LLM model', isCorrect: false },
                { id: 'b', text: 'Add a Reranker between RAG and Writer — scoring each chunk\'s actual relevance to the query and selecting the best 5 from 30+ retrieved chunks dramatically improves grounding', isCorrect: true },
                { id: 'c', text: 'Increase max_tokens to 8192', isCorrect: false },
                { id: 'd', text: 'Add more Critic revision passes', isCorrect: false },
            ],
            explanation:
                'As discussed in the ChatGPT conversation you shared: AutoResearch is LLM-heavy, not retrieval-heavy. Currently: retrieve 5 chunks (keyword/semantic) → give to Writer. With a reranker: retrieve 20 chunks → rerank to top 5 most relevant → Writer gets better evidence. BGE-Reranker and Cohere Reranker are free/cheap. This improves grounding without changing the model or architecture.',
            wrongAnswerExplanations: {
                a: 'Larger models help but are expensive. Better retrieval helps more for factual research tasks.',
                c: 'Longer output does not equal higher quality — focus and evidence quality matter more.',
                d: 'More revisions increase cost and latency with diminishing returns.',
            },
            tradeoff:
                'Reranker: best quality improvement per engineering hour, small cost (~$0.0001/query for Cohere), requires one extra API call. vs Better model: highest quality ceiling, 50-200× more expensive. The retrieval-heavy approach (better evidence selection) is the most efficient path to quality improvement for research applications.',
            codeReference: 'autoresearch-backend/app/agents/rag.py',
        },
    ],
}

export default quiz