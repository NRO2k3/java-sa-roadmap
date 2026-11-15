import { ClockCircleOutlined, RightOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Empty, Progress, Segmented, Space, Tag, Timeline, Typography } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PhaseIcon from '../components/PhaseIcon';
import { levelColor, phaseSkillIds, phases, totalWeeks, type Level } from '../data/roadmap';
import { percent, useProgress } from '../progress';

const { Title, Paragraph, Text } = Typography;

type Filter = 'Tất cả' | Level;

export default function Roadmap() {
  const { countDone } = useProgress();
  const [filter, setFilter] = useState<Filter>('Tất cả');

  const visible = phases
    .map((p) => ({ ...p, topics: p.topics.filter((t) => filter === 'Tất cả' || t.level === filter) }))
    .filter((p) => p.topics.length > 0);

  return (
    <div className="page">
      <Title level={2}>Lộ trình tổng quan</Title>
      <Paragraph type="secondary">
        Tổng thời gian ước tính khoảng {totalWeeks} tuần (~{Math.round(totalWeeks / 4.3)} tháng) nếu học 10–15 giờ mỗi tuần.
        Các giai đoạn 6–7 có thể học song song với giai đoạn 5.
      </Paragraph>

      <Segmented<Filter>
        options={['Tất cả', 'Cơ bản', 'Trung cấp', 'Nâng cao']}
        value={filter}
        onChange={setFilter}
        style={{ marginBottom: 24 }}
      />

      {visible.length === 0 ? (
        <Empty />
      ) : (
        <Timeline
          items={visible.map((p) => {
            const ids = phaseSkillIds(phases.find((x) => x.id === p.id)!);
            const pct = percent(countDone(ids), ids.length);
            return {
              key: p.id,
              dot: <PhaseIcon icon={p.icon} style={{ fontSize: 20, color: p.color }} />,
              children: (
                <Card size="small" style={{ marginBottom: 8 }}>
                  <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        GIAI ĐOẠN {p.order}
                      </Text>
                      <Title level={4} style={{ margin: 0 }}>
                        {p.title}
                      </Title>
                    </div>
                    <Link to={`/phase/${p.id}`}>
                      Chi tiết <RightOutlined />
                    </Link>
                  </Space>
                  <Space size={4} wrap style={{ margin: '8px 0' }}>
                    <Tag icon={<UserOutlined />} color="purple">
                      {p.role}
                    </Tag>
                    <Tag icon={<ClockCircleOutlined />}>{p.duration}</Tag>
                  </Space>
                  <Paragraph style={{ marginBottom: 8 }}>{p.goal}</Paragraph>
                  <Space size={[6, 6]} wrap>
                    {p.topics.map((t) => (
                      <Link key={t.id} to={`/phase/${p.id}?topic=${t.id}`}>
                        <Tag color={levelColor[t.level]} style={{ cursor: 'pointer' }}>
                          {t.title}
                        </Tag>
                      </Link>
                    ))}
                  </Space>
                  <Progress percent={pct} strokeColor={p.color} size="small" style={{ marginTop: 8 }} />
                </Card>
              ),
            };
          })}
        />
      )}
    </div>
  );
}
