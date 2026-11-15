import {
  AppstoreOutlined,
  BookOutlined,
  BulbOutlined,
  GithubOutlined,
  HomeOutlined,
  MenuOutlined,
  MoonOutlined,
  NodeIndexOutlined,
  PieChartOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  SunOutlined,
} from '@ant-design/icons';
import {
  App as AntApp,
  AutoComplete,
  Button,
  ConfigProvider,
  Drawer,
  Grid,
  Input,
  Layout,
  Menu,
  Progress,
  Space,
  Tooltip,
  Typography,
  theme as antTheme,
  type MenuProps,
} from 'antd';
import viVN from 'antd/locale/vi_VN';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import PhaseIcon from './components/PhaseIcon';
import { allSkillIds, phases } from './data/roadmap';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Patterns from './pages/Patterns';
import PhaseDetail from './pages/PhaseDetail';
import ProgressPage from './pages/Progress';
import Quiz from './pages/Quiz';
import Resources from './pages/Resources';
import Roadmap from './pages/Roadmap';
import { percent, useProgress } from './progress';

const { Header, Sider, Content, Footer } = Layout;
const THEME_KEY = 'java-sa-roadmap:theme';
// Workflow deploy tự điền link repo; khi chạy local thì trỏ về github.com
const REPO_URL = import.meta.env.VITE_REPO_URL || 'https://github.com/';

function initialDark() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved === 'dark';
  } catch {
    // bỏ qua
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

const menuItems: MenuProps['items'] = [
  { key: '/', icon: <HomeOutlined />, label: <Link to="/">Trang chủ</Link> },
  { key: '/roadmap', icon: <NodeIndexOutlined />, label: <Link to="/roadmap">Lộ trình tổng quan</Link> },
  {
    key: 'phases',
    icon: <AppstoreOutlined />,
    label: 'Các giai đoạn',
    children: phases.map((p) => ({
      key: `/phase/${p.id}`,
      icon: <PhaseIcon icon={p.icon} style={{ color: p.color }} />,
      label: <Link to={`/phase/${p.id}`}>{`${p.order}. ${p.title}`}</Link>,
    })),
  },
  { key: '/patterns', icon: <BulbOutlined />, label: <Link to="/patterns">Mẫu kiến trúc</Link> },
  { key: '/quiz', icon: <QuestionCircleOutlined />, label: <Link to="/quiz">Trắc nghiệm</Link> },
  { key: '/resources', icon: <BookOutlined />, label: <Link to="/resources">Tài nguyên</Link> },
  { key: '/progress', icon: <PieChartOutlined />, label: <Link to="/progress">Tiến độ của tôi</Link> },
];

function GlobalSearch() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');

  const options = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return phases
      .map((p) => ({
        label: `${p.order}. ${p.title}`,
        options: p.topics
          .filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.description.toLowerCase().includes(q) ||
              t.skills.some((s) => s.toLowerCase().includes(q)),
          )
          .map((t) => ({ value: `${p.id}|${t.id}`, label: t.title })),
      }))
      .filter((g) => g.options.length > 0);
  }, [value]);

  return (
    <AutoComplete
      value={value}
      options={options}
      onChange={setValue}
      onSelect={(v: string) => {
        const [phaseId, topicId] = v.split('|');
        navigate(`/phase/${phaseId}?topic=${topicId}`);
        setValue('');
      }}
      style={{ width: '100%', maxWidth: 360 }}
      notFoundContent={value ? 'Không tìm thấy chủ đề' : null}
    >
      <Input prefix={<SearchOutlined />} placeholder="Tìm chủ đề: Kafka, JVM, DDD…" allowClear />
    </AutoComplete>
  );
}

export default function App() {
  const [dark, setDark] = useState(initialDark);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const isDesktop = screens.lg ?? true;
  const location = useLocation();
  const { countDone } = useProgress();
  const overall = percent(countDone(allSkillIds), allSkillIds.length);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch {
      // bỏ qua
    }
    document.body.style.background = dark ? '#000' : '#f5f5f5';
  }, [dark]);

  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const selectedKey = location.pathname;
  const openKeys = selectedKey.startsWith('/phase/') ? ['phases'] : [];

  const brand = (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px' }}>
      <img src="./favicon.svg" alt="" width={32} height={32} />
      <div style={{ lineHeight: 1.2 }}>
        <Typography.Text strong style={{ fontSize: 16, display: 'block' }}>
          Java SA Roadmap
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Lộ trình Solution Architect
        </Typography.Text>
      </div>
    </Link>
  );

  const sideContent = (
    <>
      {brand}
      <div style={{ padding: '0 20px 12px' }}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Tiến độ tổng thể
        </Typography.Text>
        <Progress percent={overall} size="small" />
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={openKeys}
        items={menuItems}
        style={{ borderInlineEnd: 'none' }}
      />
    </>
  );

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: dark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: { colorPrimary: '#1677ff', borderRadius: 8 },
      }}
    >
      <AntApp>
        <Layout style={{ minHeight: '100vh' }}>
          {isDesktop ? (
            <Sider
              width={272}
              theme={dark ? 'dark' : 'light'}
              style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}
            >
              {sideContent}
            </Sider>
          ) : (
            <Drawer
              placement="left"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              width={280}
              styles={{ body: { padding: 0 } }}
              closable={false}
            >
              {sideContent}
            </Drawer>
          )}
          <Layout>
            <ThemedHeader>
              <Space style={{ flex: 1, minWidth: 0 }}>
                {!isDesktop && (
                  <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} aria-label="Mở menu" />
                )}
                <GlobalSearch />
              </Space>
              <Space>
                <Tooltip title={dark ? 'Chế độ sáng' : 'Chế độ tối'}>
                  <Button
                    shape="circle"
                    icon={dark ? <SunOutlined /> : <MoonOutlined />}
                    onClick={() => setDark((d) => !d)}
                    aria-label="Đổi giao diện"
                  />
                </Tooltip>
                <Tooltip title="Mã nguồn trên GitHub">
                  <Button shape="circle" icon={<GithubOutlined />} href={REPO_URL} target="_blank" aria-label="GitHub" />
                </Tooltip>
              </Space>
            </ThemedHeader>
            <Content style={{ padding: isDesktop ? 24 : 16 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/phase/:id" element={<PhaseDetail />} />
                <Route path="/patterns" element={<Patterns />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
              <Typography.Text type="secondary">
                Java SA Roadmap · Xây dựng với React + Ant Design · Tiến độ được lưu trên trình duyệt của bạn
              </Typography.Text>
            </Footer>
          </Layout>
        </Layout>
      </AntApp>
    </ConfigProvider>
  );
}

function ThemedHeader({ children }: { children: ReactNode }) {
  const { token } = antTheme.useToken();
  return (
    <Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      {children}
    </Header>
  );
}
