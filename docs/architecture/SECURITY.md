# HM OS Security Contract (V1)

## 현재 보안 보강 (2026-10-29)

아래 마일스톤 구현 노트는 과거 검증 이력이다. 현재 소스의 보강 사항과 남은 의존성 위험은
[보안 점검 기록](../operations/SECURITY_REVIEW.md)을 함께 따른다.

- 모든 `/api` HTTP 경로에 중앙 Tailscale 신원·Host 검사를 적용한다. 보호 라우트의 세션 검사도 유지한다.
- API 응답은 인증 실패를 포함해 `Cache-Control: no-store`로 처리한다.
- 자동 presence·상태 조회는 idle 시간을 연장하지 않는다. 인증된 활동 경로와 실제 사용자 입력으로 활동을 갱신한다.
- 명시적 잠금·로그아웃은 연결된 채팅 upstream과 PTY를 취소한다. 만료는 주기 검사와 출력 전 검사로 차단한다.
- 채팅 요청은 헤더 대기·본문·스트림을 포함한 시간 제한과 연결 종료 정리를 수행하고 upstream 상세 오류를 노출하지 않는다.
- 대화 UI는 메모리만 사용하고 과거 평문 브라우저 캐시는 앱 시작 시 제거한다. 서버 측 Hermes 이력은 별도로 유지된다.
- 감사 로그의 `sessionId`는 원문 세션 토큰이 아니라 SHA-256 해시다. 기존 로그를 임의 삭제·변경하지 않는다.
- 파일 서비스는 문자열 경로와 실제 symlink 경로를 모두 검사한다. 동일 UID 프로세스의 동시 경로 교체까지 막는 OS 샌드박스는 아니다.

이 계약은 사용자 승인 운영 정책과 앱의 기술적 인증을 구분한다. 현재 인증된 소유자에게 허용된
터미널·파일 작업마다 추가 승인 UI를 강제하는 설계는 아니며, 새 sudo 권한을 부여하지 않는다.

## 인증 2단계

1. **Tailscale 사용자 신원**
   - Tailscale Serve가 주입한 `Tailscale-User-Login` 헤더가 등록된 소유자
     (`ihyeongmin00@gmail.com`)와 정확히 일치해야 한다.
   - 요청의 `Host`가 발급된 MagicDNS 이름(`hm-os-server.taila8b4a0.ts.net`)과
     정확히 일치해야 한다.
   - API는 `127.0.0.1`에만 바인딩하여 tailnet 우회 접근을 차단한다.

2. **HM OS PIN**
   - PIN은 Argon2id로 해시하여 저장한다. 평문 PIN은 저장·로그하지 않는다.
   - 로그인 성공 시 짧은 수명의 세션을 발급한다 (`HttpOnly`, `Secure`,
     `SameSite=Strict` 쿠키).
   - 반복 실패 시 지수 백오프 rate limit을 적용한다.

## 세션과 잠금

- 일정 시간 미사용 시 자동 잠금 상태로 전환한다.
- 잠금 상태에서는 모든 PTY·파일 편집 WebSocket 채널을 즉시 종료하거나 재인증을 요구한다.
- 모든 WebSocket 연결은 최초 접속 시점뿐 아니라 각 채널 생성 시점에도 세션을 재검증한다.
- 로그아웃/세션 만료 시 서버 측에서 세션을 즉시 무효화한다 (클라이언트 신뢰 금지).

## 실행 권한 경계

- 모든 명령·파일 작업은 HM OS 서버 프로세스의 Linux 사용자 권한을 그대로 사용한다.
- V1은 어떤 경로로도 새로운 `sudo`/`root` 권한을 부여하지 않는다.
- 로그인 이후 명령은 즉시 실행하되(추가 확인 없음), 모든 실행은 감사 로그에 기록한다.

## 감사 로그 원칙

- 기록: 명령 시작/종료 시각, exit code, 대상 파일 경로, 작업 종류(read/write/move/delete 등),
  세션 식별자.
