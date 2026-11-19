import {
  CalendarOutlined,
  CoffeeOutlined,
  FireOutlined,
  LikeOutlined,
  TrophyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Card, Col, Progress, Row, Segmented, Space, Statistic, Table, Tooltip, Typography, theme } from 'antd';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  dayKey,
  emptyDay,
  isActiveDay,
  useActivityLog,
  useDailyGoal,
  type ActivityLog,
  type DayActivity,
} from '../activity';

const { Title, Paragraph, Text } = Typography;

const GOALS = [15, 30, 45, 60, 90];
const WEEKS = 26;
const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/** Ngày cách hôm nay `offset` ngày, theo giờ máy */
const daysAgo = (offset: number) => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset);
};

const weekdayOf = (d: Date) => WEEKDAYS[(d.getDay() + 6) % 7];
const formatDate = (d: Date) => `${weekdayOf(d)}, ${d.toLocaleDateString('vi-VN')}`;

function describe(day: DayActivity) {
  const parts = [`${day.minutes} phút`];
  if (day.lessons.length) parts.push(`${day.lessons.length} bài`);
  if (day.quiz) parts.push(`${day.quiz} câu hỏi`);
  if (day.cards) parts.push(`${day.cards} flashcard`);
  if (day.skills) parts.push(`${day.skills} kỹ năng`);
  if (day.interview) parts.push(`${day.interview} câu phỏng vấn`);
  return parts.join(' · ');
}

function streaks(log: ActivityLog) {
  // Hôm nay chưa học thì chuỗi vẫn tính tới hôm qua
  let current = 0;
  for (let i = isActiveDay(log[dayKey()]) ? 0 : 1; isActiveDay(log[dayKey(daysAgo(i))]); i++) current++;

  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const key of Object.keys(log).filter((k) => isActiveDay(log[k])).sort()) {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    run = prev && Math.round((date.getTime() - prev.getTime()) / 86400000) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = date;
  }
  return { current, best: Math.max(best, current) };
}

function sumRange(log: ActivityLog, from: number, to: number) {
  const total = { days: 0, minutes: 0, lessons: 0, quiz: 0, cards: 0 };
  for (let i = from; i < to; i++) {
    const day = log[dayKey(daysAgo(i))];
    if (!day) continue;
    if (isActiveDay(day)) total.days++;
    total.minutes += day.minutes;
    total.lessons += day.lessons.length;
    total.quiz += day.quiz;
    total.cards += day.cards;
  }
  return total;
}

interface Verdict {
  title: string;
  text: string;
  color: string;
  icon: ReactNode;
}

function verdictOf(days: number, colors: { success: string; info: string; warning: string; error: string }): Verdict {
  if (days >= 5)
    return {
      title: 'Chăm chỉ',
      text: `Bạn học ${days}/7 ngày tuần qua. Giữ nhịp này là lộ trình sẽ về đích đúng hẹn.`,
      color: colors.success,
      icon: <FireOutlined />,
    };
  if (days >= 3)
    return {
      title: 'Khá đều đặn',
      text: `Bạn học ${days}/7 ngày tuần qua. Thêm ${5 - days} ngày nữa là vào nhóm chăm chỉ.`,
      color: colors.info,
      icon: <LikeOutlined />,
    };
  if (days >= 1)
    return {
      title: 'Hơi lười rồi',
      text: `Tuần qua mới học ${days} ngày. Đặt lịch cố định mỗi ngày 15–30 phút sẽ dễ duy trì hơn.`,
      color: colors.warning,
      icon: <WarningOutlined />,
    };
  return {
    title: 'Đang lười',
    text: 'Chưa có buổi học nào trong 7 ngày qua. Mở một bài và học 15 phút thôi, bắt đầu lại hôm nay nhé!',
    color: colors.error,
    icon: <CoffeeOutlined />,
  };
}

