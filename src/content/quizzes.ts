import type { Question } from '../data/quiz';
import type { LessonQuiz } from './types';

const quizFiles = import.meta.glob<LessonQuiz>('./*/quiz.ts', { import: 'default', eager: true });

// './java-core/quiz.ts' -> 'java-core'
const quizByPhase = Object.fromEntries(Object.entries(quizFiles).map(([file, quiz]) => [file.split('/')[1], quiz]));

export function topicQuestions(phaseId: string, topicId: string): Question[] {
  return (quizByPhase[phaseId]?.[topicId] ?? []).map((q, i) => ({ ...q, id: `${phaseId}.${topicId}.${i}`, phaseId, topicId }));
}

export const lessonQuestions: Question[] = Object.entries(quizByPhase).flatMap(([phaseId, quiz]) =>
  Object.keys(quiz).flatMap((topicId) => topicQuestions(phaseId, topicId)),
);
