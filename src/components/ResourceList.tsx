import { LinkOutlined } from '@ant-design/icons';
import { List, Space, Tag } from 'antd';
import { resourceTypeLabel, type Resource } from '../data/roadmap';

export default function ResourceList({ resources }: { resources: Resource[] }) {
  return (
    <List
      size="small"
      split={false}
      dataSource={resources}
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
  );
}
