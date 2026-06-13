# AI-OS 소스 카탈로그 (Source Catalog & Capability Registry)

> 지금까지 검토한 모든 소스를 **콘텐츠 성격**과 **기능**으로 정리한 등록부. 마스터플랜이 "구축 방법"이라면 이 문서는 "보유 자산 목록과 활용처"다. 현재는 FPGA/임베디드 연구가 중심이지만, 추후 AI Agent 환경을 연구 밖(제품 개발·자동화·콘텐츠·데이터 등)으로 확장할 때 어떤 소스를 켜면 되는지까지 매핑했다.

## 분류 체계

소스를 4개 군으로 나눈다:
- **A. 시스템 구성 소스** — 실제 설치·운영되는 도구 (에이전트 엔진, 메모리, 프레임워크)
- **B. 운영 방법론 소스** — 시스템을 *어떻게 쓰는가*를 알려주는 철학·사용법
- **C. 학습 소스** — *무엇을 입력하는가* (정보 식단 3축: 도메인 60 / 도구 25 / 방향성 15)
- **D. 향후 확장 소스** — 지금은 보류, 특정 확장 시 활성화

---

## A. 시스템 구성 소스 (설치·운영 대상)

### A-1. 에이전트 엔진 (실행 계층)

| 소스 | 콘텐츠 성격 | 기능 | 현재 활용 | OS |
|------|------------|------|-----------|-----|
| **Claude Code** | 에이전트형 코딩 CLI (Anthropic) | 두뇌·오케스트레이터. 스펙 작성, 코드 리뷰, wiki 관리, 슬래시 커맨드/서브에이전트/훅 | 전 Phase의 중심. /rtl-* 루프, /loop | Linux |
| **Codex CLI** | 에이전트형 코딩 CLI (OpenAI) | 구현 전담(Maker). AGENTS.md 자동 인식, 작은 diff 단위 코딩 | RTL/Python 구현, Claude와 brain/maker 협업 | Linux |
| **Hermes Agent** | 멀티에이전트 OS·대시보드 (NousResearch) | 1차 대시보드. 사이드바 멀티세션, 인라인 렌더링, 영구 세션, 무료 장문 컨텍스트 | 모든 세션 통제, 워크스페이스 탭 | Linux |

### A-2. 메모리·지식 계층

| 소스 | 콘텐츠 성격 | 기능 | 현재 활용 | OS |
|------|------------|------|-----------|-----|
| **Obsidian** | 마크다운 노트앱 | 세컨드 브레인. raw→wiki→output 구조, Dataview 대시보드 | Vault 전체, Dashboard.md | Linux(주)/Win(열람) |
| **obsidian-second-brain** | Claude 스킬셋 (eugeniughelbur) | /save /reference /ingest 등 vault 운영 스킬 주입 | Phase 4.3 스킬 기반 | Linux |
| **Zotero + Better BibTeX** | 서지관리 + 자동 내보내기 | 원본 PDF 금고, references.bib 실시간 동기화, 인용키 | 논문·데이터시트 수집 | Linux(주)/Win(동기화) |
| **NotebookLM / notebooklm-py** | Gemini 기반 사서 + 브리지 (teng-lin) | 대용량 문서 1차 정제로 Claude 토큰 절약, 슬라이드/오디오 | 논문 뭉치 요약 → /ingest | 웹(Win/Linux)+CLI(Linux) |
| **Graphify** | 3D 지식그래프 (graphify.net) | wiki 노트 간 연결 시각화, 고립 노드 점검 → RAG 정확도 향상 | /graphify wiki 주 1회 | Linux |

### A-3. 프레임워크·스킬 패키징

| 소스 | 콘텐츠 성격 | 기능 | 현재 활용 |
|------|------------|------|-----------|
| **agent-os** (buildermethods) | 프로젝트 표준 학습 도구 | 기존 코드의 컨벤션 자동 분석 → 표준 문서화 | discover-standards로 RTL 표준 정립 |
| **phuryn/pm-skills** | PM 스킬 마켓플레이스 (68스킬/42커맨드) | **아키텍처 패턴 차용**(marketplace+plugin, skills=명사/commands=동사, validator) + 사고도구 4종 이식 | hm-skills 구조, research-prd·assumption-redteam·priority-frameworks·intended-vs-implemented |

---

## B. 운영 방법론 소스 (어떻게 쓰는가)

