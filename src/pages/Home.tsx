import { ArrowRightOutlined, CheckCircleOutlined, ClockCircleOutlined, RocketOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Button, Card, Col, List, Progress, Row, Space, Statistic, Steps, Tag, Tooltip, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { PhaseAvatar } from '../components/PhaseIcon';
import TrackSwitch from '../components/TrackSwitch';
import { hasLesson } from '../content/lessons';
import { isSharedPhase, phaseSkillIds, trackSkillIds, trackWeeks } from '../data/roadmap';
import { percent, useProgress } from '../progress';
import { useTrack } from '../track';

const { Title, Paragraph, Text } = Typography;

export default function Home() {
  const { countDone } = useProgress();
  const { track, trackPhaseList } = useTrack();
  const skillIds = trackSkillIds(track);
  const lessonCount = trackPhaseList.reduce((n, p) => n + p.topics.filter((t) => hasLesson(p.id, t.id)).length, 0);
  const progressByPhase = trackPhaseList.map((p) => {
    const ids = phaseSkillIds(p);
    return percent(countDone(ids), ids.length);
  });
  const currentIndex = Math.max(0, progressByPhase.findIndex((v) => v < 100));
  const allDone = progressByPhase.every((v) => v === 100);
  const current = trackPhaseList[allDone ? trackPhaseList.length - 1 : currentIndex];
  const started = countDone(skillIds) > 0;

  return (
    <div className="page">
      <div className="hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Space wrap style={{ marginBottom: 16 }}>
            <TrackSwitch />
            <Tag color="gold">{track.tagline}</Tag>
          </Space>
          <Title style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>{track.heroTitle}</Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.88)', fontSize: 16, maxWidth: 680 }}>
            {trackPhaseList.length} giai đoạn. {track.heroDescription}
          </Paragraph>
          <Space wrap size="middle" style={{ marginTop: 8 }}>
            <Link to={`/phase/${current.id}`}>
              <Button size="large" icon={<RocketOutlined />} style={{ fontWeight: 600 }}>
                {started ? `Tiếp tục: ${current.title}` : 'Bắt đầu học'}
              </Button>
            </Link>
            <Link to="/roadmap">
              <Button size="large" ghost icon={<ArrowRightOutlined />}>
                Xem toàn bộ lộ trình
              </Button>
            </Link>
          </Space>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {[
          { title: 'Giai đoạn', value: trackPhaseList.length },
          { title: 'Bài học', value: lessonCount },
          { title: 'Kỹ năng cần đạt', value: skillIds.length },
          { title: 'Thời gian ước tính', value: Math.round(trackWeeks(track) / 4.3), suffix: 'tháng' },
        ].map((s) => (
          <Col xs={12} md={6} key={s.title}>
            <Card>
              <Statistic title={s.title} value={s.value} suffix={s.suffix} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Con đường sự nghiệp" style={{ height: '100%' }}>
            <Steps
              direction="vertical"
              size="small"
              current={allDone ? track.careerPath.length : track.careerStepOfPhase[currentIndex]}
              items={track.careerPath}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={track.responsibilitiesTitle} style={{ height: '100%' }}>
            <List
              size="small"
              split={false}
              dataSource={track.responsibilities}
              renderItem={(item) => (
                <List.Item style={{ paddingInline: 0 }}>
                  <Space align="start">
                    <CheckCircleOutlined style={{ color: '#52c41a', marginTop: 4 }} />
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Title level={3} style={{ marginTop: 32 }}>
        Các giai đoạn
      </Title>
      <Row gutter={[16, 16]}>
        {trackPhaseList.map((p, i) => (
          <Col xs={24} sm={12} xl={8} key={p.id}>
            <Link to={`/phase/${p.id}`}>
              <Card hoverable className="phase-card">
                <Space align="start" size="middle" style={{ width: '100%' }}>
                  <PhaseAvatar icon={p.icon} color={p.color} />
                  <div style={{ minWidth: 0 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      GIAI ĐOẠN {i + 1}
                    </Text>
                    <Title level={5} style={{ margin: '2px 0 4px' }}>
                      {p.title}
                    </Title>
                    <Text type="secondary">{p.subtitle}</Text>
                  </div>
                </Space>
                <Space size={4} wrap style={{ marginTop: 12 }}>
                  <Tag icon={<ClockCircleOutlined />}>{p.duration}</Tag>
                  <Tag color="blue">{p.topics.length} chủ đề</Tag>
                  {isSharedPhase(p.id) && (
                    <Tooltip title="Giai đoạn chung của cả hai lộ trình, tiến độ được tính cho cả hai">
                      <Tag icon={<ShareAltOutlined />} color="cyan">
                        Dùng chung
                      </Tag>
                    </Tooltip>
                  )}
                </Space>
                <Progress percent={progressByPhase[i]} strokeColor={p.color} size="small" style={{ marginTop: 8 }} />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
