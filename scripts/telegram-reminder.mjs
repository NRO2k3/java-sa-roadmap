// Gửi lời nhắc học qua Telegram: mỗi ngày một chủ đề theo thứ tự lộ trình, kèm flashcard và câu quiz của bài đó.
// Chạy: node --experimental-strip-types scripts/telegram-reminder.mjs
// Biến môi trường: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TRACK (sa | lead, để trống = cả hai),
// START_DATE (YYYY-MM-DD, ngày gửi bài 1), DRY_RUN=1 để chỉ in payload.
import { existsSync } from 'node:fs';

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const dryRun = process.env.DRY_RUN === '1';

if (!dryRun && (!token || !chatId)) {
  console.log('Chưa cấu hình TELEGRAM_BOT_TOKEN và TELEGRAM_CHAT_ID, bỏ qua.');
  process.exit(0);
}

const TIME_ZONE = 'Asia/Ho_Chi_Minh';
// Giới hạn của quiz poll trong Telegram Bot API
const POLL_QUESTION_MAX = 300;
const POLL_OPTION_MAX = 100;
const POLL_EXPLANATION_MAX = 200;

const [owner = '', repo = ''] = (process.env.GITHUB_REPOSITORY ?? '').split('/');
const siteUrl = process.env.SITE_URL || `https://${owner.toLowerCase()}.github.io/${repo}/`;

const { phases, tracks } = await import('../src/data/roadmap.ts');
const track = tracks.find((t) => t.id === process.env.TRACK);
// Theo thứ tự lộ trình; không chọn lộ trình thì lấy SA rồi tới các giai đoạn riêng của Lead
const orderedPhases = track ? track.phaseIds.map((id) => phases.find((p) => p.id === id)) : phases;
const contentDir = new URL('../src/content/', import.meta.url);

async function loadByTopic(phase, file) {
  const url = new URL(`${phase.id}/${file}`, contentDir);
  return existsSync(url) ? (await import(url.href)).default : {};
}

const lessons = [];
for (const [index, phase] of orderedPhases.entries()) {
  const quiz = await loadByTopic(phase, 'quiz.ts');
  const cards = await loadByTopic(phase, 'flashcards.ts');
  for (const topic of phase.topics) {
    if (!existsSync(new URL(`${phase.id}/${topic.id}.md`, contentDir))) continue;
    lessons.push({ phase, phaseOrder: index + 1, topic, questions: quiz[topic.id] ?? [], cards: cards[topic.id] ?? [] });
  }
}
if (lessons.length === 0) {
  console.log('Chưa có bài học nào, bỏ qua.');
  process.exit(0);
}

// Mỗi ngày (giờ Việt Nam) tiến một bài kể từ START_DATE; chạy lại trong ngày vẫn ra cùng bài
const now = new Date();
const today = Date.parse(new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now));
const start = Date.parse(process.env.START_DATE || '2026-11-15');
const dayNumber = Math.round((today - (Number.isNaN(start) ? today : start)) / 86400000);
const lesson = lessons[((dayNumber % lessons.length) + lessons.length) % lessons.length];
const dateLabel = new Intl.DateTimeFormat('vi-VN', { timeZone: TIME_ZONE, weekday: 'long', day: '2-digit', month: '2-digit' }).format(now);

const pick = (items) => items[Math.floor(Math.random() * items.length)];
const escape = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const shorten = (text, max) => (text.length <= max ? text : `${text.slice(0, text.lastIndexOf(' ', max - 1))}…`);
const pageUrl = (path) => `${siteUrl}#${path}`;

const card = pick(lesson.cards);
const lines = [
  `📚 <b>Giờ học Java của bạn đây!</b>`,
  `<i>${escape(dateLabel)} · bài ${lessons.indexOf(lesson) + 1}/${lessons.length}</i>`,
  '',
  `<b>📖 ${escape(lesson.topic.title)}</b>`,
  `<i>Giai đoạn ${lesson.phaseOrder}: ${escape(lesson.phase.title)} · ${escape(lesson.topic.level)}</i>`,
  `<blockquote>${escape(lesson.topic.description)}</blockquote>`,
];
if (card) {
  lines.push(
    '',
    '<b>🃏 Flashcard</b>',
    `<blockquote><b>${escape(card.front)}</b>`,
    `<tg-spoiler>${escape(card.back)}</tg-spoiler></blockquote>`,
    '<i>Tự trả lời trong đầu trước, rồi chạm vào ô mờ để xem đáp án.</i>',
  );
}
lines.push('', '⏱ <i>Chỉ cần 15 phút: đọc bài → làm 5 câu trắc nghiệm → ôn flashcard.</i>');

const keyboard = {
  inline_keyboard: [
    [{ text: '📖 Học bài hôm nay', url: pageUrl(`/lesson/${lesson.phase.id}/${lesson.topic.id}`) }],
    [
      { text: '🃏 Ôn flashcard', url: pageUrl('/flashcards') },
      { text: '🔥 Chuỗi ngày học', url: pageUrl('/habits') },
    ],
  ],
};

const messages = [
  [
    'sendMessage',
    {
      text: lines.join('\n'),
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      reply_markup: keyboard,
    },
  ],
];

// Câu hỏi gửi dạng quiz poll để bấm chọn và xem giải thích ngay trong Telegram
const pollable = lesson.questions.filter(
  (q) => q.question.length <= POLL_QUESTION_MAX - 3 && q.options.every((o) => o.length <= POLL_OPTION_MAX),
);
const question = pick(pollable.length ? pollable : lesson.questions);
const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
const textQuiz = (q) => [
  'sendMessage',
  {
    text: [
      '<b>📝 Câu hỏi nhanh</b>',
      `<blockquote>${escape(q.question)}</blockquote>`,
      ...q.options.map((o, i) => `<b>${letters[i]}.</b> ${escape(o)}`),
      '',
      `Đáp án: <tg-spoiler><b>${letters[q.answer]}</b>. ${escape(q.explanation)}</tg-spoiler>`,
    ].join('\n'),
    parse_mode: 'HTML',
  },
];
if (question && pollable.includes(question)) {
  messages.push([
    'sendPoll',
    {
      question: `📝 ${question.question}`,
      options: question.options.map((text) => ({ text })),
      type: 'quiz',
      correct_option_id: question.answer,
      explanation: shorten(question.explanation, POLL_EXPLANATION_MAX),
      is_anonymous: false,
    },
  ]);
} else if (question) {
  messages.push(textQuiz(question));
}

async function call(method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, ...payload }),
  });
  // Không in URL vì có chứa token
  if (!res.ok) throw new Error(`Telegram ${method} trả lỗi ${res.status}: ${await res.text()}`);
}

for (const [method, payload] of messages) {
  if (dryRun) {
    console.log(`--- ${method}\n${payload.text ?? JSON.stringify(payload, null, 2)}`);
    continue;
  }
  try {
    await call(method, payload);
  } catch (err) {
    if (method !== 'sendPoll') throw err;
    // Poll bị từ chối thì gửi câu hỏi dạng chữ
    console.warn(err.message);
    await call(...textQuiz(question));
  }
}
console.log(dryRun ? 'DRY_RUN: không gửi.' : `Đã gửi lời nhắc: ${lesson.topic.title}`);
