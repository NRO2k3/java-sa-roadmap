import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  LeftOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  RightOutlined,
  SwitcherOutlined,
} from '@ant-design/icons';
import { Alert, Breadcrumb, Button, Card, Col, List, Result, Row, Skeleton, Space, Tag, Typography } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LessonQuiz from '../components/LessonQuiz';
import Markdown from '../components/Markdown';
import ResourceList from '../components/ResourceList';
import SkillChecklist from '../components/SkillChecklist';
import { topicCards } from '../content/flashcards';
import { hasLesson, lessonPath, loadLesson } from '../content/lessons';
import { topicQuestions } from '../content/quizzes';
import { levelColor, phaseById, topicSkillIds, trackPhases, type Phase, type Topic, type Track } from '../data/roadmap';
import { logLesson, logQuiz } from '../activity';
import { lessonKey, useLessonScores } from '../lessonScores';
import { useProgress } from '../progress';
import { useTrackOfPhase } from '../track';
import NotFound from './NotFound';

const { Title, Paragraph, Text } = Typography;

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function Lesson() {
  const { phaseId, topicId } = useParams();
  const phase = phaseId ? phaseById(phaseId) : undefined;
  const topic = phase?.topics.find((t) => t.id === topicId);
  const track = useTrackOfPhase(phase?.id);

  if (!phase || !topic) return <NotFound />;
  // key để chuyển bài thì trạng thái tải và trắc nghiệm làm lại từ đầu
  return <LessonView key={`${phase.id}/${topic.id}`} phase={phase} topic={topic} track={track} />;
}

