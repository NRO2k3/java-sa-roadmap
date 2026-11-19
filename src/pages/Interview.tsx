import { CheckOutlined, DownloadOutlined, ReadOutlined, ReloadOutlined, UndoOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Input,
  Pagination,
  Progress,
  Result,
  Row,
  Segmented,
  Select,
  Space,
  Typography,
  theme,
} from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import InterviewCard from '../components/InterviewCard';
import TrackSwitch from '../components/TrackSwitch';
import { interviewItems, topicInterview, type InterviewItem } from '../content/interview';
import { lessonPath } from '../content/lessons';
import type { InterviewLevel } from '../content/types';
import { useInterviewMastered } from '../interviewReview';
import { shuffle } from '../quizUtils';
import { useTrack, useTrackOfPhase } from '../track';
import { useReviewKeys } from '../useReviewKeys';

const { Title, Paragraph, Text } = Typography;

const ALL = 'all';
const PAGE_SIZE = 12;
const EXPORT_WIDTH = 640;
const LEVELS: InterviewLevel[] = ['Junior', 'Middle', 'Senior'];

type Mode = 'gallery' | 'practice';

/** Giai đoạn trong tham số scope (phase:<id> hoặc topic:<id>/<topic>) */
const phaseOfScope = (scope: string | null) => scope?.match(/^(?:phase|topic):([^/]+)/)?.[1];

export default function Interview() {
  const [params] = useSearchParams();
  const track = useTrackOfPhase(phaseOfScope(params.get('scope')));
  // Đổi lộ trình thì danh sách và phiên luyện làm lại từ đầu
  return <InterviewDeck key={track.id} />;
}

