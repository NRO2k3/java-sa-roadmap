import { CopyOutlined } from '@ant-design/icons';
import { App, Button, Typography, theme } from 'antd';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import java from 'highlight.js/lib/languages/java';
import json from 'highlight.js/lib/languages/json';
import plaintext from 'highlight.js/lib/languages/plaintext';
import properties from 'highlight.js/lib/languages/properties';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import { useMemo, type CSSProperties } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Chỉ đăng ký các ngôn ngữ bài học dùng để bundle nhỏ
Object.entries({ bash, dockerfile, java, json, plaintext, properties, sql, xml, yaml }).forEach(([name, lang]) =>
  hljs.registerLanguage(name, lang),
);

const { Title, Paragraph, Text } = Typography;

interface HastNode {
  type: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const textOf = (node?: HastNode): string =>
  node?.type === 'text' ? (node.value ?? '') : (node?.children ?? []).map(textOf).join('');

export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const { message } = App.useApp();
  const html = useMemo(
    () => hljs.highlight(code, { language: hljs.getLanguage(lang) ? lang : 'plaintext' }).value,
    [code, lang],
  );

  const copy = () =>
    navigator.clipboard.writeText(code).then(
      () => message.success('Đã sao chép'),
      () => message.error('Không sao chép được'),
    );

  return (
    <div className="md-code">
      <div className="md-code-head">
        <span>{lang}</span>
        <Button type="text" size="small" icon={<CopyOutlined />} onClick={copy} aria-label="Sao chép code" />
      </div>
      <pre>
        {/* hljs đã escape mã nguồn nên chèn HTML an toàn */}
        <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}

const components: Components = {
  h2: ({ node, children }) => (
    <Title level={3} id={slugify(textOf(node as HastNode))} className="md-h2">
      {children}
    </Title>
  ),
  h3: ({ children }) => <Title level={4}>{children}</Title>,
  h4: ({ children }) => <Title level={5}>{children}</Title>,
  p: ({ children }) => <Paragraph>{children}</Paragraph>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  // Khối code do pre xử lý nên code ở đây luôn là inline
  code: ({ children }) => <Text code>{children}</Text>,
  pre: ({ node }) => {
    const codeEl = (node as HastNode | undefined)?.children?.[0];
    const classes = (codeEl?.properties?.className as string[] | undefined) ?? [];
    const lang = classes.find((c) => c.startsWith('language-'))?.slice('language-'.length) ?? 'text';
    return <CodeBlock code={textOf(codeEl).replace(/\n$/, '')} lang={lang} />;
  },
  table: ({ children }) => (
    <div className="md-table">
      <table>{children}</table>
    </div>
  ),
  blockquote: ({ children }) => <div className="md-callout">{children}</div>,
};

export default function Markdown({ content }: { content: string }) {
  const { token } = theme.useToken();
  const vars = {
    '--md-border': token.colorBorderSecondary,
    '--md-soft': token.colorFillQuaternary,
    '--md-accent': token.colorPrimary,
    '--md-callout': token.colorPrimaryBg,
  } as CSSProperties;

  return (
    <div className="lesson-md" style={vars}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
