import { CheckOutlined, CloseOutlined, ReloadOutlined, SwapOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Popconfirm,
  Progress,
  Result,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
  theme,
} from 'antd';
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import TrackSwitch from '../components/TrackSwitch';
import { lessonCards, patternCards, topicCards, type Card as FlashCard } from '../content/flashcards';
import { lessonPath } from '../content/lessons';
import { phaseById } from '../data/roadmap';
import { INTERVAL_DAYS, MASTERED_BOX, isDue, useFlashcardReview, type ReviewStates } from '../flashcardReview';
import { shuffle } from '../quizUtils';
import { useTrack } from '../track';

const { Title, Paragraph, Text } = Typography;

const ALL = 'all';
const PATTERNS = 'patterns';
// 0 nghĩa là ôn toàn bộ thẻ trong phạm vi
const SIZES = [20, 50, 0];

type Mode = 'due' | 'all';

function sourceOf(card: FlashCard) {
  if (card.label) return { text: card.label };
  const phase = phaseById(card.phaseId!);
  const topic = phase?.topics.find((t) => t.id === card.topicId);
  return { text: topic ? topic.title : (phase?.title ?? ''), link: lessonPath(card.phaseId!, card.topicId!) };
}

export default function Flashcards() {
  const { track } = useTrack();
  // Đổi lộ trình thì phiên ôn bắt đầu lại
  return <FlashcardDeck key={track.id} />;
}