| 소스 | 콘텐츠 성격 | 핵심 메시지 | 시스템 내 기능 |
|------|------------|------------|----------------|
| **Boris Cherny — 13대 비법** (2026.1) | Claude Code 창시자의 실전 운영법 | Plan mode 우선, 커맨드 git화, 권한 사전허용(skip 금지), **검증 수단을 주면 품질 2~3배** | Phase 4.5 전체. RTL 루프의 운영 규율 |
| **Boris Cherny — 루프 엔지니어링** (2026.5 인터뷰) | 진화된 운영 패러다임 | "프롬프트하지 않는다, 루프를 쓴다." /loops·Routines·동적 워크플로우, git worktree 병렬 | Phase 4.6. 자동화 3단계의 최종 단계 |
| **Andrej Karpathy** | AI를 가장 잘 설명하는 연구자 | Software 3.0(자연어=프로그래밍), Vibe Coding, Agentic Engineering, 문제 분해 | Phase 6.5-4 vibe coding 하드웨어 보정 공식, 사고방식 |
| **Ben AI — 6대 실수** (원본 자료) | 세컨드 브레인 구축 함정 | raw 덤프 금지, 컨텍스트 살리기, 폴더 고정, CLAUDE.md≤300줄, 주간 audit, 일관 사용 | Phase 0·2·3·10의 설계 원칙 |
| **Karpathy LLM wiki** (원본 자료) | 지식 승격 철학 | 세상의 지식→raw→wiki→AI 대답, 5대 승격 필터 | Phase 2-3 raw/wiki 분리 규칙 |
| **Matt Pocock (AI Hero)** | 소프트웨어 공학 관점 | "AI가 코딩을 대신하는 게 아니라, 좋은 공학이 더 중요해졌다" | 검증·아키텍처 우선 철학 보강 |
| **r/FPGA 에이전트 논의** (원본 자료) | 현업 컨센서스 | AI=주니어 RTL 엔지니어, 골든모델 bit-exact, 합성 리포트 피드백 | Phase 5 검증 루프의 직접 근거 |
| **r/FPGA 워크플로우 스레드** (2026.6) | 현업 워크플로우 합의 | Vivado git 위생(proj/ 제외·rebuild.tcl), batch 모드, 빠른 루프 우선, 타이밍 클로저 | Phase 5-6 에이전트 규칙 |

---

## C. 학습 소스 — 정보 식단 (무엇을 입력하는가)

비중 원칙: **도메인 전문성 60% / 도구 활용 25% / 방향성 15%.** AI 도구 콘텐츠는 휘발성이 높고 소비가 쉬워 비중이 저절로 커지는 함정에 주의.

### C-1. 도메인 전문성 (60%) — 성장의 주력

| 인물/소스 | 영역 | 콘텐츠 성격 | 형민님 연구 접점 |
|-----------|------|------------|------------------|
| **Tom Verbeure** | FPGA·**ISP**·AI가속기 | tomverbeure.github.io 블로그 | **연구주제 직접 일치. 최우선 정독** |
| **Dan Gisselquist (ZipCPU)** | FPGA·Formal·AXI | zipcpu.com, 디버깅 심화 | AXI는 ICAP/DPU 인터페이스, Formal은 Checker 검증 다음 단계 |
| **Cliff Cummings** | SystemVerilog·CDC·Reset·FSM | Sunburst Design 논문 | standards.md의 리셋/CDC 규칙 근거 |
| **Matt Venn** | 오픈소스 FPGA·Tiny Tapeout | 입문·툴체인 | 오픈소스 검증 체인 철학 |
| **Ben Cohen** | SVA·Assertion·Coverage | 검증 교과서 | Phase 5 루프의 SVA 고도화 |
| **Stuart Sutherland** | SystemVerilog 언어 | RTL 코딩·검증 방법론 | RTL 코딩 표준 |
| **Miro Samek** | RTOS·상태머신 | 임베디드 설계 | (향후 STM32 확장 시) |
| **Jacob Beningo** | STM32·FreeRTOS | 실무 임베디드 | (향후 STM32 확장 시) |
| **Jim Keller** | 컴퓨터 아키텍처·AI칩 | 시스템 설계 | (향후 NPU/가속기 설계 진입 시) |
| **Greg Kroah-Hartman** | 리눅스 커널 | 커널 개발 | (향후 임베디드 리눅스 심화) |
| **Yann LeCun** | AI 모델 방향 | 딥러닝 연구 | TinyML/가속기 배경 |

