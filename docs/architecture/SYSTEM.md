# HM OS 시스템 아키텍처

확인 기준: 2026-10-29, 이 저장소의 구현. 과거 마일스톤 문서는 설계 이력이며 현재 동작은 아래 소스와 구분해 읽는다.

## Agent OS와 HM OS

Agent OS는 Hermes, 역할별 프로필, 프로젝트 Kanban, 로컬 Second Brain, 반복 운영 작업을 연결하는 개인 운영환경이다. HM OS는 그 환경과 현재 Linux 서버에 접근하는 비공개 PWA다. 별도 커널이나 새로운 지식 정본을 만드는 프로젝트가 아니다.

운영환경의 정본 경계와 포트폴리오 설명은 [AGENT_OS.md](./AGENT_OS.md), 실제 어댑터의 범위는 [DATA_SOURCES.md](./DATA_SOURCES.md)를 따른다.

## 프런트엔드

`apps/web`은 React, Vite, TypeScript 기반 PWA다. 현재 맵은 React DOM과 CSS로 렌더링하며 PixiJS 기반 캔버스가 아니다.

- `features/auth`: PIN 잠금 화면과 인증 상태.
- `features/office/PixelOffice.tsx`: 맵, 터미널, 파일 화면 및 Hermes 대화창 전환.
- `features/office/ColonyMap.tsx`: 하나로 연결된 타일 맵, 충돌 판정, 클릭 경로 이동, 방향키/WASD 이동, 근접 상호작용. 고정 주기 이동으로 키 반복에 따른 가속을 피한다.
- `features/office/useDevicePresence.ts`: 브라우저에 기기 프로필 선택을 저장하고 위치·방향을 서버와 동기화.
- `features/chat/HermesChat.tsx`: Hermes 응답 스트리밍과 대화 표시. thinking-orbs는 대화 UI의 상태 표시이며 모델 내부 추론을 관측하는 기능이 아니다.
- `features/terminal`, `features/files`: xterm 기반 터미널과 파일 탐색·편집 UI.

맵의 상태 엔티티는 읽기 모델을 시각화한다. 모든 오브젝트가 별도 기능 패널을 여는 것은 아니다. 현재 `PixelOffice`의 상호작용 분기는 대화·터미널·파일을 연다. 기기 캐릭터는 접속 표시이며 해당 Windows PC나 노트북을 원격 제어하는 기능을 뜻하지 않는다.

## 백엔드와 데이터 흐름

`apps/api`는 Fastify와 Node.js 기반이다. `server.ts`가 인증, 상태, 파일, 기기, 대화 라우트를 등록하며 상태·터미널 WebSocket은 기반 HTTP 서버에 연결한다.

1. `adapters/`가 시스템 상태, 프로필 계약 파일의 존재, Kanban 작업, 로컬 문서 메타데이터를 읽는다.
2. `read-model/office-state.ts`가 결과를 공유 `OfficeStatusEvent`로 모은다. 어댑터별 실패는 격리하며 전체 수집 실패를 성공 이벤트로 꾸미지 않는다.
3. `realtime/status-stream.ts`가 상태를 프런트엔드에 전송한다. `sourcePath`, `observedAt`, `confidence`가 근거와 시각을 전달한다.
4. 인증된 `/api/devices` 경로로 기기 위치·접속 상태를 교환한다.
5. `/api/chat`은 서버에서 Hermes API로 요청을 중계하고 SSE 응답을 전달한다. `/api/chat/history`는 별도 HM OS 대화 세션의 이력을 조회하는 중계 API다. 현재 `HermesChat.tsx`는 이 API를 호출하지 않고 브라우저 localStorage의 최근 20개 메시지를 복원한다. 기기 간 전체 이력을 자동 동기화하는 UI가 아니다. 브라우저에는 Hermes API 키를 전달하지 않는다.
6. 터미널은 인증된 WebSocket의 `node-pty` 세션, 파일 작업은 인증된 HTTP 라우트로 처리한다. 파일 경로는 설정된 루트 안에 제한된다.

## 저장 상태와 정본

- 지식 정본은 로컬 Second Brain이다. HM OS는 문서를 복제해 별도 정본으로 저장하지 않는다.
- 프로젝트 작업 정본은 기존 Kanban SQLite 보드다. Agent OS 어댑터는 이를 읽기 전용으로 연다.
- HM OS 인증 세션은 메모리에 보관하며 API 프로세스 재시작 후 재인증이 필요하다.
- 기기 접속 상태도 메모리 저장소다. 기기 프로필 선택은 브라우저 localStorage에 저장한다.
- PIN 해시는 런타임 데이터 디렉터리의 `pin.json`, 작업 메타데이터는 `audit.log`에 저장한다. 인증·읽기 모델 전체를 HM OS 전용 SQLite에 영속화한다는 초기 설계 설명은 현재 구현과 다르다.
- 서버의 대화 이력 조회 API는 Hermes 세션 경로를 중계한다. 현재 대화 UI의 최근 메시지는 별도의 브라우저 localStorage 캐시다. 어느 쪽도 Second Brain 정본으로 자동 승격되었다는 뜻이 아니다.

`pin.json`, 감사 로그, 세션, 인증 키, 개인 지식 원문은 GitHub에 올리는 소스·문서와 분리한다.

## 운영·보안 경계

API는 `127.0.0.1`에 바인딩하고 Tailscale Serve의 tailnet 전용 HTTPS 뒤에서 사용한다. 등록된 Tailscale 신원과 Host, HM OS PIN·세션으로 접근을 제한한다. API와 userspace Tailscale의 지속 실행 설정은 [운영 설치](../operations/INSTALL.md)를 따른다.

터미널과 파일 기능은 현재 Linux 서버 프로세스의 권한 범위에서만 동작하며 새 sudo/root 권한을 부여하지 않는다. GitHub push, 외부 업로드, 삭제, 시스템 설정·권한 변경의 사용자 승인 경계는 에이전트 운영 정책이다. HM OS의 인증된 터미널·파일 서비스가 개별 명령마다 추가 승인을 기술적으로 강제하는 것은 아니다. 맵·문서 최신화는 서비스 재배포 승인을 대신하지 않는다.

자세한 보안 계약은 [SECURITY.md](./SECURITY.md)를 따른다.
