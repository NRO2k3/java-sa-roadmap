import { BookOutlined, GlobalOutlined, LinkOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Card, Col, List, Row, Space, Switch, Table, Tabs, Tag, Typography } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import TrackSwitch from '../components/TrackSwitch';
import { phaseById } from '../data/roadmap';
import { books, certifications, sites, type Book, type Certification } from '../data/resources';
import { useTrack } from '../track';

const { Title, Paragraph, Text } = Typography;

const certLevelColor: Record<Certification['level'], string> = {
  Associate: 'green',
  Professional: 'blue',
  Expert: 'purple',
};

function BooksTab({ data: trackBooks }: { data: Book[] }) {
  const { trackPhaseList } = useTrack();
  const [mustReadOnly, setMustReadOnly] = useState(false);
  const data = mustReadOnly ? trackBooks.filter((b) => b.mustRead) : trackBooks;

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
            filters: trackPhaseList.map((p) => ({ text: p.title, value: p.id })),
            onFilter: (value, b) => b.phaseId === value,
            render: (id: string) => {
              const p = phaseById(id)!;
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

function CertsTab({ data }: { data: Certification[] }) {
  return (
    <Row gutter={[16, 16]}>
      {data.map((c) => (
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
  const { track } = useTrack();
  const trackBooks = books.filter((b) => track.phaseIds.includes(b.phaseId));
  const trackCerts = certifications.filter((c) => c.tracks.includes(track.id));

  return (
    <div className="page">
      <Title level={2}>Tài nguyên học tập</Title>
      <Paragraph type="secondary">
        Sách và chứng chỉ được chọn lọc cho lộ trình Java {track.name}. Website tham khảo dùng chung cho cả hai lộ trình.
      </Paragraph>
      <div style={{ marginBottom: 8 }}>
        <TrackSwitch />
      </div>
      <Tabs
        items={[
          {
            key: 'books',
            label: <span><BookOutlined /> Sách ({trackBooks.length})</span>,
            children: <BooksTab data={trackBooks} />,
          },
          {
            key: 'certs',
            label: <span><SafetyCertificateOutlined /> Chứng chỉ ({trackCerts.length})</span>,
            children: <CertsTab data={trackCerts} />,
          },
          { key: 'sites', label: <span><GlobalOutlined /> Website ({sites.length})</span>, children: <SitesTab /> },
        ]}
      />
    </div>
  );
}
