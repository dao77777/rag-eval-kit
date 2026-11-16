import { evaluate } from "./eval.ts";

const { rows, recall, citation, refusal } = evaluate();
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

console.log("# RAG Eval Report\n");
console.log("| id | question | retrieved | cited | refused | recall | citation | refusal |");
console.log("| --- | --- | --- | --- | --- | --- | --- | --- |");
for (const row of rows) {
  console.log(
    `| ${row.id} | ${row.question} | ${row.retrieved.join(", ")} | ${row.cited.join(", ") || "-"} | ${row.refused} | ${row.recall} | ${row.citationOk} | ${row.refusalOk} |`,
  );
}
console.log(`\n**Recall@3:** ${pct(recall)}  `);
console.log(`**Citation accuracy:** ${pct(citation)}  `);
console.log(`**Refusal accuracy:** ${pct(refusal)}`);