- 기록하지 않음: 명령 원문, 파일 내용, PIN, 세션 토큰 원문, 모델/agent 응답 본문.

## 네트워크 경계

- Funnel(공개 인터넷 노출)은 사용하지 않는다. `tailnet only` 상태를 유지한다.
- 브라우저는 Hermes의 범용 에이전트 API나 다른 host-capable 도구 API를 직접 호출하지 않는다.
- HM OS API는 자체 인증 계층 뒤에서만 터미널/파일 기능을 노출한다.

## 검증 체크리스트 (Milestone 1 게이트)

- [x] 잘못된 Host 헤더 → 403 (`invalid_host`) — 자동 테스트 + 실제 HTTP 스모크 테스트로 확인
- [x] 누락된/위조된 Tailscale 신원 헤더 → 403 (`missing_identity`) — 자동 테스트 + 실제 HTTP 스모크 테스트로 확인
- [x] 잘못된 PIN → 401 (`invalid_pin`) (+ rate limit 확인) — 자동 테스트 + 실제 HTTP 스모크 테스트로 확인
- [x] 유효한 세션 없이 보호된 라우트(`/api/auth/whoami`) 접근 → 401 (`session_expired`)
- [x] 잠금 상태에서 보호된 라우트 접근 → 401 (`session_expired`, `Session is locked.`)
- [x] 세션 만료(로그아웃) 후 API 호출 → 401 (`session_expired`)

Milestone 1 구현 노트:
- Tailscale 신원 검사는 `apps/api/src/auth/tailscale-identity.ts`, 세션/잠금은
  `apps/api/src/auth/session-store.ts`, PIN 해시는 `apps/api/src/auth/pin.ts`
  (Argon2id, `@node-rs/argon2`), rate limit은 `apps/api/src/auth/rate-limiter.ts`에 구현.
- 프런트엔드 잠금 화면은 `apps/web/src/features/auth/{LockScreen,AuthGate,useAuthGate,api}.ts(x)`.
- 위 Milestone 1 검증 당시에는 터미널·파일 채널이 없었다. 현재는 Milestone 4 구현과
  2026-10-29의 세션 무효화 보강을 사용한다.

Milestone 2 구현 노트 — WebSocket 업그레이드 처리 방식:
- **발견한 이슈:** `@fastify/websocket@11.3.1`을 Fastify 5.12.5 + Node 26.5.1 조합에서
  route-hijack 방식(`{ websocket: true }` 옵션)으로 등록했을 때, 라우트 핸들러의 첫 번째
  인자로 실제 `ws.WebSocket` 소켓이 아니라 Fastify 내부의 `_Request` 객체가 전달되는 것을
  실제 서버 기동 후 최소 재현 스크립트로 확인했다(`socket.send is not a function`,
  `socket.close is not a function`). 원인은 이 특정 버전 조합에서의 라이브러리 통합 버그로
  보이며, 별도 이슈 리포트 없이 우회하기로 결정했다.
- **우회 방법:** `@fastify/websocket` 의존성을 제거하고, `ws` 패키지의
  `WebSocketServer({ noServer: true })`를 Fastify의 기반 Node `http.Server`
  (`app.server`)의 `upgrade` 이벤트에 직접 연결하는 방식으로 전환했다
  (`apps/api/src/realtime/status-stream.ts`의 `attachStatusStream`).
  Tailscale 신원 검사(`checkTailscaleIdentity`)와 세션 조회(`sessionStore.get`)를
  업그레이드 단계에서 직접 수행해 실패 시 소켓을 HTTP 응답(403/401)으로 거부한 뒤
  destroy한다. `checkTailscaleIdentity`는 이 재사용을 위해 Fastify `FastifyRequest` 대신
  일반 헤더 레코드(`HeaderLookup`)를 받도록 리팩터링했다.
