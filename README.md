# HM OS

이형민의 서버 중심 개인 운영환경 인터페이스 — 연속 2D 픽셀 맵에서 실제 서버·Agent OS·로컬
Second Brain의 상태를 보여주고, Tailscale + PIN 인증 뒤 Hermes 대화와 현재 서버의 터미널·파일
기능을 사용하는 비공개 PWA. 새 OS 커널이나 별도 지식 정본을 만드는 프로젝트는 아니다.

Agent OS는 역할·지식·작업·검증·반복 운영을 연결하는 환경이며, HM OS는 그 환경에 접근하는
웹앱이다. 현재 지식 정본은 로컬 Second Brain이고 Drive·Notion은 외부 참조로 구분한다.

## 바로 사용

1. 개인 PC에서 Tailscale에 로그인한다.
2. **https://hm-os-server.taila8b4a0.ts.net** 을 연다.
3. 최초 PIN을 설정하고 브라우저의 **앱 설치** 버튼을 누른다.

자세한 안내: [`docs/operations/QUICK_START.md`](./docs/operations/QUICK_START.md)

## 문서 지도

- **제품 범위:** [`docs/product/V1_SCOPE.md`](./docs/product/V1_SCOPE.md)
- **시스템 아키텍처:** [`docs/architecture/SYSTEM.md`](./docs/architecture/SYSTEM.md)
- **Agent OS 현재 구성·포트폴리오 설명:** [`docs/architecture/AGENT_OS.md`](./docs/architecture/AGENT_OS.md)
- **보안 계약:** [`docs/architecture/SECURITY.md`](./docs/architecture/SECURITY.md)
- **데이터 소스:** [`docs/architecture/DATA_SOURCES.md`](./docs/architecture/DATA_SOURCES.md)
- **픽셀 오피스 디자인:** [`docs/design/PIXEL_OFFICE.md`](./docs/design/PIXEL_OFFICE.md)
- **운영 설치:** [`docs/operations/INSTALL.md`](./docs/operations/INSTALL.md)
- **바로 사용:** [`docs/operations/QUICK_START.md`](./docs/operations/QUICK_START.md)
- **Tailscale 배포:** [`docs/operations/TAILSCALE.md`](./docs/operations/TAILSCALE.md)
- **백업·복구:** [`docs/operations/BACKUP_AND_RECOVERY.md`](./docs/operations/BACKUP_AND_RECOVERY.md)
- **빌드 마일스톤(정본):** [`.hermes/plans/2026-09-19_140517-hm-os-v1.md`](./.hermes/plans/2026-09-19_140517-hm-os-v1.md)
- **기존 연구 자료(원문 보존):** [`docs/legacy/`](./docs/legacy/)
- **에이전트 작업 계약:** [`AGENTS.md`](./AGENTS.md)

## 현재 상태

문서 확인 기준: 2026-10-29. 패키지 버전은 `0.5.0`이며, 과거 시각 릴리스 이력은
[`docs/releases/v0.5.0.md`](./docs/releases/v0.5.0.md)에 보존한다.

- React DOM/CSS 연속 타일 맵, 고정 속도 이동·충돌 판정·근접 상호작용.
- 기기 프로필별 캐릭터와 접속 표시. 다른 기기 자체를 원격 제어하는 기능은 아님.
- 서버 측 Hermes API 중계를 통한 대화 스트리밍. 이력 조회 중계 API는 있으나 현재 대화 UI는 브라우저의 최근 20개 메시지 캐시를 복원한다.
- 프로필·Kanban, 로컬 Markdown, 프로젝트 최근 파일과 시스템 상태의 읽기 모델.
- 인증된 현재 서버 PTY 터미널 및 파일 탐색·편집.
- PM2 기반 API·userspace Tailscale 운영 및 tailnet-only HTTPS PWA.

Agent 상태는 보드·프로필 근거의 추정이며 모델 내부 실행 추적이 아니다. 현재 지식 어댑터는
문서 메타데이터를 읽을 뿐 통합 FTS·Graphify 검색 UI를 구현한 것은 아니다. 상세 범위는
[데이터 소스](./docs/architecture/DATA_SOURCES.md)를 참고한다.

## 개발

```bash
npm install
npm run lint
npm run typecheck
npm test
```

## 보안 원칙 (요약)

- Tailscale 사용자 신원 + HM OS PIN 2단계 인증.
- API는 `127.0.0.1`에만 바인딩, Tailscale Serve를 통해서만 외부 접속.
- 모든 제어(터미널/파일)는 현재 서버 프로세스의 Linux 사용자 권한 범위 내로 제한.
- 자세한 내용은 [`docs/architecture/SECURITY.md`](./docs/architecture/SECURITY.md) 참고.