function LessonView({ phase, topic, track }: { phase: Phase; topic: Topic; track: Track }) {
  const { countDone, setMany } = useProgress();
  const { scores, record } = useLessonScores();
  const available = hasLesson(phase.id, topic.id);
  const [content, setContent] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!available) return;
    let active = true;
    loadLesson(phase.id, topic.id).then(
      (md) => {
        if (!active) return;
        setContent(md);
        logLesson(lessonKey(phase.id, topic.id));
      },
      () => active && setFailed(true),
    );
    return () => {
      active = false;
    };
  }, [available, phase.id, topic.id]);

  // Mục lục lấy từ các tiêu đề đã render để id luôn khớp
  useEffect(() => {
    const nodes = contentRef.current?.querySelectorAll('h3.md-h2') ?? [];
    setHeadings(Array.from(nodes, (h) => ({ id: h.id, text: h.textContent ?? '' })));
  }, [content]);

  const questions = useMemo(() => topicQuestions(phase.id, topic.id), [phase.id, topic.id]);
  const cardCount = topicCards(phase.id, topic.id).length;
  const phaseList = trackPhases(track);
  const lessons = phaseList.flatMap((p) => p.topics.map((t) => ({ phase: p, topic: t })));
  const index = lessons.findIndex((l) => l.topic === topic);
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const skillIds = topicSkillIds(phase.id, topic);
  const skillsDone = countDone(skillIds) === skillIds.length;
  const key = lessonKey(phase.id, topic.id);
  const best = scores[key];
  const minutes = content ? Math.max(1, Math.round(content.split(/\s+/).length / 250)) : null;

  let body;
  if (!available) {
    body = (
      <Result
        status="info"
        title="Bài học đang được biên soạn"
        subTitle="Trong lúc chờ, bạn có thể học theo danh sách kỹ năng và tài liệu tham khảo bên cạnh."
      />
    );
  } else if (failed) {
    body = (
      <Result
        status="warning"
        title="Không tải được bài học"
        subTitle="Có thể site vừa được cập nhật. Hãy tải lại trang."
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
            Tải lại
          </Button>
        }
      />
    );
  } else if (content === null) {
    body = <Skeleton active paragraph={{ rows: 14 }} />;
  } else {
    body = <Markdown content={content} />;
  }

  return (
    <div className="page">
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/"><HomeOutlined /></Link> },
          { title: <Link to="/roadmap">Lộ trình {track.name}</Link> },
          { title: <Link to={`/phase/${phase.id}`}>{phase.title}</Link> },
          { title: topic.title },
        ]}
      />

      <Card style={{ borderTop: `4px solid ${phase.color}` }}>
        <Text type="secondary">
          GIAI ĐOẠN {phaseList.indexOf(phase) + 1} · BÀI {phase.topics.indexOf(topic) + 1}/{phase.topics.length}
        </Text>
        <Title level={2} style={{ margin: '4px 0 8px' }}>
          {topic.title}
        </Title>
        <Space size={4} wrap>
          <Tag color={levelColor[topic.level]}>{topic.level}</Tag>
          {minutes && <Tag icon={<ClockCircleOutlined />}>~{minutes} phút đọc</Tag>}
          {questions.length > 0 && <Tag icon={<QuestionCircleOutlined />}>{questions.length} câu trắc nghiệm</Tag>}
          {best !== undefined && <Tag color={best >= 80 ? 'success' : 'warning'}>Điểm cao nhất: {best}%</Tag>}
          {skillsDone && (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Đã hoàn thành
            </Tag>
          )}
        </Space>
        <Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
          {topic.description}
        </Paragraph>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={17}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card>
              <div ref={contentRef}>{body}</div>
            </Card>
            {questions.length > 0 && (
              <Card
                id="lesson-quiz"
                title={
                  <>
                    <QuestionCircleOutlined /> Trắc nghiệm cuối bài
                  </>
                }
                style={{ scrollMarginTop: 80 }}
              >
                <LessonQuiz
                  questions={questions}
                  onFinish={(pct) => {
                    record(key, pct);
                    logQuiz(questions.length);
                  }}
                  extra={(pct) =>
                    pct >= 80 &&
                    !skillsDone && (
                      <Alert
                        style={{ marginTop: 16 }}
                        type="success"
                        showIcon
                        message="Bạn đã nắm vững bài này"
                        description="Đánh dấu các kỹ năng của bài là đã đạt để cập nhật tiến độ."
                        action={
                          <Button size="small" type="primary" onClick={() => setMany(skillIds, true)}>
                            Đánh dấu hoàn thành
                          </Button>
                        }
                      />
                    )
                  }
                />
              </Card>
            )}
          </Space>
        </Col>
        <Col xs={24} lg={7}>
          <Space direction="vertical" size="middle" className="lesson-aside">
            {headings.length > 0 && (
              <Card size="small" title="Nội dung bài">
                <List
                  size="small"
                  split={false}
                  dataSource={[
                    ...headings,
                    ...(questions.length > 0 ? [{ id: 'lesson-quiz', text: 'Trắc nghiệm cuối bài' }] : []),
                  ]}
                  renderItem={(h) => (
                    <List.Item style={{ paddingInline: 0, paddingBlock: 4 }}>
                      <a onClick={() => scrollToId(h.id)}>{h.text}</a>
                    </List.Item>
                  )}
                />
              </Card>
            )}
            {cardCount > 0 && (
              <Link to={`/flashcards?scope=topic:${phase.id}/${topic.id}`}>
                <Button block icon={<SwitcherOutlined />}>
                  Ôn {cardCount} flashcard của bài
                </Button>
              </Link>
            )}
            <Card size="small">
              <SkillChecklist phase={phase} topic={topic} />
            </Card>
            {topic.resources.length > 0 && (
              <Card size="small" title="Đọc thêm">
                <ResourceList resources={topic.resources} />
              </Card>
            )}
          </Space>
        </Col>
      </Row>

      <Row justify="space-between" style={{ marginTop: 24 }} gutter={[8, 8]}>
        <Col>
          {prev && (
            <Link to={lessonPath(prev.phase.id, prev.topic.id)}>
              <Button icon={<LeftOutlined />}>{prev.topic.title}</Button>
            </Link>
          )}
        </Col>
        <Col>
          {next && (
            <Link to={lessonPath(next.phase.id, next.topic.id)}>
              <Button type="primary">
                {next.topic.title} <RightOutlined />
              </Button>
            </Link>
          )}
        </Col>
      </Row>
    </div>
  );
}
