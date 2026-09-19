# HM OS

이형민의 서버 중심 개인 운영체제(Personal OS) — 2D 픽셀 오피스로 실제 서버·Agent OS·지식
베이스 상태를 보여주고, Tailscale + PIN 인증 뒤 현재 서버를 직접 제어하는 비공개 PWA.

## 문서 지도

- **제품 범위:** [`docs/product/V1_SCOPE.md`](./docs/product/V1_SCOPE.md)
- **시스템 아키텍처:** [`docs/architecture/SYSTEM.md`](./docs/architecture/SYSTEM.md)
- **보안 계약:** [`docs/architecture/SECURITY.md`](./docs/architecture/SECURITY.md)
- **데이터 소스:** [`docs/architecture/DATA_SOURCES.md`](./docs/architecture/DATA_SOURCES.md)
- **운영 설치:** [`docs/operations/INSTALL.md`](./docs/operations/INSTALL.md)
- **Tailscale 배포:** [`docs/operations/TAILSCALE.md`](./docs/operations/TAILSCALE.md)
- **백업·복구:** [`docs/operations/BACKUP_AND_RECOVERY.md`](./docs/operations/BACKUP_AND_RECOVERY.md)
- **빌드 마일스톤(정본):** [`.hermes/plans/2026-09-19_140517-hm-os-v1.md`](./.hermes/plans/2026-09-19_140517-hm-os-v1.md)
- **기존 연구 자료(원문 보존):** [`docs/legacy/`](./docs/legacy/)
- **에이전트 작업 계약:** [`AGENTS.md`](./AGENTS.md)

## 현재 상태

V1 Milestone 5 운영 배포 완료 — PM2로 API·userspace Tailscale daemon을 관리하고,
`https://hm-os-server.taila8b4a0.ts.net`에서 tailnet-only HTTPS PWA로 제공한다.
Milestone 6 통합 검증 및 `v0.1.0` 릴리스 후보 작업 중.

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
