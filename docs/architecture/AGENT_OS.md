# Agent OS와 HM OS — 현재 구성

확인 기준: 2026-10-29. 이 문서는 포트폴리오의 초기 Agent OS 설명을 현재 운영환경과 HM OS 구현에 맞춰 연결한다. 개인 기록이나 운영 자격증명 자체를 보관하는 문서가 아니다.

## 프로젝트 정의

Agent OS는 AI 도구를 늘리는 대신 지식, 역할, 작업, 검증, 반복 운영을 연결하는 개인 운영환경이다. Hermes가 사용자 요청의 범위를 정하고 실행·검증 결과를 전달한다. 전문 프로필은 역할별 문맥과 계약을 분리하며 모델은 그 역할을 수행하는 실행 수단이다.

HM OS는 이 운영환경을 현재 Linux 서버에서 사용하는 비공개 인터페이스다. React/Vite PWA, Fastify API, 상태 어댑터, 터미널·파일 서비스와 Hermes 대화 중계로 구성된다. Agent OS 전체와 HM OS 웹앱을 같은 것으로 취급하지 않는다.

## 정본과 책임

지식 정본은 로컬 Second Brain이다. 프로젝트 문서, 근거, 검증된 지식은 이곳에서 관리하고 Google Drive와 Notion은 외부 참조·읽기 전용 수집 대상으로 구분한다. 과거 포트폴리오의 “Google Drive가 Document Source of Truth”라는 설명은 현재 운영 원칙과 다르다. Drive 로컬 아카이브와 초기 문서는 이력으로 보존하며 새 정본으로 승격하지 않는다.

프로젝트 작업 상태는 기존 Kanban 보드가 담당한다. 프로필별 역할 계약은 `SOUL.md` 등 각 프로필 문서, 운영·검토 계약은 Second Brain 구조 노트에서 관리한다. HM OS 화면은 이 소스들의 읽기 모델이며 원본을 대체하지 않는다.

요청은 범위가 있는 작업으로 정리하고 결과를 실제 파일·명령·테스트 근거와 연결한다. 반복 운영은 스케줄된 수집·상태 점검·리뷰로 수행하되, 스케줄 등록이나 화면 표시만으로 매 실행의 성공을 보장하지 않는다. 이 저장소는 외부 운영 루프 전체의 설정·개인 실행 로그를 복사하는 장소가 아니다.

## 현재 HM OS에서 구현된 것

하나로 연결된 타일 맵에서 캐릭터가 일정한 속도로 이동하고 가까운 오브젝트와 상호작용한다. 브라우저별로 기기 프로필을 선택해 접속 위치를 표시하며 Hermes 대화창, 현재 서버의 터미널, 파일 탐색·편집 기능으로 전환한다. 맵 엔티티는 시스템·프로필·Kanban·최근 문서 메타데이터를 바탕으로 표시된다.

대화는 HM OS API가 서버 측 Hermes API로 중계한다. 터미널과 파일 작업은 현재 Linux 서버의 프로세스 권한을 사용한다. Tailscale 신원과 PIN·세션 인증 뒤 접근하며, API는 loopback에 바인딩한다. 이 구조는 Windows 우선 설치형 PWA와 모바일 브라우저 접근을 목표로 한다. 지원 코드가 있다는 사실과 각 실제 기기에서의 사용자 검증 완료는 구분한다.

화면 테마는 초기 방 카드에서 연속 픽셀 맵으로 발전했다. 색상·영역 명칭은 프런트엔드 표현이며 운영 계약은 아니다. 계약과 실제 데이터 흐름은 [SYSTEM.md](./SYSTEM.md), 어댑터의 구현 범위는 [DATA_SOURCES.md](./DATA_SOURCES.md)를 따른다.

## 검증·판단·승인 경계

프로필과 작업 보드를 읽어 만든 상태는 추정이지 모델 내부 실행의 직접 관측이 아니다. 전문 프로필이나 Council의 운영 계약이 존재해도 모두 HM OS NPC로 연결된 것은 아니다. Jev는 필요한 의미 판단에 구조화된 보조 신호를 제공하며, 사실 조회·산술·빌드·테스트와 사용자 승인을 대신하지 않는다. 최종 판단과 전달 책임은 Hermes에 둔다.

현재 문서 어댑터는 Markdown 경로·수정 시각을 수집한다. Second Brain의 FTS·Graphify 운영환경과 구분하며, HM OS에서 통합 검색·그래프 분석까지 구현했다고 설명하지 않는다. 기기 캐릭터도 접속 표시일 뿐 원격 PC 제어 기능은 아니다.

GitHub 반영, 외부 업로드·공유, 삭제, 비밀정보 접근, sudo·시스템 설정은 사용자 승인 경계를 유지한다. 비공개 저장소라도 OAuth 토큰, API 키, PIN 해시, 개인 대화, 감사 로그, 지식 원문을 일괄 올리지 않는다. 문서·GitHub 최신화와 실제 서비스 재배포는 별도 작업이다.

## 포트폴리오에 사용할 현재 설명

> 엔지니어링 작업의 문맥과 결과가 세션마다 흩어지는 문제를 줄이기 위해 Agent OS를 구성했습니다. Hermes를 중심으로 역할별 프로필, 프로젝트 Kanban, 로컬 Second Brain, 반복 운영 작업을 연결하고, 이를 사용하는 비공개 PWA인 HM OS를 개발했습니다. HM OS는 연속 픽셀 맵에서 실제 서버와 작업 상태를 보여주며 기기별 캐릭터, Hermes 대화, 서버 터미널과 파일 기능을 제공합니다. 화면 자체를 새로운 정본으로 만들지 않고 기존 자료와 검증 근거를 연결하며, 상태 추정과 실제 검증 결과를 구분하는 것이 설계의 핵심입니다.

정량적인 생산성 향상률, 완전 자율 운영, 모든 플랫폼 자동 동기화, 모든 전문 에이전트의 NPC 연결은 이 문서에서 입증하지 않는다. 발표에서는 본인 기여와 실제 시연·검증 범위에 맞춰 설명한다.

## 근거를 확인할 곳

저장소 구현:
- `apps/web/src/features/office/{PixelOffice,ColonyMap,useDevicePresence}.ts(x)`
- `apps/web/src/features/chat/HermesChat.tsx`
- `apps/api/src/routes/{chat,devices}.ts`
- `apps/api/src/adapters/{config,agent-os-adapter,wiki-adapter,recent-documents-adapter}.ts`
- `apps/api/src/auth/{session-store,pin}.ts`, `apps/api/src/audit/audit-log.ts`
- `scripts/start-hm-os.sh`, `scripts/healthcheck.sh`

소유자의 서버에만 있는 운영 근거:
- `/opt/data/second-brain` — 지식 정본
- `/opt/data/profiles/<name>/SOUL.md` — 역할별 계약
- `/opt/data/kanban/boards/<board>/kanban.db` — 프로젝트 작업 상태
- `/opt/data/second-brain/30-knowledge/structures/agent-os-council.md` — 보조 검토 계약
- `/opt/data/agent_os_archive` — 과거 Agent OS 자료와 아카이브

위 로컬 경로는 구성 설명용이다. 해당 자료의 본문이나 런타임 데이터는 이 문서에 복사하지 않는다.
