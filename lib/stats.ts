import { answerValue } from "@/db/responses";
import { parseSqliteDate } from "@/lib/dates";
import type { AnsweredQuestion, FormResponse, Question } from "@/types/journal";

export type InsightTimeRange = "week" | "month" | "all";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Filters responses down to those created within the given rolling time range (relative to `now`). */
export function filterResponsesByRange(
  responses: FormResponse[],
  range: InsightTimeRange,
  now: Date = new Date(),
): FormResponse[] {
  if (range === "all") return responses;
  const days = range === "week" ? 7 : 30;
  const cutoff = now.getTime() - days * DAY_MS;
  return responses.filter(
    (r) => parseSqliteDate(r.createdAt).getTime() >= cutoff,
  );
}

export interface NumericInsight {
  type: "numeric";
  question: Question;
  count: number;
  average: number;
  min: number;
  max: number;
}

export interface YesNoInsight {
  type: "yes_no";
  question: Question;
  count: number;
  yesCount: number;
  noCount: number;
  yesPercentage: number;
}

export interface ShortTextInsight {
  type: "short_text";
  question: Question;
  count: number;
}

export type QuestionInsight = NumericInsight | YesNoInsight | ShortTextInsight;

/** Aggregates every answer given to each question of a form into a per-question summary. */
export function computeQuestionInsights(
  questions: Question[],
  answeredQuestions: AnsweredQuestion[],
): QuestionInsight[] {
  const answersByQuestion = new Map<number, AnsweredQuestion[]>();
  for (const aq of answeredQuestions) {
    const list = answersByQuestion.get(aq.question.id) ?? [];
    list.push(aq);
    answersByQuestion.set(aq.question.id, list);
  }

  return questions.map((question): QuestionInsight => {
    const answered = answersByQuestion.get(question.id) ?? [];

    switch (question.type) {
      case "numeric": {
        const values = answered
          .map((aq) => answerValue(aq.answer))
          .filter((v): v is number => typeof v === "number");
        const count = values.length;
        const sum = values.reduce((total, v) => total + v, 0);
        return {
          type: "numeric",
          question,
          count,
          average: count > 0 ? sum / count : 0,
          min: count > 0 ? Math.min(...values) : 0,
          max: count > 0 ? Math.max(...values) : 0,
        };
      }
      case "yes_no": {
        const values = answered
          .map((aq) => answerValue(aq.answer))
          .filter((v): v is boolean => typeof v === "boolean");
        const count = values.length;
        const yesCount = values.filter(Boolean).length;
        return {
          type: "yes_no",
          question,
          count,
          yesCount,
          noCount: count - yesCount,
          yesPercentage: count > 0 ? (yesCount / count) * 100 : 0,
        };
      }
      case "short_text": {
        const values = answered
          .map((aq) => answerValue(aq.answer))
          .filter((v): v is string => typeof v === "string" && v.length > 0);
        return {
          type: "short_text",
          question,
          count: values.length,
        };
      }
    }
  });
}
