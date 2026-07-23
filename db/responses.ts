import type { SQLiteDatabase } from "expo-sqlite";

import type {
  Answer,
  AnsweredQuestion,
  AnswerDraft,
  FormResponse,
  QuestionType,
  ResponseWithAnswers,
} from "@/types/journal";

interface ResponseRow {
  id: number;
  form_id: number;
  created_at: string;
  updated_at: string;
}

interface AnsweredQuestionRow {
  a_id: number;
  a_response_id: number;
  a_question_id: number;
  a_value_text: string | null;
  a_value_numeric: number | null;
  a_value_bool: number | null;
  q_id: number;
  q_form_id: number;
  q_prompt: string;
  q_type: QuestionType;
  q_sort_order: number;
  q_required: number;
}

function mapResponseRow(row: ResponseRow): FormResponse {
  return {
    id: row.id,
    formId: row.form_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAnsweredQuestionRow(row: AnsweredQuestionRow): AnsweredQuestion {
  const answer: Answer = {
    id: row.a_id,
    responseId: row.a_response_id,
    questionId: row.a_question_id,
    valueText: row.a_value_text,
    valueNumeric: row.a_value_numeric,
    valueBool: row.a_value_bool === null ? null : row.a_value_bool === 1,
  };
  return {
    question: {
      id: row.q_id,
      formId: row.q_form_id,
      prompt: row.q_prompt,
      type: row.q_type,
      sortOrder: row.q_sort_order,
      required: row.q_required === 1,
    },
    answer,
  };
}

export async function listResponsesForForm(
  db: SQLiteDatabase,
  formId: number,
): Promise<FormResponse[]> {
  const rows = await db.getAllAsync<ResponseRow>(
    "SELECT * FROM responses WHERE form_id = ? ORDER BY created_at DESC",
    formId,
  );
  return rows.map(mapResponseRow);
}

export async function listAnsweredQuestionsForForm(
  db: SQLiteDatabase,
  formId: number,
): Promise<AnsweredQuestion[]> {
  const answerRows = await db.getAllAsync<AnsweredQuestionRow>(
    `SELECT
       a.id AS a_id, a.response_id AS a_response_id, a.question_id AS a_question_id,
       a.value_text AS a_value_text, a.value_numeric AS a_value_numeric, a.value_bool AS a_value_bool,
       q.id AS q_id, q.form_id AS q_form_id, q.prompt AS q_prompt,
       q.type AS q_type, q.sort_order AS q_sort_order, q.required AS q_required
     FROM answers a
     JOIN questions q ON q.id = a.question_id
     WHERE q.form_id = ?
     ORDER BY q.sort_order ASC`,
    formId,
  );
  return answerRows.map(mapAnsweredQuestionRow);
}

export async function getResponseWithAnswers(
  db: SQLiteDatabase,
  responseId: number,
): Promise<ResponseWithAnswers | null> {
  const responseRow = await db.getFirstAsync<ResponseRow>(
    "SELECT * FROM responses WHERE id = ?",
    responseId,
  );
  if (!responseRow) return null;

  const answerRows = await db.getAllAsync<AnsweredQuestionRow>(
    `SELECT
       a.id AS a_id, a.response_id AS a_response_id, a.question_id AS a_question_id,
       a.value_text AS a_value_text, a.value_numeric AS a_value_numeric, a.value_bool AS a_value_bool,
       q.id AS q_id, q.form_id AS q_form_id, q.prompt AS q_prompt,
       q.type AS q_type, q.sort_order AS q_sort_order, q.required AS q_required
     FROM answers a
     JOIN questions q ON q.id = a.question_id
     WHERE a.response_id = ?
     ORDER BY q.sort_order ASC`,
    responseId,
  );

  return {
    ...mapResponseRow(responseRow),
    answers: answerRows.map(mapAnsweredQuestionRow),
  };
}

/** Picks which of the three value columns an answer's value belongs in, based on its question type. */
function toColumns(
  type: QuestionType,
  value: string | number | boolean | null,
): [string | null, number | null, number | null] {
  if (value === null || value === undefined || value === "") {
    return [null, null, null];
  }
  switch (type) {
    case "short_text":
      return [String(value), null, null];
    case "numeric":
      return [null, Number(value), null];
    case "yes_no":
      return [null, null, value ? 1 : 0];
  }
}

export async function createResponse(
  db: SQLiteDatabase,
  formId: number,
  answers: AnswerDraft[],
): Promise<number> {
  let newResponseId = 0;
  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      "INSERT INTO responses (form_id) VALUES (?)",
      formId,
    );
    newResponseId = result.lastInsertRowId;

    for (const a of answers) {
      const [valueText, valueNumeric, valueBool] = toColumns(a.type, a.value);
      await db.runAsync(
        "INSERT INTO answers (response_id, question_id, value_text, value_numeric, value_bool) VALUES (?, ?, ?, ?, ?)",
        newResponseId,
        a.questionId,
        valueText,
        valueNumeric,
        valueBool,
      );
    }
  });
  return newResponseId;
}

export async function updateResponse(
  db: SQLiteDatabase,
  responseId: number,
  answers: AnswerDraft[],
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "UPDATE responses SET updated_at = datetime('now') WHERE id = ?",
      responseId,
    );

    for (const a of answers) {
      const [valueText, valueNumeric, valueBool] = toColumns(a.type, a.value);
      await db.runAsync(
        `INSERT INTO answers (response_id, question_id, value_text, value_numeric, value_bool)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(response_id, question_id) DO UPDATE SET
           value_text = excluded.value_text,
           value_numeric = excluded.value_numeric,
           value_bool = excluded.value_bool`,
        responseId,
        a.questionId,
        valueText,
        valueNumeric,
        valueBool,
      );
    }
  });
}

export async function deleteResponse(
  db: SQLiteDatabase,
  responseId: number,
): Promise<void> {
  await db.runAsync("DELETE FROM responses WHERE id = ?", responseId);
}

/** Extracts the JS-typed value out of an Answer's type-specific columns, for seeding editable form state. */
export function answerValue(
  answer: Answer | null,
): string | number | boolean | null {
  if (!answer) return null;
  if (answer.valueText !== null) return answer.valueText;
  if (answer.valueNumeric !== null) return answer.valueNumeric;
  if (answer.valueBool !== null) return answer.valueBool;
  return null;
}