- **실제 검증(진짜 서버 기동 + 진짜 WebSocket 클라이언트로 확인):**
  - 정상 세션 → `office-status` 이벤트 스트림 정상 수신(2회 연속 각 17개 이벤트)
  - `/api/auth/lock` 호출 후 같은 쿠키로 재연결 시도 → 업그레이드 단계에서 401 거부
  - 잘못된 Host 헤더로 연결 시도 → 업그레이드 단계에서 403 거부
- 이 패턴(`WebSocketServer({ noServer: true })` + 수동 `upgrade` 핸들러)이 Milestone 4의
  PTY 터미널·파일 편집 WebSocket 채널에도 그대로 재사용될 정본 구현이다.

## 검증 체크리스트 (Milestone 4 게이트)

- [x] 세션 없이 파일 라우트 접근 → 401
- [x] path escape 시도(`../../etc/passwd`) → 403 (`path_escape`)
- [x] 존재하지 않는 파일 읽기 → 404
- [x] 파일 write/read/move/delete 실제 왕복 검증(HTTP inject + 실제 서버 curl 둘 다)
- [x] 바이너리 upload/download 바이트 단위 동일성 검증(`cmp`로 실제 확인)
- [x] 세션 잠금 후 새 터미널 WebSocket 연결 시도 → 업그레이드 단계에서 401 거부
- [x] 감사 로그에 파일 내용·PIN·세션 토큰 원문이 기록되지 않음(자동 테스트 + 실제 로그 파일
      직접 확인)

Milestone 4 구현 노트:
- `apps/api/src/terminal/pty-session.ts` — `node-pty` 래퍼. 이 서버(Node 26.5.1)에서
  프리빌드 바이너리가 정상 동작함을 실제 빌드 후 확인(별도 대체 라이브러리 불필요).
- `apps/api/src/realtime/terminal-stream.ts` — Milestone 2와 동일한 수동
  `WebSocketServer({ noServer: true })` + `upgrade` 패턴 재사용. Tailscale 신원 +
  세션을 업그레이드 단계에서 검증하고, 연결 유지 중에도 `lockCheckIntervalMs`(기본 2초)
  주기로 세션을 재검사해 잠금·만료 시 PTY를 kill하고 소켓을 닫는다.
- `apps/api/src/files/path-safety.ts` — 문자열 경로와 실제 symlink 대상·부모 경로를 검사한다.
  새 파일의 누락된 말단과 이동 뒤 상대 링크도 확인한다. 동일 UID 프로세스의 TOCTOU 경쟁까지
  차단하는 OS 샌드박스는 아니며, 터미널의 OS 권한 자체를 제한하는 기능도 아니다.
- `apps/api/src/files/file-service.ts` — list/read/write/mkdir/move/delete와 별도의
  raw read/write(업로드·다운로드용, UTF-8 디코딩 없이 바이트 그대로).
- `apps/api/src/audit/audit-log.ts` — 파일/터미널 액션마다 append-only JSON 라인 기록.
  타입 시스템으로 필드를 제한해 파일 내용·명령 원문이 실수로 로그에 들어갈 수 없게 함.
- **실제 검증(진짜 서버 + 진짜 HTTP/WebSocket 클라이언트, 실제 파일시스템 대상)**:
  실제 서버를 `/tmp` 경로(files root)를 대상으로 기동 → curl로 list/read/write/upload/
  download 전부 실제 파일시스템에 반영됨을 `cat`/`cmp`로 직접 확인 → `ws` 클라이언트로
  `/api/terminal`에 연결해 실제 bash PTY에서 `pwd && echo <marker>`를 실행, 출력 스트림에
  설정된 cwd와 marker가 그대로 나타남을 확인 → `/api/auth/lock` 호출 후 같은 쿠키로 새
  터미널 연결 시도 시 401 거부 확인 → 실행된 모든 액션이 `audit.log`에 경로만 기록되고
  파일 내용("SENSITIVE CONTENT MARKER" 등 테스트 마커)은 전혀 포함되지 않음을 확인.
