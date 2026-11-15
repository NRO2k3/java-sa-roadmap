// Gửi lời nhắc học qua Telegram, kèm một flashcard và một câu hỏi trong ngày (đáp án che bằng spoiler).
// Chạy: node --experimental-strip-types scripts/telegram-reminder.mjs
// Biến môi trường: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TRACK (sa | lead, để trống = cả hai), DRY_RUN=1 để chỉ in tin nhắn.
import { existsSync } from 'node:fs';

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const dryRun = process.env.DRY_RUN === '1';

if (!dryRun && (!token || !chatId)) {
  console.log('Chưa cấu hình TELEGRAM_BOT_TOKEN và TELEGRAM_CHAT_ID, bỏ qua.');
  process.exit(0);
}

const [owner = '', repo = ''] = (process.env.GITHUB_REPOSITORY ?? '').split('/');
const siteUrl = process.env.SITE_URL || `https://${owner.toLowerCase()}.github.io/${repo}/`;

const { phases, tracks } = await import('../src/data/roadmap.ts');
const track = tracks.find((t) => t.id === process.env.TRACK);
const trackPhases = track ? phases.filter((p) => track.phaseIds.includes(p.id)) : phases;
const contentDir = new URL('../src/content/', import.meta.url);

async function loadItems(phase, file) {
  const url = new URL(`${phase.id}/${file}`, contentDir);
  if (!existsSync(url)) return [];
  const { default: byTopic } = await import(url.href);
  return Object.entries(byTopic).flatMap(([topicId, items]) => {
    const topic = phase.topics.find((t) => t.id === topicId);
    return topic ? items.map((item) => ({ ...item, phase, topic })) : [];
  });
}

const cards = [];
const questions = [];
const lessons = [];
for (const phase of trackPhases) {
  cards.push(...(await loadItems(phase, 'flashcards.ts')));
  questions.push(...(await loadItems(phase, 'quiz.ts')));
  for (const topic of phase.topics) {
    if (existsSync(new URL(`${phase.id}/${topic.id}.md`, contentDir))) lessons.push({ phase, topic });
  }
}

const pick = (items) => items[Math.floor(Math.random() * items.length)];
const escape = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const link = (path, text) => `<a href="${siteUrl}#${path}">${escape(text)}</a>`;

const parts = ['<b>📚 Đến giờ học rồi!</b>', 'Mỗi ngày một chút, đều đặn quan trọng hơn học dồn.'];

const card = pick(cards);
if (card) {
  parts.push(
    '',
    `<b>🃏 Flashcard hôm nay</b> · <i>${escape(card.topic.title)}</i>`,
    `❓ ${escape(card.front)}`,
    `💡 <tg-spoiler>${escape(card.back)}</tg-spoiler>`,
  );
}

const question = pick(questions);
if (question) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  parts.push(
    '',
    `<b>📝 Câu hỏi nhanh</b> · <i>${escape(question.topic.title)}</i>`,
    escape(question.question),
    ...question.options.map((o, i) => `${letters[i]}. ${escape(o)}`),
    `Đáp án: <tg-spoiler>${letters[question.answer]}. ${escape(question.options[question.answer])}. ${escape(question.explanation)}</tg-spoiler>`,
  );
}

const lesson = pick(lessons);
if (lesson) {
  parts.push('', `<b>📖 Gợi ý học:</b> ${link(`/lesson/${lesson.phase.id}/${lesson.topic.id}`, lesson.topic.title)}`);
}
parts.push(`🔥 ${link('/habits', 'Xem chuỗi ngày học')} · 🃏 ${link('/flashcards', 'Ôn flashcard đến hạn')}`);

const text = parts.join('\n');

if (dryRun) {
  console.log(text);
  process.exit(0);
}

const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', link_preview_options: { is_disabled: true } }),
});
if (!res.ok) {
  // Không in URL vì có chứa token
  console.error(`Telegram trả lỗi ${res.status}: ${await res.text()}`);
  process.exit(1);
}
console.log('Đã gửi lời nhắc học.');
