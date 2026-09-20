# HM OS Pixel Office Design

## 콘셉트

HM OS는 일반 관리자 대시보드가 아니라, 실제 서버·에이전트·지식·프로젝트 상태가
캐릭터와 공간으로 표현되는 **탑다운 픽셀아트 Agent Operations HQ**다.

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
