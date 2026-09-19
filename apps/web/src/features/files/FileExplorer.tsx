import { useEffect, useState } from 'react';
import type { FileEntry } from '@hm-os/contracts';
import { createDirectory, deletePath, listDirectory, movePath, readTextFile, uploadFile, writeTextFile } from './api.js';

function parentPath(path: string) {
  if (path === '.' || !path.includes('/')) return '.';
  return path.slice(0, path.lastIndexOf('/')) || '.';
}

export function FileExplorer() {
  const [cwd, setCwd] = useState('.');
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  async function refresh(path = cwd) {
    try {
      const result = await listDirectory(path);
      setCwd(result.path);
      setEntries(result.entries);
      setMessage('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '목록을 불러오지 못했습니다.');
    }
  }

  useEffect(() => { void refresh('.'); }, []);

  async function open(entry: FileEntry) {
    if (entry.type === 'directory') {
      setSelected(null);
      setContent('');
      await refresh(entry.path);
      return;
    }
    try {
      const result = await readTextFile(entry.path);
      setSelected(result.path);
      setContent(result.content);
      setMessage(result.truncated ? '2MiB까지만 표시됩니다.' : '');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '파일을 읽지 못했습니다.');
    }
  }

  async function save() {
    if (!selected) return;
    await writeTextFile(selected, content);
    setMessage('저장됨');
  }

  async function mkdir() {
    const name = window.prompt('새 폴더 이름');
    if (!name) return;
    await createDirectory(cwd === '.' ? name : `${cwd}/${name}`);
    await refresh();
  }

  async function rename(entry: FileEntry) {
    const name = window.prompt('새 이름', entry.name);
    if (!name || name === entry.name) return;
    const to = cwd === '.' ? name : `${cwd}/${name}`;
    await movePath(entry.path, to);
    if (selected === entry.path) setSelected(to);
    await refresh();
  }

  async function remove(entry: FileEntry) {
    if (!window.confirm(`${entry.name}을(를) 삭제할까요?`)) return;
    await deletePath(entry.path);
    if (selected === entry.path) { setSelected(null); setContent(''); }
    await refresh();
  }

  async function upload(file: File) {
    const path = cwd === '.' ? file.name : `${cwd}/${file.name}`;
    await uploadFile(path, file);
    await refresh();
  }

  return (
    <section className="hm-os-control-panel hm-os-file-panel" aria-label="파일 탐색기">
      <header><h2>파일</h2><span>{cwd}</span></header>
      <div className="hm-os-file-toolbar">
        <button type="button" onClick={() => void refresh(parentPath(cwd))} disabled={cwd === '.'}>상위</button>
        <button type="button" onClick={() => void mkdir()}>새 폴더</button>
        <label className="hm-os-file-upload">업로드<input type="file" onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); }} /></label>
      </div>
      {message && <p className="hm-os-control-message">{message}</p>}
      <div className="hm-os-file-layout">
        <ul className="hm-os-file-list">
          {entries.map((entry) => (
            <li key={entry.path}>
              <button type="button" className="hm-os-file-entry" onDoubleClick={() => void open(entry)} onClick={() => entry.type === 'file' && void open(entry)}>
                <span aria-hidden="true">{entry.type === 'directory' ? '▣' : '▪'}</span> {entry.name}
              </button>
              <button type="button" onClick={() => void rename(entry)} aria-label={`${entry.name} 이름 변경`}>✎</button>
              <button type="button" onClick={() => void remove(entry)} aria-label={`${entry.name} 삭제`}>×</button>
              {entry.type === 'file' && <a href={`/api/files/download?path=${encodeURIComponent(entry.path)}`} aria-label={`${entry.name} 다운로드`}>⇩</a>}
            </li>
          ))}
        </ul>
        <div className="hm-os-file-editor">
          <div className="hm-os-file-editor-header"><span>{selected ?? '파일을 선택하세요'}</span><button type="button" onClick={() => void save()} disabled={!selected}>저장</button></div>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} disabled={!selected} spellCheck={false} />
        </div>
      </div>
    </section>
  );
}
