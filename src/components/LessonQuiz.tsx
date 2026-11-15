import { CheckCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Progress, Radio, Space, Typography, theme } from 'antd';
import { useMemo, useState, type ReactNode } from 'react';
import type { Question } from '../data/quiz';
import { shuffleOptions } from '../quizUtils';

const { Title, Text } = Typography;

interface Props {
  questions: Question[];
  onFinish: (percent: number) => void;
  /** Nội dung thêm dưới kết quả, ví dụ nút đánh dấu hoàn thành bài */
  extra?: (percent: number) => ReactNode;
}

export default function LessonQuiz({ questions, onFinish, extra }: Props) {
  const { token } = theme.useToken();
  const [round, setRound] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // round đổi để xáo lại đáp án khi làm lại
  const deck = useMemo(() => questions.map(shuffleOptions), [questions, round]);
  const answered = answers.filter((a) => a !== undefined).length;
  const score = deck.filter((q, i) => answers[i] === q.answer).length;
  const pct = Math.round((score / deck.length) * 100);

  const choose = (index: number, option: number) =>
    setAnswers((a) => {
      const next = [...a];
      next[index] = option;
      return next;
    });

  const submit = () => {
    setSubmitted(true);
    onFinish(pct);
  };

  const retry = () => {
    setRound((r) => r + 1);
    setAnswers([]);
    setSubmitted(false);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {deck.map((q, i) => {
        const chosen = answers[i];
        return (
          <div key={q.id}>
            <Text strong>
              Câu {i + 1}. {q.question}
            </Text>
            <Radio.Group
              value={chosen}
              disabled={submitted}
              onChange={(e) => choose(i, e.target.value)}
              style={{ display: 'block', marginTop: 8 }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {q.options.map((opt, j) => {
                  const isAnswer = submitted && j === q.answer;
                  const isWrong = submitted && j === chosen && j !== q.answer;
                  return (
                    <Radio
                      key={j}
                      value={j}
                      style={{
                        color: isAnswer ? token.colorSuccess : isWrong ? token.colorError : undefined,
                        fontWeight: isAnswer ? 600 : undefined,
                      }}
                    >
                      {opt} {isAnswer && <CheckCircleFilled />}
                    </Radio>
                  );
                })}
              </Space>
            </Radio.Group>
            {submitted && (
              <Alert
                style={{ marginTop: 8 }}
                type={chosen === q.answer ? 'success' : 'error'}
                showIcon
                message={chosen === q.answer ? 'Chính xác' : 'Chưa đúng'}
                description={q.explanation}
              />
            )}
          </div>
        );
      })}

      {submitted ? (
        <div>
          <Space align="center" size="large" wrap>
            <Progress type="circle" size={80} percent={pct} status={pct >= 80 ? 'success' : 'normal'} />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Bạn đúng {score}/{deck.length} câu
              </Title>
              <Text type="secondary">
                {pct >= 80
                  ? 'Rất tốt, bạn đã nắm được bài này.'
                  : 'Hãy đọc lại các phần liên quan tới câu sai rồi làm lại.'}
              </Text>
            </div>
            <Button icon={<ReloadOutlined />} onClick={retry}>
              Làm lại
            </Button>
          </Space>
          {extra?.(pct)}
        </div>
      ) : (
        <Space wrap>
          <Button type="primary" disabled={answered < deck.length} onClick={submit}>
            Nộp bài
          </Button>
          <Text type="secondary">
            Đã trả lời {answered}/{deck.length} câu
          </Text>
        </Space>
      )}
    </Space>
  );
}
