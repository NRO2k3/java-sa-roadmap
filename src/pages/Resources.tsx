import { BookOutlined, GlobalOutlined, LinkOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Card, Col, List, Row, Space, Switch, Table, Tabs, Tag, Typography } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { phases } from '../data/roadmap';
import { books, certifications, sites, type Book, type Certification } from '../data/resources';

const { Title, Paragraph, Text } = Typography;

const certLevelColor: Record<Certification['level'], string> = {
  Associate: 'green',
  Professional: 'blue',
  Expert: 'purple',
};

function BooksTab() {
  const [mustReadOnly, setMustReadOnly] = useState(false);
  const data = mustReadOnly ? books.filter((b) => b.mustRead) : books;

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Switch checked={mustReadOnly} onChange={setMustReadOnly} />
        <Text>Chỉ hiện sách nên đọc</Text>
      </Space>
      <Table<Book>
        rowKey="title"
        dataSource={data}
        pagination={false}
        scroll={{ x: 640 }}
        columns={[
          {
            title: 'Tên sách',
            dataIndex: 'title',
            render: (title: string, b) => (
              <Space size={4} wrap>
                <Text strong>{title}</Text>
                {b.mustRead && <Tag color="red">Nên đọc</Tag>}
              </Space>
            ),
          },
          { title: 'Tác giả', dataIndex: 'author', width: 220 },
          { title: 'Chủ đề', dataIndex: 'topic', width: 200 },
          {
            title: 'Giai đoạn',
            dataIndex: 'phaseId',
            width: 200,
            filters: phases.map((p) => ({ text: p.title, value: p.id })),
            onFilter: (value, b) => b.phaseId === value,
            render: (id: string) => {
              const p = phases.find((x) => x.id === id)!;
              return (
                <Link to={`/phase/${p.id}`}>
                  <Tag color={p.color}>{p.title}</Tag>
                </Link>
              );
            },
          },
        ]}
      />
    </>
  );
}

function CertsTab() {
  return (
    <Row gutter={[16, 16]}>
      {certifications.map((c) => (
        <Col xs={24} md={12} xl={8} key={c.name}>
          <Card
            title={c.provider}
            extra={<Tag color={certLevelColor[c.level]}>{c.level}</Tag>}
            style={{ height: '100%' }}
            actions={[
              <a key="link" href={c.url} target="_blank" rel="noreferrer">
                <LinkOutlined /> Trang chính thức
              </a>,
            ]}
          >
            <Title level={5} style={{ marginTop: 0 }}>
              {c.name}
            </Title>
            <Text type="secondary">{c.focus}</Text>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

function SitesTab() {
  return (
    <List
      grid={{ gutter: 16, xs: 1, md: 2, xl: 3 }}
      dataSource={sites}
      renderItem={(s) => (
        <List.Item>
          <Card size="small" style={{ height: '100%' }}>
            <a href={s.url} target="_blank" rel="noreferrer">
              <Text strong>
                <GlobalOutlined /> {s.name}
              </Text>
            </a>
            <Paragraph type="secondary" style={{ margin: '6px 0' }}>
              {s.description}
            </Paragraph>
            <Space size={4} wrap>
              {s.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </Space>
          </Card>
        </List.Item>
      )}
    />
  );
}

export default function Resources() {
  return (
    <div className="page">
      <Title level={2}>Tài nguyên học tập</Title>
      <Paragraph type="secondary">
        Sách, chứng chỉ và website được chọn lọc cho lộ trình Java Solution Architect.
      </Paragraph>
      <Tabs
        items={[
          { key: 'books', label: <span><BookOutlined /> Sách ({books.length})</span>, children: <BooksTab /> },
          {
            key: 'certs',
            label: <span><SafetyCertificateOutlined /> Chứng chỉ ({certifications.length})</span>,
            children: <CertsTab />,
          },
          { key: 'sites', label: <span><GlobalOutlined /> Website ({sites.length})</span>, children: <SitesTab /> },
        ]}
      />
    </div>
  );
}