function InterviewDeck() {
  const { trackPhaseList } = useTrack();
  const [params, setParams] = useSearchParams();
  const { mastered, mark } = useInterviewMastered();
  const [mode, setMode] = useState<Mode>('gallery');
  const [level, setLevel] = useState<InterviewLevel | typeof ALL>(ALL);
  const [onlyNew, setOnlyNew] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [round, setRound] = useState(0);

  const trackPhaseIds = trackPhaseList.map((p) => p.id);
  const trackItems = interviewItems.filter((q) => trackPhaseIds.includes(q.phaseId));

  const scopeOptions = [
    { value: ALL, label: `Tất cả chủ đề (${trackItems.length} câu)` },
    ...trackPhaseList
      .map((p, i) => ({
        label: `${i + 1}. ${p.title}`,
        options: [
          { value: `phase:${p.id}`, label: `Cả giai đoạn (${trackItems.filter((q) => q.phaseId === p.id).length} câu)` },
          ...p.topics
            .map((t) => ({ value: `topic:${p.id}/${t.id}`, label: t.title, count: topicInterview(p.id, t.id).length }))
            .filter((o) => o.count > 0)
            .map((o) => ({ value: o.value, label: `${o.label} (${o.count} câu)` })),
        ],
      }))
      .filter((g) => g.options.length > 1),
  ];
  const validScopes = scopeOptions.flatMap((o) => ('options' in o ? o.options.map((x) => x.value) : [o.value]));
  const requested = params.get('scope') ?? ALL;
  const scope = validScopes.includes(requested) ? requested : ALL;

  const scopeItems = useMemo(() => {
    if (scope.startsWith('phase:')) return trackItems.filter((q) => q.phaseId === scope.slice('phase:'.length));
    if (scope.startsWith('topic:')) {
      const [phaseId, topicId] = scope.slice('topic:'.length).split('/');
      return topicInterview(phaseId, topicId);
    }
    return trackItems;
    // trackItems suy ra từ lộ trình, mà đổi lộ trình thì component được tạo lại
  }, [scope]);

  const keyword = query.trim().toLowerCase();
  const filtered = scopeItems.filter(
    (q) =>
      (level === ALL || q.level === level) &&
      (!onlyNew || !mastered.has(q.id)) &&
      (!keyword || q.question.toLowerCase().includes(keyword) || q.points.some((p) => p.toLowerCase().includes(keyword))),
  );
  const masteredCount = scopeItems.filter((q) => mastered.has(q.id)).length;

  // Đổi bộ lọc thì quay về trang đầu
  useEffect(() => setPage(1), [scope, level, onlyNew, keyword]);

  return (
    <div className="page">
      <Title level={2}>Ôn phỏng vấn</Title>
      <Paragraph type="secondary">
        Câu hỏi phỏng vấn hay gặp theo từng chủ đề, mỗi câu là một thẻ: ý chính cần nói, bảng so sánh, code mẫu, mẹo và câu
        hỏi nối tiếp. Tải thẻ về thành ảnh để lưu hoặc chia sẻ, hoặc chuyển sang chế độ luyện để tự trả lời trước khi xem.
      </Paragraph>

      <Space wrap style={{ marginBottom: 12 }}>
        <TrackSwitch />
        <Select
          value={scope}
          onChange={(value: string) => setParams(value === ALL ? {} : { scope: value })}
          options={scopeOptions}
          showSearch
          optionFilterProp="label"
          style={{ minWidth: 300 }}
        />
        <Segmented<Mode>
          value={mode}
          onChange={setMode}
          options={[
            { value: 'gallery', label: 'Xem thẻ' },
            { value: 'practice', label: 'Luyện phỏng vấn' },
          ]}
        />
      </Space>
      <Space wrap style={{ marginBottom: 16 }}>
        <Segmented<InterviewLevel | typeof ALL>
          value={level}
          onChange={setLevel}
          options={[{ value: ALL, label: 'Mọi cấp độ' }, ...LEVELS.map((l) => ({ value: l, label: l }))]}
        />
        <Checkbox checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)}>
          Chỉ câu chưa nắm
        </Checkbox>
        {mode === 'gallery' && (
          <Input.Search
            allowClear
            placeholder="Tìm câu hỏi: Kafka, transaction, feedback…"
            onSearch={setQuery}
            onChange={(e) => !e.target.value && setQuery('')}
            style={{ width: 300, maxWidth: '100%' }}
          />
        )}
      </Space>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>
            Đã nắm <Text strong>{masteredCount}</Text>/{scopeItems.length} câu trong phạm vi này
          </Text>
          <Progress
            percent={scopeItems.length ? Math.round((masteredCount / scopeItems.length) * 100) : 0}
            size="small"
            style={{ width: 220, margin: 0 }}
          />
        </Space>
      </Card>

      {mode === 'gallery' ? (
        <Gallery items={filtered} page={page} onPage={setPage} mastered={mastered} onMark={mark} />
      ) : (
        <Practice
          key={`${scope}|${level}|${onlyNew}|${round}`}
          items={filtered}
          onMark={mark}
          onRestart={() => setRound((r) => r + 1)}
        />
      )}
    </div>
  );
}

interface GalleryProps {
  items: InterviewItem[];
  page: number;
  onPage: (page: number) => void;
  mastered: Set<string>;
  onMark: (id: string, known: boolean) => void;
}

