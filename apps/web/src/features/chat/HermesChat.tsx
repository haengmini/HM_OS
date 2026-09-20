import { useEffect, useRef, useState, type FormEvent } from 'react';

interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string }
const STORAGE_KEY = 'hm-os-chat-preview';

function initialMessages(): ChatMessage[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]').slice(-20); } catch { return []; }
}

export function HermesChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [tool, setTool] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20))); endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => () => abortRef.current?.abort(), []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const assistantId = crypto.randomUUID();
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', content: text }, { id: assistantId, role: 'assistant', content: '' }]);
    setInput(''); setBusy(true); setTool('');
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: text }), signal: controller.signal });
      if (!response.ok || !response.body) throw new Error((await response.json().catch(() => null))?.message ?? `대화 연결 실패 (${response.status})`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split('\n\n'); buffer = frames.pop() ?? '';
        for (const frame of frames) {
          const eventName = frame.split('\n').find((line) => line.startsWith('event:'))?.slice(6).trim();
          const dataLine = frame.split('\n').find((line) => line.startsWith('data:'));
          if (!dataLine || dataLine.slice(5).trim() === '[DONE]') continue;
          try {
            const data = JSON.parse(dataLine.slice(5));
            if (eventName === 'hermes.tool.progress') {
              setTool(data.status === 'running' ? (data.label ?? data.tool ?? '도구 실행 중') : '');
            } else {
              const delta = data.choices?.[0]?.delta?.content;
              if (delta) setMessages((current) => current.map((item) => item.id === assistantId ? { ...item, content: item.content + delta } : item));
            }
          } catch { /* keepalive or malformed optional frame */ }
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setMessages((current) => current.map((item) => item.id === assistantId ? { ...item, content: `⚠ ${(error as Error).message}` } : item));
    } finally { setBusy(false); setTool(''); abortRef.current = null; }
  }

  return (
    <section className="hm-os-chat-panel" aria-label="Hermes 대화">
      <header><div><span className="hm-os-chat-avatar">H</span><div><b>Hermes</b><small>COLONY AI · ONLINE</small></div></div><button type="button" onClick={onClose} aria-label="대화 닫기">×</button></header>
      <div className="hm-os-chat-log" aria-live="polite">
        {messages.length === 0 && <div className="hm-os-chat-welcome"><b>안녕하세요, 형민님.</b><p>콜로니에서 무엇을 함께 할까요?</p></div>}
        {messages.map((message) => <article key={message.id} data-role={message.role}><span>{message.role === 'assistant' ? 'H' : 'YOU'}</span><p>{message.content || (busy ? '...' : '')}</p></article>)}
        {tool && <div className="hm-os-chat-tool">⚙ {tool}</div>}<div ref={endRef} />
      </div>
      <form onSubmit={submit}><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Hermes에게 메시지 보내기..." rows={2} /><div><small>Enter 전송 · Shift+Enter 줄바꿈</small>{busy ? <button type="button" onClick={() => abortRef.current?.abort()}>중단</button> : <button type="submit" disabled={!input.trim()}>전송</button>}</div></form>
    </section>
  );
}
