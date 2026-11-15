import { ClockCircleOutlined, RightOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Empty, Progress, Segmented, Space, Tag, Timeline, Typography } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PhaseIcon from '../components/PhaseIcon';
import TrackSwitch from '../components/TrackSwitch';
import { hasLesson, lessonPath } from '../content/lessons';
import { levelColor, phaseSkillIds, trackWeeks, type Level } from '../data/roadmap';
import { percent, useProgress } from '../progress';
import { useTrack } from '../track';

const { Title, Paragraph, Text } = Typography;

type Filter = 'Tất cả' | Level;

export default function Roadmap() {
  const { countDone } = useProgress();
  const { track, trackPhaseList } = useTrack();
  const [filter, setFilter] = useState<Filter>('Tất cả');
  const totalWeeks = trackWeeks(track);

  const visible = trackPhaseList
    .map((p, i) => ({
      phase: p,
      order: i + 1,
      topics: p.topics.filter((t) => filter === 'Tất cả' || t.level === filter),
    }))
    .filter((v) => v.topics.length > 0);

  return (
    <div className="page">
      <Title level={2}>Lộ trình tổng quan: {track.name}</Title>
      <Paragraph type="secondary">
        Tổng thời gian ước tính khoảng {totalWeeks} tuần (~{Math.round(totalWeeks / 4.3)} tháng) nếu học 10–15 giờ mỗi tuần.{' '}
        {track.note}
      </Paragraph>

      <Space wrap size="middle" style={{ marginBottom: 24 }}>
        <TrackSwitch />
        <Segmented<Filter>
          options={['Tất cả', 'Cơ bản', 'Trung cấp', 'Nâng cao']}
          value={filter}
          onChange={setFilter}
        />
      </Space>

      {visible.length === 0 ? (
        <Empty />
      ) : (
        <Timeline
          items={visible.map(({ phase: p, order, topics }) => {
            const ids = phaseSkillIds(p);
            const pct = percent(countDone(ids), ids.length);
            return {
              key: p.id,
              dot: <PhaseIcon icon={p.icon} style={{ fontSize: 20, color: p.color }} />,
              children: (
                <Card size="small" style={{ marginBottom: 8 }}>
                  <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        GIAI ĐOẠN {order}
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
                    {topics.map((t) => (
                      <Link
                        key={t.id}
                        to={hasLesson(p.id, t.id) ? lessonPath(p.id, t.id) : `/phase/${p.id}?topic=${t.id}`}
                      >
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
