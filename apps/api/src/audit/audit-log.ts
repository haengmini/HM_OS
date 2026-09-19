import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * Append-only audit log per docs/architecture/SECURITY.md:
 * "기록: 명령 시작/종료 시각, exit code, 대상 파일 경로, 작업 종류
 * (read/write/move/delete 등), 세션 식별자. 기록하지 않음: 명령 원문,
 * 파일 내용, PIN, 세션 토큰 원문, 모델/agent 응답 본문."
 *
 * This module enforces that contract at the type level: callers can
 * only pass the allowed fields, so a future call site cannot
 * accidentally log a command string or file content.
 */
export type AuditAction =
  | 'terminal_start'
  | 'terminal_exit'
  | 'file_read'
  | 'file_write'
  | 'file_move'
  | 'file_delete'
  | 'file_mkdir'
  | 'file_upload'
  | 'file_download';

export interface AuditEntry {
  action: AuditAction;
  sessionId: string;
  /** Relative path only (never absolute; never file content). */
  targetPath?: string;
  exitCode?: number;
  /** ISO timestamp; defaults to now if omitted. */
  at?: string;
}

export class AuditLog {
  private readonly filePath: string;
  private ready: Promise<void>;

  constructor(dataDir: string, fileName = 'audit.log') {
    this.filePath = path.join(dataDir, fileName);
    this.ready = mkdir(dataDir, { recursive: true, mode: 0o700 }).then(() => undefined);
  }

  async record(entry: AuditEntry): Promise<void> {
    await this.ready;
    const line = JSON.stringify({
      at: entry.at ?? new Date().toISOString(),
      action: entry.action,
      sessionId: entry.sessionId,
      targetPath: entry.targetPath,
      exitCode: entry.exitCode,
    });
    await appendFile(this.filePath, line + '\n', { mode: 0o600 });
  }
}
