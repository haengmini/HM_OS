# HM OS 데이터 소스

확인 기준: 2026-10-29. 이 문서는 실제 읽기 어댑터의 범위를 정의한다. Agent OS 전체의 운영 원칙과 개별 어댑터가 구현한 기능은 구분한다.

## 1. 시스템

`apps/api/src/adapters/system-adapter.ts`가 현재 Linux 서버 상태를 수집해 `system` 이벤트로 변환한다. 다른 기기의 캐릭터가 보이더라도 그 기기의 CPU·프로세스를 수집하는 것은 아니다.

## 2. Agent OS 프로필과 Kanban

기본 경로는 `/opt/data/profiles/<name>/SOUL.md`와 `/opt/data/kanban/boards/<board>/kanban.db`다. `HM_OS_PROFILES_DIR`, `HM_OS_KANBAN_DIR`로 변경할 수 있다.

`agent-os-adapter.ts`는 프로필 디렉터리와 SOUL.md 존재 여부를 확인한다. SQLite 보드를 읽기 전용으로 열고 담당자와 프로필 이름을 연결해 완료되지 않은 작업을 찾는다. 작업 상태를 `working`, `researching`, `error`, `idle` 등으로 변환한다. 계약 파일이 없으면 `offline`과 `unknown`으로 표시한다.

이는 **프로필·보드에 근거한 상태 추정**이다. 실행 중인 모델의 내부 상태, 실제 토큰 생성, 모든 세션이나 도구 실행을 추적하는 모니터가 아니다. 보드 읽기 실패 시 해당 보드를 건너뛰므로 화면의 `idle`만으로 모든 작업이 정상이라고 판정할 수 없다.

## 3. 로컬 Second Brain

`wiki-adapter.ts`의 기본 경로는 `/opt/data/second-brain`이며 `HM_OS_WIKI_ROOT`로 변경할 수 있다. 숨김·시스템 디렉터리를 제외하고 제한된 깊이의 Markdown 파일 경로와 수정 시각을 읽어 최근 문서를 표시한다.

로컬 Second Brain이 지식 정본이다. Google Drive와 Notion은 외부 참조·읽기 전용 수집 대상으로 취급하며, `/opt/data/agent_os_archive/files`는 과거 Drive 로컬 아카이브다. 현재 wiki 어댑터가 Drive나 Notion API를 직접 호출하는 것은 아니다.

Second Brain 운영환경의 SQLite/FTS·Graphify와 HM OS의 화면 어댑터도 구분한다. **현재 wiki 어댑터에는 전문검색·의미검색·지식 그래프 질의·고립 노드 분석이 구현되어 있지 않다.**

## 4. 최근 프로젝트 파일

`recent-documents-adapter.ts`는 기본 `/opt/data/projects`를 제한된 깊이로 순회하며 파일 경로와 수정 시각을 수집한다. `HM_OS_RECENT_DOC_ROOTS`에 콜론으로 구분한 경로 목록을 지정할 수 있다.

파일의 본문을 분석하거나 작성 에이전트를 자동 확정하지 않는다. 누락·접근 불가 경로는 건너뛰며, 최근 수정 파일이 있다는 사실은 작업 완료나 결과 품질의 증거가 아니다.

## 5. 기기 접속과 Hermes 대화

기기 접속은 네 가지 상태 어댑터와 별도 경로다. `routes/devices.ts`와 `devices/device-presence.ts`가 선택한 기기 프로필, 맵 좌표, 방향, 마지막 접속 시각을 메모리에 보관한다. 브라우저는 주기적으로 갱신하며 최근 갱신 여부로 온라인을 판정한다. 서버 재시작 후 복구되는 기기 이력 DB나 원격 장치 관리 시스템은 아니다.

Hermes 대화도 별도 경로다. `routes/chat.ts`가 인증 후 서버 측 설정의 Hermes API를 호출하고 스트리밍 응답과 대화 이력을 중계한다. 현재 대화 UI는 이력 조회 API를 호출하지 않고 브라우저 localStorage에 저장한 최근 20개 메시지를 복원한다. 키가 없거나 upstream이 실패하면 사용 불가·오류를 반환한다. 이 경로가 동작한다고 모든 Agent OS 전문 프로필이 HM OS NPC로 개별 연결되었다고 볼 수 없다.

## 상태 계약과 실패 해석

실제 공유 타입은 `packages/contracts/src/status.ts`다. `OfficeStatusEvent`에는 소스, 엔티티, 상태, 선택적 설명·원본 경로, 관측 시각과 `fresh`/`stale`/`unknown` 신뢰도가 포함된다.

`stale`은 설정된 시간 기준의 노후화 표시다. 예를 들어 문서가 오래 수정되지 않았다는 사실만으로 동기화 서비스 장애를 증명하지 않는다. `read-model/office-state.ts`는 네 어댑터를 `Promise.allSettled`로 수집하며, 상위에서 거부된 결과는 이벤트 목록에서 빠질 수 있다. 화면만으로 전체 운영 루프의 성공 여부를 보장하지 않는다.

어댑터의 기본값은 `apps/api/src/adapters/config.ts`, 실제 배포 입력은 로컬 런타임 설정으로 관리한다. 자격증명과 개인 데이터는 저장소에 포함하지 않는다.
