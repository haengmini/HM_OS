# Prompt Authoring Standard (05_Resources/prompt-standards.md)

> AI-OS의 모든 지시문(CLAUDE.md·AGENTS.md·SKILL.md·슬래시 커맨드·세션 프롬프트)이 따르는 공통 규격. Anthropic 프롬프팅 워크숍 원칙 기반. 이 파일은 vault의 05_Resources에 두고 /prompt-review가 참조한다.

## 5대 구성 요소 체크리스트
복잡한 작업일수록 다섯 개를 모두 채운다.

- [ ] **Persona/Role** — 어떤 전문가로 행동? (예: 시니어 RTL 엔지니어, 검증 엔지니어)
- [ ] **Task** — 무엇을? 1~2문장, 구체·간결
- [ ] **Context** — 필요한 배경·표준·데이터. 외부 데이터는 영역 구분
- [ ] **Instructions** — 단계별 순서 (먼저 X, 다음 Y, 마지막 Z)
- [ ] **Constraints/Examples/Final Reminder** — 형식·규칙·few-shot·끝 강조

## 핵심 기법
- **XML 태그로 영역 분리**: `<persona> <task> <context> <instructions> <constraints> <final_reminder>`. 지시문이 데이터에 희석되는 것 방지, 토큰 효율↑
- **노이즈 제거**: 결과에 무관한 서술 삭제
- **어조 지정**: "사실 기반, 미검증은 단정 금지"
- **Few-shot**: 출력 예시 1~2개
- **Final Reminder**: 가장 중요한 규칙을 끝에 반복

## 반복 개선 루프 (= 복리 엔지니어링)
초안 → 결과 평가 → 결함 식별 → 제약 추가 → 재실행.
반복되는 실수는 즉시 CLAUDE.md / Final Reminder에 규칙으로 박는다.

## 범용 템플릿
```xml
<persona>[전문가 역할]</persona>
<task>[1~2문장 과업]</task>
<context>
  [표준/명세/데이터 — @파일참조 또는 인라인]
</context>
<instructions>
  1. [먼저 읽을 것]
  2. [핵심 작업, 작은 단위]
  3. [검증/자가점검]
</instructions>
<constraints>
  - [형식·규칙]
  - [통과 조건]
</constraints>
<final_reminder>[가장 중요한 규칙 — 단정 금지 등]</final_reminder>
```

## FPGA RTL 생성 예시
```xml
<persona>너는 Vivado 2024.1 합성 가능 Verilog에 능숙한 시니어 RTL 엔지니어다.</persona>
<task>아래 명세에 따라 히스토그램 Checker 모듈 하나만 구현한다.</task>
<context>
  <standards>@01_Context/standards.md</standards>
  <design_spec>@04_Projects/fpga-adaptive-isp/DESIGN.md</design_spec>
</context>
<instructions>
  1. 먼저 standards와 design_spec을 읽는다.
  2. checker 모듈만 작성한다 (작은 diff, 한 모듈).
  3. make lint로 경고 0까지 자가 수정.
</instructions>
<constraints>
  - Verilog-2001 합성 서브셋, 동기 active-high 리셋.
  - model/checker_model.py 기준 cocotb bit-exact 통과 필수.
</constraints>
<final_reminder>lint 통과 없이 완료 선언 금지. 미검증 결과 단정 금지.</final_reminder>
```

## 설계 시각화 규약 (Phase 3-5)
설계 내용을 시각 자료로 만들 때:
- **ASCII 다이어그램** = 커밋되는 정본 문서 (DESIGN.md 블록도/데이터플로우, FSM, 파이프라인, AXI/ICAP 타이밍). git diff 가능, 터미널 열람, 토큰 효율.
- **HTML** = 설명·발표·탐색용 (코드/IP 설명, 합성 리포트 대시보드, /learn 슬라이드). Hermes 워크스페이스 탭 인라인 렌더링 + 스크린샷 피드백 루프.
- 정본은 ASCII로 repo에, HTML은 그 파생 설명물로. 이미지 생성·외부도구 비의존.
