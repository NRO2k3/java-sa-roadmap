import type { InterviewQuestion, LessonInterview } from './types';

export interface InterviewItem extends InterviewQuestion {
  id: string;
  phaseId: string;
  topicId: string;
}

const interviewFiles = import.meta.glob<LessonInterview>('./*/interview.ts', { import: 'default', eager: true });

// './java-core/interview.ts' -> 'java-core'
const interviewByPhase = Object.fromEntries(
  Object.entries(interviewFiles).map(([file, items]) => [file.split('/')[1], items]),
);

export function topicInterview(phaseId: string, topicId: string): InterviewItem[] {
  return (interviewByPhase[phaseId]?.[topicId] ?? []).map((q, i) => ({ ...q, id: `${phaseId}.${topicId}.${i}`, phaseId, topicId }));
}

export const interviewItems: InterviewItem[] = Object.entries(interviewByPhase).flatMap(([phaseId, items]) =>
  Object.keys(items).flatMap((topicId) => topicInterview(phaseId, topicId)),
);
