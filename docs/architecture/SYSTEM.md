# HM OS System Architecture (V1)

## 계층 구조

```text
┌───────────────────────────────────────────────────────────┐
│ apps/web  (React + Vite + PixiJS, PWA)                     │
│   features/auth   — 잠금 화면, 세션 상태                    │
│   features/office — 2D 픽셀 오피스 캔버스                   │
│   features/system — 서버 상태 패널                          │
│   features/terminal — PTY 터미널 UI                         │
│   features/files  — 파일 탐색기/에디터                       │
├───────────────────────────────────────────────────────────┤
│ apps/api  (Fastify, Node.js, WebSocket)                     │
│   auth/     — Tailscale 신원 + PIN + 세션                   │
│   adapters/ — system / agent-os / wiki / recent-docs        │
│   read-model/ — office-state 정규화                         │
│   terminal/ — node-pty 세션 관리                             │
│   files/    — 파일 서비스                                    │
│   audit/    — 감사 로그                                       │
├───────────────────────────────────────────────────────────┤
│ 기존 정본 데이터 소스 (읽기 전용 어댑터 대상)                  │
│   Agent OS 프로필/보드, 로컬 Wiki/Obsidian, 최근 문서, 시스템 │
├───────────────────────────────────────────────────────────┤
│ 네트워크 경계                                                 │
│   API는 127.0.0.1에만 바인딩                                  │
│   Tailscale Serve가 HTTPS + 신원 헤더 주입                    │
│   Funnel 비활성, tailnet 전용                                 │
└───────────────────────────────────────────────────────────┘
```

## 데이터 흐름

1. 어댑터가 기존 소스(파일시스템 경로, 프로세스 상태, 문서 메타데이터)를 주기적으로 읽는다.
2. `read-model/office-state`가 어댑터 출력을 정규화된 상태 이벤트로 변환한다.
3. WebSocket 상태 스트림이 프런트엔드 픽셀 오피스에 실시간 반영된다.
4. 사용자가 캐릭터/방을 클릭하면 상세 패널이 원본 소스 경로·시각·근거를 함께 표시한다.
5. 터미널/파일 작업은 별도의 인증된 WebSocket/HTTP 채널로 처리되며 감사 로그에 기록된다.

## 소스 오브 트루스 경계

- Agent OS 프로필/보드, Wiki/Obsidian, 프로젝트 Kanban은 각자의 기존 정본을 유지한다.
- HM OS 자체 데이터베이스(SQLite)는 다음만 저장한다:
  - 세션/인증 상태
  - 읽기 모델 캐시 (재구성 가능해야 함)
  - 감사 로그 (명령 메타데이터, 파일 작업 메타데이터 — 내용/명령 원문 제외)
- 대시보드/오피스 화면은 읽기 모델일 뿐 독립적인 운영 진실이 되지 않는다.

## 배포 경계 (V1)

- 실행 대상은 **현재 Linux 서버 한 대**뿐이다.
- 프로세스는 Docker 소켓이나 서버 전체를 광범위하게 마운트하지 않는 방식으로 실행한다.
- Tailscale은 `userspace-networking` 모드로 이미 인증되어 있다 (호스트 `hm-os-server`,
  MagicDNS `hm-os-server.taila8b4a0.ts.net`). 영구 실행(supervisor)化는 Milestone 5에서 진행한다.
