import { DeleteOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Popconfirm, Progress, Row, Space, Statistic, Table, Tag, Typography, Upload } from 'antd';
import { Link } from 'react-router-dom';
import { PhaseAvatar } from '../components/PhaseIcon';
import { allSkillIds, phaseSkillIds, phases, type Phase } from '../data/roadmap';
import { percent, useProgress } from '../progress';

const { Title, Paragraph, Text } = Typography;

interface PhaseRow {
  phase: Phase;
  done: number;
  total: number;
  pct: number;
}

function statusTag(pct: number) {
  if (pct === 100) return <Tag color="success">Hoàn thành</Tag>;
  if (pct > 0) return <Tag color="processing">Đang học</Tag>;
  return <Tag>Chưa bắt đầu</Tag>;
}

export default function ProgressPage() {
  const { done, countDone, reset, importIds } = useProgress();
  const { message } = App.useApp();

  const rows: PhaseRow[] = phases.map((phase) => {
    const ids = phaseSkillIds(phase);
    const d = countDone(ids);
    return { phase, done: d, total: ids.length, pct: percent(d, ids.length) };
  });
  const totalDone = countDone(allSkillIds);
  const overall = percent(totalDone, allSkillIds.length);
  const phasesDone = rows.filter((r) => r.pct === 100).length;
  // Ước tính số tuần còn lại theo tỉ lệ kỹ năng chưa xong của từng giai đoạn
  const weeksLeft = Math.round(rows.reduce((sum, r) => sum + r.phase.weeks * (1 - r.done / r.total), 0));

  const exportProgress = () => {
    const blob = new Blob([JSON.stringify({ version: 1, done: [...done] }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'java-sa-roadmap-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importProgress = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as { done?: unknown };
      if (!Array.isArray(data.done)) throw new Error('invalid');
      const valid = new Set(allSkillIds);
      const ids = data.done.filter((x): x is string => typeof x === 'string' && valid.has(x));
      importIds(ids);
      message.success(`Đã nhập ${ids.length} kỹ năng`);
    } catch {
      message.error('File không hợp lệ');
    }
    return false;
  };

  return (
    <div className="page">
      <Title level={2}>Tiến độ của tôi</Title>
      <Paragraph type="secondary">
        Tiến độ được lưu trong trình duyệt (localStorage). Xuất file JSON để sao lưu hoặc chuyển sang máy khác.
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', height: '100%' }}>
            <Progress type="dashboard" percent={overall} size={180} />
            <div>
              <Text type="secondary">Hoàn thành tổng thể</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Row gutter={[16, 16]}>
            <Col xs={12}>
              <Card>
                <Statistic title="Kỹ năng đã đạt" value={totalDone} suffix={`/ ${allSkillIds.length}`} />
              </Card>
            </Col>
            <Col xs={12}>
              <Card>
                <Statistic title="Giai đoạn hoàn thành" value={phasesDone} suffix={`/ ${phases.length}`} />
              </Card>
            </Col>
            <Col xs={24}>
              <Card>
                <Statistic title="Thời gian còn lại ước tính" value={weeksLeft} suffix="tuần" />
                <Space wrap style={{ marginTop: 16 }}>
                  <Button icon={<DownloadOutlined />} onClick={exportProgress}>
                    Xuất JSON
                  </Button>
                  <Upload accept="application/json,.json" showUploadList={false} beforeUpload={importProgress}>
                    <Button icon={<UploadOutlined />}>Nhập JSON</Button>
                  </Upload>
                  <Popconfirm
                    title="Xoá toàn bộ tiến độ?"
                    description="Thao tác này không thể hoàn tác."
                    okText="Xoá"
                    cancelText="Huỷ"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => {
                      reset();
                      message.success('Đã đặt lại tiến độ');
                    }}
                  >
                    <Button danger icon={<DeleteOutlined />} disabled={totalDone === 0}>
                      Đặt lại
                    </Button>
                  </Popconfirm>
                </Space>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Card title="Chi tiết theo giai đoạn" style={{ marginTop: 16 }}>
        <Table<PhaseRow>
          rowKey={(r) => r.phase.id}
          dataSource={rows}
          pagination={false}
          scroll={{ x: 640 }}
          columns={[
            {
              title: 'Giai đoạn',
              key: 'phase',
              render: (_, r) => (
                <Link to={`/phase/${r.phase.id}`}>
                  <Space>
                    <PhaseAvatar icon={r.phase.icon} color={r.phase.color} size={32} />
                    <span>
                      {r.phase.order}. {r.phase.title}
                    </span>
                  </Space>
                </Link>
              ),
            },
            {
              title: 'Tiến độ',
              key: 'pct',
              width: 240,
              sorter: (a, b) => a.pct - b.pct,
              render: (_, r) => <Progress percent={r.pct} strokeColor={r.phase.color} size="small" />,
            },
            {
              title: 'Kỹ năng',
              key: 'count',
              width: 100,
              render: (_, r) => `${r.done}/${r.total}`,
            },
            {
              title: 'Trạng thái',
              key: 'status',
              width: 140,
              filters: [
                { text: 'Hoàn thành', value: 'done' },
                { text: 'Đang học', value: 'doing' },
                { text: 'Chưa bắt đầu', value: 'todo' },
              ],
              onFilter: (value, r) =>
                value === 'done' ? r.pct === 100 : value === 'doing' ? r.pct > 0 && r.pct < 100 : r.pct === 0,
              render: (_, r) => statusTag(r.pct),
            },
          ]}
        />
      </Card>
    </div>
  );
}
