// Mỗi bài học là một file markdown, tải theo nhu cầu nên không làm nặng bundle chính
const lessonFiles = import.meta.glob<string>('./*/*.md', { query: '?raw', import: 'default' });

// Chỉ dùng để biết giai đoạn có dữ liệu hay không, không tải nội dung
const flashcardFiles = import.meta.glob('./*/flashcards.ts');
const interviewFiles = import.meta.glob('./*/interview.ts');

const fileOf = (phaseId: string, topicId: string) => `./${phaseId}/${topicId}.md`;

export const hasFlashcards = (phaseId: string) => `./${phaseId}/flashcards.ts` in flashcardFiles;
export const hasInterview = (phaseId: string) => `./${phaseId}/interview.ts` in interviewFiles;

export const lessonPath = (phaseId: string, topicId: string) => `/lesson/${phaseId}/${topicId}`;

export const hasLesson = (phaseId: string, topicId: string) => fileOf(phaseId, topicId) in lessonFiles;

export function loadLesson(phaseId: string, topicId: string): Promise<string> {
  const load = lessonFiles[fileOf(phaseId, topicId)];
  return load ? load() : Promise.reject(new Error(`Chưa có bài học ${phaseId}/${topicId}`));
}
