# HM OS Security Contract (V1)

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
- WebSocket(터미널/파일) 채널의 세션 재검증은 Milestone 4에서 구현 예정 — 이 문서의
  "세션과 잠금" 섹션 규칙을 그대로 적용한다.
- PTY/파일 편집 채널의 실제 잠금-시 강제 종료는 Milestone 4에서 구현되므로 아직 대상 채널이
  없다(터미널/파일 라우트가 아직 없음).
