import type { FastifyInstance } from 'fastify';
import { sessionGuard } from '../auth/guards.js';
import type { SessionStore } from '../auth/session-store.js';
import type { AuditLog } from '../audit/audit-log.js';
import { FileService, FileServiceError } from '../files/file-service.js';

const ERROR_STATUS: Record<FileServiceError['reason'], number> = {
  not_found: 404,
  path_escape: 403,
  not_a_directory: 400,
  not_a_file: 400,
  already_exists: 409,
  too_large: 413,
  io_error: 500,
};

function handleFileError(reply: import('fastify').FastifyReply, err: unknown) {
  if (err instanceof FileServiceError) {
    reply.code(ERROR_STATUS[err.reason]);
    return { reason: err.reason, message: err.message };
  }
  reply.code(500);
  return { reason: 'io_error', message: 'Unexpected file service error.' };
}

/**
 * Registers `/api/files/*` routes, all behind sessionGuard. Every
 * mutating operation writes an audit entry per
 * docs/architecture/SECURITY.md (path + action + session id only —
 * never file content).
 */
export function registerFileRoutes(
  app: FastifyInstance,
  filesRoot: string,
  sessionStore: SessionStore,
  auditLog: AuditLog,
) {
  const fileService = new FileService(filesRoot);

  app.get<{ Querystring: { path?: string } }>(
    '/api/files/list',
    { preHandler: [sessionGuard(sessionStore)] },
    async (req, reply) => {
      try {
        const result = await fileService.list(req.query.path ?? '.');
        await auditLog.record({ action: 'file_read', sessionId: req.hmOsSessionId!, targetPath: result.path });
        return result;
      } catch (err) {
        return handleFileError(reply, err);
      }
    },
  );

  app.get<{ Querystring: { path: string } }>(
    '/api/files/read',
    { preHandler: [sessionGuard(sessionStore)] },
    async (req, reply) => {
      try {
        const result = await fileService.read(req.query.path);
        await auditLog.record({ action: 'file_read', sessionId: req.hmOsSessionId!, targetPath: result.path });
        return result;
      } catch (err) {
        return handleFileError(reply, err);
      }
    },
  );

  app.post<{ Body: { path: string; content: string } }>(
    '/api/files/write',
    { preHandler: [sessionGuard(sessionStore)] },
    async (req, reply) => {
      try {
        await fileService.write(req.body.path, req.body.content);
        await auditLog.record({ action: 'file_write', sessionId: req.hmOsSessionId!, targetPath: req.body.path });
        return { ok: true };
      } catch (err) {
        return handleFileError(reply, err);
      }
    },
  );

  app.post<{ Body: { path: string } }>(
    '/api/files/mkdir',
    { preHandler: [sessionGuard(sessionStore)] },
    async (req, reply) => {
      try {
        await fileService.mkdir(req.body.path);
        await auditLog.record({ action: 'file_mkdir', sessionId: req.hmOsSessionId!, targetPath: req.body.path });
        return { ok: true };
      } catch (err) {
        return handleFileError(reply, err);
      }
    },
  );

  app.post<{ Body: { from: string; to: string } }>(
    '/api/files/move',
    { preHandler: [sessionGuard(sessionStore)] },
    async (req, reply) => {
      try {
        await fileService.move(req.body.from, req.body.to);
        await auditLog.record({ action: 'file_move', sessionId: req.hmOsSessionId!, targetPath: req.body.to });
        return { ok: true };
      } catch (err) {
        return handleFileError(reply, err);
      }
    },
  );

  app.post<{ Body: { path: string } }>(
    '/api/files/delete',
    { preHandler: [sessionGuard(sessionStore)] },
    async (req, reply) => {
      try {
        await fileService.delete(req.body.path);
        await auditLog.record({ action: 'file_delete', sessionId: req.hmOsSessionId!, targetPath: req.body.path });
        return { ok: true };
      } catch (err) {
        return handleFileError(reply, err);
      }
    },
  );

  // Download: streams the raw file bytes so binary files aren't
  // mangled by JSON/UTF-8 round-tripping the way /api/files/read is.
  app.get<{ Querystring: { path: string } }>(
    '/api/files/download',
    { preHandler: [sessionGuard(sessionStore)] },
    async (req, reply) => {
      try {
        const buffer = await fileService.readRaw(req.query.path);
        await auditLog.record({
          action: 'file_download',
          sessionId: req.hmOsSessionId!,
          targetPath: req.query.path,
        });
        reply.header('content-type', 'application/octet-stream');
        reply.header(
          'content-disposition',
          `attachment; filename="${req.query.path.split('/').pop() ?? 'download'}"`,
        );
        return reply.send(buffer);
      } catch (err) {
        return handleFileError(reply, err);
      }
    },
  );

  // Upload: raw request body bytes written verbatim to `path` (query
  // string), so any file type (not just UTF-8 text) round-trips
  // correctly. Requires the 'application/octet-stream' content-type
  // parser registered in server.ts (Fastify only parses json/text by
  // default). Body size is capped by Fastify's bodyLimit.
  app.post<{ Querystring: { path: string }; Body: Buffer }>(
    '/api/files/upload',
    { preHandler: [sessionGuard(sessionStore)] },
    async (req, reply) => {
      try {
        await fileService.writeRaw(req.query.path, req.body);
        await auditLog.record({
          action: 'file_upload',
          sessionId: req.hmOsSessionId!,
          targetPath: req.query.path,
        });
        return { ok: true };
      } catch (err) {
        return handleFileError(reply, err);
      }
    },
  );
}
