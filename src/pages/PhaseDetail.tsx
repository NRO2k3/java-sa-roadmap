import {
  BookOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  HomeOutlined,
  LeftOutlined,
  LinkOutlined,
  QuestionCircleOutlined,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  List,
  Progress,
  Row,
  Space,
  Tag,
  Typography,
  theme,
} from 'antd';
import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PhaseAvatar } from '../components/PhaseIcon';
import {
  levelColor,
  phaseById,
  phaseSkillIds,
  resourceTypeLabel,
  skillId,
  topicSkillIds,
  trackPhases,
  tracks,
  type Phase,
  type Topic,
} from '../data/roadmap';
import { books } from '../data/resources';
import { percent, useProgress } from '../progress';
import { useTrack } from '../track';
import NotFound from './NotFound';

const { Title, Paragraph, Text } = Typography;

function TopicCard({ phase, topic }: { phase: Phase; topic: Topic }) {
  const { isDone, toggle, setMany, countDone } = useProgress();
  const ids = topicSkillIds(phase.id, topic);
  const doneCount = countDone(ids);
  const allChecked = doneCount === ids.length;

  return (
    <Card
      id={`topic-${topic.id}`}
      title={
        <Space wrap>
          <span>{topic.title}</span>
          <Tag color={levelColor[topic.level]}>{topic.level}</Tag>
        </Space>
      }
      extra={
        <Text type="secondary">
          {doneCount}/{ids.length}
        </Text>
      }
      style={{ scrollMarginTop: 80 }}
    >
      <Paragraph type="secondary">{topic.description}</Paragraph>
      <Checkbox
        indeterminate={doneCount > 0 && !allChecked}
        checked={allChecked}
        onChange={(e) => setMany(ids, e.target.checked)}
        style={{ marginBottom: 4 }}
      >
        <Text strong>Kỹ năng cần đạt</Text>
      </Checkbox>
      <div style={{ paddingLeft: 24 }}>
        {topic.skills.map((skill, i) => {
          const id = skillId(phase.id, topic.id, i);
          const checked = isDone(id);
          return (
            <div className="skill-item" key={id}>
              <Checkbox checked={checked} onChange={(e) => toggle(id, e.target.checked)}>
                <span className={checked ? 'skill-done' : undefined}>{skill}</span>
              </Checkbox>
            </div>
          );
        })}
      </div>
      {topic.resources.length > 0 && (
        <>
          <Divider orientation="left" plain style={{ margin: '12px 0 4px' }}>
            Tài liệu tham khảo
          </Divider>
          <List
            size="small"
            split={false}
            dataSource={topic.resources}
            renderItem={(r) => (
              <List.Item style={{ paddingInline: 0 }}>
                <Space>
                  <Tag>{resourceTypeLabel[r.type]}</Tag>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    <LinkOutlined /> {r.title}
                  </a>
                </Space>
              </List.Item>
            )}
          />
        </>
      )}
    </Card>
  );
}

