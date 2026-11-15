import { ArrowRightOutlined, CheckCircleOutlined, ClockCircleOutlined, RocketOutlined } from '@ant-design/icons';
import { Button, Card, Col, List, Progress, Row, Space, Statistic, Steps, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { PhaseAvatar } from '../components/PhaseIcon';
import { allSkillIds, phaseSkillIds, phases, totalWeeks } from '../data/roadmap';
import { percent, useProgress } from '../progress';

const { Title, Paragraph, Text } = Typography;

const careerPath = [
  { title: 'Junior Developer', description: 'Java Core, Git, SQL' },
  { title: 'Backend Developer', description: 'Spring Boot, REST, JPA' },
  { title: 'Senior Developer', description: 'Hệ phân tán, messaging' },
  { title: 'Tech Lead', description: 'Cloud, DevOps, bảo mật' },
  { title: 'Solution Architect', description: 'Thiết kế giải pháp end-to-end' },
];

// Giai đoạn cuối mà người học đang ở, ánh xạ sang bậc nghề nghiệp
const careerStepOfPhase = [0, 1, 2, 2, 3, 3, 3, 4, 4, 4];

const responsibilities = [
  'Chuyển yêu cầu kinh doanh thành giải pháp kỹ thuật khả thi',
  'Lựa chọn công nghệ, nền tảng và giải thích các đánh đổi',
  'Đảm bảo yêu cầu phi chức năng: hiệu năng, bảo mật, khả năng mở rộng, chi phí',
  'Tài liệu hoá kiến trúc (C4, ADR) và truyền đạt cho mọi bên liên quan',
  'Đồng hành cùng đội phát triển từ PoC đến vận hành',
];

export default function Home() {
  const { countDone } = useProgress();
  const topicCount = phases.reduce((n, p) => n + p.topics.length, 0);
  const progressByPhase = phases.map((p) => {
    const ids = phaseSkillIds(p);
    return percent(countDone(ids), ids.length);
  });
  const currentIndex = Math.max(0, progressByPhase.findIndex((v) => v < 100));
  const allDone = progressByPhase.every((v) => v === 100);
  const current = phases[allDone ? phases.length - 1 : currentIndex];
  const overall = percent(countDone(allSkillIds), allSkillIds.length);
  const started = overall > 0;

  return (
    <div className="page">
      <div className="hero">
        <Tag color="gold" style={{ marginBottom: 16 }}>
          Tech stack: Java · Spring · Cloud
        </Tag>
        <Title style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>Lộ trình trở thành Solution Architect</Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.88)', fontSize: 16, maxWidth: 680 }}>
          {phases.length} giai đoạn từ Java Core đến kiến trúc giải pháp doanh nghiệp. Đánh dấu từng kỹ năng, làm dự án cột
          mốc, kiểm tra kiến thức bằng trắc nghiệm và theo dõi tiến độ của bạn.
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

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {[
          { title: 'Giai đoạn', value: phases.length },
          { title: 'Chủ đề', value: topicCount },
          { title: 'Kỹ năng cần đạt', value: allSkillIds.length },
          { title: 'Thời gian ước tính', value: Math.round(totalWeeks / 4.3), suffix: 'tháng' },
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
              current={allDone ? careerPath.length : careerStepOfPhase[currentIndex]}
              items={careerPath}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Solution Architect làm gì?" style={{ height: '100%' }}>
            <List
              size="small"
              split={false}
              dataSource={responsibilities}
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
        {phases.map((p, i) => (
          <Col xs={24} sm={12} xl={8} key={p.id}>
            <Link to={`/phase/${p.id}`}>
              <Card hoverable className="phase-card">
                <Space align="start" size="middle" style={{ width: '100%' }}>
                  <PhaseAvatar icon={p.icon} color={p.color} />
                  <div style={{ minWidth: 0 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      GIAI ĐOẠN {p.order}
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
