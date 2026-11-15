// Mỗi bài học là một file markdown, tải theo nhu cầu nên không làm nặng bundle chính
const lessonFiles = import.meta.glob<string>('./*/*.md', { query: '?raw', import: 'default' });

const fileOf = (phaseId: string, topicId: string) => `./${phaseId}/${topicId}.md`;

export const lessonPath = (phaseId: string, topicId: string) => `/lesson/${phaseId}/${topicId}`;

export const hasLesson = (phaseId: string, topicId: string) => fileOf(phaseId, topicId) in lessonFiles;

export function loadLesson(phaseId: string, topicId: string): Promise<string> {
  const load = lessonFiles[fileOf(phaseId, topicId)];
  return load ? load() : Promise.reject(new Error(`Chưa có bài học ${phaseId}/${topicId}`));
}