function Gallery({ items, page, onPage, mastered, onMark }: GalleryProps) {
  if (items.length === 0) return <Empty description="Không có câu hỏi phù hợp bộ lọc" />;
  const visible = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <Row gutter={[16, 24]}>
        {visible.map((item) => (
          <Col xs={24} lg={12} key={item.id}>
            <GalleryCard item={item} known={mastered.has(item.id)} onMark={onMark} />
          </Col>
        ))}
      </Row>
      {items.length > PAGE_SIZE && (
        <Pagination
          style={{ marginTop: 24, textAlign: 'center' }}
          current={page}
          pageSize={PAGE_SIZE}
          total={items.length}
          showSizeChanger={false}
          onChange={(p) => {
            onPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </>
  );
}

function GalleryCard({
  item,
  known,
  onMark,
}: {
  item: InterviewItem;
  known: boolean;
  onMark: (id: string, known: boolean) => void;
}) {
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const ref = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const download = async () => {
    const node = ref.current;
    if (!node) return;
    setSaving(true);
    const width = node.style.width;
    try {
      // Chỉ tải thư viện chụp ảnh khi cần
      const { toPng } = await import('html-to-image');
      // Ảnh luôn cùng khổ dù đang xem trên điện thoại hay màn hình rộng
      node.style.width = `${EXPORT_WIDTH}px`;
      const url = await toPng(node, { pixelRatio: 2, backgroundColor: token.colorBgContainer });
      const a = document.createElement('a');
      a.href = url;
      a.download = `phong-van-${item.topicId}-${Number(item.id.split('.').pop()) + 1}.png`;
      a.click();
    } catch {
      message.error('Không tạo được ảnh, hãy thử lại');
    } finally {
      node.style.width = width;
      setSaving(false);
    }
  };

  return (
    <div>
      <InterviewCard ref={ref} item={item} />
      <Space wrap style={{ marginTop: 8 }}>
        <Checkbox checked={known} onChange={(e) => onMark(item.id, e.target.checked)}>
          Đã nắm
        </Checkbox>
        <Button size="small" icon={<DownloadOutlined />} loading={saving} onClick={download}>
          Tải ảnh
        </Button>
        <Link to={lessonPath(item.phaseId, item.topicId)}>
          <Button size="small" type="link" icon={<ReadOutlined />}>
            Học bài
          </Button>
        </Link>
      </Space>
    </div>
  );
}

function Practice({
  items,
  onMark,
  onRestart,
}: {
  items: InterviewItem[];
  onMark: (id: string, known: boolean) => void;
  onRestart: () => void;
}) {
  // Chụp danh sách khi bắt đầu phiên; đánh dấu trong phiên không làm đổi thứ tự
  const [queue, setQueue] = useState(() => shuffle(items));
  const [total] = useState(queue.length);
  const [revealed, setRevealed] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const current = queue[0];

  const answer = (known: boolean) => {
    if (!current || !revealed) return;
    onMark(current.id, known);
    if (known) setKnownCount((n) => n + 1);
    setQueue((q) => q.slice(1));
    setRevealed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useReviewKeys({ flip: () => setRevealed(true), answer });

  if (total === 0) return <Empty description="Không có câu hỏi phù hợp bộ lọc" />;

  if (!current) {
    return (
      <Card>
        <Result
          status="success"
          title={`Đã luyện xong ${total} câu`}
          subTitle={`Tự tin trả lời được ${knownCount}/${total} câu. Câu chưa nắm có thể lọc lại bằng "Chỉ câu chưa nắm".`}
          extra={
            <Button type="primary" icon={<ReloadOutlined />} onClick={onRestart}>
              Luyện lượt mới
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }} wrap>
        <Text type="secondary">
          Câu {total - queue.length + 1}/{total} · tự trả lời thành tiếng trước khi xem đáp án
        </Text>
        <Link to={lessonPath(current.phaseId, current.topicId)}>Xem bài học</Link>
      </Space>
      <Progress percent={Math.round(((total - queue.length) / total) * 100)} showInfo={false} size="small" />
      <div style={{ marginTop: 12 }}>
        <InterviewCard item={current} hidden={!revealed} onReveal={() => setRevealed(true)} />
      </div>
      {revealed && (
        <Space wrap style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
          <Button size="large" icon={<UndoOutlined />} onClick={() => answer(false)}>
            Cần ôn lại (←)
          </Button>
          <Button size="large" type="primary" icon={<CheckOutlined />} onClick={() => answer(true)}>
            Đã nắm (→)
          </Button>
        </Space>
      )}
    </div>
  );
}
