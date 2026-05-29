import type { Quiz } from '@/lib/types'

const quiz: Quiz = {
    id: 'ai-ml-4a',
    title: 'AI/ML Engineering',
    subtitle: 'Part 1 — LLMs, Transformers, Embeddings & RAG',
    description:
        'Master the AI fundamentals behind AutoResearch: how LLMs work, what embeddings are, how RAG systems are built, and the engineering decisions that make AI applications production-grade.',
    track: 'ai-ml',
    part: '4a',
    projectId: 'autoresearch',
    passMark: 70,
    estimatedMinutes: 25,
    prerequisites: ['autoresearch-3b'],
    questions: [
        {
            id: 'ai4a-q1',
            number: 1,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'LLMs — What is a token?',
            question: 'What is a token in the context of LLMs and approximately how many tokens is "Tell me about Enugu state"?',
            answers: [
                { id: 'a', text: 'A token is one word — the sentence has 5 tokens', isCorrect: false },
                { id: 'b', text: 'A token is a subword unit — the sentence has approximately 7-8 tokens (some words split into multiple tokens)', isCorrect: true },
                { id: 'c', text: 'A token is one character — the sentence has 30 tokens', isCorrect: false },
                { id: 'd', text: 'A token is one sentence — the sentence is 1 token', isCorrect: false },
            ],
            explanation:
                'Tokenisation splits text into subword units using algorithms like Byte Pair Encoding (BPE). Common words ("Tell", "me", "about") are single tokens. Less common words ("Enugu", "state") may be 1-2 tokens each. Punctuation often gets its own token. On average: 1 token ≈ 4 characters, or ¾ of a word. The AutoResearch writer uses ~3,000-4,000 tokens per report.',
            wrongAnswerExplanations: {
                a: 'Words are not always single tokens — "Enugu" might tokenise as "Enu" + "gu".',
                c: 'Character-level tokenisation is rare in modern LLMs — it would make context windows very short.',
                d: 'Sentence-level tokenisation would limit models to processing only a few sentences.',
            },
            tradeoff:
                'Subword tokenisation (BPE): balances vocabulary size and coverage, handles unknown words by splitting them. Word tokenisation: simple but huge vocabulary needed. Character tokenisation: unlimited coverage but very long sequences. Understanding tokens is critical for cost estimation — AutoResearch charges per token.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'ai4a-q2',
            number: 2,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'LLMs — Context Window',
            question: 'What does "context window" mean and why does it matter for the AutoResearch writer?',
            answers: [
                { id: 'a', text: 'The browser window size where the AI response is displayed', isCorrect: false },
                { id: 'b', text: 'The maximum number of tokens an LLM can process in one call — including both the input (system prompt + context) and the output (generated report)', isCorrect: true },
                { id: 'c', text: 'The number of previous conversations the LLM remembers', isCorrect: false },
                { id: 'd', text: 'The speed at which tokens are generated', isCorrect: false },
            ],
            explanation:
                'Context window = maximum total tokens (input + output) per LLM call. Gemini 2.0 Flash: 1 million tokens. Llama 3.3 70B: 128K tokens. If the writer context (system prompt + search results + RAG chunks) exceeds the input portion of the context window, the request fails or truncates. This is why _build_context() limits content per result.',
            wrongAnswerExplanations: {
                a: 'Context window is a technical LLM constraint, not a UI concept.',
                c: 'LLMs have no memory between calls — each call is stateless. Conversation history must be included explicitly in the context.',
                d: 'Token generation speed is throughput, not context window.',
            },
            tradeoff:
                'Larger context window (Gemini 1M): can include all search results without truncation. Smaller context window (8K): must be selective about what to include. The 250-char truncation in _build_context() is specifically because Groq\'s free models have 8K-32K context windows.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'ai4a-q3',
            number: 3,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'LLMs — Temperature',
            question: 'Why does the Planner use temperature=0.1 while the Writer uses a higher temperature?',
            code: `# Planner — structured JSON output
response = client.chat.completions.create(
    model=GROQ_MODEL,
    temperature=0.1,  # ← near-deterministic
    response_format={"type": "json_object"},
    ...
)

# Writer — creative prose
response = client.chat.completions.create(
    model=GEMINI_MODEL,
    # temperature not explicitly set → model default (~0.7-1.0)
    ...
)`,
            answers: [
                { id: 'a', text: 'Temperature controls the speed of generation', isCorrect: false },
                { id: 'b', text: 'Temperature controls randomness. Near 0: deterministic/consistent output (good for JSON). Near 1: creative/varied output (good for prose writing)', isCorrect: true },
                { id: 'c', text: 'Temperature only affects the length of the output', isCorrect: false },
                { id: 'd', text: 'Higher temperature produces more accurate outputs', isCorrect: false },
            ],
            explanation:
                'Temperature scales the probability distribution over the vocabulary before sampling. Temperature=0: always picks the highest probability token (deterministic). Temperature=1: samples from the full distribution (creative). For the Planner, you want the same JSON structure every time (low temperature). For the Writer, some creativity produces better prose (default/higher temperature).',
            wrongAnswerExplanations: {
                a: 'Temperature has no effect on generation speed — that is determined by hardware and model size.',
                c: 'Temperature affects word choice and creativity, not length. max_tokens controls length.',
                d: 'For factual tasks, lower temperature produces more accurate outputs. For creative tasks, higher temperature is better.',
            },
            tradeoff:
                'Temperature=0: reproducible, predictable, less creative. Temperature=1+: creative, varied, less predictable. For structured data extraction (Planner, Critic), use 0-0.1. For creative writing (Writer), use 0.7-1.0. For code generation, 0-0.3 is typical.',
            codeReference: 'autoresearch-backend/app/agents/planner.py',
        },
        {
            id: 'ai4a-q4',
            number: 4,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'LLMs — System vs User prompt',
            question: 'What is the difference between system and user roles in LLM messages?',
            code: `messages=[
    {"role": "system", "content": SYSTEM},  # who the AI is
    {"role": "user",   "content": context}, # the actual request
]`,
            answers: [
                { id: 'a', text: 'System messages are sent by the server, user messages by the browser', isCorrect: false },
                { id: 'b', text: 'System sets the AI\'s persona/instructions (processed once, higher priority). User is the actual request. Separating them gives the model clearer context about its role vs the task', isCorrect: true },
                { id: 'c', text: 'System messages are required for all API calls', isCorrect: false },
                { id: 'd', text: 'User messages are ignored if a system message is present', isCorrect: false },
            ],
            explanation:
                'The system prompt defines the model\'s behaviour: "You are a professional research writer...". The user prompt is the actual task: the context to write about. Models are trained to give system prompts higher priority — they shape how the user request is interpreted. Without a system prompt, the model uses default behaviour.',
            wrongAnswerExplanations: {
                a: 'System/user roles are API conventions, not network architecture.',
                c: 'System messages are optional — many simple API calls use only user messages.',
                d: 'Both messages are processed — system shapes behaviour, user provides the task.',
            },
            tradeoff:
                'Detailed system prompt: consistent behaviour, uses more tokens on every call. Minimal system prompt: faster, cheaper, less control. The AutoResearch SYSTEM prompts are ~100-150 tokens each — moderate overhead justified by consistent structured output.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'ai4a-q5',
            number: 5,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'Embeddings — What they are',
            question: 'What is a text embedding and what does "768-dimensional vector" mean?',
            answers: [
                { id: 'a', text: 'A compressed version of the original text', isCorrect: false },
                { id: 'b', text: 'A list of 768 floating-point numbers that represent the semantic meaning of text in a high-dimensional space — similar meaning = similar vectors', isCorrect: true },
                { id: 'c', text: 'A 768-character summary of the text', isCorrect: false },
                { id: 'd', text: 'A 768-layer neural network', isCorrect: false },
            ],
            explanation:
                'An embedding maps text to a point in high-dimensional space. "768 dimensions" means the embedding is a list of 768 floats. Similar texts (semantically) end up with similar vectors (close in space). "Water shortage Enugu" and "lack of water supply Nigeria" would have high cosine similarity. The embedding model (like gemini-embedding-001) does this mapping.',
            wrongAnswerExplanations: {
                a: 'Embeddings are not compressed text — they are a mathematical representation that loses the original text.',
                c: '768 refers to the number of floating-point dimensions, not characters.',
                d: 'The embedding vector is the OUTPUT of a neural network, not the network itself.',
            },
            tradeoff:
                'Larger embedding dimension (3072): more expressive, better semantic capture, more storage. Smaller dimension (384): faster, less storage, slightly less accurate. Gemini embedding-001 produces 768d vectors. OpenAI text-embedding-3-large produces 3072d. For the AutoResearch in-memory store, 768d is appropriate.',
            codeReference: 'autoresearch-backend/app/tools/embedder.py',
        },
        {
            id: 'ai4a-q6',
            number: 6,
            type: 'code',
            difficulty: 'intermediate',
            topic: 'RAG — Why it exists',
            question: 'What problem does RAG solve that simply giving the LLM a large context window does not?',
            answers: [
                { id: 'a', text: 'RAG makes LLMs faster', isCorrect: false },
                { id: 'b', text: 'RAG solves: 1) LLM knowledge cutoff (provides current info), 2) Context window limits (retrieves only relevant chunks), 3) Hallucination (grounds responses in retrieved evidence)', isCorrect: true },
                { id: 'c', text: 'RAG is only needed for non-English languages', isCorrect: false },
                { id: 'd', text: 'RAG replaces the need for fine-tuning', isCorrect: false },
            ],
            explanation:
                'RAG (Retrieval Augmented Generation) addresses three core LLM limitations: 1) Knowledge cutoff — LLMs trained in 2024 do not know 2025 events. RAG retrieves current information at query time. 2) Context limits — you cannot fit 1,000 documents in a context window. RAG selects the most relevant. 3) Hallucination — grounding responses in retrieved text reduces fabrication.',
            wrongAnswerExplanations: {
                a: 'RAG adds latency (retrieval step) — it does not make LLMs faster.',
                c: 'RAG is language-agnostic — it applies to all text.',
                d: 'RAG and fine-tuning solve different problems. RAG: dynamic knowledge. Fine-tuning: behaviour/style adaptation.',
            },
            tradeoff:
                'RAG: dynamic knowledge, no retraining needed, depends on retrieval quality. Fine-tuning: baked-in knowledge, no retrieval latency, expensive to update. Hybrid (RAG + fine-tuning): best quality but complex and expensive. For a research app needing current information, RAG is the right choice.',
            codeReference: 'autoresearch-backend/app/agents/rag.py',
        },
        {
            id: 'ai4a-q7',
            number: 7,
            type: 'mcq',
            difficulty: 'intermediate',
            topic: 'RAG — Chunking strategy',
            question: 'Why does the AutoResearch RAG agent chunk content by search result instead of by fixed character count?',
            code: `def _flatten_results(search_results: list[dict]) -> list[str]:
    chunks = []
    for item in search_results:
        for result in item["results"]:
            # Each search result becomes one chunk
            content = result.get("content", "").strip()
            if content and len(content) > 50:
                chunks.append(f"{result['title']}\\n{content[:600]}")
    return chunks`,
            answers: [
                { id: 'a', text: 'Character-based chunking is not supported by Gemini embeddings', isCorrect: false },
                { id: 'b', text: 'Each search result is already a semantically coherent unit (one article/page). Splitting within a result would break context. Result-based chunking preserves semantic coherence', isCorrect: true },
                { id: 'c', text: 'Result-based chunking is always better than fixed-size chunking', isCorrect: false },
                { id: 'd', text: 'The Tavily API returns fixed-size chunks', isCorrect: false },
            ],
            explanation:
                'A Tavily search result is a coherent piece of content from one source — it has a title, URL, and extracted content about a specific topic. Chunking WITHIN a result at arbitrary character boundaries would split related sentences, potentially putting a statement and its context in different chunks. Result-as-chunk preserves the natural boundaries.',
            wrongAnswerExplanations: {
                a: 'Gemini embeddings accept any text input.',
                c: 'Result-based chunking works well when results are self-contained. For long documents (PDFs, books), fixed-size or semantic chunking is better.',
                d: 'Tavily returns variable-length content — chunking is done by AutoResearch.',
            },
            tradeoff:
                'Result-based chunks: semantic coherence, variable size, may include irrelevant content. Fixed-size chunks: consistent size, may split sentences, works for any document. Semantic chunking (split at sentence/paragraph boundaries): best quality, requires NLP processing. For Tavily results (typically 200-800 chars), result-based is appropriate.',
            codeReference: 'autoresearch-backend/app/agents/rag.py',
        },
        {
            id: 'ai4a-q8',
            number: 8,
            type: 'code',
            difficulty: 'advanced',
            topic: 'Transformer — Attention mechanism',
            question: 'At a conceptual level, what does "attention" in transformers allow the model to do when generating the AutoResearch report?',
            answers: [
                { id: 'a', text: 'Attention allows the model to process tokens in parallel (instead of sequentially)', isCorrect: false },
                { id: 'b', text: 'Attention allows each token to "look at" all other tokens in the context and weight their relevance — when writing "nuclear fusion" analysis, the model can attend to earlier mentions of "ITER" and "plasma" simultaneously', isCorrect: true },
                { id: 'c', text: 'Attention is a regularisation technique that prevents overfitting', isCorrect: false },
                { id: 'd', text: 'Attention reduces the number of parameters needed in the model', isCorrect: false },
            ],
            explanation:
                'Self-attention computes, for each token, a weighted sum of all other token representations. When generating the word "breakthrough" in the analysis section, the attention mechanism can simultaneously consider "ITER" (mentioned 50 tokens ago), "plasma" (mentioned 30 tokens ago), and "2025" (mentioned 10 tokens ago). This long-range dependency is why transformers outperform RNNs for language.',
            wrongAnswerExplanations: {
                a: 'Parallel processing is a benefit of transformers but is enabled by the architecture, not specifically by attention.',
                c: 'Dropout and weight decay are regularisation techniques. Attention is the core mechanism.',
                d: 'Attention actually adds parameters (Q, K, V weight matrices) compared to simple sequential models.',
            },
            tradeoff:
                'Full self-attention: O(n²) complexity (every token attends to every other). Efficient attention variants (Flash Attention, Sparse Attention): O(n log n) or O(n). For the 2048-token reports AutoResearch generates, O(n²) is manageable. For 1M-token contexts, Flash Attention is essential.',
        },
        {
            id: 'ai4a-q9',
            number: 9,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'LLM — Hallucination',
            question: 'What causes LLM hallucination and how does the AutoResearch architecture mitigate it?',
            answers: [
                { id: 'a', text: 'Hallucination is caused by bugs in the LLM code', isCorrect: false },
                { id: 'b', text: 'LLMs predict the most probable next token — when the "correct" answer is not in training data, the model generates a plausible-sounding but incorrect response. RAG mitigates this by providing retrieved evidence', isCorrect: true },
                { id: 'c', text: 'Hallucination only occurs with smaller models like Llama 7B', isCorrect: false },
                { id: 'd', text: 'Higher temperature causes hallucination', isCorrect: false },
            ],
            explanation:
                'LLMs are trained to predict the next token — they optimise for statistical plausibility, not factual accuracy. When asked about something outside training data, the model still generates a fluent response based on patterns — it "hallucinates". AutoResearch mitigates this: 1) RAG grounds the Writer in retrieved evidence. 2) The Critic evaluates accuracy. 3) Sources are listed so users can verify.',
            wrongAnswerExplanations: {
                a: 'Hallucination is a fundamental property of how LLMs are trained, not a bug.',
                c: 'Large models (GPT-4, Claude) also hallucinate — they just do so more fluently and confidently.',
                d: 'Temperature increases creativity/variation but hallucination fundamentally comes from training on internet text with errors.',
            },
            tradeoff:
                'RAG reduces hallucination for factual queries. System prompt instructions ("be factual, cite sources") reduce it further. Temperature=0 reduces variation but not all hallucination. The only complete solution is retrieval-augmented generation with verification — which is exactly the AutoResearch architecture.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'ai4a-q10',
            number: 10,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Embeddings — Gemini embedding-001',
            question: 'Why does the embedder use gemini-embedding-001 specifically for text embeddings rather than a generation model like gemini-2.0-flash?',
            code: `def _embed_batch(texts: list[str]) -> list[list[float]] | None:
    result = client.models.embed_content(
        model="gemini-embedding-001",  # ← embedding model
        contents=texts,
    )
    return [e.values for e in result.embeddings]`,
            answers: [
                { id: 'a', text: 'Embedding models are cheaper than generation models', isCorrect: false },
                { id: 'b', text: 'Embedding models are trained specifically to produce semantic vector representations. Generation models produce text — they cannot produce fixed-size float vectors for semantic similarity', isCorrect: true },
                { id: 'c', text: 'gemini-2.0-flash does not support the embed_content API', isCorrect: false },
                { id: 'd', text: 'Embedding models are always faster', isCorrect: false },
            ],
            explanation:
                'Generation models (GPT-4, Gemini Flash) produce text tokens one by one — they do not output a fixed-size float vector. Embedding models (text-embedding-3-small, gemini-embedding-001) are fine-tuned with contrastive learning objectives to produce semantic vectors where similar texts cluster together. They have a different architecture optimised for the embedding task.',
            wrongAnswerExplanations: {
                a: 'Embedding models are generally cheaper per token but that is not the reason for using them.',
                c: 'The distinction is API capability based on model type, not specific model limitations.',
                d: 'Speed comparison depends on the specific models and use case.',
            },
            tradeoff:
                'Dedicated embedding model: purpose-built, best quality for semantic search. Using the last hidden state of a generation model: possible but lower quality. OpenAI text-embedding-3-small: good balance of quality and cost. Sentence-transformers (local): no API cost, requires GPU/CPU inference.',
            codeReference: 'autoresearch-backend/app/tools/embedder.py',
        },
        {
            id: 'ai4a-q11',
            number: 11,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Vector DB — Why ChromaDB was removed',
            question: 'AutoResearch originally used ChromaDB but replaced it with an in-memory keyword store. What caused this change?',
            answers: [
                { id: 'a', text: 'ChromaDB is not compatible with Python 3.11', isCorrect: false },
                { id: 'b', text: 'ChromaDB requires sentence-transformers which pulls in PyTorch (~500MB) — exceeding Render free tier\'s build limits and causing deployment timeouts', isCorrect: true },
                { id: 'c', text: 'ChromaDB has no free tier', isCorrect: false },
                { id: 'd', text: 'ChromaDB cannot store more than 100 documents', isCorrect: false },
            ],
            explanation:
                'ChromaDB uses sentence-transformers for local embedding which depends on PyTorch (~500MB compressed). Render free tier containers build from requirements.txt — a 500MB PyTorch download caused build timeouts. The in-memory replacement uses Gemini API for embeddings (no local model) or keyword matching — zero extra dependencies.',
            wrongAnswerExplanations: {
                a: 'ChromaDB is compatible with Python 3.11.',
                c: 'ChromaDB is open-source — free to use. Chroma Cloud has a free tier.',
                d: 'ChromaDB can store millions of documents.',
            },
            tradeoff:
                'ChromaDB (local): persistent, semantic search, ~500MB dependency, free. Gemini embeddings + in-memory: no large dependencies, API-dependent, lost on restart. For production, a hosted vector DB (Chroma Cloud, Pinecone, Weaviate) would give the best of both worlds.',
            codeReference: 'autoresearch-backend/app/tools/embedder.py',
        },
        {
            id: 'ai4a-q12',
            number: 12,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'LangGraph — why not LangChain chains',
            question: 'The codebase uses LangGraph instead of LangChain\'s LCEL (LangChain Expression Language) chains. What does LangGraph add?',
            answers: [
                { id: 'a', text: 'LangGraph is faster than LangChain chains', isCorrect: false },
                { id: 'b', text: 'LangGraph adds: conditional branching (cycles), shared state between nodes, checkpointing, and graph visualisation — LCEL chains are linear and stateless', isCorrect: true },
                { id: 'c', text: 'LangGraph supports more LLM providers', isCorrect: false },
                { id: 'd', text: 'LangGraph is a replacement for LangChain that is not maintained by the same team', isCorrect: false },
            ],
            explanation:
                'LCEL (chain = prompt | llm | parser) is excellent for linear pipelines. LangGraph adds: 1) Cycles (the writer→critic→writer revision loop is impossible with linear chains). 2) Shared state (all agents read/write the same ResearchState). 3) Checkpointing (resume interrupted pipelines). 4) Conditional edges (route based on state values).',
            wrongAnswerExplanations: {
                a: 'LangGraph adds abstraction overhead — it is not necessarily faster.',
                c: 'Both work with the same LLM providers.',
                d: 'LangGraph is maintained by LangChain Inc — it is the evolution of their agent framework.',
            },
            tradeoff:
                'LCEL: simpler, linear only, no cycles. LangGraph: complex setup, supports cycles and branching, necessary for revision loops. Use LCEL for simple chains (prompt → LLM → parse). Use LangGraph for agent systems with conditional logic and shared state.',
            codeReference: 'autoresearch-backend/app/graph/workflow.py',
        },
        {
            id: 'ai4a-q13',
            number: 13,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'ReAct — Agent pattern',
            question: 'What is the ReAct agent pattern and does AutoResearch use it?',
            answers: [
                { id: 'a', text: 'ReAct is a React.js pattern for AI components', isCorrect: false },
                { id: 'b', text: 'ReAct (Reasoning + Acting) is an agent pattern where the LLM alternates between thinking and calling tools in a loop. AutoResearch uses a FIXED pipeline instead — each agent has one job', isCorrect: true },
                { id: 'c', text: 'ReAct is the only valid approach for AI agents', isCorrect: false },
                { id: 'd', text: 'AutoResearch uses ReAct in the Critic agent', isCorrect: false },
            ],
            explanation:
                'ReAct: LLM thinks → decides which tool to call → calls tool → observes result → thinks again → repeat until done. This is the pattern used by Claude\'s tool use, ChatGPT plugins, and LangChain agents. AutoResearch uses a PREDEFINED pipeline: the graph structure is fixed, each agent has exactly one task. This is simpler, more predictable, and faster but less flexible than ReAct.',
            wrongAnswerExplanations: {
                a: 'ReAct is an agent design pattern from the AI research paper "ReAct: Synergizing Reasoning and Acting".',
                c: 'Multiple valid agent patterns exist: ReAct, Plan-and-Execute, Chain-of-Thought, fixed pipelines.',
                d: 'The Critic uses a fixed prompt structure — no tool calling or reasoning loop.',
            },
            tradeoff:
                'Fixed pipeline: predictable, fast, easy to debug, cannot adapt to unexpected situations. ReAct: flexible, handles unexpected tool needs, harder to debug, potentially unlimited tool calls (cost risk). For a research assistant with well-defined steps, fixed pipeline is more appropriate.',
            codeReference: 'autoresearch-backend/app/graph/workflow.py',
        },
        {
            id: 'ai4a-q14',
            number: 14,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Prompt engineering — structured output',
            question: 'What makes the Critic system prompt effective at producing reliable JSON?',
            code: `SYSTEM = """You are a research quality critic. Evaluate the given report
on three dimensions, each scored 0-10:
- completeness: Does it fully answer the original question?
- accuracy: Are claims grounded in the provided sources?
- coherence: Is it well-structured and clearly written?

Respond ONLY with a JSON object in this exact format:
{
  "completeness": 8,
  "accuracy": 7,
  "coherence": 9,
  "feedback": "One sentence of the most important improvement needed."
}
No preamble, no markdown, no explanation."""`,
            answers: [
                { id: 'a', text: 'The length of the system prompt guarantees JSON output', isCorrect: false },
                { id: 'b', text: 'Four elements: clear task definition, defined output keys, example JSON format with realistic values, explicit negative instructions (no preamble/markdown)', isCorrect: true },
                { id: 'c', text: 'Using "ONLY" in capitals forces JSON output', isCorrect: false },
                { id: 'd', text: 'The numbered dimensions make the model more accurate', isCorrect: false },
            ],
            explanation:
                'Effective structured output prompts use: 1) Clear role definition ("research quality critic"). 2) Explicit scoring criteria with descriptions. 3) Example JSON with realistic values (not "X" or "N" placeholders). 4) Explicit negative constraints ("No preamble, no markdown"). 5) Combined with json_object mode on Groq. Each element reduces the chance of the model adding unwanted text.',
            wrongAnswerExplanations: {
                a: 'Prompt length alone does not guarantee format compliance.',
                c: 'Capitalization adds emphasis but does not programmatically enforce output format — json_object mode does.',
                d: 'The dimension descriptions improve scoring accuracy but not JSON format compliance.',
            },
            tradeoff:
                'Detailed prompt: reliable output, uses more input tokens. Minimal prompt: fewer tokens, less reliable. Providing example output with realistic values (8, 7, 9) rather than placeholders (X, Y, Z) significantly improves output quality — the model learns the expected value range.',
            codeReference: 'autoresearch-backend/app/agents/critic.py',
        },
        {
            id: 'ai4a-q15',
            number: 15,
            type: 'mcq',
            difficulty: 'advanced',
            topic: 'Multi-provider — model selection strategy',
            question: 'Why does the revision Writer use DeepSeek R1 while the first attempt uses Gemini Flash?',
            code: `if is_revision:
    providers = [
        ("deepseek-r1", lambda c: _try_deepseek_revision(c)),
        ("gemini",      lambda c: _try_gemini(c)),
    ]
else:
    providers = [
        ("gemini", lambda c: _try_gemini(c)),
        # ... fallbacks
    ]`,
            answers: [
                { id: 'a', text: 'DeepSeek R1 is faster for revision tasks', isCorrect: false },
                { id: 'b', text: 'DeepSeek R1 is a reasoning model — it excels at "think step-by-step about what this report is missing". Gemini Flash is better at fast synthesis. Revision needs deeper reasoning about quality gaps', isCorrect: true },
                { id: 'c', text: 'DeepSeek R1 is free on OpenRouter', isCorrect: false },
                { id: 'd', text: 'Gemini Flash cannot process feedback from the Critic', isCorrect: false },
            ],
            explanation:
                'DeepSeek R1 is a reasoning model (similar to GPT o1/o3) — it generates a chain-of-thought before answering. For revision, the task is: "given the Critic\'s feedback that sources lack citation, improve the report". This requires reasoning about what is missing. Gemini Flash is optimised for fast, high-quality generation but may not deeply reason about gaps.',
            wrongAnswerExplanations: {
                a: 'DeepSeek R1 is actually slower due to chain-of-thought generation.',
                c: 'Cost is not the reason — quality of reasoning is.',
                d: 'Gemini Flash can process the feedback — R1 just reasons about it more deeply.',
            },
            tradeoff:
                'Reasoning model (DeepSeek R1): deep analysis, slow (chain-of-thought adds tokens), expensive. Fast generation model (Gemini Flash): quick synthesis, less deep reasoning. For first draft: fast model. For revision: reasoning model. This hybrid approach optimises both speed and quality.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'ai4a-q16',
            number: 16,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'RLHF — Why models follow instructions',
            question: 'Why do modern LLMs like Claude and Gemini reliably follow the instruction "Respond ONLY with JSON"?',
            answers: [
                { id: 'a', text: 'They are programmed with if/else rules to detect format instructions', isCorrect: false },
                { id: 'b', text: 'RLHF (Reinforcement Learning from Human Feedback) trains models to be helpful and follow instructions — human raters reward responses that follow format instructions, so the model learns to comply', isCorrect: true },
                { id: 'c', text: 'JSON is a special token that overrides normal text generation', isCorrect: false },
                { id: 'd', text: 'LLMs always produce valid JSON by default', isCorrect: false },
            ],
            explanation:
                'Base LLMs (pretrained) do not reliably follow instructions — they generate text based on statistical patterns. RLHF fine-tunes the model with human feedback: human raters rate responses, better responses get higher rewards, the model is trained to maximise reward. Since raters reward instruction-following, the model learns to follow format instructions. This is why Claude/GPT are much better at structured output than base models.',
            wrongAnswerExplanations: {
                a: 'LLMs have no programmatic if/else logic — behaviour emerges from training.',
                c: 'JSON has no special status in tokenisation — it is just text characters.',
                d: 'Base LLMs frequently produce non-JSON output even when asked for JSON.',
            },
            tradeoff:
                'RLHF: better instruction following, aligned behaviour, risk of sycophancy (telling users what they want to hear). Pre-RLHF: more "raw" generation, follows statistical patterns. Understanding RLHF explains why different models have different "personalities" and why smaller models (trained with less RLHF) are less reliable at structured output.',
        },
        {
            id: 'ai4a-q17',
            number: 17,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Sentence Transformers — all-MiniLM',
            question: 'Before the in-memory keyword store, AutoResearch used all-MiniLM-L6-v2 for embeddings. What is this model?',
            answers: [
                { id: 'a', text: 'A miniaturised version of the GPT language model', isCorrect: false },
                { id: 'b', text: 'A 22M parameter sentence transformer fine-tuned for semantic similarity — produces 384d embeddings, runs locally (no API needed), 5x faster than BERT-large', isCorrect: true },
                { id: 'c', text: 'A model that translates between languages', isCorrect: false },
                { id: 'd', text: 'The embedding model inside ChromaDB', isCorrect: false },
            ],
            explanation:
                'all-MiniLM-L6-v2 is from the sentence-transformers library. It was fine-tuned on 1 billion sentence pairs to produce semantically meaningful 384-dimensional embeddings. "L6" = 6 transformer layers (tiny). "MiniLM" = knowledge distilled from a larger model. It runs locally (no API cost) which is why it was attractive, but requires PyTorch (~500MB) which caused Render deployment issues.',
            wrongAnswerExplanations: {
                a: 'MiniLM is an encoder-only model optimised for embedding, not a language generation model.',
                c: 'Sentence transformers produce embeddings, not translations.',
                d: 'ChromaDB can use multiple embedding providers — all-MiniLM-L6-v2 is just the default.',
            },
            tradeoff:
                'Local embedding (all-MiniLM): no API cost, no network latency, works offline, requires 500MB PyTorch. API embedding (Gemini): no local dependencies, requires internet and API key, small per-call cost. For a Render-deployed app, API-based embedding removes the heavy dependency.',
            codeReference: 'autoresearch-backend/app/tools/embedder.py',
        },
        {
            id: 'ai4a-q18',
            number: 18,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'Vector DB — HNSW indexing',
            question: 'ChromaDB uses HNSW indexing for vector similarity search. What does HNSW do?',
            answers: [
                { id: 'a', text: 'HNSW sorts all vectors alphabetically for fast lookup', isCorrect: false },
                { id: 'b', text: 'HNSW (Hierarchical Navigable Small World) builds a graph of vectors at multiple layers — enabling approximate nearest-neighbour search in O(log n) instead of O(n) brute force', isCorrect: true },
                { id: 'c', text: 'HNSW compresses vectors to reduce memory', isCorrect: false },
                { id: 'd', text: 'HNSW is only used for image embeddings', isCorrect: false },
            ],
            explanation:
                'Brute-force similarity search compares a query vector against ALL stored vectors — O(n). At 1M vectors, this is slow. HNSW builds a multilayer graph: each vector connects to its nearest neighbours. Search starts at the top layer (few nodes, fast navigation) and drills down to find approximate nearest neighbours in O(log n). The "approximate" part means it may miss the exact best match for a small accuracy tradeoff.',
            wrongAnswerExplanations: {
                a: 'Vectors have no alphabetical order — they are float arrays.',
                c: 'HNSW is about search speed, not compression. Product Quantisation (PQ) is for compression.',
                d: 'HNSW is used for any high-dimensional vectors — text, images, audio.',
            },
            tradeoff:
                'Exact search (brute force): 100% accurate, O(n) — unusable at scale. HNSW (approximate): 95-99% accurate, O(log n), excellent for millions of vectors. For the AutoResearch in-memory store with ~50 chunks per query, brute force cosine similarity is actually faster than HNSW (no index overhead).',
        },
        {
            id: 'ai4a-q19',
            number: 19,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'LLM — max_tokens vs context window',
            question: 'What is the difference between max_tokens in the API call and the model\'s context window?',
            code: `response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": context}],
    max_tokens=2048,   # ← output limit
    timeout=TIMEOUT,
)
# Context window of llama-3.3-70b: 128,000 tokens total`,
            answers: [
                { id: 'a', text: 'They are the same — max_tokens IS the context window', isCorrect: false },
                { id: 'b', text: 'Context window = total input + output tokens. max_tokens = maximum output tokens. Input (context) + max_tokens must fit within the context window', isCorrect: true },
                { id: 'c', text: 'max_tokens only applies to the input, not the output', isCorrect: false },
                { id: 'd', text: 'Context window is unlimited on paid API plans', isCorrect: false },
            ],
            explanation:
                'For Llama 3.3 70B: context window = 128K total. If the input context is 5K tokens and max_tokens=2048, total = 7K — well within 128K. If the input context was 127K tokens and max_tokens=2048, total = 129K — would exceed the context window and error. The context includes: system prompt + all messages + previous response in multi-turn.',
            wrongAnswerExplanations: {
                a: 'max_tokens is just the output limit — the context window is the total budget.',
                c: 'max_tokens limits OUTPUT generation. Input length is determined by the messages.',
                d: 'Context windows are architectural constraints of the model — not a billing tier feature.',
            },
            tradeoff:
                'Large max_tokens: longer, more detailed output, more expensive. Small max_tokens: shorter output, cheaper, may truncate. For the Writer, max_tokens=2048 is sufficient for a research report (typically 600-900 words = ~800-1200 tokens). Setting max_tokens too low cuts off reports mid-sentence.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
        {
            id: 'ai4a-q20',
            number: 20,
            type: 'mcq',
            difficulty: 'expert',
            topic: 'AI — Reasoning models vs instruction-following models',
            question: 'DeepSeek R1 is a reasoning model. How does it differ from Llama 3.3 70B in how it processes the revision task?',
            answers: [
                { id: 'a', text: 'Reasoning models are simply larger and therefore smarter', isCorrect: false },
                { id: 'b', text: 'Reasoning models generate a hidden chain-of-thought (thinking tokens) before producing the answer — for revision, R1 might "think": what gaps did the critic identify? what evidence addresses them? THEN write the improved report', isCorrect: true },
                { id: 'c', text: 'Reasoning models only work for math problems', isCorrect: false },
                { id: 'd', text: 'Llama 3.3 70B cannot process the critic feedback', isCorrect: false },
            ],
            explanation:
                'Reasoning models (DeepSeek R1, GPT o1/o3) are trained with process reward modelling — they are rewarded for correct reasoning steps, not just correct answers. They produce thinking tokens (visible in some APIs as <think>...</think>) before the final answer. For revision: the thinking process might analyse the critic\'s feedback, identify specific gaps, plan improvements, then write. This structured thinking produces better revisions.',
            wrongAnswerExplanations: {
                a: 'DeepSeek R1 uses 671B parameters total (MoE) but reasoning behaviour comes from training methodology, not just size.',
                c: 'Reasoning models excel at any task requiring multi-step analysis — not just math.',
                d: 'Llama 3.3 70B can process the feedback — it just does not explicitly reason about it step by step.',
            },
            tradeoff:
                'Reasoning model: better complex analysis, 2-5x more tokens (thinking tokens cost money), slower. Instruction-following model: fast, cheaper, good for straightforward tasks. Use reasoning models for: complex analysis, multi-step planning, debugging hard problems. Use instruction-following for: summarisation, format conversion, simple Q&A.',
            codeReference: 'autoresearch-backend/app/agents/writer.py',
        },
    ],
}

export default quiz