function DailyChart({ log, goal }: { log: ActivityLog; goal: number }) {
  const { token } = theme.useToken();
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const days = Array.from({ length: 14 }, (_, i) => daysAgo(13 - i)).map((date) => ({
    date,
    day: log[dayKey(date)] ?? emptyDay(),
  }));
  const max = Math.max(goal * 1.5, ...days.map((d) => d.day.minutes));

  return (
    <Card
      title="Phút học 14 ngày gần nhất"
      extra={
        <Segmented
          size="small"
          value={view}
          onChange={(v) => setView(v as 'chart' | 'table')}
          options={[
            { value: 'chart', label: 'Biểu đồ' },
            { value: 'table', label: 'Bảng' },
          ]}
        />
      }
    >
      {view === 'chart' ? (
        <div className="habit-bars" style={{ borderBottom: `1px solid ${token.colorBorder}` }}>
          <div
            className="habit-goal-line"
            style={{ bottom: `${(goal / max) * 100}%`, borderColor: token.colorTextTertiary }}
          >
            <Text type="secondary" style={{ fontSize: 11 }}>
              Mục tiêu {goal} phút
            </Text>
          </div>
          {days.map(({ date, day }) => (
            <Tooltip key={dayKey(date)} title={`${formatDate(date)}: ${describe(day)}`}>
              <div className="habit-bar-slot">
                <div
                  className="habit-bar"
                  style={{
                    height: `${(day.minutes / max) * 100}%`,
                    background: day.minutes >= goal ? token.colorPrimary : token.colorPrimaryBorder,
                  }}
                />
              </div>
            </Tooltip>
          ))}
        </div>
      ) : (
        <Table
          size="small"
          pagination={false}
          scroll={{ x: 600 }}
          rowKey={(r) => dayKey(r.date)}
          dataSource={[...days].reverse()}
          columns={[
            { title: 'Ngày', render: (_, r) => formatDate(r.date) },
            { title: 'Phút', render: (_, r) => r.day.minutes, align: 'right' },
            { title: 'Bài', render: (_, r) => r.day.lessons.length, align: 'right' },
            { title: 'Câu hỏi', render: (_, r) => r.day.quiz, align: 'right' },
            { title: 'Flashcard', render: (_, r) => r.day.cards, align: 'right' },
            { title: 'Kỹ năng', render: (_, r) => r.day.skills, align: 'right' },
            { title: 'Phỏng vấn', render: (_, r) => r.day.interview ?? 0, align: 'right' },
          ]}
        />
      )}
      {view === 'chart' && (
        <>
          <div className="habit-bar-labels">
            {days.map(({ date }) => (
              <Text key={dayKey(date)} type="secondary">
                {date.getDate()}
                <br />
                {weekdayOf(date)}
              </Text>
            ))}
          </div>
          <Space size={12} wrap style={{ marginTop: 8, fontSize: 12 }}>
            <Space size={4}>
              <span className="habit-swatch" style={{ background: token.colorPrimary }} />
              <Text type="secondary">Đạt mục tiêu</Text>
            </Space>
            <Space size={4}>
              <span className="habit-swatch" style={{ background: token.colorPrimaryBorder }} />
              <Text type="secondary">Chưa đạt</Text>
            </Space>
          </Space>
        </>
      )}
    </Card>
  );
}