function FlashcardDeck() {
  const { trackPhaseList } = useTrack();
  const [params, setParams] = useSearchParams();
  const { states, grade, reset } = useFlashcardReview();
  const [mode, setMode] = useState<Mode>('due');
  const [size, setSize] = useState(20);
  const [round, setRound] = useState(0);

  const trackPhaseIds = trackPhaseList.map((p) => p.id);
  const trackCards = lessonCards.filter((c) => trackPhaseIds.includes(c.phaseId!));

  const scopeOptions = [
    { value: ALL, label: `Tất cả bài (${trackCards.length} thẻ)` },
    ...trackPhaseList
      .map((p, i) => ({
        label: `${i + 1}. ${p.title}`,
        options: [
          { value: `phase:${p.id}`, label: `Cả giai đoạn (${trackCards.filter((c) => c.phaseId === p.id).length} thẻ)` },
          ...p.topics
            .map((t) => ({ value: `topic:${p.id}/${t.id}`, label: `${t.title} (${topicCards(p.id, t.id).length} thẻ)`, count: topicCards(p.id, t.id).length }))
            .filter((o) => o.count > 0)
            .map(({ value, label }) => ({ value, label })),
        ],
      }))
      .filter((g) => g.options.length > 1),
    { value: PATTERNS, label: `Mẫu kiến trúc (${patternCards.length} thẻ)` },
  ];
  const validScopes = scopeOptions.flatMap((o) => ('options' in o ? o.options.map((x) => x.value) : [o.value]));
  const requested = params.get('scope') ?? ALL;
  const scope = validScopes.includes(requested) ? requested : ALL;

  const scopeCards = useMemo(() => {
    if (scope === PATTERNS) return patternCards;
    if (scope.startsWith('phase:')) return trackCards.filter((c) => c.phaseId === scope.slice('phase:'.length));
    if (scope.startsWith('topic:')) {
      const [phaseId, topicId] = scope.slice('topic:'.length).split('/');
      return topicCards(phaseId, topicId);
    }
    return trackCards;
    // trackCards suy ra từ lộ trình, mà đổi lộ trình thì component được tạo lại
  }, [scope]);

  const now = Date.now();
  const due = scopeCards.filter((c) => isDue(states[c.id], now));
  const fresh = scopeCards.filter((c) => !states[c.id]).length;
  const mastered = scopeCards.filter((c) => (states[c.id]?.box ?? 0) >= MASTERED_BOX).length;
  const nextDue = Math.min(...scopeCards.map((c) => states[c.id]?.due ?? Infinity).filter((d) => d > now));

  // Chụp danh sách thẻ khi bắt đầu phiên; chấm điểm trong phiên không làm đổi thứ tự
  const sessionCards = useMemo(() => {
    const pool = mode === 'due' ? due : scopeCards;
    // Thẻ đang học đến hạn ôn trước, thẻ mới theo thứ tự bài
    const reviews = shuffle(pool.filter((c) => states[c.id]));
    const news = pool.filter((c) => !states[c.id]);
    return [...reviews, ...news].slice(0, size || undefined);
  }, [scope, mode, size, round]);

  const restart = () => setRound((r) => r + 1);

  return (
    <div className="page" style={{ maxWidth: 860 }}>
      <Title level={2}>Flashcard ôn tập</Title>
      <Paragraph type="secondary">
        Đọc mặt trước, tự nhớ câu trả lời rồi lật thẻ và tự chấm. Thẻ nhớ rồi sẽ hẹn ôn lại sau{' '}
        {INTERVAL_DAYS.slice(1).join(', ')} ngày (lặp lại ngắt quãng); thẻ chưa nhớ quay lại cuối phiên.
      </Paragraph>

      <Space wrap style={{ marginBottom: 16 }}>
        <TrackSwitch />
        <Select
          value={scope}
          onChange={(value: string) => setParams(value === ALL ? {} : { scope: value })}
          options={scopeOptions}
          showSearch
          optionFilterProp="label"
          style={{ minWidth: 300 }}
        />
      </Space>
      <Space wrap style={{ marginBottom: 16 }}>
        <Segmented<Mode>
          value={mode}
          onChange={setMode}
          options={[
            { value: 'due', label: `Cần ôn (${due.length})` },
            { value: 'all', label: `Tất cả (${scopeCards.length})` },
          ]}
        />
        <Segmented<number>
          value={size}
          onChange={setSize}
          options={SIZES.map((n) => ({ value: n, label: n ? `${n} thẻ/phiên` : 'Không giới hạn' }))}
        />
      </Space>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {[
          { title: 'Cần ôn hôm nay', value: due.length },
          { title: 'Thẻ mới', value: fresh },
          { title: 'Đang học', value: scopeCards.length - fresh - mastered },
          { title: 'Đã thuộc', value: mastered },
        ].map((s) => (
          <Col xs={12} md={6} key={s.title}>
            <Card size="small">
              <Statistic title={s.title} value={s.value} />
            </Card>
          </Col>
        ))}
      </Row>

      <Session
        key={`${scope}|${mode}|${size}|${round}`}
        cards={sessionCards}
        states={states}
        onGrade={grade}
        onRestart={restart}
        empty={
          <Result
            status="success"
            title={scopeCards.length ? 'Không còn thẻ nào cần ôn' : 'Chưa có flashcard cho phạm vi này'}
            subTitle={
              Number.isFinite(nextDue)
                ? `Thẻ tiếp theo đến hạn ngày ${new Date(nextDue).toLocaleDateString('vi-VN')}.`
                : undefined
            }
            extra={
              scopeCards.length > 0 && (
                <Button type="primary" onClick={() => setMode('all')}>
                  Ôn tất cả thẻ
                </Button>
              )
            }
          />
        }
      />

      {scopeCards.some((c) => states[c.id]) && (
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Popconfirm
            title="Đặt lại tiến độ flashcard?"
            description="Mọi thẻ trong phạm vi đang chọn sẽ trở về thẻ mới."
            okText="Đặt lại"
            cancelText="Huỷ"
            onConfirm={() => {
              reset(scopeCards.map((c) => c.id));
              restart();
            }}
          >
            <Button size="small" type="text" icon={<ReloadOutlined />}>
              Đặt lại tiến độ thẻ của phạm vi này
            </Button>
          </Popconfirm>
        </div>
      )}
    </div>
  );
}