export default function PhaseDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { countDone, setMany } = useProgress();
  const { token } = theme.useToken();
  const { track, setTrack } = useTrack();
  const phase = id ? phaseById(id) : undefined;
  // Link tới giai đoạn thuộc lộ trình khác (từ tìm kiếm, link chia sẻ) thì chuyển sang lộ trình đó
  const activeTrack =
    phase && !track.phaseIds.includes(phase.id) ? tracks.find((t) => t.phaseIds.includes(phase.id))! : track;
  const trackPhaseList = trackPhases(activeTrack);
  const index = phase ? trackPhaseList.indexOf(phase) : -1;
  const focusTopic = params.get('topic');

  useEffect(() => {
    if (activeTrack.id !== track.id) setTrack(activeTrack.id);
  }, [activeTrack.id, track.id, setTrack]);

  useEffect(() => {
    if (!focusTopic) return;
    const el = document.getElementById(`topic-${focusTopic}`);
    if (!el) return;
    // Đợi trang render xong mới cuộn tới chủ đề
    const timer = setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    return () => clearTimeout(timer);
  }, [focusTopic, id]);

  if (!phase) return <NotFound />;

  const ids = phaseSkillIds(phase);
  const doneCount = countDone(ids);
  const pct = percent(doneCount, ids.length);
  const prev = trackPhaseList[index - 1];
  const next = trackPhaseList[index + 1];
  const phaseBooks = books.filter((b) => b.phaseId === phase.id);

  return (
    <div className="page">
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/"><HomeOutlined /></Link> },
          { title: <Link to="/roadmap">Lộ trình {activeTrack.name}</Link> },
          { title: `Giai đoạn ${index + 1}` },
        ]}
      />

      <Card style={{ borderTop: `4px solid ${phase.color}` }}>
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={18}>
            <Space align="start" size="middle">
              <PhaseAvatar icon={phase.icon} color={phase.color} size={56} />
              <div>
                <Text type="secondary">GIAI ĐOẠN {index + 1} / {trackPhaseList.length}</Text>
                <Title level={2} style={{ margin: '4px 0' }}>
                  {phase.title}
                </Title>
                <Text type="secondary">{phase.subtitle}</Text>
              </div>
            </Space>
            <Space size={4} wrap style={{ marginTop: 16, display: 'flex' }}>
              <Tag icon={<UserOutlined />} color="purple">
                Mục tiêu vị trí: {phase.role}
              </Tag>
              <Tag icon={<ClockCircleOutlined />}>{phase.duration}</Tag>
              <Tag icon={<CheckSquareOutlined />}>{ids.length} kỹ năng</Tag>
            </Space>
            <Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
              <Text strong>Mục tiêu: </Text>
              {phase.goal}
            </Paragraph>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: 'center' }}>
            <Progress type="circle" percent={pct} strokeColor={phase.color} size={120} />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                {doneCount}/{ids.length} kỹ năng
              </Text>
            </div>
            <Space style={{ marginTop: 8 }} wrap>
              <Button size="small" onClick={() => setMany(ids, true)} disabled={pct === 100}>
                Hoàn thành hết
              </Button>
              <Button size="small" onClick={() => setMany(ids, false)} disabled={doneCount === 0}>
                Bỏ chọn
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {phase.topics.map((t) => (
              <TopicCard key={t.id} phase={phase} topic={t} />
            ))}
          </Space>
        </Col>
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="middle" style={{ width: '100%', position: 'sticky', top: 80 }}>
            <Alert
              type="info"
              showIcon
              icon={<FlagOutlined />}
              message={<Text strong>Dự án cột mốc</Text>}
              description={phase.milestone}
            />
            <Card size="small" title="Mục lục">
              <List
                size="small"
                split={false}
                dataSource={phase.topics}
                renderItem={(t) => {
                  const tIds = topicSkillIds(phase.id, t);
                  const tPct = percent(countDone(tIds), tIds.length);
                  return (
                    <List.Item style={{ paddingInline: 0 }}>
                      <a
                        onClick={() =>
                          document.getElementById(`topic-${t.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                        style={{ color: tPct === 100 ? token.colorSuccess : undefined }}
                      >
                        {t.title}
                      </a>
                      <Text type="secondary">{tPct}%</Text>
                    </List.Item>
                  );
                }}
              />
            </Card>
            {phaseBooks.length > 0 && (
              <Card size="small" title={<><BookOutlined /> Sách gợi ý</>}>
                <List
                  size="small"
                  split={false}
                  dataSource={phaseBooks}
                  renderItem={(b) => (
                    <List.Item style={{ paddingInline: 0 }}>
                      <List.Item.Meta
                        title={
                          <Space size={4} wrap>
                            {b.title}
                            {b.mustRead && <Tag color="red">Nên đọc</Tag>}
                          </Space>
                        }
                        description={b.author}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}
            <Link to={`/quiz?phase=${phase.id}`}>
              <Button block icon={<QuestionCircleOutlined />}>
                Làm trắc nghiệm giai đoạn này
              </Button>
            </Link>
          </Space>
        </Col>
      </Row>

      <Row justify="space-between" style={{ marginTop: 24 }} gutter={[8, 8]}>
        <Col>
          {prev && (
            <Link to={`/phase/${prev.id}`}>
              <Button icon={<LeftOutlined />}>{prev.title}</Button>
            </Link>
          )}
        </Col>
        <Col>
          {next && (
            <Link to={`/phase/${next.id}`}>
              <Button type="primary">
                {next.title} <RightOutlined />
              </Button>
            </Link>
          )}
        </Col>
      </Row>
    </div>
  );
}
