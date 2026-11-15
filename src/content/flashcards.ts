import { patterns } from '../data/patterns';
import type { Flashcard, LessonFlashcards } from './types';

export interface Card extends Flashcard {
  id: string;
  /** Không có với thẻ mẫu kiến trúc */
  phaseId?: string;
  topicId?: string;
  label?: string;
}

const cardFiles = import.meta.glob<LessonFlashcards>('./*/flashcards.ts', { import: 'default', eager: true });

// './java-core/flashcards.ts' -> 'java-core'
const cardsByPhase = Object.fromEntries(Object.entries(cardFiles).map(([file, cards]) => [file.split('/')[1], cards]));

export function topicCards(phaseId: string, topicId: string): Card[] {
  return (cardsByPhase[phaseId]?.[topicId] ?? []).map((c, i) => ({ ...c, id: `${phaseId}.${topicId}.${i}`, phaseId, topicId }));
}

export const lessonCards: Card[] = Object.entries(cardsByPhase).flatMap(([phaseId, cards]) =>
  Object.keys(cards).flatMap((topicId) => topicCards(phaseId, topicId)),
);

export const patternCards: Card[] = patterns.map((p) => ({
  id: `pattern.${p.name}`,
  front: p.name,
  back: `Vấn đề: ${p.problem}\nGiải pháp: ${p.solution}`,
  label: `Mẫu kiến trúc · ${p.category}`,
}));
