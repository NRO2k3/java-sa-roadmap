import { CheckCircleFilled, CloseCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Empty, List, Progress, Radio, Result, Segmented, Select, Space, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TrackSwitch from '../components/TrackSwitch';
import { lessonQuestions } from '../content/quizzes';
import { phaseById } from '../data/roadmap';
import { questions, type Question } from '../data/quiz';
import { shuffle, shuffleOptions } from '../quizUtils';
import { logQuiz } from '../activity';
import { useTrack } from '../track';

const { Title, Paragraph, Text } = Typography;

const ALL = 'all';
// 0 nghĩa là làm toàn bộ câu trong phạm vi
const SIZES = [10, 20, 50, 0];

// Câu hỏi tổng hợp của giai đoạn và câu hỏi cuối các bài học
const pool = [...questions, ...lessonQuestions];

function sourceLabel(q: Question) {
  const phase = phaseById(q.phaseId);
  const topic = phase?.topics.find((t) => t.id === q.topicId);
  return topic ? `${phase!.title} · ${topic.title}` : (phase?.title ?? q.phaseId);
}

export default function Quiz() {
  const { track } = useTrack();
  // Đổi lộ trình thì làm bài mới từ đầu
  return <QuizRun key={track.id} />;
}

function QuizRun() {
  const { trackPhaseList } = useTrack();
  const [params, setParams] = useSearchParams();
  const trackPhaseIds = trackPhaseList.map((p) => p.id);
  const requested = params.get('phase') ?? ALL;
  const scope = trackPhaseIds.includes(requested) ? requested : ALL;
  const trackQuestions = pool.filter((q) => trackPhaseIds.includes(q.phaseId));
  const [size, setSize] = useState(20);
  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);

  const deck: Question[] = useMemo(
    () =>
      shuffle(trackQuestions.filter((q) => scope === ALL || q.phaseId === scope))
        .slice(0, size || undefined)
        .map(shuffleOptions),
    // round đổi để xáo lại bộ câu hỏi khi làm lại
    [scope, size, round],
  );

  const restart = () => {
    setRound((r) => r + 1);
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setAnswers([]);
  };

  const changeScope = (value: string) => {
    setParams(value === ALL ? {} : { phase: value });
    restart();
  };

  const changeSize = (value: number) => {
    setSize(value);
    restart();
  };

  const finished = answers.length === deck.length && deck.length > 0;
  const score = answers.filter((a, i) => a === deck[i].answer).length;
  const q = deck[index];

  const header = (
    <Space wrap style={{ marginBottom: 16 }}>
      <TrackSwitch />
      <Select
        value={scope}
        onChange={changeScope}
        style={{ minWidth: 280 }}
        options={[
          { value: ALL, label: `Tất cả giai đoạn (${trackQuestions.length} câu)` },
          ...trackPhaseList.map((p, i) => ({
            value: p.id,
            label: `${i + 1}. ${p.title} (${trackQuestions.filter((x) => x.phaseId === p.id).length} câu)`,
          })),
        ]}
      />
      <Segmented<number>
        value={size}
        onChange={changeSize}
        options={SIZES.map((n) => ({ value: n, label: n ? `${n} câu` : 'Tất cả' }))}
      />
    </Space>
  );

  if (finished) {
    const pct = Math.round((score / deck.length) * 100);
    return (
      <div className="page" style={{ maxWidth: 820 }}>
        <Title level={2}>Trắc nghiệm</Title>
        {header}
        <Card>
          <Result
            status={pct >= 80 ? 'success' : pct >= 50 ? 'info' : 'warning'}
            title={`Bạn đúng ${score}/${deck.length} câu (${pct}%)`}
            subTitle={
              pct >= 80
                ? 'Xuất sắc! Bạn đã nắm vững kiến thức phần này.'
                : pct >= 50
                  ? 'Khá tốt. Hãy xem lại các câu sai bên dưới.'
                  : 'Hãy ôn lại các chủ đề liên quan rồi thử lại nhé.'
            }
            extra={
              <Button type="primary" icon={<ReloadOutlined />} onClick={restart}>
                Làm lại
              </Button>
            }
          />
          <List
            itemLayout="vertical"
            dataSource={deck}
            renderItem={(item, i) => {
              const correct = answers[i] === item.answer;
              return (
                <List.Item key={item.id}>
                  <Space align="start">
                    {correct ? (
                      <CheckCircleFilled style={{ color: '#52c41a', marginTop: 4 }} />
                    ) : (
                      <CloseCircleFilled style={{ color: '#ff4d4f', marginTop: 4 }} />
                    )}
                    <div>
                      <Text strong>{item.question}</Text>
                      {!correct && (
                        <div>
                          <Text type="danger">Bạn chọn: {item.options[answers[i]]}</Text>
                        </div>
                      )}
                      <div>
                        <Text type="success">Đáp án: {item.options[item.answer]}</Text>
                      </div>
                      <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                        {item.explanation}
                      </Paragraph>
                    </div>
                  </Space>
                </List.Item>
              );
            }}
          />
        </Card>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="page" style={{ maxWidth: 820 }}>
        <Title level={2}>Trắc nghiệm</Title>
        {header}
        <Empty description="Chưa có câu hỏi cho phạm vi này" />
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <Title level={2}>Trắc nghiệm</Title>
      <Paragraph type="secondary">
        Ôn tập tổng hợp từ câu hỏi của các giai đoạn và trắc nghiệm cuối mỗi bài học. Câu hỏi được chọn ngẫu nhiên và xáo
        trộn mỗi lần làm.
      </Paragraph>
      {header}
      <Card>
        <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
          <Text type="secondary">
            Câu {index + 1}/{deck.length}
          </Text>
          <Tag color="blue" style={{ whiteSpace: 'normal' }}>
            {sourceLabel(q)}
          </Tag>
        </Space>
        <Progress percent={Math.round((index / deck.length) * 100)} showInfo={false} size="small" />
        <Title level={4} style={{ marginTop: 16 }}>
          {q.question}
        </Title>
        <Radio.Group
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={checked}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {q.options.map((opt, i) => {
              const isAnswer = checked && i === q.answer;
              const isWrong = checked && i === selected && i !== q.answer;
              return (
                <Card
                  key={i}
                  size="small"
                  hoverable={!checked}
                  onClick={() => !checked && setSelected(i)}
                  style={{
                    borderColor: isAnswer ? '#52c41a' : isWrong ? '#ff4d4f' : undefined,
                    cursor: checked ? 'default' : 'pointer',
                  }}
                >
                  <Radio value={i}>{opt}</Radio>
                </Card>
              );
            })}
          </Space>
        </Radio.Group>

        {checked && (
          <Alert
            style={{ marginTop: 16 }}
            type={selected === q.answer ? 'success' : 'error'}
            showIcon
            message={selected === q.answer ? 'Chính xác!' : 'Chưa đúng'}
            description={q.explanation}
          />
        )}

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          {!checked ? (
            <Button
              type="primary"
              disabled={selected === null}
              onClick={() => {
                setChecked(true);
                logQuiz();
              }}
            >
              Kiểm tra
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => {
                setAnswers((a) => [...a, selected!]);
                setSelected(null);
                setChecked(false);
                if (index + 1 < deck.length) setIndex(index + 1);
              }}
            >
              {index + 1 < deck.length ? 'Câu tiếp theo' : 'Xem kết quả'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
