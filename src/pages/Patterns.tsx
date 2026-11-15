import { CheckOutlined, CloseOutlined, SearchOutlined, ToolOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Input, Row, Segmented, Space, Tag, Typography } from 'antd';
import { useState } from 'react';
import { patternCategories, patterns, type PatternCategory } from '../data/patterns';

const { Title, Paragraph, Text } = Typography;

type Filter = 'Tất cả' | PatternCategory;

const categoryColor: Record<PatternCategory, string> = {
  'Ứng dụng': 'blue',
  'Dữ liệu': 'orange',
  'Tích hợp': 'cyan',
  Resilience: 'red',
  'Triển khai': 'purple',
  Migration: 'green',
};

export default function Patterns() {
  const [filter, setFilter] = useState<Filter>('Tất cả');
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const visible = patterns.filter(
    (p) =>
      (filter === 'Tất cả' || p.category === filter) &&
      (!q || [p.name, p.problem, p.solution, ...p.javaTools].some((s) => s.toLowerCase().includes(q))),
  );

  return (
    <div className="page">
      <Title level={2}>Mẫu kiến trúc</Title>
      <Paragraph type="secondary">
        Các pattern một Solution Architect cần nắm, kèm công cụ triển khai trong hệ sinh thái Java và các đánh đổi.
      </Paragraph>

      <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm pattern hoặc công cụ (Saga, Resilience4j…)"
          allowClear
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: 420 }}
        />
        <div style={{ overflowX: 'auto' }}>
          <Segmented<Filter> options={['Tất cả', ...patternCategories]} value={filter} onChange={setFilter} />
        </div>
      </Space>

      {visible.length === 0 ? (
        <Empty description="Không có pattern phù hợp" />
      ) : (
        <Row gutter={[16, 16]}>
          {visible.map((p) => (
            <Col xs={24} md={12} key={p.name}>
              <Card
                title={p.name}
                extra={<Tag color={categoryColor[p.category]}>{p.category}</Tag>}
                style={{ height: '100%' }}
              >
                <Paragraph>
                  <Text strong>Vấn đề: </Text>
                  {p.problem}
                </Paragraph>
                <Paragraph>
                  <Text strong>Giải pháp: </Text>
                  {p.solution}
                </Paragraph>
                <Space size={[4, 4]} wrap style={{ marginBottom: 12 }}>
                  <ToolOutlined />
                  {p.javaTools.map((t) => (
                    <Tag key={t} color="geekblue">
                      {t}
                    </Tag>
                  ))}
                </Space>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Text strong type="success">
                      Ưu điểm
                    </Text>
                    {p.pros.map((x) => (
                      <div key={x}>
                        <CheckOutlined style={{ color: '#52c41a', marginRight: 6 }} />
                        <Text>{x}</Text>
                      </div>
                    ))}
                  </Col>
                  <Col xs={24} sm={12}>
                    <Text strong type="danger">
                      Nhược điểm
                    </Text>
                    {p.cons.map((x) => (
                      <div key={x}>
                        <CloseOutlined style={{ color: '#ff4d4f', marginRight: 6 }} />
                        <Text>{x}</Text>
                      </div>
                    ))}
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
