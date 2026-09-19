import { useEffect, useRef, useState } from 'react';
import type { TerminalClientMessage, TerminalServerMessage } from '@hm-os/contracts';
import '@xterm/xterm/css/xterm.css';

function terminalWsUrl(): string {
  const url = new URL('/api/terminal', window.location.origin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

export function TerminalPanel() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('연결 준비');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    void Promise.all([import('@xterm/xterm'), import('@xterm/addon-fit')]).then(
      ([{ Terminal }, { FitAddon }]) => {
        if (disposed) return;
        const terminal = new Terminal({
          cursorBlink: true,
          convertEol: true,
          fontFamily: "'Courier New', monospace",
          fontSize: 13,
          theme: { background: '#020617', foreground: '#e2e8f0', cursor: '#3b82f6' },
        });
        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.open(host);
        fitAddon.fit();

        const ws = new WebSocket(terminalWsUrl());
        setStatus('연결 중');
        const send = (message: TerminalClientMessage) => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
        };
        ws.onopen = () => setStatus('연결됨');
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data as string) as TerminalServerMessage;
          if (message.type === 'output') terminal.write(message.data);
          if (message.type === 'ready') {
            fitAddon.fit();
            send({ type: 'resize', cols: terminal.cols, rows: terminal.rows });
          }
          if (message.type === 'exit') setStatus(`종료됨 (${message.exitCode})`);
          if (message.type === 'error') terminal.writeln(`\r\n[HM OS] ${message.message}`);
        };
        ws.onclose = (event) => setStatus(event.code === 4401 ? '잠금됨' : '연결 종료');
        ws.onerror = () => setStatus('연결 오류');

        const inputDisposable = terminal.onData((data: string) => send({ type: 'input', data }));
        const resizeObserver = new ResizeObserver(() => {
          fitAddon.fit();
          send({ type: 'resize', cols: terminal.cols, rows: terminal.rows });
        });
        resizeObserver.observe(host);
        cleanup = () => {
          resizeObserver.disconnect();
          inputDisposable.dispose();
          ws.close();
          terminal.dispose();
        };
      },
    );

    return () => { disposed = true; cleanup(); };
  }, []);

  return (
    <section className="hm-os-control-panel" aria-label="서버 터미널">
      <header><h2>터미널</h2><span>{status}</span></header>
      <div ref={hostRef} className="hm-os-terminal-host" />
    </section>
  );
}