interface SessionProps {
  cards: FlashCard[];
  states: ReviewStates;
  onGrade: (id: string, remembered: boolean) => void;
  onRestart: () => void;
  empty: ReactNode;
}

function Session({ cards, states, onGrade, onRestart, empty }: SessionProps) {
  const { token } = theme.useToken();
  const [queue, setQueue] = useState(cards);
  const [flipped, setFlipped] = useState(false);
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const current = queue[0];

  const answer = (remembered: boolean) => {
    if (!current || !flipped) return;
    onGrade(current.id, remembered);
    if (!remembered) setMissed((m) => new Set(m).add(current.id));
    // Chưa nhớ thì đưa thẻ về cuối hàng để gặp lại trong phiên
    setQueue((q) => (remembered ? q.slice(1) : [...q.slice(1), q[0]]));
    setFlipped(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, .ant-select')) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === 'ArrowRight' || e.key === '2') {
        answer(true);
      } else if (e.key === 'ArrowLeft' || e.key === '1') {
        answer(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (cards.length === 0) return <Card>{empty}</Card>;

  if (!current) {
    return (
      <Card>
        <Result
          status="success"
          title={`Đã ôn xong ${cards.length} thẻ`}
          subTitle={`Nhớ ngay lần đầu ${cards.length - missed.size}/${cards.length} thẻ. Các thẻ đã được hẹn lịch ôn lại.`}
          extra={
            <Button type="primary" icon={<ReloadOutlined />} onClick={onRestart}>
              Phiên ôn mới
            </Button>
          }
        />
      </Card>
    );
  }

  const source = sourceOf(current);
  const box = states[current.id]?.box;
  const done = cards.length - queue.length;
  const vars = {
    '--fc-bg': token.colorBgContainer,
    '--fc-back': token.colorPrimaryBg,
    '--fc-border': token.colorBorderSecondary,
  } as CSSProperties;

  return (
    <Card>
      <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
        <Text type="secondary">
          Đã xong {done}/{cards.length} · còn {queue.length} lượt
        </Text>
        <Space size={4} wrap>
          {box === undefined ? <Tag color="blue">Thẻ mới</Tag> : <Tag>Hộp {box}</Tag>}
          <Tag color="purple" style={{ whiteSpace: 'normal' }}>
            {source.link ? <Link to={source.link}>{source.text}</Link> : source.text}
          </Tag>
        </Space>
      </Space>
      <Progress percent={Math.round((done / cards.length) * 100)} showInfo={false} size="small" />

      <div
        className={`flashcard${flipped ? ' flipped' : ''}`}
        style={vars}
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Mặt sau thẻ, bấm để lật lại' : 'Mặt trước thẻ, bấm để lật'}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className="flashcard-inner">
          <div className="flashcard-face" aria-hidden={flipped}>
            <Text type="secondary" className="flashcard-label">
              CÂU HỎI
            </Text>
            <div className="flashcard-front-text">{current.front}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Bấm vào thẻ hoặc nhấn Space để lật
            </Text>
          </div>
          <div className="flashcard-face flashcard-back" aria-hidden={!flipped}>
            <Text type="secondary" className="flashcard-label">
              TRẢ LỜI
            </Text>
            <div className="flashcard-back-text">{current.back}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        {flipped ? (
          <Space wrap>
            <Button danger size="large" icon={<CloseOutlined />} onClick={() => answer(false)}>
              Chưa nhớ (←)
            </Button>
            <Button type="primary" size="large" icon={<CheckOutlined />} onClick={() => answer(true)}>
              Nhớ rồi (→)
            </Button>
          </Space>
        ) : (
          <Button size="large" icon={<SwapOutlined />} onClick={() => setFlipped(true)}>
            Lật thẻ (Space)
          </Button>
        )}
      </div>
    </Card>
  );
}
