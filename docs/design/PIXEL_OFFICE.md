# HM OS Pixel Office Design

## 콘셉트

HM OS는 일반 관리자 대시보드가 아니라, 실제 서버·에이전트·지식·프로젝트 상태가
캐릭터와 공간으로 표현되는 **탑다운 픽셀아트 Agent Operations HQ**다.

**v0.3.0**부터는 방 카드 그리드 대신, RimWorld류 콜로니 시뮬레이션의 공간·동선
문법(연속 타일 맵 위에서 캐릭터가 걸어 다니며 시설과 상호작용)을 HM OS 스타일로
재구현한 **하나의 연속된 콜로니 맵**이다.
**v0.4.0**부터는 시각 컨셉을 어두운 SF 톤에서 **동물의 숲 스타일 파스텔
아일랜드 마을**로 전면 개편했다. 공간·동선 문법은 유지하고 표현만 교체했다.
자산은 복사하지 않았다.

세 레퍼런스에서 가져온 역할은 다음과 같다.

- AionUi: 실제 터미널·파일·에이전트 운영 기능
- Star Office UI: 탑다운 오피스 공간과 캐릭터 상태 표현
- ai-office: 살아 있는 작업 공간의 분위기와 색감

브랜드·이미지·캐릭터 자산은 복사하지 않고 HM OS 전용 CSS 픽셀 시스템으로 구현한다.

## 월드 구조

| 공간 | 실제 데이터 | 게임 의미 |
|---|---|---|
| 관제실 / System Core | CPU·메모리·디스크 | 월드 코어 상태 |
| 에이전트 길드 / Agent Guild | Agent OS 프로필·Kanban | 길드원 활동 |
| 지식 도서관 / Knowledge Vault | Local Second Brain | 지식 보관·연구 |
| 프로젝트 공방 / Quest Studio | 최근 프로젝트 문서 | 퀘스트·제작 진행 |
| 터미널 게이트 / Control Gate | 실제 PTY·파일 API | 서버 제어 포털 |

## 시각 규칙

- 24px 단위 배경 grid와 scanline으로 레트로 모니터 분위기를 만든다.
- 외곽 UI는 차가운 navy, 방 바닥은 따뜻한 wood/steel tile을 사용한다.
- 각 방은 하나의 고유 accent(cyan, orange, lavender, gold, sky)를 가진다.
- 캐릭터는 CSS로 머리·머리카락·몸·팔·다리·그림자를 구성한다.
- entity ID로 팔레트를 결정해 새 에이전트도 일관된 고유 외형을 얻는다.
- 상태 색은 read-model 계약의 `OfficeState`와 1:1로 연결한다.
- working/executing은 타이핑, researching은 glow, syncing은 walk, error는 shake한다.
- hover 시 실제 event detail을 말풍선으로 표시한다.
- `prefers-reduced-motion`에서는 애니메이션을 사실상 비활성화한다.

## 콜로니 맵 (v0.3.0)

- 30×18 타일의 단일 연속 맵. 방 카드 대신 하나의 이어진 공간이다.
- 5개 구역(SYSTEM CORE / AGENT GUILD / KNOWLEDGE VAULT / QUEST STUDIO /
  CONTROL BAY)이 도로로 연결된다.
- 사용자 캐릭터는 `WASD`/방향키, 클릭 경로탐색(BFS), 모바일 방향 패드로 이동한다.
- 시설 오브젝트(서버 관제, 에이전트 현황판, Hermes NPC, 지식 보관소, 프로젝트
  보드, 터미널, 파일 보관소)에 가까이 가면 `E` 또는 상호작용 버튼으로 진입한다.
- Agent OS 이벤트는 실제 상태(working/researching/syncing/error/offline)에 따라
  맵 위 NPC 캐릭터의 애니메이션으로 표현된다.
- **기기 캐릭터**: 최초 접속 기기마다 `acer-nitro-windows` /
  `acer-nitro-linux` / `desktop-windows` / `iphone` 중 하나를 선택한다. 선택은
  해당 기기 로컬 저장소에만 남고, 접속 중인 모든 기기가 실시간으로 맵에 표시된다.
  현재 조작 중인 캐릭터에는 `YOU` 표시가 붙는다. 언제든 상단 HUD의 `DEVICE 변경`
  으로 다시 선택할 수 있다.
- **Hermes NPC 대화**: 맵의 Hermes 캐릭터(H) 또는 하단 독의 `Hermes` 버튼으로
  실제 실행 중인 Hermes Agent와 SSE 스트리밍 대화를 나눈다. Hermes API Server
  자격 증명은 backend 프로세스에만 있으며 브라우저에는 노출되지 않는다.

## 반응형 규칙

- 1000px 이상: 12-column 연결형 오피스 floor plan.
- 621–1000px: 2-column map.
- 620px 이하: 에이전트 길드부터 시작하는 1-column vertical world.
- 하단 app dock은 viewport에 고정하고 터미널/파일/오피스 전환을 유지한다.
- 390px mobile에서 horizontal overflow가 없어야 한다.

## 검증 기준

- 실제 OfficeStatusEvent가 올바른 방에 렌더링된다.
- desktop 1440×900과 mobile 390×844에서 가로 넘침과 충돌이 없다.
- 실제 terminal/file E2E가 시각 변경 전과 동일하게 통과한다.
- PWA manifest/service worker 및 업데이트 흐름을 보존한다.
- 외부 폰트 로딩 실패 시 monospace fallback으로 기능과 배치가 유지된다.
