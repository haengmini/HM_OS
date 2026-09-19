# AGENTS.md — HM OS 저장소 작업 계약

이 저장소에서 작업하는 모든 에이전트(Hermes, Claude Code, Codex 등)는 아래 규칙을 따른다.

## 정본 문서

- 빌드 마일스톤 정본: `.hermes/plans/2026-09-19_140517-hm-os-v1.md`
- 제품 범위: `docs/product/V1_SCOPE.md`
- 아키텍처: `docs/architecture/SYSTEM.md`
- 보안 계약: `docs/architecture/SECURITY.md`
- 데이터 소스: `docs/architecture/DATA_SOURCES.md`
- 기존 연구 자료(원문 보존): `docs/legacy/`

## 핵심 규칙

1. **`docs/legacy/`의 파일은 이동만 가능하고 내용을 임의로 수정하지 않는다.** 필요한 내용은
   새 문서로 발췌·재작성하고 원문은 그대로 둔다.
2. **보안 경계를 완화하는 변경(sudo 권한 부여, Funnel 활성화, 인증 우회 등)은 절대 하지
   않는다.** 필요하다고 판단되면 계획 문서에 위험으로 기록하고 사용자 승인을 받는다.
3. **GitHub push, 태그, 릴리스, 실제 서버 배포, Tailscale 설정 변경은 사용자 승인 후에만
   실행한다.**
4. 마일스톤 순서(M0→M6)를 따르며, 한 마일스톤 내에서 계획에 없는 범위 확장을 하지 않는다.
5. 코드 변경 후 반드시 해당 워크스페이스의 lint/typecheck/test를 실행하고 결과를 보고한다.
6. 감사 로그·세션·PIN 등 보안 관련 코드를 수정할 때는 `docs/architecture/SECURITY.md`의
   체크리스트를 함께 갱신한다.

## 디렉터리 규약

- `apps/web` — React/Vite/PixiJS PWA
- `apps/api` — Fastify API, WebSocket, 어댑터, 터미널/파일 서비스
- `packages/contracts` — API/이벤트 공유 타입
- `packages/test-fixtures` — synthetic 상태 픽스처 (실제 데이터 대체용 테스트 자료)
- `tests/integration`, `tests/e2e` — 통합/E2E 테스트
- `.hermes/plans/` — 마일스톤 계획 (정본)
