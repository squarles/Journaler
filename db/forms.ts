import type { SQLiteDatabase } from "expo-sqlite";

import type {
  Form,
  FormWithQuestions,
  Question,
  QuestionDraft,
  QuestionType,
} from "@/types/journal";

interface FormRow {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface QuestionRow {
  id: number;
  form_id: number;
  prompt: string;
  type: QuestionType;
  sort_order: number;
  required: number;
}

function mapFormRow(row: FormRow): Form {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapQuestionRow(row: QuestionRow): Question {
  return {
    id: row.id,
    formId: row.form_id,
    prompt: row.prompt,
    type: row.type,
    sortOrder: row.sort_order,
    required: row.required === 1,
  };
}

export async function listForms(db: SQLiteDatabase): Promise<Form[]> {
  const rows = await db.getAllAsync<FormRow>(
    "SELECT * FROM forms ORDER BY updated_at DESC",
  );
  return rows.map(mapFormRow);
}

export async function getFormWithQuestions(
  db: SQLiteDatabase,
  formId: number,
): Promise<FormWithQuestions | null> {
  const formRow = await db.getFirstAsync<FormRow>(
    "SELECT * FROM forms WHERE id = ?",
    formId,
  );
  if (!formRow) return null;

  const questionRows = await db.getAllAsync<QuestionRow>(
    "SELECT * FROM questions WHERE form_id = ? ORDER BY sort_order ASC",
    formId,
  );

  return {
    ...mapFormRow(formRow),
    questions: questionRows.map(mapQuestionRow),
  };
}

export interface FormInput {
  title: string;
  description: string | null;
  questions: QuestionDraft[];
}

export async function createForm(
  db: SQLiteDatabase,
  input: FormInput,
): Promise<number> {
  let newFormId = 0;
  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      "INSERT INTO forms (title, description) VALUES (?, ?)",
      input.title,
      input.description,
    );
    newFormId = result.lastInsertRowId;

    for (let i = 0; i < input.questions.length; i++) {
      const q = input.questions[i];
      await db.runAsync(
        "INSERT INTO questions (form_id, prompt, type, sort_order, required) VALUES (?, ?, ?, ?, ?)",
        newFormId,
        q.prompt,
        q.type,
        i,
        q.required ? 1 : 0,
      );
    }
  });
  return newFormId;
}

/**
 * Diffs incoming questions against existing rows by id (rather than delete-all/reinsert)
 * so that ids referenced by answers.question_id on existing responses stay stable.
 */
export async function updateForm(
  db: SQLiteDatabase,
  formId: number,
  input: FormInput,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "UPDATE forms SET title = ?, description = ?, updated_at = datetime('now') WHERE id = ?",
      input.title,
      input.description,
      formId,
    );

    const existingRows = await db.getAllAsync<{ id: number }>(
      "SELECT id FROM questions WHERE form_id = ?",
      formId,
    );
    const existingIds = new Set(existingRows.map((r) => r.id));
    const keptIds = new Set(
      input.questions
        .filter((q) => q.id !== undefined)
        .map((q) => q.id as number),
    );

    for (const id of existingIds) {
      if (!keptIds.has(id)) {
        await db.runAsync("DELETE FROM questions WHERE id = ?", id);
      }
    }

    for (let i = 0; i < input.questions.length; i++) {
      const q = input.questions[i];
      if (q.id !== undefined && existingIds.has(q.id)) {
        await db.runAsync(
          "UPDATE questions SET prompt = ?, type = ?, sort_order = ?, required = ? WHERE id = ?",
          q.prompt,
          q.type,
          i,
          q.required ? 1 : 0,
          q.id,
        );
      } else {
        await db.runAsync(
          "INSERT INTO questions (form_id, prompt, type, sort_order, required) VALUES (?, ?, ?, ?, ?)",
          formId,
          q.prompt,
          q.type,
          i,
          q.required ? 1 : 0,
        );
      }
    }
  });
}

export async function deleteForm(
  db: SQLiteDatabase,
  formId: number,
): Promise<void> {
  await db.runAsync("DELETE FROM forms WHERE id = ?", formId);
}