### C-2. 도구 활용 (25%)

| 소스 | 콘텐츠 성격 | 티어/방식 |
|------|------------|-----------|
| **Anthropic Engineering** | Claude Code 공식 기술 블로그 | 1차 소스, Routines 모니터링 |
| **OpenAI Codex GitHub** | Codex 공식 문서/릴리스 | 1차 소스 |
| **Boris Cherny** (X) | 운영법 (위 B군과 동일 인물) | 1차 소스 |
| **Jeff Su** (YT) | 생산성·워크플로우·Obsidian | **B티어** 정기 시청 |
| **Tina Huang** (YT) | 학습시스템·프롬프트·데이터과학 커리어 | **B티어** 정기 시청 |
| **Liam Ottley** (YT) | AI 에이전트·자동화 구축(no-code) | C티어 pull |
| **Nate Herk** (YT) | AI 자동화 튜토리얼(n8n) | C티어 pull |
| **Silicon Valley Girl** (YT) | 업계뉴스·커리어·테크 라이프 | C티어 pull |
| **Anuj (@anujcodes_21)** (X) | Claude/Codex/에이전트·바이브코딩 | C티어. 도구 활용 참고용, 도메인 깊이는 부족 |

### C-3. 방향성·산업 (15%)

| 소스 | 콘텐츠 성격 | 기능 |
|------|------------|------|
| **Dwarkesh Patel** | 최고 연구자/CEO 심층 인터뷰 | "무엇을 만들어야 하는가" 질문력·시스템 사고. GPU/TPU/FPGA 아키텍처 인터뷰 |
| **Andrej Karpathy** | AI 패러다임 (B군과 중복) | 기술 이해 + 방향성 |
| **Jim Keller** | 반도체/AI칩 방향 (C-1과 중복) | 장기 하드웨어 방향 |
| **Ilya Sutskever / Demis Hassabis** | 미래 AI 연구·AI와 과학 융합 | (Dwarkesh 인터뷰 등으로 간접 추적) |

### C-4. 제외·보류 (정보 식단에서 뺀 것)

| 소스 | 사유 |
|------|------|
| **Nick Saraev** (YT) | AI 수익화·agency 성격. 연구개발 아닌 사업화 → 향후 D군 참조 |
| **Chase H. AI** (YT) | 새 도구 쫓기(novelty churn) 위험 |
| **Itssssss_Jack** (YT) | AI 영상 제작. 연구 무관 → 향후 콘텐츠 확장 시 참조 |
| **twetsfyp (@twetsfyp)** (X) | 밈·바이럴. 정보 가치 낮음. 보더라도 파이프라인 제외 |

---

## D. 향후 확장 시나리오별 소스 매핑

AI Agent 환경을 연구 밖으로 키울 때, **이미 검토했지만 지금은 보류한 소스**들이 어디서 살아나는지. 확장 시점에 이 표를 보고 해당 소스·도구를 활성화하면 된다.

| 확장 방향 | 활성화할 소스/도구 | 비고 |
|-----------|-------------------|------|
| **제품·SaaS 개발** | pm-skills **전체 마켓플레이스**(discovery·strategy·GTM·growth), Karpathy(vibe coding), Claude/Codex | 지금은 사고도구 4종만 발췌. 제품을 만들면 lean-canvas·PRD·GTM 플러그인 전체 설치 |
| **비즈니스 자동화·외주** | Liam Ottley, Nate Herk, **Nick Saraev**, n8n/Make 연동 | no-code 자동화 에이전시 노하우. 코드 기반 오케스트레이션과 결합 가능 |
| **콘텐츠 제작·퍼블리싱** | **Itssssss_Jack**, Silicon Valley Girl, NotebookLM(오디오/슬라이드) | 연구 홍보 영상, 기술 블로그, 발표 자료 고도화 |
| **데이터 분석·지표** | pm-data-analytics(SQL·cohort), **Tina Huang** | 사용자/실험 데이터 분석이 필요한 단계 |
| **개인 생산성·지식 사업** | **Jeff Su**, obsidian-second-brain 확장, Graphify | vault를 강의/뉴스레터/디지털 제품으로 전환 시 |
| **임베디드 제품화 (STM32/TinyML)** | Miro Samek, Jacob Beningo, Phillip Johnston, Firmware Agent 활성화 | 마스터플랜의 worktree-firmware·Domain Agent 켜기 |
| **AI 가속기·NPU 설계** | Jim Keller, Yann LeCun, Karpathy(Zero to Hero), Dwarkesh 인터뷰 | ISP 가속기 → NPU로 연구 범위 확장 시 |

