import { search } from "./rag.ts";

export type Question = {
  id: string;
  question: string;
  expectedDoc?: string;
  answerable: boolean;
};

export const questions: Question[] = [
  { id: "q1", question: "采购金额超过 50 万需要谁审批？", expectedDoc: "policy-approval", answerable: true },
  { id: "q2", question: "新供应商准入需要哪些材料？", expectedDoc: "policy-supplier", answerable: true },
  { id: "q3", question: "超过 10 万的采购需要几家比价？", expectedDoc: "policy-quote", answerable: true },
  { id: "q4", question: "预付款比例一般不超过多少？", expectedDoc: "policy-payment", answerable: true },
  { id: "q5", question: "紧急采购多久内要补齐审批？", expectedDoc: "policy-emergency", answerable: true },
  { id: "q6", question: "供应商黑名单期限一般多久？", expectedDoc: "policy-blacklist", answerable: true },
  { id: "q7", question: "采购系统可以明文存身份证号吗？", expectedDoc: "policy-data", answerable: true },
  { id: "q8", question: "非模板合同需要谁审核？", expectedDoc: "policy-contract", answerable: true },
  { id: "q9", question: "员工年假有多少天？", answerable: false },
  { id: "q10", question: "公司股票代码是什么？", answerable: false },
];

export type EvalRow = {
  id: string;
  question: string;
  expectedDoc?: string;
  retrieved: string[];
  cited: string[];
  refused: boolean;
  recall: boolean;
  citationOk: boolean;
  refusalOk: boolean;
};

export function answer(question: Question, k = 3): EvalRow {
  const hits = search(question.question, k);
  const retrieved = hits.map((h) => h.doc.id);
  const top = hits[0];
  const refused = !top || top.score < 10;

  // A deliberately simple extractive answer: cite the top document.
  const cited = refused || !top ? [] : [top.doc.id];
  const recall = !question.answerable || (question.expectedDoc ? retrieved.includes(question.expectedDoc) : false);
  const citationOk = cited.every((id) => retrieved.includes(id));
  const refusalOk = question.answerable ? !refused : refused;

  return {
    id: question.id,
    question: question.question,
    ...(question.expectedDoc ? { expectedDoc: question.expectedDoc } : {}),
    retrieved,
    cited,
    refused,
    recall,
    citationOk,
    refusalOk,
  };
}

export function evaluate(): { rows: EvalRow[]; recall: number; citation: number; refusal: number } {
  const rows = questions.map((q) => answer(q));
  const rate = (xs: boolean[]) => (xs.length ? xs.filter(Boolean).length / xs.length : 0);
  return {
    rows,
    recall: rate(rows.map((r) => r.recall)),
    citation: rate(rows.map((r) => r.citationOk)),
    refusal: rate(rows.map((r) => r.refusalOk)),
  };
}
