import { docs, type Doc } from "./corpus.ts";

export type Hit = {
  doc: Doc;
  score: number;
};

function tokens(text: string): string[] {
  const lower = text.toLowerCase();
  const latin = lower.match(/[a-z0-9]+/g) ?? [];
  const chinese = lower.match(/[\u4e00-\u9fff]/g) ?? [];
  const bigrams: string[] = [];
  for (let i = 0; i < chinese.length - 1; i++) {
    bigrams.push(chinese[i]! + chinese[i + 1]!);
  }
  return [...latin, ...chinese, ...bigrams].filter((t) => t.length > 0);
}

function termFreq(text: string): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens(text)) tf.set(token, (tf.get(token) ?? 0) + 1);
  return tf;
}

const docTerms = docs.map((doc) => termFreq(`${doc.title} ${doc.text}`));
const docLengths = docTerms.map((tf) => [...tf.values()].reduce((a, b) => a + b, 0));
const avgLength = docLengths.reduce((a, b) => a + b, 0) / docs.length;
const df = new Map<string, number>();
for (const tf of docTerms) {
  for (const term of tf.keys()) df.set(term, (df.get(term) ?? 0) + 1);
}

const k1 = 1.5;
const b = 0.75;

function idf(term: string): number {
  const n = docs.length;
  const d = df.get(term) ?? 0;
  return Math.log(1 + (n - d + 0.5) / (d + 0.5));
}

export function search(query: string, k = 3): Hit[] {
  const q = tokens(query);
  const scored = docs.map((doc, i) => {
    const tf = docTerms[i]!;
    let score = 0;
    for (const term of q) {
      const f = tf.get(term) ?? 0;
      if (f === 0) continue;
      const denom = f + k1 * (1 - b + b * (docLengths[i]! / avgLength));
      score += idf(term) * ((f * (k1 + 1)) / denom);
    }
    return { doc, score };
  });
  return scored.filter((hit) => hit.score > 0).sort((a, b) => b.score - a.score).slice(0, k);
}
