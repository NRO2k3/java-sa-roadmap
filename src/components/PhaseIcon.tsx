import {
  AimOutlined,
  AlertOutlined,
  ApiOutlined,
  AuditOutlined,
  ClusterOutlined,
  CloudServerOutlined,
  CodeOutlined,
  DatabaseOutlined,
  DeploymentUnitOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  ShareAltOutlined,
  SolutionOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import type { CSSProperties } from 'react';
import type { PhaseIcon as PhaseIconKey } from '../data/roadmap';

const icons: Record<PhaseIconKey, typeof CodeOutlined> = {
  java: CodeOutlined,
  spring: ApiOutlined,
  data: DatabaseOutlined,
  messaging: ShareAltOutlined,
  microservices: ClusterOutlined,
  cloud: CloudServerOutlined,
  security: SafetyCertificateOutlined,
  design: DeploymentUnitOutlined,
  architect: SolutionOutlined,
  career: TrophyOutlined,
  quality: AuditOutlined,
  ops: AlertOutlined,
  leadership: AimOutlined,
  people: TeamOutlined,
  delivery: ScheduleOutlined,
  growth: RiseOutlined,
};

export default function PhaseIcon({ icon, style }: { icon: PhaseIconKey; style?: CSSProperties }) {
  const Icon = icons[icon];
  return <Icon style={style} />;
}

export function PhaseAvatar({ icon, color, size = 44 }: { icon: PhaseIconKey; color: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 4,
        background: `${color}1f`,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        flexShrink: 0,
      }}
    >
      <PhaseIcon icon={icon} />
    </div>
  );
}