### 확장 트리거 운영 규칙
1. 확장은 **현 시스템이 안정 가동된 뒤** 하나씩. 미리 다 켜면 자료의 '실수 3·4'(빈 구조·컨텍스트 오염).
2. 새 확장 시작 시 `me.md`에 관심 분야 추가 → `hm-skills`에 전용 플러그인 신설 → 해당 소스를 정보 식단에 편입.
3. 확장해도 **도메인 60% 원칙 유지**: 새 영역에서도 도구·인플루언서보다 그 분야 전문가가 우선.

---

## E. 한눈 인덱스 (전체 소스 마스터 목록)

| # | 소스 | 군 | 한 줄 기능 |
|---|------|----|-----------|
| 1 | Claude Code | A1 | 두뇌·오케스트레이터 |
| 2 | Codex CLI | A1 | 구현 전담 코더 |
| 3 | Hermes Agent | A1 | 멀티세션 대시보드 |
| 4 | Obsidian | A2 | 세컨드 브레인 |
| 5 | obsidian-second-brain | A2 | vault 운영 스킬셋 |
| 6 | Zotero + Better BibTeX | A2 | 원본 금고·서지 |
| 7 | NotebookLM / notebooklm-py | A2 | 토큰 절약 사서 |
| 8 | Graphify | A2 | 3D 지식그래프 |
| 9 | agent-os | A3 | 프로젝트 표준 학습 |
| 10 | phuryn/pm-skills | A3 | 스킬 패키징 패턴·사고도구 |
| 11 | Boris Cherny (1·2월 스레드·5월 루프) | B | Claude Code 운영 규율·학습/검증 마인드 |
| 12 | Andrej Karpathy | B/C | AI 패러다임·문제 분해 |
| 13 | Ben AI 6대 실수 | B | 세컨드 브레인 함정 |
| 14 | Karpathy LLM wiki | B | 지식 승격 철학 |
| 15 | Matt Pocock | B/C | 공학 우선 관점 |
| 16 | r/FPGA 논의 | B | 검증 루프 근거 |
| 17 | Tom Verbeure | C1 | FPGA·ISP (최우선) |
| 18 | Dan Gisselquist (ZipCPU) | C1 | FPGA·Formal·AXI |
| 19 | Cliff Cummings | C1 | CDC·Reset·SV |
| 20 | Matt Venn | C1 | 오픈소스 FPGA |
| 21 | Ben Cohen | C1 | SVA·검증 |
| 22 | Stuart Sutherland | C1 | SystemVerilog |
| 23 | Miro Samek | C1 | RTOS·상태머신 |
| 24 | Jacob Beningo | C1 | STM32·FreeRTOS |
| 25 | Jim Keller | C1/C3 | 아키텍처·AI칩 |
| 26 | Greg Kroah-Hartman | C1 | 리눅스 커널 |
| 27 | Yann LeCun | C1/C3 | AI 모델 방향 |
| 28 | Anthropic Engineering | C2 | Claude 공식 |
| 29 | OpenAI Codex GitHub | C2 | Codex 공식 |
| 30 | Jeff Su | C2 | 생산성 (B티어) |
| 31 | Tina Huang | C2 | 학습시스템 (B티어) |
| 32 | Liam Ottley | C2 | 에이전트 자동화 (C티어) |
| 33 | Nate Herk | C2 | AI 자동화 (C티어) |
| 34 | Silicon Valley Girl | C2 | 업계뉴스 (C티어) |
| 35 | Anuj (@anujcodes_21) | C2 | 도구 활용 (C티어) |
| 36 | Dwarkesh Patel | C3 | 산업 방향·질문력 |
| 37 | Ilya Sutskever | C3 | 미래 AI 연구 |
| 38 | Demis Hassabis | C3 | AI·과학 융합 |
| 39 | Nick Saraev | D | 비즈니스 자동화(보류) |
| 40 | Chase H. AI | D | 도구 리뷰(보류) |
| 41 | Itssssss_Jack | D | AI 영상제작(보류) |
| 42 | twetsfyp | D | 밈(제외) |

> 군 표기: A=시스템 구성, B=운영 방법론, C1/C2/C3=학습(도메인/도구/방향성), D=향후확장·보류
