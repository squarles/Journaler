export type QuestionType = "short_text" | "numeric" | "yes_no";

export interface Form {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: number;
  formId: number;
  prompt: string;
  type: QuestionType;
  sortOrder: number;
  required: boolean;
}

export interface FormWithQuestions extends Form {
  questions: Question[];
}

export interface FormResponse {
  id: number;
  formId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: number;
  responseId: number;
  questionId: number;
  valueText: string | null;
  valueNumeric: number | null;
  valueBool: boolean | null;
}

export interface AnsweredQuestion {
  question: Question;
  answer: Answer | null;
}

export interface ResponseWithAnswers extends FormResponse {
  answers: AnsweredQuestion[];
}

/** Write-time shape for a question in the builder. `id` is present only when editing an existing question. */
export interface QuestionDraft {
  id?: number;
  prompt: string;
  type: QuestionType;
  required: boolean;
}

/** Write-time shape for a single answer value keyed to its question's type. */
export interface AnswerDraft {
  questionId: number;
  type: QuestionType;
  value: string | number | boolean | null;
}
