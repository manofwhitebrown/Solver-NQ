import { useMemo, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import { toast } from '@/components/ui';
import { copyText } from './clipboard';
import './code.css';

const LANGS = { javascript, typescript, python, java, c, cpp, xml, css, json, bash, sql };
for (const [name, def] of Object.entries(LANGS)) hljs.registerLanguage(name, def);
const ALIAS: Record<string, string> = { js: 'javascript', ts: 'typescript', py: 'python', html: 'xml', sh: 'bash', shell: 'bash', 'c++': 'cpp' };

export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const html = useMemo(() => {
    const name = lang ? (ALIAS[lang.toLowerCase()] ?? lang.toLowerCase()) : '';
    return name && hljs.getLanguage(name) ? hljs.highlight(code, { language: name }).value : null;
  }, [code, lang]);

  const copy = async () => {
    const ok = await copyText(code);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else toast('Could not copy', 'error');
  };

  return (
    <div className="my-3 overflow-hidden rounded-md border border-line bg-raised">
      <div className="flex items-center justify-between border-b border-line px-3 py-1 text-xs text-muted">
        <span>{lang ?? 'code'}</span>
        <button type="button" onClick={copy} className="min-h-[44px] px-2 font-medium text-accent">{copied ? 'Copied' : 'Copy'}</button>
      </div>
      <pre className="hljs-code overflow-x-auto p-3 text-[13.5px] leading-relaxed">
        {html ? <code dangerouslySetInnerHTML={{ __html: html }} /> : <code>{code}</code>}
      </pre>
    </div>
  );
}
