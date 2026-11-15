export interface LessonQuestion {
  question: string;
  options: string[];
  /** Vị trí đáp án đúng trong options */
  answer: number;
  explanation: string;
}

/** Câu hỏi trắc nghiệm theo bài học của một giai đoạn, key là topicId */
export type LessonQuiz = Record<string, LessonQuestion[]>;

export interface Flashcard {
  front: string;
  back: string;
}

/** Flashcard ôn tập theo bài học của một giai đoạn, key là topicId */
export type LessonFlashcards = Record<string, Flashcard[]>;
