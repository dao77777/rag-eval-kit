import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { search } from "../src/rag.ts";
import { answer, evaluate, questions } from "../src/eval.ts";

describe("rag", () => {
  it("retrieves the approval policy for approval questions", () => {
    const hits = search("50 万 审批", 3);
    assert.equal(hits[0]?.doc.id, "policy-approval");
  });

  it("scores an unrelated question below the refusal threshold", () => {
    const hits = search("股票代码", 3);
    assert.ok(!hits[0] || hits[0].score < 10);
  });

  it("only cites retrieved documents", () => {
    const row = answer(questions[0]!);
    assert.ok(row.cited.every((id) => row.retrieved.includes(id)));
  });

  it("refuses unanswerable questions", () => {
    const row = answer(questions.find((q) => q.id === "q9")!);
    assert.equal(row.refused, true);
    assert.equal(row.refusalOk, true);
  });

  it("reports metrics in range", () => {
    const result = evaluate();
    for (const value of [result.recall, result.citation, result.refusal]) {
      assert.ok(value >= 0 && value <= 1);
    }
  });
});
