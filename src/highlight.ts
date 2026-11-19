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

// Chỉ đăng ký các ngôn ngữ nội dung dùng để bundle nhỏ
Object.entries({ bash, dockerfile, java, json, plaintext, properties, sql, xml, yaml }).forEach(([name, lang]) =>
  hljs.registerLanguage(name, lang),
);

/** HTML đã tô màu; hljs escape mã nguồn nên chèn vào trang an toàn */
export function highlight(code: string, lang?: string) {
  if (lang && hljs.getLanguage(lang)) return hljs.highlight(code, { language: lang }).value;
  return lang ? hljs.highlight(code, { language: 'plaintext' }).value : hljs.highlightAuto(code).value;
}