function Heatmap({ log, goal }: { log: ActivityLog; goal: number }) {
  const { token } = theme.useToken();
  // Thang một màu xanh, càng đậm càng học nhiều so với mục tiêu
  const levels = [token.colorFillSecondary, token.blue3, token.blue5, token.blue7, token.blue9];
  const levelOf = (day?: DayActivity) => {
    if (!day || !isActiveDay(day)) return 0;
    if (day.minutes >= goal * 2) return 4;
    if (day.minutes >= goal) return 3;
    if (day.minutes >= goal / 2) return 2;
    return 1;
  };

  const today = daysAgo(0);
  const mondayOffset = (today.getDay() + 6) % 7;
  // Cột đầu là thứ Hai của tuần cách đây WEEKS-1 tuần
  const start = (WEEKS - 1) * 7 + mondayOffset;
  const weeks = Array.from({ length: WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const offset = start - (w * 7 + d);
      return offset < 0 ? null : daysAgo(offset);
    }),
  );

  // Màn hình hẹp thì cuộn sẵn tới tuần gần nhất
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, []);

  return (
    <Card title={<><CalendarOutlined /> Lịch học {WEEKS} tuần gần nhất</>}>
      <div className="habit-heatmap" ref={scrollRef}>
        <div className="habit-heatmap-days">
          {WEEKDAYS.map((d, i) => (
            <Text key={d} type="secondary">
              {i % 2 === 0 ? d : ''}
            </Text>
          ))}
        </div>
        <div className="habit-heatmap-grid">
          {weeks.map((week, w) => (
            <div key={w} className="habit-heatmap-week">
              <Text type="secondary" className="habit-heatmap-month">
                {week[0] && week[0].getDate() <= 7 ? `Th${week[0].getMonth() + 1}` : ''}
              </Text>
              {week.map((date, d) =>
                date ? (
                  <Tooltip key={d} title={`${formatDate(date)}: ${describe(log[dayKey(date)] ?? emptyDay())}`}>
                    <div className="habit-cell" style={{ background: levels[levelOf(log[dayKey(date)])] }} />
                  </Tooltip>
                ) : (
                  <div key={d} className="habit-cell" style={{ visibility: 'hidden' }} />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      <Space size={4} style={{ marginTop: 12, fontSize: 12 }} wrap>
        <Text type="secondary">Không học</Text>
        {levels.map((c, i) => (
          <div key={i} className="habit-cell" style={{ background: c }} />
        ))}
        <Text type="secondary">Gấp đôi mục tiêu</Text>
      </Space>
    </Card>
  );
}

export default function Habits() {
  const { token } = theme.useToken();
  const log = useActivityLog();
  const [goal, setGoal] = useDailyGoal();
  const today = log[dayKey()] ?? emptyDay();
  const { current, best } = streaks(log);
  const thisWeek = sumRange(log, 0, 7);
  const lastWeek = sumRange(log, 7, 14);
  const verdict = verdictOf(thisWeek.days, {
    success: token.colorSuccess,
    info: token.colorInfo,
    warning: token.colorWarning,
    error: token.colorError,
  });
  const hasData = Object.values(log).some(isActiveDay);

  const weekStats: { title: string; value: number; prev: number; suffix?: string }[] = [
    { title: 'Ngày có học', value: thisWeek.days, prev: lastWeek.days, suffix: '/ 7' },
    { title: 'Phút học', value: thisWeek.minutes, prev: lastWeek.minutes },
    { title: 'Bài đã đọc', value: thisWeek.lessons, prev: lastWeek.lessons },
    { title: 'Câu trắc nghiệm', value: thisWeek.quiz, prev: lastWeek.quiz },
    { title: 'Lượt ôn flashcard', value: thisWeek.cards, prev: lastWeek.cards },
  ];

  return (
    <div className="page">
      <Title level={2}>Thói quen học tập</Title>
      <Paragraph type="secondary">
        Hoạt động được ghi tự động trên trình duyệt này: thời gian học (chỉ tính phút bạn đang thao tác trên site), bài đã
        đọc, câu trắc nghiệm, flashcard và kỹ năng đánh dấu đạt. Dữ liệu không gửi đi đâu cả.
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card style={{ height: '100%', borderLeft: `4px solid ${verdict.color}` }}>
            <Space align="start" size="middle">
              <div style={{ fontSize: 40, color: verdict.color, lineHeight: 1 }}>{verdict.icon}</div>
              <div>
                <Text type="secondary">ĐÁNH GIÁ 7 NGÀY GẦN NHẤT</Text>
                <Title level={3} style={{ margin: '4px 0' }}>
                  {verdict.title}
                </Title>
                <Paragraph style={{ marginBottom: 8 }}>{verdict.text}</Paragraph>
                {!hasData && (
                  <Text type="secondary">
                    Chưa có dữ liệu. Hãy <Link to="/roadmap">vào học một bài</Link> để bắt đầu ghi nhận.
                  </Text>
                )}
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card style={{ height: '100%' }}>
            <Row gutter={16} align="middle">
              <Col span={10} style={{ textAlign: 'center' }}>
                <Progress
                  type="circle"
                  size={110}
                  percent={Math.min(100, Math.round((today.minutes / goal) * 100))}
                  format={() => (
                    <span style={{ fontSize: 18 }}>
                      {today.minutes}/{goal}
                      <br />
                      <span style={{ fontSize: 12 }}>phút</span>
                    </span>
                  )}
                />
              </Col>
              <Col span={14}>
                <Statistic
                  title="Chuỗi ngày học"
                  value={current}
                  suffix="ngày"
                  prefix={<FireOutlined style={{ color: current > 0 ? token.colorWarning : undefined }} />}
                />
                <Text type="secondary">
                  <TrophyOutlined /> Kỷ lục: {best} ngày
                </Text>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Mục tiêu mỗi ngày
                  </Text>
                  <br />
                  <Segmented<number>
                    size="small"
                    value={goal}
                    onChange={setGoal}
                    options={GOALS.map((g) => ({ value: g, label: `${g}′` }))}
                  />
                </div>
              </Col>
            </Row>
            {!isActiveDay(today) && current > 0 && (
              <Text type="warning" style={{ display: 'block', marginTop: 12 }}>
                Hôm nay chưa học, học ngay để giữ chuỗi {current} ngày!
              </Text>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {weekStats.map((s) => {
          const diff = s.value - s.prev;
          return (
            <Col xs={12} md={8} xl={{ flex: '20%' }} key={s.title}>
              <Card size="small" style={{ height: '100%' }}>
                <Statistic title={`${s.title} (7 ngày)`} value={s.value} suffix={s.suffix} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {diff === 0 ? 'Bằng' : diff > 0 ? `Hơn ${diff} so với` : `Kém ${-diff} so với`} 7 ngày trước đó
                </Text>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={12}>
          <DailyChart log={log} goal={goal} />
        </Col>
        <Col xs={24} xl={12}>
          <Heatmap log={log} goal={goal} />
        </Col>
      </Row>
    </div>
  );
}
