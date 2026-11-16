# RAG Eval Kit

A small, dependency-free **RAG evaluation harness** in TypeScript.

It answers procurement policy questions from a tiny corpus, then checks:

- **Recall@3** — did retrieval find the expected policy?
- **Citation accuracy** — are all cited documents in the retrieved set?
- **Refusal accuracy** — does it refuse questions the corpus cannot answer?

## Run

```bash
node src/cli.ts
node --test test/*.test.ts
```

No API keys, no vector database, no build step. Node 22.18+ runs the TypeScript directly.

## Sample output

```text
# RAG Eval Report

| id | question | retrieved | cited | refused | recall | citation | refusal |
| --- | --- | --- | --- | --- | --- | --- | --- |
| q1 | 采购金额超过 50 万需要谁审批？ | policy-approval, policy-quote, policy-contract | policy-approval | false | true | true | true |
...

**Recall@3:** 100.0%
**Citation accuracy:** 100.0%
**Refusal accuracy:** 100.0%
```

## Why this exists

Most RAG demos show a chatbot. This repo shows the **evaluation loop**:

1. retrieval with BM25 + Chinese bigrams
2. extractive answer with document citations
3. citation verification against retrieved chunks
4. refusal tests for out-of-corpus questions
5. a markdown report you can paste into a PR or client update

The refusal threshold is a simple minimum BM25 score (`10`) tuned on this corpus. In production, replace it with a calibrated classifier or a small eval set.

## Structure

```text
src/corpus.ts   8 policy documents
src/rag.ts      BM25 index + search
src/eval.ts     questions, answer, metrics
src/cli.ts      markdown report
test/           retrieval + citation + refusal tests
```

## Next steps

- swap BM25 for a vector store behind the same `search()` interface
- add a `--json` report for CI
- add LLM-as-judge for answer faithfulness
