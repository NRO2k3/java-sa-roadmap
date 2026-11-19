import { BulbOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, theme } from 'antd';
import { forwardRef, Fragment, useMemo, type CSSProperties, type ReactNode } from 'react';
import type { InterviewItem } from '../content/interview';
import { phaseById } from '../data/roadmap';
import { highlight } from '../highlight';

// Làm tối màu giai đoạn để chữ trắng trên dải đầu thẻ luôn đọc rõ
function shade(hex: string, factor: number) {
  const n = parseInt(hex.slice(1), 16);
  const channel = (shift: number) => Math.round(((n >> shift) & 255) * factor);
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

/** Hiển thị `code` và **đậm** trong nội dung câu trả lời */
function rich(text: string): ReactNode {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) return <code key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

interface Props {
  item: InterviewItem;
  /** Che đáp án để tự trả lời trước (chế độ luyện) */
  hidden?: boolean;
  onReveal?: () => void;
}

const InterviewCard = forwardRef<HTMLDivElement, Props>(function InterviewCard({ item, hidden, onReveal }, ref) {
  const { token } = theme.useToken();
  const phase = phaseById(item.phaseId)!;
  const topic = phase.topics.find((t) => t.id === item.topicId);
  const code = useMemo(() => (item.code ? highlight(item.code.join('\n')) : null), [item.code]);
  const vars = {
    '--iv-bg': token.colorBgContainer,
    '--iv-text': token.colorText,
    '--iv-muted': token.colorTextSecondary,
    '--iv-border': token.colorBorderSecondary,
    '--iv-soft': token.colorFillQuaternary,
    '--iv-accent': phase.color,
    '--iv-tip-bg': token.colorWarningBg,
    '--iv-tip-border': token.colorWarningBorder,
  } as CSSProperties;

  return (
    <div ref={ref} className="iv-card" style={vars}>
      <div
        className="iv-head"
        style={{ background: `linear-gradient(135deg, ${shade(phase.color, 0.8)} 0%, ${shade(phase.color, 0.45)} 100%)` }}
      >
        <div className="iv-head-top">
          <span className="iv-kicker">Phỏng vấn · {topic?.title ?? phase.title}</span>
          <span className={`iv-level iv-level-${item.level.toLowerCase()}`}>{item.level}</span>
        </div>
        <div className="iv-question">{item.question}</div>
      </div>

      <div className="iv-body-wrap">
        <div className={`iv-body${hidden ? ' iv-hidden' : ''}`} aria-hidden={hidden}>
          <div className="iv-label">Ý chính cần nói</div>
          <ol className="iv-points">
            {item.points.map((p, i) => (
              <li key={i}>
                <span className="iv-num">{i + 1}</span>
                <span>{rich(p)}</span>
              </li>
            ))}
          </ol>

          {item.compare && item.compare.length > 1 && (
            <div className="iv-table-wrap">
              <table className="iv-table">
                <thead>
                  <tr>
                    {item.compare[0].map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {item.compare.slice(1).map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c}>{rich(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {code && (
            <pre className="iv-code">
              <code className="hljs" dangerouslySetInnerHTML={{ __html: code }} />
            </pre>
          )}

          {item.tip && (
            <div className="iv-tip">
              <BulbOutlined /> <strong>Mẹo:</strong> {rich(item.tip)}
            </div>
          )}

          {item.followUps && item.followUps.length > 0 && (
            <>
              <div className="iv-label">Có thể bị hỏi tiếp</div>
              <ul className="iv-follow">
                {item.followUps.map((f, i) => (
                  <li key={i}>{rich(f)}</li>
                ))}
              </ul>
            </>
          )}
        </div>
        {hidden && (
          <div className="iv-reveal">
            <Button type="primary" size="large" icon={<EyeOutlined />} onClick={onReveal}>
              Xem đáp án (Space)
            </Button>
          </div>
        )}
      </div>

      <div className="iv-foot">
        <img src="./favicon.svg" alt="" width={18} height={18} />
        <span>Java Career Roadmap</span>
        <span className="iv-foot-phase">{phase.title}</span>
      </div>
    </div>
  );
});

export default InterviewCard;
