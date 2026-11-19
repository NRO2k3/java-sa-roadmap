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

export type InterviewLevel = 'Junior' | 'Middle' | 'Senior';

export interface InterviewQuestion {
  question: string;
  level: InterviewLevel;
  /** 3–6 ý chính của câu trả lời; được dùng `code` và **đậm** */
  points: string[];
  /** Bảng so sánh, dòng đầu là tiêu đề cột */
  compare?: string[][];
  /** Đoạn code ngắn, mỗi phần tử là một dòng */
  code?: string[];
  /** Mẹo trả lời hoặc bẫy hay gặp */
  tip?: string;
  /** Câu nhà tuyển dụng hay hỏi tiếp */
  followUps?: string[];
}

/** Câu hỏi phỏng vấn theo bài học của một giai đoạn, key là topicId */
export type LessonInterview = Record<string, InterviewQuestion[]>;
