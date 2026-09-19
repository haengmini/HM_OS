# HM OS Data Sources (V1)

이 문서는 V1의 읽기 모델이 참조하는 실제 데이터 소스와 각 어댑터의 책임을 정의한다.
모든 소스는 기존 정본을 유지하며, HM OS는 상태를 정규화해서 보여줄 뿐 원본을 대체하지 않는다.

## 1. System Adapter

- **소스:** 현재 Linux 서버의 프로세스, 디스크, 메모리, 활성 서비스 상태.
- **책임:** 주기적으로 상태를 샘플링하고 `system.status` 이벤트로 정규화.
- **실패 처리:** 수집 실패 시 `stale`/`error` 상태와 마지막 성공 시각을 함께 반환한다.

## 2. Agent OS Adapter

- **소스:** `/opt/data/profiles/<name>/SOUL.md` 등 Agent OS 프로필 계약서, 프로젝트 보드
  (`agent-os`, `dfxisp`, `ai-drone` 등), 관련 작업 상태.
- **책임:** 프로필별 현재 작업, 최근 활동, 상태(idle/working/researching/executing/error)를
  추출.
- **실패 처리:** 특정 프로필 읽기 실패가 전체 API를 중단시키지 않고 해당 프로필만
  `unknown`으로 표시한다.

## 3. Wiki/Obsidian Adapter

- **소스:** 로컬 Wiki/Second Brain, Agent OS Drive 로컬 미러
  (`/opt/data/agent_os_archive/files`), graphify 산출물.
- **책임:** 최근 수정 문서, 지식 그래프 고립 노드 여부 등 요약 정보 제공.
- **실패 처리:** 경로 부재/권한 오류 시 해당 항목만 비활성 표시.

## 4. Recent Documents Adapter

- **소스:** 프로젝트 루트(`/opt/data/projects/*`)와 주요 작업 디렉터리의 최근 수정 파일.
- **책임:** 최근 문서 목록, 수정 시각, 연결된 프로젝트/에이전트 추정.
- **실패 처리:** 존재하지 않는 경로는 조용히 건너뛰되 감사 로그에 남긴다.

## 정규화 이벤트 형식 (초안)

```ts
interface OfficeStatusEvent {
  source: 'system' | 'agent-os' | 'wiki' | 'recent-docs';
  entityId: string;
  state: 'idle' | 'working' | 'researching' | 'executing' | 'syncing' | 'error' | 'offline' | 'stale';
  detail?: string;
  sourcePath?: string;
  observedAt: string; // ISO timestamp
  confidence: 'fresh' | 'stale' | 'unknown';
}
```

이 형식은 `packages/contracts/src/status.ts`에서 실제 타입으로 구현되며 Milestone 2에서
어댑터가 이를 채운다.
