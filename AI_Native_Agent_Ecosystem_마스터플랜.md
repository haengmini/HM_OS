# 형민의 AI Native Agent Ecosystem 구축 마스터플랜 (A to Z)

> **목표**: Linux 기반 FPGA 연구개발 워크스테이션 위에, Claude · Codex · Obsidian · Hermes Agent · Graphify를 유기적으로 결합한 개인 AI Agent OS를 구축한다. 단일 대시보드에서 에이전트·파일·프로젝트를 총괄하고, FPGA(Vivado/Vitis 2024.1) 연구에 직접 투입 가능한 자율 검증 루프까지 완성한다.

---

## 0. 핵심 아키텍처와 사전 결정사항

자료 분석 후 결정이 필요한 사항은 묻지 않고 아래와 같이 확정했다. 각 결정의 근거를 함께 적는다.

| # | 결정 항목 | 결정 | 근거 |
|---|----------|------|------|
| D1 | Linux 배포판 | **Ubuntu 22.04.5 LTS** | Vivado/Vitis **2024.1 공식 지원 OS**가 Ubuntu 22.04까지임. 24.04는 2024.1에서 미지원이라 라이브러리 충돌 위험이 큼. FPGA 툴 안정성이 최우선. |
| D2 | 시스템 루트 구조 | `~/ai-os/` 단일 루트 | vault, 프로젝트, 도구를 한 트리에 두면 에이전트의 파일 라우팅 오류(자료의 '실수 3')가 줄고 백업이 단순해짐. |
| D3 | Vault 폴더 구조 | **80/20 5대 폴더 + raw/wiki 2계층 분리** 하이브리드 | Ben AI의 5대 폴더(Context/Daily/Intelligence/Projects/Resources)와 카파시 LLM wiki의 raw→wiki 승격 구조를 결합. raw는 불변 원본, wiki는 정제 지식만. |
| D4 | 역할 분담 | Claude=두뇌/오케스트레이터, Codex=코더, Hermes=대시보드+무료 장문 컨텍스트, NotebookLM=사서(토큰 절약), Zotero=원본 금고 | 자료의 "claude: brain, codex: maker" 구도 + Hermes의 $0/mo 통합 사이드바 + NotebookLM의 Gemini 위임으로 Claude 토큰 절약. |
| D5 | 대시보드 | **Hermes Agent OS (NousResearch)** 를 1차 대시보드, Obsidian 내 `Dashboard.md`(Dataview)를 2차 보조 | Hermes는 멀티 에이전트 사이드바 + 인라인 렌더링 + 영구 세션을 제공. Obsidian 대시보드는 오프라인/경량 보조용. |
| D6 | Graphify | **graphify.net 공식 CLI** (safishamsi/graphify) | 자료에서 안내하는 `/graphify wiki` 워크플로우와 직접 호환. kbastani/warioddly 저장소는 동명이인의 별개 프로젝트라 제외. |
| D7 | Windows↔Linux 동기화 | **Syncthing** (vault만 동기화) | 무료·P2P·실시간. Windows에서는 Obsidian/Zotero 열람과 한글(HWP)·학교 행정·문서 제출용으로만 사용하고, 에이전트 실행은 전부 Linux에서. |
| D8 | RTL 검증 체인 | **Verilator(lint) → Icarus Verilog + cocotb(sim) → Vivado 2024.1 batch mode(synth/timing)** | r/FPGA 현업 컨센서스: 빠른 오픈소스 루프로 1차 검증 후, Vivado tcl 배치로 최종 합성/타이밍 확인. 에이전트는 "주니어 RTL 엔지니어"로서 작은 diff 단위만 수정. |
| D9 | 골든 모델 검증 | Python/NumPy 참조 모델 (MATLAB 대체) | 라이선스 없는 Python 참조 모델을 cocotb 테스트벤치에서 bit-exact 비교. 형민님의 히스토그램 Checker 같은 ISP 모듈 검증에 그대로 적용 가능. |
| D10 | 학습 파이프라인 | Zotero(수집) → NotebookLM(1차 정제) → Obsidian wiki(승격) → Claude(생산) | 자료의 "세상의 지식 → raw → wiki → ai 대답" 4단 구조 그대로. 전공/실무 학습을 연구와 같은 파이프라인에 태움. |
| D19 | 설계 시각화 규약 | **ASCII 다이어그램(커밋 정본)·HTML(설명/발표) 적극 활용**, 이미지 생성·외부도구 비의존. DESIGN.md는 ASCII 블록/데이터플로우 필수, HTML은 Hermes 인라인 렌더링 | git diff 가능성·터미널 열람·토큰 효율(ASCII) + 시각적 풍부함·즉시 피드백(HTML). 보리스 학습기법(4.5-9)과 일관. 상세는 Phase 3-5. |
| D18 | Vivado 프로젝트 위생 | **r/FPGA 합의 채택**: proj/ git 제외, rtl/cons/sim/ip + rebuild.tcl만 체크인, 에이전트는 non-project batch 모드 기본, 빠른 오픈소스 루프 통과 후에만 Vivado 호출, GUI/ILA 디버깅은 인간 영역 | 현업 워크플로우 합의(AMD ug892·커뮤니티 저장소 교차검증). 에이전트가 프로젝트 junk를 커밋하거나 느린 합성을 남발하는 것을 차단. 상세는 Phase 5-6. |
| D17 | 프롬프트 저작 표준 | **모든 지시문(CLAUDE/AGENTS/SKILL/커맨드)에 5대 요소 + XML 구조 + Final Reminder 적용**, 반복개선 루프를 복리 엔지니어링과 통합, `/prompt-review` 게이트 | Anthropic 프롬프팅 워크숍. 지시문 품질이 전체 시스템 출력 품질의 상한을 정함. XML로 지시·데이터 분리해 컨텍스트 오염 방지. 상세는 Phase 3-4. |
| D16 | 보리스식 학습·검증 화법 | **적대적 검증 프롬프팅**("증명해"·"심문해")을 표준 화법으로, **`/learn` 간격반복 스킬**로 연구·학습 통합, Explanatory 출력 스타일 상시. 마인드: vanilla 셋업·검증 우선·복리 엔지니어링 | 보리스 2월 스레드 + 1월 스레드 마인드. 형민님의 꾸준한 전공/실무 학습 목표를 시스템에 내장. 상세는 Phase 4.5-7~10. |
| D15 | 영상 소스 소비 | **YouTube는 25% 도구 버킷 하위**로 분류. B티어(Jeff Su·Tina Huang)만 정기, C는 pull 방식, D(수익화·도구쫓기·영상제작)는 제외. 주 1편 time-box + 승격필터 엄격 적용 | 영상은 정보밀도 낮고 시간 흡수 큼. 도메인 깊이(60%)를 잠식하지 않게 push 구독 대신 pull 소비. 상세는 Phase 6.5-5~6. |
| D14 | 스킬 패키징 구조 | **marketplace + plugin 계층 구조 채택** (phuryn/pm-skills 패턴): skills=명사(자동 로드)/commands=동사(체이닝), 검증 스크립트 + progressive disclosure. 단 PM 콘텐츠 자체는 선별 이식만 | 흩어진 ~/.claude/skills보다 git 버전관리·재사용·이식이 쉬운 구조. SaaS/웹 PM 스킬 대부분은 형민님 도메인과 무관하므로 전체 설치 대신 4종만 발췌. 상세는 Phase 5.5. |
| D13 | 정보 식단 | **도메인 전문가 60% / 도구 활용 25% / 방향성 15%** 비중. Tier S(ZipCPU·Verbeure·Cummings)를 수집 파이프라인의 상시 입력원으로 고정, 오락성 계정은 파이프라인 제외 | AI 도구 활용법은 휘발성이 높고 RTL 설계 관점은 경력 전체를 떠받침. 특히 Verbeure는 ISP 연구 주제가 직접 겹침. 상세는 Phase 6.5. |
| D12 | 자동화 성숙도 | **프롬프트 → 커맨드 → 루프 3단계 점진 진화** (보리스 2026.5 인터뷰). 단 3단계(/loop·Routines·dynamic workflow) 진입은 검증 게이트 안정화 이후로 게이팅 | "내 일은 루프를 쓰는 것" 패러다임을 수용하되, FPGA 연구 신뢰성을 위해 머지·합성·하드웨어 반영은 항상 인간 승인. 상세는 Phase 4.6. |
| D11 | Claude Code 운영 규율 | **보리스 체르니(Claude Code 창시자) 13대 비법** 채택: Plan mode 우선, 슬래시 커맨드 git 체크인, permissions 사전 허용(skip-permissions 금지), 검증 루프 최우선 | 도구 제작자의 실전 운영법. 특히 "Claude에게 검증 수단을 주면 결과 품질 2~3배"는 Phase 5 설계 철학과 정확히 일치. 상세는 Phase 4.5. |

### 전체 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│  Interface Layer : Hermes Agent OS 대시보드 (사이드바 멀티세션)   │
│                    + Obsidian Dashboard.md (보조)                 │
├─────────────────────────────────────────────────────────────────┤
│  LLM Layer       : Claude Code(두뇌) │ Codex CLI(코더)           │
│                    Hermes(무료 1M ctx) │ Gemini via NotebookLM   │
├─────────────────────────────────────────────────────────────────┤
│  Memory Layer    : Obsidian Vault (raw → wiki → output)          │
│                    + Graphify 3D 지식그래프 + Zotero 원본금고     │
├─────────────────────────────────────────────────────────────────┤
│  Connector Layer : Skills(/ingest /query /lint /rtl-*)           │
│                    MCP(filesystem, git) │ cron 스케줄러           │
├─────────────────────────────────────────────────────────────────┤
│  Execution Layer : Verilator │ Icarus+cocotb │ Vivado 2024.1 tcl │
│                    Vitis AI │ git │ Python                       │
└─────────────────────────────────────────────────────────────────┘
```

### 디렉터리 마스터 레이아웃 (먼저 머리에 넣고 시작)

```
~/ai-os/
├── vault/                    # Obsidian Vault = 세컨드 브레인 (Syncthing 동기화 대상)
│   ├── CLAUDE.md             # 시스템 지도 (300줄 이하)
│   ├── AGENTS.md             # Codex용 역할 계약서
│   ├── MY.md                 # 나에 대한 정보
│   ├── index.md / log.md     # 인덱스, 작업 로그
│   ├── 00_raw/               # 불변 원본 (회의록, 클리핑, NotebookLM 산출 원문)
│   ├── 01_Context/           # me.md, research.md, standards.md (핵심 5~6개만)
│   ├── 02_Daily/             # 일일 연구일지 (자동 생성)
│   ├── 03_Intelligence/      # wiki = 정제 지식 (FPGA, 전자공학, AI)
│   │   └── references.bib    # Zotero Better BibTeX 자동 내보내기
│   ├── 04_Projects/          # 프로젝트별 PROJECT.md 현황판
│   └── 05_Resources/         # RTL 템플릿, tcl 스크립트, 데이터시트 링크
├── projects/
│   ├── fpga-adaptive-isp/    # 동적 부분 재구성 ISP 연구 (메인)
│   └── ssd-vitis-ai/         # Vitis AI SSD 양자화/컴파일
├── tools/
│   ├── hermes-agent/         # Hermes Agent OS
│   ├── notebooklm-py/        # NotebookLM 브리지
│   └── agent-os/             # buildermethods/agent-os
└── scripts/                  # cron, 백업, 동기화 스크립트
```

---

## Phase 1. 베이스 시스템 구축 (Day 1)

### 1-1. Ubuntu 22.04.5 LTS 설치 및 기본 세팅

이미 Vivado/Vitis 2024.1을 쓰고 있다면 OS가 22.04인지 먼저 확인한다.

```bash
lsb_release -a          # Ubuntu 22.04.x 인지 확인
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential git curl wget unzip \
    python3 python3-pip python3-venv nodejs npm \
    libtinfo5 libncurses5 locales            # libtinfo5/libncurses5는 Vivado 필수
```

Node는 Claude Code/Codex 모두 18+ 필요. apt 버전이 낮으면 nvm으로 올린다.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts       # Node 20.x LTS
node -v && npm -v
```

### 1-2. 디렉터리 골격 생성

```bash
mkdir -p ~/ai-os/{vault,projects,tools,scripts}
mkdir -p ~/ai-os/vault/{00_raw,01_Context,02_Daily,03_Intelligence,04_Projects,05_Resources}
mkdir -p ~/ai-os/vault/00_raw/{clippings,meetings,notebooklm,conversations}
mkdir -p ~/ai-os/vault/03_Intelligence/{fpga,embedded,electronics,ai-tools}
mkdir -p ~/ai-os/projects/{fpga-adaptive-isp,ssd-vitis-ai}
```

### 1-3. RTL 오픈소스 검증 체인 설치

```bash
sudo apt install -y verilator iverilog gtkwave
pip3 install cocotb cocotb-bus numpy matplotlib
verilator --version && iverilog -V | head -1
```

### 1-4. Vivado/Vitis 2024.1 확인 및 PATH 등록

이미 설치돼 있으므로 에이전트가 CLI에서 바로 부를 수 있도록 PATH만 정리한다. `~/.bashrc` 끝에 추가:

```bash
# --- AMD FPGA Tools ---
source /tools/Xilinx/Vivado/2024.1/settings64.sh
source /tools/Xilinx/Vitis/2024.1/settings64.sh   # 설치 경로는 본인 환경에 맞게
# --- AI-OS ---
export AIOS_HOME="$HOME/ai-os"
export PATH="$HOME/ai-os/tools/agent-os/scripts:$PATH"
```

검증: 새 터미널에서 `vivado -version`, `which vitis`.

> **주의**: 에이전트가 헤드리스로 합성을 돌릴 것이므로 `vivado -mode batch -source synth.tcl` 형태가 동작하는지 이 단계에서 한 번 손으로 확인해 둔다. 이것이 Phase 5 자율 루프의 토대다.


---

## Phase 2. 메모리 인프라: Obsidian + Zotero (Day 1~2)

### 2-1. Obsidian 설치 (Linux)

```bash
# AppImage 방식 (가장 안정적)
cd ~/ai-os/tools
wget https://github.com/obsidianmd/obsidian-releases/releases/latest/download/Obsidian-1.7.7.AppImage -O Obsidian.AppImage
chmod +x Obsidian.AppImage
./Obsidian.AppImage   # 실행 후 "Open folder as vault" → ~/ai-os/vault 선택
```

> AppImage 버전 번호는 [obsidian.md](https://obsidian.md) 최신 릴리스를 확인해 바꿔준다. snap(`sudo snap install obsidian --classic`)도 가능하지만 파일 접근 권한 문제가 가끔 있어 AppImage를 권장.

설치할 커뮤니티 플러그인 (설정 → Community plugins → Browse):

| 플러그인 | 용도 |
|----------|------|
| **Dataview** | Dashboard.md에서 PROJECT.md 상태를 쿼리해 현황판 자동 생성 |
| **Zotero Integration** | 인용 키(@author2026) 삽입, 논문 노트 가져오기 |
| **Templater** | 일일 연구일지 템플릿 자동 생성 |
| **Obsidian Git** | vault 변경사항 자동 커밋(백업 2중화) |

### 2-2. 핵심 컨텍스트 파일 작성 (80/20의 핵심 — 이것부터 정교하게)

자료의 '실수 1' 교훈: raw 덤프 금지, 핵심 문서 5~6개를 먼저 정교하게. 형민님 상황에 맞춘 초안:

**`01_Context/me.md`**
```markdown
# Me
- 제주대학교 전자공학과, FPGA 기반 적응형 영상처리 연구
- 핵심 연구: 동적 부분 재구성(DPR)으로 조명 변화에 따라 ISP 모듈을 회로 수준에서 교체
- 시스템 구성: Histogram Checker(40%/20% 이중 임계값, 20%p 버퍼) → PR Controller → ICAP → DPU
- 도구: AMD 보드, Vivado/Vitis 2024.1, Vitis AI (SSD 양자화/컴파일 경험)
- 커뮤니케이션: 한국어 기본, 기술 키워드는 영어
- 문체 원칙: 사실 기반, 검증된 결과만 단정, 미검증은 "시뮬레이션 수준" 명시
- 장기 비전: FPGA + 임베디드(STM32/TinyML/ISP 가속기) + AI Agent를 결합한 1인 연구개발 체제. 확장 관심 분야는 진입 시점에 이 파일에 추가
```

**`01_Context/research.md`** — 연구 배경, 선행연구 대비 차별점("기존 ISP 연구는 파라미터만 조정, 우리는 모듈 자체를 재구성"), 학회 일정.

**`01_Context/standards.md`** — RTL 코딩 표준 (예시):
```markdown
# RTL Coding Standards
- 언어: Verilog-2001 / SystemVerilog (Vivado 2024.1 호환 서브셋)
- 리셋: 동기 리셋, active-high `rst`
- 클록: 단일 `clk`, CDC 필요 시 반드시 2FF synchronizer 명시
- 네이밍: 모듈 snake_case, 파라미터 UPPER_CASE, `_i/_o` 접미사
- 검증: 모든 모듈은 cocotb TB + Python 골든 모델 bit-exact 비교 필수
- 합성: Vivado batch 합성 후 timing/utilization 리포트 첨부 없이는 done 선언 금지
```

**`MY.md`** (vault 루트) — me.md의 요약본. Codex 등 다른 에이전트도 읽는 공용 프로필.

### 2-3. raw / wiki 분리 규칙 (맥락 오염 방지 안전장치)

자료의 5대 승격 필터를 시스템 규칙으로 박는다. **wiki(03_Intelligence)에 저장하려면 아래 중 하나 이상 만족해야 한다:**

1. 향후 반복 재사용할 데이터인가?
2. 다른 에이전트(또는 미래의 나)가 프로젝트를 이어받으려면 반드시 읽어야 하는가?
3. 의사결정의 근거·결정자를 나중에 추적할 필요가 있는가?
4. 실패한 방식이라 재시도하면 안 되는 리스크 정보인가?
5. 전체를 일관되게 맞춰야 하는 공통 규칙/설계 가이드인가?

하나도 만족하지 않는 1회성 답변·중간 산출물·미검증 초안은 `00_raw/` 또는 `00_raw/conversations/`에만 남긴다. 이 규칙은 Phase 3의 CLAUDE.md에 명문화한다.

### 2-4. Zotero 설치 및 Better BibTeX 연동

```bash
# Linux 설치 (공식 tarball)
cd ~/ai-os/tools
wget "https://www.zotero.org/download/client/dl?channel=release&platform=linux-x86_64" -O zotero.tar.bz2
tar -xjf zotero.tar.bz2 && mv Zotero_linux-x86_64 zotero
./zotero/set_launcher_icon && ln -s ~/ai-os/tools/zotero/zotero.desktop ~/.local/share/applications/
```

1. 브라우저에 **Zotero Connector** 확장 설치 → 논문/유튜브/웹페이지를 메타데이터와 함께 1클릭 수집.
2. Zotero 앱에서 **Better BibTeX** 플러그인 설치 (도구 → 플러그인 → .xpi 설치).
3. 라이브러리 우클릭 → "Export Library" → 포맷 *Better BibTeX*, **Keep updated 체크** → 경로 `~/ai-os/vault/03_Intelligence/references.bib`.
4. Obsidian Zotero Integration 플러그인 설정에 위 .bib 경로 지정.

이제 FPGA 논문·데이터시트·DPR 관련 자료를 Zotero에 수집하면 인용 키가 vault에 실시간 반영된다. **원본 PDF는 Zotero에, vault에는 md 노트만** — 자료의 핵심 원칙.

---

## Phase 3. 시스템 설계서: CLAUDE.md / AGENTS.md (Day 2)

에이전트의 내비게이션 지도. **300줄 이하**, 라우팅 테이블 필수 (자료의 '실수 4' 방지).

### 3-1. `~/ai-os/vault/CLAUDE.md`

```markdown
# AI-OS System Map & Routing Table

## Who am I serving
Read `MY.md` first. 사용자는 FPGA(DPR/ISP/Vitis AI) 연구자. 한국어로 답하되 기술 용어는 영어 유지.

## Routing Table (어디서 읽고 어디에 쓰는가)
- 사용자/연구 맥락 → READ `01_Context/` (me.md, research.md, standards.md)
- 오늘 할 일/일지 → READ+WRITE `02_Daily/YYYY-MM-DD.md`
- 정제된 지식 검색 → READ `03_Intelligence/` (wiki). 원본이 필요하면 `00_raw/` 추적
- 프로젝트 현황 → READ+WRITE `04_Projects/<name>/PROJECT.md` (모든 작업 후 갱신 의무)
- 템플릿/스크립트 → READ `05_Resources/`
- 원본 덤프 → WRITE는 `00_raw/`에만. `03_Intelligence/`에 raw 직접 저장 금지

## Core Rules
1. 작업 시작 전 반드시 해당 프로젝트의 `PROJECT.md` 상태 확인.
2. wiki 저장 전 5대 승격 필터 통과 검사 (불통과 시 00_raw/conversations에만 기록).
3. RTL 코드는 `01_Context/standards.md` 준수. 검증 리포트 없이 완료 선언 금지.
4. 미검증 결과를 단정 표현으로 쓰지 말 것 ("시뮬레이션 수준에서 확인됨" 등 명시).
5. 토큰 절약: 하위 폴더는 각 폴더의 sub-CLAUDE.md(인덱스)를 먼저 읽고 필요 파일만 연다.
6. 설계를 시각화할 때는 **ASCII 다이어그램(커밋 대상 문서)과 HTML(설명·발표용)을 적극 사용**한다 (Phase 3-5 규약).

## Natural Language Commands (한국어 트리거 → 영어 명령)
- "옵시디언에 저장해줘" → /save : 5대 필터 검사 후 wiki 또는 raw에 저장 + log.md 갱신
- "옵시디언 참조" → /reference : index.md → 관련 wiki 노트 로드
- "수집해줘" → /ingest : 00_raw/clippings 신규 파일을 정제해 wiki로 승격
- "검색/질문" → /query : wiki 기반 RAG 응답 (출처 노트 링크 필수)
- "정리해줘" → /lint : 중복·출처 없는 결정·오래된 규칙·깨진 링크 점검 리포트
```

### 3-2. `~/ai-os/vault/AGENTS.md` (Codex 및 멀티 에이전트 계약서)

```markdown
# Agent Roles & Responsibilities

## Claude (Brain / Orchestrator)
- 요구사항 분석, 아키텍처 결정, 스펙(DESIGN.md) 작성, 코드 리뷰, wiki 관리
- 최종 판단 권한. Codex 산출물의 머지 승인자.

## Codex (Maker / Coder)
- DESIGN.md 스펙을 받아 구현. RTL/Python/tcl 코드 생성 담당.
- 한 번에 하나의 작은 diff만. 스펙에 없는 임의 변경 금지.

## RTL Pipeline Agents (Phase 5 스킬로 구현)
- Prompt Enhancer: 자연어 → cycle budget, DSP 매핑 힌트 포함 기술 명세
- RTL Generator: standards.md 준수 Verilog 생성
- Lint Agent: verilator --lint-only 실행 → 경고 0까지 수정
- Sim Agent: cocotb + Python 골든 모델 bit-exact 비교
- Synth Agent: vivado -mode batch → timing/utilization 리포트 분석
- Trackback: 실패 시 원인 파일(RTL vs TB) 판별 → 해당 에이전트 재호출

## Domain Agents (워크스페이스/worktree 단위 상주 — 1인 R&D 기업의 가상 팀)
- RTL Design Agent: Verilog/SystemVerilog 설계 (worktree-rtl)
- Verification Agent: Testbench·Assertion(SVA)·Coverage (worktree-verification)
- Firmware Agent: STM32·FreeRTOS·드라이버 (향후 임베디드 확장 시)
- Docs Agent: 설계 문서·README·논문/특허 정리 (worktree-docs)
- Research Agent: 논문 분석·벤치마크/특허 조사 → 00_raw 적재 (worktree-research)

## Shared Contract
- 모든 에이전트는 MY.md, 01_Context/standards.md를 세션 시작 시 읽는다.
- PROJECT.md 갱신 없이 작업 종료 금지.
- 사람이 읽는 가이드라인은 한국어, 실행 명령 키워드는 영어로 고정.
```

### 3-3. 프로젝트 현황판 `04_Projects/fpga-adaptive-isp/PROJECT.md`

```markdown
# FPGA Adaptive ISP (Dynamic Partial Reconfiguration)
status: active | tool: Vivado 2024.1 | board: AMD <보드명>

## Now
- [ ] Checker 모듈 cocotb TB 작성 (Python 골든 모델 비교)
## Next
- [ ] PR Controller ↔ ICAP 인터페이스 합성 타이밍 확인
## Done
- [x] 2026 SoC 학회 포스터 발표 (Vivado 시뮬레이션 수준 검증)
## Decisions Log
- 2026-06: 이중 임계값 40%/20% + 20%p 버퍼존 확정 (근거: ...)
## Risks / Don't Repeat
- (실패 사례 기록 — lint 필터 5번 항목)
```

### 3-4. 프롬프트 작성 표준 (Anthropic 워크숍 기반) — 모든 지시문의 공통 규격

CLAUDE.md·AGENTS.md·SKILL.md·슬래시 커맨드·/rtl-spec 출력까지, **시스템 안의 모든 지시문은 아래 규격으로 쓴다.** Anthropic의 프롬프팅 워크숍 원칙을 시스템 저작 표준으로 고정한 것이다.

**5대 구성 요소** (복잡한 작업일수록 다섯 개를 모두 채운다):
1. **Persona/Role** — Claude가 어떤 전문가로 행동할지 (예: "Vivado 2024.1 합성 가능 Verilog에 능숙한 시니어 RTL 엔지니어")
2. **Task** — 무엇을 할지 1~2문장으로 구체·간결하게
3. **Context/Dynamic Content** — 처리할 데이터·문서·표준. 외부 데이터는 영역을 명확히 구분해 입력
4. **Step-by-step Instructions** — 수행 순서를 단계로 (chain-of-thought 유도). "먼저 표준을 읽고, 그 다음 구현하고, 마지막에 lint" 식 명시적 순서
5. **Constraints/Examples/Final Reminder** — 출력 형식(표/JSON), 지켜야 할 규칙, few-shot 예시 1~2개, 그리고 가장 중요한 규칙을 끝에 한 번 더

**핵심 기법**:
- **XML 태그 > 마크다운**: `<instructions>`, `<context>`, `<documents>` 등으로 영역을 나누면 경계가 명확하고 토큰 효율이 좋으며, **지시사항이 외부 데이터에 희석되는 현상을 막는다**. (라우팅 테이블·DESIGN.md 섹션도 XML로 구조화)
- **불필요한 정보 제거**: 결과에 영향 없는 서술은 삭제 — 모델 주의력 분산 방지. (CLAUDE.md ≤300줄 원칙과 같은 결)
- **어조 지정**: "사실 기반, 미검증은 단정하지 않는 어조" — 형민님의 연구 원칙을 프롬프트 차원에서도 강제
- **Few-shot**: 원하는 출력 예시 1~2개만 줘도 품질이 크게 오른다

**반복 개선 루프 = 복리 엔지니어링과 통합**: 한 번에 완벽을 노리지 말고 [초안 → 결과 평가 → 결함 식별 → 제약 추가 → 재실행]. **반복되는 실수는 그 자리에서 CLAUDE.md/Final Reminder에 규칙으로 박는다** — 이것이 Phase 4.5-10의 복리 엔지니어링과 동일한 루프다. 즉 프롬프트 개선과 시스템 진화가 한 동작이다.

**FPGA RTL 생성 프롬프트 템플릿** (5요소 + XML 적용 예 — `05_Resources/prompt-standards.md`에 저장):
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
  3. make lint를 실행해 경고 0까지 자가 수정한다.
</instructions>
<constraints>
  - Verilog-2001 합성 서브셋, 동기 active-high 리셋.
  - model/checker_model.py 기준 cocotb bit-exact 통과 필수.
</constraints>
<final_reminder>lint 통과 없이 완료 선언 금지. 미검증 결과를 단정하지 말 것.</final_reminder>
```

**`/prompt-review` 커맨드 신설** (hm-knowledge 플러그인): 작성한 프롬프트/지시문을 받아 5대 요소 누락·XML 구조·모호성·노이즈를 점검하고 개선안을 제시. CLAUDE.md나 새 SKILL.md를 만들 때 통과 게이트로 쓴다.

### 3-5. 설계 시각화 출력 규약 — ASCII & HTML 우선

설계 내용(아키텍처·모듈 계층·데이터플로우·FSM·파이프라인·버스 타이밍 등)을 시각 자료로 만들 때, 에이전트는 **ASCII 다이어그램과 HTML을 기본 수단으로 적극 활용**한다. 이미지 생성이나 외부 도구에 의존하지 않는다.

**언제 ASCII를 쓰는가 — "커밋되는 정본(canonical) 문서"**
- 대상: DESIGN.md의 블록 다이어그램·데이터플로우, PROJECT.md, wiki 노트, RTL 코드 주석, FSM 상태 전이, 파이프라인 스테이지, AXI/ICAP 핸드셰이크 타이밍(ASCII 파형)
- 이유: git으로 diff·버전관리 가능, 어떤 에디터·터미널에서도 열람, 바이너리 없음, 토큰 효율적. **설계의 단일 진실 출처에 적합.**
- 예:
```
        ┌──────────┐  hist[255:0]  ┌──────────┐  mode  ┌──────────────┐
  pixel→│ Histogram │──────────────▶│ Checker  │───────▶│ PR Controller│
        │  Builder  │               │ 40%/20%  │ trigger│   → ICAP      │
        └──────────┘               └──────────┘        └──────────────┘
```

**언제 HTML을 쓰는가 — "설명·발표·탐색용"**
- 대상: 낯선 코드/IP 코어 설명 자료, 합성 리포트 대시보드(WNS·utilization 시각화), 시뮬 파형 뷰, 학습 슬라이드(/learn), 인터랙티브 모듈 다이어그램
- 이유: 시각적 풍부함, **Hermes 워크스페이스 탭에서 인라인 렌더링**, 마음에 안 들면 그 자리서 스크린샷 피드백 → 즉시 수정(보리스식 검증 루프)
- 운영: 정본은 ASCII로 repo에 남기고, HTML은 그 정본을 설명·발표하기 위한 파생물로 다룬다(일회성이면 00_raw에).

**규칙 요약**: 정본 설계 문서 = ASCII(diff 가능), 설명·발표 = HTML(렌더링). 두 형식 모두 Phase 3-4의 XML 구조·"미검증 단정 금지" 원칙을 그대로 따른다. 이 규약은 /rtl-spec, /learn, Docs Agent, Phase 8 대시보드 전반에 적용된다.

---

## Phase 4. 에이전트 엔진 설치: Claude Code + Codex + 프레임워크 (Day 2~3)

### 4-1. Claude Code 설치

```bash
npm install -g @anthropic-ai/claude-code
cd ~/ai-os/vault
claude          # 첫 실행 시 브라우저 인증 (Pro/Max 구독 또는 API 키)
```

vault 루트에서 실행하면 CLAUDE.md를 자동 인식한다. 첫 세션에서 확인:
```
> 이 vault의 라우팅 테이블을 요약하고, MY.md를 읽고 내가 누구인지 말해줘.
```

### 4-2. Codex CLI 설치

```bash
npm install -g @openai/codex
cd ~/ai-os/vault
codex           # ChatGPT 계정 로그인
```

Codex는 vault 루트의 **AGENTS.md를 자동으로 읽는다**(Codex의 표준 컨벤션). 즉 Phase 3에서 만든 계약서가 그대로 Codex의 행동 규약이 된다. 프로젝트 폴더(`~/ai-os/projects/fpga-adaptive-isp/`)에도 프로젝트 전용 AGENTS.md를 별도로 두면 좋다.

**Claude↔Codex 협업 패턴** (자료의 brain/maker 구도):
1. Claude 세션에서 스펙 작성 → `04_Projects/<p>/DESIGN.md` 저장
2. Codex 세션에서 "DESIGN.md를 읽고 구현해" → 작은 diff 단위 구현
3. Claude 세션에서 "Codex의 diff를 리뷰하고 standards.md 위반을 지적해" → 승인/반려
- 두 도구는 **서로 다른 터미널 세션**으로 관리한다. Claude 에이전트 세션 정리는 `Ctrl+X` 두 번.

### 4-3. obsidian-second-brain 스킬셋 주입

```bash
git clone https://github.com/eugeniughelbur/obsidian-second-brain ~/.claude/skills/obsidian-second-brain
bash ~/.claude/skills/obsidian-second-brain/scripts/setup.sh "$HOME/ai-os/vault"
```

(원라인 `curl ... | bash`도 가능하지만, 스크립트를 한 번 읽어보고 수동 설치하는 쪽을 권장 — 보안 습관.)

선택: 리서치 API 키 설정.
```bash
mkdir -p ~/.config/obsidian-second-brain
cp ~/.claude/skills/obsidian-second-brain/.env.example ~/.config/obsidian-second-brain/.env
chmod 600 ~/.config/obsidian-second-brain/.env
# PERPLEXITY_API_KEY(딥리서치), GEMINI_API_KEY(NotebookLM류 기능) 등 보유한 것만 입력
```

초기화: vault에서 `claude` 실행 후 `/obsidian-init` → `index.md`, `log.md` 등 생성. 기존 Phase 3 파일과 겹치면 **내 CLAUDE.md를 우선**으로 병합하라고 Claude에게 지시한다.

### 4-4. Codex/기타 CLI용 빌드 (선택)

Codex 세션에서도 같은 스킬을 쓰려면:
```bash
git clone https://github.com/eugeniughelbur/obsidian-second-brain ~/ai-os/tools/osb-build
cd ~/ai-os/tools/osb-build
bash scripts/build.sh --platform codex-cli
cp -R dist/codex-cli/. ~/ai-os/vault/
```

### 4-5. agent-os (프로젝트 표준 학습 도구)

```bash
git clone https://github.com/buildermethods/agent-os.git ~/ai-os/tools/agent-os
# PATH는 Phase 1-4에서 이미 등록됨. 확인:
agent-os --help

cd ~/ai-os/projects/fpga-adaptive-isp
agent-os init                  # .agent-os/ 생성
agent-os discover-standards    # 기존 RTL/tcl 코드의 컨벤션 자동 분석 → 표준 문서화
```

discover-standards 산출물은 `01_Context/standards.md`와 교차 검토해 하나로 통일한다(중복 규칙 = lint 대상).

---

## Phase 4.5. 보리스 체르니식 Claude Code 운영 체계 (Day 3)

Claude Code 창시자 보리스 체르니가 공개한 자신의 실전 운영법 13가지를 형민님 시스템에 맞게 이식한다. 원문 출처: x.com/bcherny/status/2007179832300581177

### 4.5-1. 13대 비법 ↔ 우리 시스템 매핑표

| # | 보리스의 비법 | 우리 시스템 적용 |
|---|--------------|------------------|
| 1 | 터미널에서 Claude 5개 병렬, 탭 번호 + 시스템 알림 | Hermes 사이드바의 #research/#fpga-main/#codex-impl/#librarian 세션 구도(Phase 8)와 동일 철학. 터미널만 쓸 땐 탭 번호 + 알림 설정 |
| 2 | 웹/모바일 세션 병행, `&` 핸드오프, `--teleport` 왕복 | 합성 대기 등 긴 작업은 claude.ai/code로 넘기고, 아침에 폰에서 세션 시작 → 연구실에서 `--teleport`로 이어받기. `/remote-control`로 로컬 세션을 폰에서 제어 |
| 3 | 가장 똑똑한 모델 + thinking을 모든 작업에 | RTL/아키텍처 작업은 최상위 모델 고정. "작은 모델이 빨라 보여도 조향 비용 때문에 결국 더 느리다" — DPR 설계처럼 정밀성이 중요한 도메인에선 더욱 그렇다 |
| 4 | CLAUDE.md를 git에 체크인, **틀릴 때마다 즉시 추가** | vault와 각 프로젝트의 CLAUDE.md를 살아있는 문서로. Claude가 실수하면 그 자리에서 "방금 실수를 CLAUDE.md에 규칙으로 추가해줘" (복리 엔지니어링) |
| 5 | PR에 @claude 태그, GitHub Action 리뷰 | 프로젝트를 GitHub에 올렸다면 `/install-github-app`으로 자동 PR 리뷰. 1인 연구라도 Codex 산출물 PR에 Claude 리뷰를 붙이는 구도로 활용 |
| 6 | **세션은 Plan mode로 시작** (shift+tab 두 번) | /rtl-impl 전 필수 관문으로 채택. 계획 합의 → auto-accept 전환 → 원샷 구현. "좋은 계획이 전부다" |
| 7 | 반복 워크플로우는 슬래시 커맨드로, `.claude/commands/`에 git 체크인 | /rtl-* 스킬 4종을 **프로젝트 내 `.claude/commands/`로 이전**(아래 4.5-2). 인라인 bash로 git status 등을 사전 계산해 왕복 절약 |
| 8 | 서브에이전트(code-simplifier, verify-app)로 공통 작업 자동화 | `rtl-reviewer` 서브에이전트 신설: 구현 완료 후 standards.md 준수·불필요한 복잡도·CDC 위반을 자동 점검 |
| 9 | PostToolUse 훅으로 코드 자동 포매팅 | verible-verilog-format 훅 등록(아래 4.5-3) — CI/리뷰 단계의 포맷 시비 원천 차단 |
| 10 | `--dangerously-skip-permissions` 안 씀. `/permissions` 사전 허용 + settings.json 체크인 | `make lint/sim/report` 등 안전 명령을 사전 허용(아래 4.5-4). 보안과 속도 양립 |
| 11 | MCP/CLI 도구를 Claude가 대신 사용 (Slack, bq, Sentry) | 우리 버전: git, filesystem MCP + vivado/verilator CLI. 도구 설정은 `.mcp.json`으로 공유 |
| 12 | 초장기 작업: 백그라운드 검증 에이전트, Stop hook, ralph-wiggum 플러그인 + 샌드박스에서만 권한 완화 | 야간 회귀 테스트·대규모 sweep용(아래 4.5-5). 단 Phase 5의 "3회 실패 시 인간 보고" 원칙은 유지 |
| 13 | **가장 중요: Claude에게 자기 작업을 검증할 수단을 줘라 → 품질 2~3배** | Phase 5의 cocotb bit-exact + Vivado 리포트 루프가 정확히 이것. 이 피드백 루프를 "rock-solid"하게 만드는 데 투자하는 것이 최우선 |

### 4.5-2. /rtl-* 를 프로젝트 슬래시 커맨드로 (git 체크인)

전역 `~/.claude/skills/` 대신 프로젝트 안에 둬서 버전 관리하고, 다른 PC·미래의 협업자와 공유 가능하게 한다.

```
~/ai-os/projects/fpga-adaptive-isp/.claude/
├── commands/
│   ├── rtl-spec.md      # Phase 5-4의 지시문을 그대로 이전
│   ├── rtl-impl.md      # 단, 첫 줄에 "Plan mode로 계획 합의 후 구현" 추가
│   ├── rtl-verify.md
│   └── rtl-synth.md
├── agents/
│   └── rtl-reviewer.md  # 서브에이전트: standards 준수/복잡도/CDC 점검
└── settings.json        # 사전 허용 권한 (4.5-4)
```

커맨드 안에서 인라인 bash 사전 계산 예 (`rtl-verify.md` 머리):
```markdown
---
description: cocotb 시뮬레이션 + 골든모델 bit-exact 검증
---
현재 상태: !`git status --short rtl/ tb/`
최근 시뮬 로그 요약: !`tail -20 tb/sim_build/last.log 2>/dev/null || echo "no log"`
위 정보를 바탕으로 make sim을 실행하고...
```

### 4.5-3. PostToolUse 훅 — Verilog 자동 포매팅

```bash
pip3 install verible-verilog-format 2>/dev/null || sudo apt install -y verible  # 또는 GitHub 릴리스 바이너리
```

`.claude/settings.json`의 hooks 항목:
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "f=\"$CLAUDE_FILE_PATHS\"; case \"$f\" in *.v|*.sv) verible-verilog-format --inplace \"$f\";; esac"
      }]
    }]
  }
}
```

### 4.5-4. 권한 사전 허용 (skip-permissions 금지 원칙)

같은 `settings.json`에:
```json
{
  "permissions": {
    "allow": [
      "Bash(make lint*)", "Bash(make sim*)", "Bash(make report*)",
      "Bash(verilator *)", "Bash(iverilog *)", "Bash(gtkwave *)",
      "Bash(git status*)", "Bash(git diff*)", "Bash(git log*)", "Bash(git add*)",
      "Read(//home/*/ai-os/**)"
    ],
    "ask": ["Bash(make synth*)", "Bash(vivado *)", "Bash(git push*)"]
  }
}
```
설계 의도: 읽기·lint·시뮬은 무제한 허용(루프 속도), **합성과 push는 매번 확인**(시간·리소스가 큰 작업 + 외부 영향). 보리스처럼 "안전한 것을 미리 허용"하되, Phase 5의 통제 원칙과 결을 맞춘다.

### 4.5-5. 초장기 작업: Stop hook + ralph-wiggum (야간 운용)

야간 회귀 테스트나 파라미터 sweep처럼 몇 시간짜리 작업은:
1. **1순위**: 작업 종료 시 백그라운드 에이전트로 자가 검증을 지시 — "끝나면 별도 에이전트로 결과를 검증하고 02_Daily에 리포트 남겨".
2. **2순위(결정론적)**: agent **Stop hook**에 `make sim` 결과 검사 스크립트를 걸어, 실패 상태로는 세션이 종료되지 못하게 한다.
3. **3순위(끈질긴 반복)**: 공식 플러그인 **ralph-wiggum** (github.com/anthropics/claude-plugins-official) — 목표 달성까지 루프를 자동 재시작.
4. 이때만 예외적으로 `--permission-mode=dontAsk`를 쓰되, **반드시 격리 환경에서**: git worktree + 합성은 ask 유지. 본 작업 트리에서는 절대 사용하지 않는다.

### 4.5-6. 병렬 작업: git worktree 운용법

Checker 개선과 PR Controller 디버깅을 동시에 진행할 때:
```bash
cd ~/ai-os/projects/fpga-adaptive-isp
git worktree add ../fpga-isp-wt-checker  feature/checker-hysteresis
git worktree add ../fpga-isp-wt-prctrl   fix/pr-controller-timing
# 각 worktree에서 별도 Claude 세션 실행 (claude --worktree 지원 버전이면 그것으로)
```
각 세션이 독립 작업 트리를 가지므로 서로 간섭 없이 병렬 진행 → 완료된 쪽부터 머지. 보리스 팀이 "단일 최대 생산성 향상"으로 꼽은 기법이다.

### 4.5-7. 2차 스레드(Feb) 추가 운영 기법 — FPGA 번역

1월 스레드(4.5-1~6) 이후 공개된 보리스의 추가 팁 중, 기존에 없던 것만 형민님 환경으로 옮긴다.

| 보리스 추가 팁 | FPGA/연구 적용 |
|----------------|----------------|
| worktree에 셸 별칭(za/zb/zc)으로 한 키 이동 + 전용 "analysis" worktree(로그/쿼리 전용) | `.bashrc`에 `alias wr='cd ~/ai-os/projects/.../wt-rtl'` 식 별칭. **읽기 전용 analysis worktree** 신설 — Vivado 합성/타이밍 로그와 cocotb 파형만 읽고 코드는 건드리지 않는 세션 |
| 계획을 한 Claude가 쓰고, 두 번째 Claude가 "스태프 엔지니어"로 리뷰 | /rtl-spec로 DESIGN.md 초안 작성 후, **별도 세션의 Claude(또는 Codex)에게 "시니어 검증 엔지니어로서 이 설계의 허점을 잡아라"** 리뷰시키고 /rtl-impl 진입 |
| 일이 틀어지면 밀어붙이지 말고 plan mode로 돌아가 재계획 | /rtl-impl가 두 번 헛돌면 즉시 plan mode 복귀. "검증 단계에도 plan mode를 쓴다" → cocotb 테스트 전략도 계획 모드로 먼저 설계 |
| 작업/프로젝트별 notes 디렉터리를 PR마다 갱신, CLAUDE.md가 그곳을 가리킴 | 우리의 PROJECT.md + Decisions Log가 이 역할. **머지/검증 통과 시마다 갱신**을 규칙으로 (4.5-10 마인드와 연결) |
| 하루 한 번 이상 하는 일은 전부 커맨드화. 세션 끝에 `/techdebt`로 중복 코드 제거 | `/rtl-cleanup` 커맨드 신설: 세션 종료 시 중복 RTL 로직·미사용 신호·dead code 점검. hm-fpga 플러그인에 편입 |
| 버그는 Claude가 대부분 자가 수정: 로그 스레드 붙이고 "fix", "CI 고쳐" 식으로 마이크로매니징 안 함 | 시뮬 실패 로그/합성 에러를 붙이고 "고쳐". 단 **Phase 5의 3회 실패 시 인간 보고 가드 유지** — 하드웨어는 웹앱과 달리 무한 자동수정이 위험 |
| Ghostty 터미널, `/statusline`(컨텍스트 사용량+git 브랜치 표시), tmux 탭=worktree | `/statusline`로 컨텍스트 잔량·브랜치 상시 표시(긴 합성 세션에서 유용). tmux 탭을 worktree별로 |
| "use subagents"로 더 많은 연산 투입 + 권한요청 훅을 강한 모델로 라우팅해 안전한 것 자동 승인 | 대규모 sweep에 "use subagents" 부착. 권한 훅: `make lint/sim`은 자동 승인, `vivado`/`push`는 인간에게(4.5-4와 결합) |

### 4.5-8. 보리스식 프롬프팅 — 적대적 검증 화법 (마인드 ①)

보리스의 핵심 프롬프팅 철학은 **Claude를 협력자가 아니라 나를 시험하는 리뷰어로 세우는 것**이다. 형민님의 "미검증은 단정 금지" 원칙과 정확히 같은 방향이라, 표준 화법으로 채택한다.

- **"이 변경을 깐깐하게 심문하고, 내가 네 테스트를 통과하기 전엔 PR 만들지 마."** → Claude가 검토자가 되어 형민님 설계를 방어하게 만든다.
- **"이게 동작한다는 걸 증명해."** → RTL이라면: main 브랜치와 feature 브랜치의 시뮬레이션 출력을 골든모델 기준으로 diff해 등가성을 입증하게 한다.
- 어설픈 수정이 나오면 **"지금 아는 걸 전부 반영해서, 이건 버리고 가장 우아한 방식으로 다시 구현해."** → 누적된 임시방편을 리셋.
- 작업 위임 전 **모호함을 줄이고 상세 명세를 준다** → 이미 /rtl-spec의 역할.

### 4.5-9. 보리스식 학습 모드 — 연구하며 배우는 장치 (형민님 핵심 니즈)

보리스의 학습 활용법은 형민님의 "FPGA/임베디드/전자 전공·실무를 꾸준히 학습" 목표에 직결된다. 별도 학습 도구를 만들 필요 없이 Claude Code 안에서 연구와 학습을 한 흐름으로 묶는다.

- **`/config`에서 "Explanatory" 또는 "Learning" 출력 스타일 켜기** → Claude가 변경의 *이유*까지 설명. 낯선 IP 코어나 Vitis AI 흐름을 다룰 때 상시 켠다.
- **낯선 코드의 시각적 HTML 설명 자료 생성** → 처음 보는 reference design, DPU 드라이버, ICAP 예제를 "HTML 슬라이드로 설명해줘"로 빠르게 파악. Hermes 워크스페이스 탭에서 인라인 렌더링.
- **새 프로토콜·코드베이스의 ASCII 다이어그램** → AXI 핸드셰이크, ICAP 재구성 시퀀스, DPU 데이터플로우를 ASCII로 그리게 해 구조를 즉시 이해. 그대로 wiki 노트에 첨부. (시각화 형식 선택 기준은 Phase 3-5 규약 — 정본은 ASCII, 설명용은 HTML)
- **간격반복(spaced-repetition) 학습 스킬 `/learn` 신설** (이번 반영의 최대 수확): 형민님이 한 개념(예: 부분 재구성 비트스트림 흐름)에 대한 *자신의 이해를 설명*하면 → Claude가 빈틈을 찾는 후속 질문 → 정리 결과를 `03_Intelligence`에 저장하고 복습 주기를 기록. **연구 중 마주친 개념이 곧바로 검증된 wiki 지식이 되는 능동 학습 루프.**

```
/learn 흐름:
1. 나: "부분 재구성 비트스트림이 ICAP로 로드되는 과정을 내가 이해한 대로 설명할게..."
2. Claude: 설명의 빈틈/오개념을 짚는 질문 3개
3. 나: 답변 → Claude가 교정 + 정리 노트 생성
4. 03_Intelligence/fpga/에 저장 + 02_Daily에 복습 예정일 기록
5. (주간 루틴에서 복습 큐 점검)
```

### 4.5-10. 보리스의 마인드셋 요약 (마인드 ②)

도구 설정보다 중요한 태도. 시스템 전반에 깔아두는 기본 자세다.

1. **셋업은 의외로 vanilla** — 과도한 커스터마이징보다 기본기에 충실. 정답은 없고, 직접 실험해 자신에게 맞는 방식을 찾는다. (우리 계획의 스킬/훅도 *필요할 때* 추가하지 미리 쌓지 않는다 — '실수 3·4' 회피와 일치)
2. **검증 피드백 루프가 품질의 전부** — Claude에게 스스로 검증할 수단을 주면 결과 품질이 2~3배. 그래서 Phase 5(bit-exact+합성)에 가장 많이 투자한다.
3. **복리 엔지니어링(Compounding Engineering)** — 모든 교정을 즉시 CLAUDE.md 규칙으로 박아 실수율을 측정 가능하게 떨어뜨린다. 매주 CLAUDE.md를 무자비하게 다듬는다.
4. **계획 > 구현** — 에너지를 계획에 쏟아 한 번에 구현되게 한다. 틀어지면 밀어붙이지 말고 재계획.
5. **병렬이 최대 생산성 지렛대** — worktree로 여러 작업을 동시에. 단 하드웨어 검증·머지는 인간 게이트 유지.

---

## Phase 4.6. 루프 엔지니어링 — 프롬프트에서 루프로 (보리스 2단계 진화, 2026.5)

보리스 체르니가 2026년 5월 인터뷰에서 공개한 진화된 운영법. 1월의 13대 비법(Phase 4.5)이 "Claude를 잘 부리는 법"이라면, 이것은 **"Claude에게 프롬프트하는 일 자체를 시스템에 위임하는 법"**이다. 핵심 선언: *"나는 더 이상 Claude에 프롬프트하지 않는다. 루프가 대신 프롬프트하고 할 일을 결정한다. 내 일은 루프를 쓰는 것."* — 자료 원문의 'loop engineer' 섹션(add issues → act → PR)과 정확히 같은 패러다임이다.

### 4.6-1. 성숙도 3단계 모델 — 우리 시스템의 성장 경로

| 단계 | 운영 방식 | 우리 시스템에서 |
|------|----------|----------------|
| 1단계: 프롬프팅 | 매번 손으로 지시 | 시스템 구축 초기 2~4주. CLAUDE.md를 복리로 키우는 시기 |
| 2단계: 커맨드/워크플로우 | /rtl-* 슬래시 커맨드, 서브에이전트 | Phase 4.5~5. 반복 작업이 버튼 하나가 된 상태 |
| 3단계: 루프 | /loop·Routines·동적 워크플로우가 스스로 작업을 발견·실행 | **검증 게이트가 rock-solid해진 뒤에만 진입.** 아래 4.6-2~4 |

> 진입 조건을 명확히 한다: cocotb bit-exact 게이트와 lint가 충분히 신뢰할 수 있게 다져진 뒤에야 3단계로 간다. 검증이 허술한 상태의 루프는 쓰레기를 자동 양산하는 기계일 뿐이다.

### 4.6-2. /loop — 반복 작업의 자율 스케줄링

Claude Code의 /loop는 프롬프트를 주기 실행한다(최대 3일 무인 가동, cron 결합 가능). 형민님 연구에 맞는 루프 후보:

```
/loop 매일 밤 23시: worktree에서 make sim 전체 회귀 테스트 실행.
      실패 시 trackback으로 원인 분석하되 코드 수정은 diff 초안만 작성.
      아침 7시까지 02_Daily에 결과 리포트 저장.

/loop 매주 일요일: 00_raw/clippings 미처리 파일을 /ingest 기준으로 분류하고
      승격 후보 목록을 만들어 내 승인을 기다려.

/loop 야간(매일 새벽 02시): r/FPGA, AMD 블로그, zipcpu.com,
      tomverbeure.github.io, Anthropic Engineering에서 DPR/ISP/검증 관련
      새 글을 검색해 03_Intelligence에 한 줄 요약 + 링크로 적재.
      → 문헌 모니터링 루프는 야간에 수행한다 (소스 기준: Phase 6.5).
```

Phase 6-4의 cron 헤드리스 스크립트는 /loop가 흡수할 수 있다 — /loop가 더 단순하면 그쪽으로 통일한다.

### 4.6-3. Routines — 노트북을 닫아도 도는 서버 측 루틴

/loop가 로컬(내 PC가 켜져 있어야 함)이라면, Routines는 Anthropic 서버에서 도는 반복 작업이다. 보리스는 이 둘의 조합으로 "매일 밤 수천 에이전트"를 운용한다. 우리 적용: 외부 리서치·문헌 모니터링처럼 **로컬 파일시스템이 필요 없는 작업**은 Routines로, 시뮬레이션·합성처럼 **로컬 툴체인이 필요한 작업**은 /loop + 켜둔 워크스테이션으로 분담한다.

### 4.6-4. 동적 워크플로우 — "use a workflow" 오케스트레이션

프롬프트에 "use a workflow"를 포함하면 오케스트레이터가 작업을 N개 태스크로 분기하고, 각 태스크는 [구현자 → 검증자 2개 → 수정자] 구조로 팬아웃되어 검증 통과까지 자체 루프를 돈다. 병렬화 가능한 카탈로그형 작업에 강력하다:

```
"use a workflow: rtl/ 의 모든 모듈을 스캔해서 (a) cocotb TB가 없는 모듈,
(b) standards.md의 리셋 규칙을 위반한 모듈, (c) 파라미터 문서화가 없는
모듈을 분류하고, 각각에 대해 수정 diff 초안을 worktree에서 만들어줘."
```

검증자 2개가 내장된 구조라 단일 에이전트보다 신뢰도가 높지만, **합성·하드웨어 반영은 여전히 인간 승인 관문을 유지**한다(Phase 5 원칙 불변).

### 4.6-5. 폰 중심 감독 체계

보리스는 작업 대부분을 폰에서 한다 — Claude 앱 좌측 Code 탭에 세션 5~10개를 띄워 두고 점검. 우리 운용: 아침 등굣길에 폰에서 야간 /loop 리포트 확인 → 승인 필요한 diff에 코멘트 → 연구실 도착 후 `--teleport`로 세션을 워크스테이션에 이어받아 합성 진행. **인간의 역할이 '타이핑'에서 '검토와 승인'으로 이동**하는 것이 3단계의 본질이다.

### 4.6-6. 루프 시대의 안전 수칙 (FPGA 연구 특화)

1. 모든 루프는 worktree 격리에서만 코드 수정 권한을 가진다. main 브랜치 직접 수정 루프 금지.
2. 루프의 산출물은 "diff 초안 + 검증 리포트"까지. 머지는 인간.
3. 루프마다 종료 조건(최대 반복 수·시간)을 명시 — 무한 재시도로 토큰을 태우는 사고 방지.
4. 주간 루틴에 "돌고 있는 루프 목록 감사"를 추가: 잊힌 루프는 컨텍스트 오염원이자 비용 누수다.

---

## Phase 5. FPGA 자율 검증 루프 구축 (Day 3~5) — 이 시스템의 심장

r/FPGA 현업 컨센서스를 그대로 구현한다: **"AI는 주니어 RTL 엔지니어. 한 번에 한 단계, 골든 모델 bit-exact 검증, 합성 리포트로 피드백."**

### 5-1. 프로젝트 표준 구조

```
~/ai-os/projects/fpga-adaptive-isp/
├── AGENTS.md / CLAUDE.md     # 프로젝트 전용 규약 (vault 것을 상속+특화)
├── DESIGN.md                 # 현재 작업 스펙 (cycle budget, DSP 힌트 포함)
├── rtl/                      # Verilog 소스 (checker.v, pr_controller.v ...)
├── model/                    # Python 골든 모델 (checker_model.py ...)
├── tb/                       # cocotb 테스트벤치
├── cons/                     # XDC 제약 파일 (체크인) — r/FPGA 표준 구조
├── ip/                        # Xilinx IP (.xci 등 일부만 체크인, 생성물 제외)
├── sim/                       # 시뮬 파일셋 소스 (체크인)
├── synth/
│   ├── synth.tcl             # Vivado batch 합성 스크립트
│   ├── rebuild.tcl           # write_project_tcl 산출물 (상대경로, 체크인)
│   └── reports/              # timing_summary.rpt, utilization.rpt
├── proj/                      # Vivado 프로젝트 디렉터리 — git 제외(.gitignore)
├── .gitignore                # proj/, *.jou, *.log, .Xil/ 등 제외
└── Makefile                  # lint / sim / synth / export 타깃
```

### 5-2. Makefile — 에이전트가 누르는 버튼

```makefile
TOP ?= checker
lint:
	verilator --lint-only -Wall rtl/$(TOP).v
sim:
	$(MAKE) -C tb TOPLEVEL=$(TOP) MODULE=test_$(TOP)   # cocotb 표준 흐름
synth:
	vivado -mode batch -source synth/synth.tcl -tclargs $(TOP) | tee synth/last_run.log
export:
	vivado -mode batch -source synth/export_rebuild.tcl   # write_project_tcl → rebuild.tcl (규칙 3)
report:
	@grep -A5 "Design Timing Summary" synth/reports/timing_summary.rpt || true
	@grep -E "Slice LUTs|DSPs|Block RAM" synth/reports/utilization.rpt || true
```

`synth/synth.tcl` 핵심 골격:
```tcl
set top [lindex $argv 0]
read_verilog [glob rtl/*.v]
synth_design -top $top -part xc7z020clg400-1   ;# 본인 보드 파트로 교체
report_timing_summary -file synth/reports/timing_summary.rpt
report_utilization    -file synth/reports/utilization.rpt
```

### 5-3. cocotb + Python 골든 모델 (bit-exact 게이트)

예: 히스토그램 Checker 검증 골격 `tb/test_checker.py`:
```python
import cocotb
from cocotb.triggers import RisingEdge
from model.checker_model import golden_checker   # NumPy 참조 모델

@cocotb.test()
async def bit_exact_vs_golden(dut):
    # 1000 프레임 랜덤 히스토그램 입력 → DUT 출력 vs 골든 모델 출력 전수 비교
    ...
    assert dut_out == gold_out, f"Mismatch at frame {i}"
```

이 게이트를 통과하지 못한 RTL 변경은 **절대 합성 단계로 넘기지 않는다**. (MitjaKobal의 경고 — 시뮬은 되는데 합성에서 깨지는 코드, edge case 버그 — 를 막는 1차 방어선.)

### 5-4. 커스텀 커맨드 4종 생성 (`.claude/commands/` — Phase 4.5-2 위치 기준)

보리스 비법 #7에 따라 프로젝트 내 `.claude/commands/<name>.md`로 만들어 git에 체크인한다. 각 커맨드의 핵심 지시문:

**`/rtl-spec`** (Prompt Enhancer 역할)
> 사용자의 자연어 요구를 받아 DESIGN.md를 생성/갱신한다. **출력은 Phase 3-4의 5요소+XML 표준을 따른다.** 반드시 포함: 입출력 포트 표, **ASCII 블록 다이어그램 + 데이터플로우(Phase 3-5 규약)**, cycle budget, 목표 클록(MHz), DSP/BRAM 매핑 힌트, 골든 모델 정의, 통과 조건(타이밍 슬랙 ≥ 0, bit-exact). 모호한 항목은 사용자에게 질문 후 확정.

**`/rtl-impl`** (RTL Generator)
> **반드시 Plan mode(shift+tab 두 번)로 시작해 구현 계획을 먼저 합의받은 뒤** auto-accept로 전환해 구현한다(보리스 비법 #6). DESIGN.md와 01_Context/standards.md를 읽고 rtl/에 코드를 작성한다. **한 번에 하나의 파이프라인 스테이지/모듈만 수정 (작은 diff)**. 수정 후 즉시 `make lint` 실행, 경고가 0이 될 때까지 자체 반복.

**`/rtl-verify`** (Sim + Trackback)
> `make sim TOP=<module>` 실행 → 실패 시 로그에서 실패 프레임/신호를 역추적 → 원인이 RTL인지 TB/골든모델인지 판별해 보고 → RTL 원인이면 최소 diff로 수정 후 재시뮬. **3회 연속 실패 시 자율 수정을 멈추고 인간에게 분석 리포트 제출** (TheTurtleCub의 회의론에 대한 안전장치).

**`/rtl-synth`** (Synth + 리포트 분석)
> `make synth && make report` 실행 → WNS(Worst Negative Slack)·DSP/LUT 사용량 요약 → 타이밍 위반 시 위반 경로의 레지스터 스테이지 추가를 *제안*(diff 초안)하되 자동 적용은 사용자 승인 후. 결과를 PROJECT.md와 02_Daily 일지에 기록.

### 5-5. 닫힌 루프 운영 흐름

```
나: "/rtl-spec 히스토그램 비교기에 hysteresis 카운터 추가, 200MHz 목표"
 → Claude가 DESIGN.md 갱신
나: "/rtl-impl"  → [Plan mode] 계획 합의 → [auto-accept] 코드 수정 + lint 통과
 → rtl-reviewer 서브에이전트가 standards 준수/복잡도 자동 점검 (보리스 비법 #8)
나: "/rtl-verify" → cocotb bit-exact 통과 (실패 시 자율 trackback ≤3회)
나: "/rtl-synth" → Vivado 배치 합성 → WNS +0.31ns 리포트 → PROJECT.md 갱신
```

익숙해지면 "spec부터 synth까지 쭉 진행해, 단 synth 적용 전엔 멈춰"로 묶어 반자율 운행한다. **완전 자율(인간 0 개입)은 의도적으로 막아둔다** — 연구 신뢰성이 우선.


### 5-6. r/FPGA 현업 워크플로우 → 에이전트 규칙 (커뮤니티 합의 내재화)

r/FPGA의 워크플로우·불만·로드맵 스레드들이 반복해서 말하는 현업 합의를, 에이전트가 어기지 못하도록 규칙으로 박는다. (Reddit 스레드 내용은 AMD ug892 문서와 다수 커뮤니티 저장소로 교차 검증.)

**규칙 1 — Vivado 프로젝트는 git에 넣지 않는다 (최대 합의).** Vivado 프로젝트 폴더는 절대 경로로 가득 차 이동 불가하고, 95%가 합성·캐시 산출물이다. 에이전트는 `proj/`를 절대 커밋하지 않는다. 체크인 대상은 `rtl/`, `cons/`, `sim/`, 선별된 `ip/`, 그리고 재생성용 `rebuild.tcl`뿐. 프로젝트용 `.gitignore`를 둔다:
```gitignore
proj/
*.jou
*.log
*.str
.Xil/
*.cache/
*.hw/
*.sim/
*.runs/
```

**규칙 2 — 에이전트는 항상 non-project(batch) 모드로 구동한다.** 재현성과 CI를 위해 모든 합성·시뮬은 tcl 배치(`vivado -mode batch -source ...`). 이미 Phase 5의 기본 흐름이다. GUI 프로젝트 모드는 **인간이 ILA(통합 로직 분석기)·핀 플래닝·온보드 디버깅**을 할 때만 연다 — 에이전트는 하드웨어를 직접 프로빙할 수 없으므로 이 영역을 침범하지 않는다.

**규칙 3 — `rebuild.tcl` 재생성 규율 (`/vivado-export` 커맨드 신설).** GUI에서 프로젝트(블록 디자인·IP 설정 등)를 바꿨다면, 에이전트가 `write_project_tcl`로 `rebuild.tcl`을 다시 만들고 **상대 경로로 교정**(`set origin_dir [file dirname [info script]]`)한 뒤 커밋한다. 이로써 "다른 PC/worktree에서 한 번에 프로젝트 복원"이 보장된다. hm-fpga 플러그인에 편입.

**규칙 4 — 빠른 오픈소스 루프를 먼저, Vivado는 마지막에 (frustration 대응).** r/FPGA 최대 불만은 합성·구현이 느려 반복이 굼뜨다는 것. 에이전트는 **Verilator lint → cocotb bit-exact를 모두 통과시킨 뒤에만** 느린 Vivado 배치를 호출한다. 미통과 상태로 합성을 돌려 인간의 시간·컴퓨트를 낭비하는 것을 금지(standards.md에 명문화). 이미 Phase 5 게이트가 이 순서지만, "왜"를 규칙에 박아 에이전트가 지름길로 합성부터 돌리지 못하게 한다.

**규칙 5 — 타이밍 클로저는 진단까지만 자동, 수정은 제안.** 또 다른 공통 불만인 타이밍 클로저는 `/rtl-synth`가 WNS·실패 경로를 분석하고 파이프라인 단 추가 등 *제안*까지만. 적용은 인간 승인(Phase 5-4 원칙 유지).

`/vivado-export` 커맨드 골격:
```bash
# proj/ 에서 프로젝트를 연 뒤 tcl 콘솔/배치로:
vivado -mode batch -source - <<'TCL'
open_project proj/fpga-adaptive-isp.xpr
write_project_tcl -force -no_copy_sources -paths_relative_to . synth/rebuild.tcl
TCL
# 이후 에이전트가 rebuild.tcl의 절대경로 잔재를 상대경로로 점검·교정 후 git add
```

> 학습 로드맵 스레드의 함의도 반영: 입문자는 "툴 사용법"보다 **작은 모듈을 끝까지(설계→시뮬→합성→온보드) 완주**하는 경험이 핵심이라는 합의. `/learn`(4.5-9)과 `/rtl-*` 루프가 바로 이 "작게, 끝까지" 완주를 매번 강제하는 구조다.

---

## Phase 5.5. 스킬 패키징 구조화와 연구용 PM 스킬 이식 (Day 5)

phuryn/pm-skills(68 스킬·42 커맨드의 PM 마켓플레이스)를 검토해, **콘텐츠가 아니라 구조와 일부 사고도구**를 전략적으로 흡수한다. 판단 근거: 그 저장소의 PM 스킬 대부분(lean canvas, GTM, growth loop, cohort 분석 등)은 SaaS/웹 제품관리용이라 FPGA 연구와 무관하다. 전체 설치는 컨텍스트 오염(자료의 '실수 4')이다. 대신 **① 패키징 아키텍처 패턴, ② 연구에 전용 가능한 4개 사고도구**만 가져온다.

### 5.5-1. 흡수할 아키텍처 패턴 (스킬을 마켓플레이스로 승격)

흩어진 `~/.claude/skills/` 대신, 형민님 전용 스킬을 **로컬 플러그인 마켓플레이스**로 구조화한다. Claude Code의 plugin/marketplace 기능과 호환되며 git 버전관리·이식이 쉽다.

```
~/ai-os/tools/hm-skills/                 # 형민 전용 스킬 마켓플레이스 (git repo)
├── .claude-plugin/marketplace.json      # 전체 플러그인 목록
├── CLAUDE.md                            # 스킬 저작 규칙 (단일 진실 출처)
├── validate_plugins.py                  # pm-skills의 검증기를 차용
├── hm-fpga/                             # 플러그인 1: FPGA 연구
│   ├── .claude-plugin/plugin.json
│   ├── skills/{rtl-standards,cdc-checklist,...}/SKILL.md   # 명사=자동 로드 지식
│   └── commands/{rtl-spec,rtl-impl,rtl-verify,rtl-synth}.md # 동사=워크플로우
├── hm-research/                         # 플러그인 2: 연구 기획/검증
│   └── skills/{research-prd,assumption-redteam,priority-frameworks}/
└── hm-knowledge/                        # 플러그인 3: 지식관리(/ingest /query /lint)
```

**핵심 설계 규칙 (pm-skills의 CLAUDE.md에서 차용)**:
- **Skills = 명사/개념** — 주제가 맞으면 Claude가 자동 로드 (예: cdc-checklist, rtl-standards). 강제 로드는 `/skill-name`.
- **Commands = 동사** — 사용자가 트리거하는 워크플로우, 여러 스킬을 체이닝 (`/rtl-verify` 등).
- **플러그인 간 하드 참조 금지** — 다른 플러그인의 커맨드를 직접 부르지 말고 자연어로 후속 제안("이제 합성해볼까요?"). 플러그인은 독립 설치되므로 하드 참조는 깨진다.
- **Progressive disclosure** — frontmatter(항상 로드)는 최소화, 세부는 SKILL.md 본문(트리거 시 로드)에. 토큰 절약과 직결.
- **skill의 name = 디렉터리명** 일치 필수. frontmatter는 skill=name+description, command=description+argument-hint.
- **모든 SKILL.md/커맨드 본문은 Phase 3-4의 프롬프트 표준(5요소+XML+Final Reminder)으로 작성**한다. `/prompt-review`로 검수 후 커밋.

설치:
```bash
cd ~/ai-os/tools/hm-skills && git init && git add -A && git commit -m "init hm-skills"
claude plugin marketplace add ~/ai-os/tools/hm-skills
claude plugin install hm-fpga@hm-skills
claude plugin install hm-research@hm-skills
claude plugin install hm-knowledge@hm-skills
```

> 마이그레이션: Phase 4.5/5/6에서 만든 커맨드·스킬을 이 구조로 이전한다. 즉 4.5-2의 프로젝트 `.claude/commands/`는 프로젝트 고유 작업에, 범용 RTL 워크플로우는 hm-fpga 플러그인에 둔다 — 여러 프로젝트(ISP, 향후 STM32)에서 재사용 가능해진다.

### 5.5-2. 이식할 연구용 사고도구 4종 (PM → 연구 번역)

pm-skills에서 도메인 독립적이고 연구에 강력한 것만 골라 `hm-research` 플러그인으로 번역한다.

**① `research-prd`** (create-prd → 연구과제 기획서)
> PM의 8섹션 PRD 템플릿을 연구 기획에 맞게 변형: 1)요약 2)문제정의 3)배경/why now 4)연구목표+측정지표(정량) 5)선행연구 대비 차별점 6)제안 방법(아키텍처) 7)검증 계획 8)마일스톤. **형민님의 DPR ISP 연구를 이 틀로 한 번 정리하면 논문/제안서의 뼈대가 된다.** DESIGN.md의 상위 문서 역할.

**② `assumption-redteam`** (strategy-red-team → 연구 가정 공격)
> 이것이 **이번 검토의 최대 수확**이다. 연구 계획의 'load-bearing 가정'(틀리면 연구가 무너지는 가정)을 골라 steelman 후 공격하고, (영향×틀릴 확률×검증 싸기) 순으로 정렬해 *이번 주에 할 가장 싼 검증*과 kill 기준을 준다. FPGA 연구 적용 예:
> - "조명 변화 시 모듈 재구성이 파라미터 조정보다 AI 정확도에 유리하다" → **Fails if**: 재구성 오버헤드(ICAP 시간)가 정확도 이득을 상쇄한다 → **이번 주 검증**: ICAP 재구성 latency를 시뮬레이션으로 측정, 프레임 예산과 비교 → **kill 기준**: 재구성이 프레임 deadline을 초과하면 접근 재설계.
> 미검증 결과를 단정하지 않는 형민님의 학회 발표 원칙과 정확히 같은 철학을 *사전에* 강제하는 도구다. cross-model 모드(Codex/Gemini로 같은 계획을 한 번 더 공격)도 지원하면 좋다.

**③ `priority-frameworks`** (prioritization-frameworks 그대로)
> RICE/ICE/Kano 등으로 연구 백로그를 우선순위화. "어떤 ISP 모듈을 먼저 PR 대상으로 할까", "검증을 어디부터 조일까"를 직관이 아니라 (영향·확신·노력) 점수로. PROJECT.md의 Next 항목 정렬에 사용.

**④ `intended-vs-implemented`** (pm-ai-shipping의 핵심 스킬)
> AI가 만든 결과물이 *의도한 명세와 일치하는가*를 점검하는 규율. 우리 시스템에서는 이미 Phase 5의 cocotb bit-exact 게이트가 이것의 하드웨어판이다. 이 스킬은 그 철학을 **문서/소프트웨어 산출물에도** 확장한다: Codex가 만든 Python 골든 모델이 DESIGN.md 명세와 일치하는지, 합성 결과가 standards.md 제약을 지켰는지 교차 점검.

### 5.5-3. `/ship-check`의 연구판 — `/research-check`

pm-ai-shipping의 `/ship-check`(vibe-coded 앱을 리뷰 가능한 패킷으로 컴파일)는 형민님의 "발표/제출 전 점검"에 그대로 번역된다. `hm-research`에 `/research-check` 커맨드를 만든다:

```
/research-check 흐름:
1. 문서화 점검   : DESIGN.md/PROJECT.md가 현재 RTL 상태와 일치하는가
2. intended-vs-implemented : RTL ↔ 골든모델 ↔ 명세 정합성
3. 검증 커버리지 : 어떤 모듈이 cocotb TB로 핀고정됐고, 어떤 게 미검증인가 (tests.md)
4. 합성 리포트   : WNS/utilization 요약, 타이밍 위반 여부
5. 발표 준비도   : 미검증 항목 = "시뮬레이션 수준" 표기 대상 목록 (단정 금지 가드)
→ 산출: '연구 패킷' — 학회/논문/제출 전 인간 사인오프용
```

이는 형민님의 2026 SoC 학회 같은 발표 직전에 "무엇이 검증됐고 무엇이 미검증인지"를 자동 정리해, 과장 없는 사실 기반 발표를 보장하는 장치다.

---

## Phase 6. 지식 파이프라인: 수집→정제→승격 자동화 (Day 5~6)

전공(전자공학)·실무(FPGA/embedded) 학습을 연구와 같은 파이프라인에 태운다. 흐름: **세상의 지식 → raw → wiki → AI 대답**.

### 6-1. Obsidian Web Clipper (웹 수집 입구)

1. 브라우저 확장 "Obsidian Web Clipper" 설치.
2. 옵션 → 기본 템플릿 → 내보내기(json).
3. 그 json을 Claude에게 주고: *"이 템플릿을 수정해서 저장 시 (a) 저장 폴더를 00_raw/clippings로 고정, (b) frontmatter에 source/date/topic 태그, (c) '이 자료를 수집한 나의 관점·목적' 질문 필드를 추가해줘."*
4. 옵션 → 템플릿 편집 → 가져오기로 Claude가 만든 템플릿 등록.
5. 이후 웹 자료 클리핑 시 "왜 저장하는가"를 한 줄 적게 됨 → 목적성 있는 수집.

### 6-2. `/ingest` `/query` `/lint` 스킬

2~3회 수동으로 해본 뒤 스킬화한다 (자료의 조언: 수작업 후 스킬을 만들어야 완성도가 높다).

- **`/ingest`**: `00_raw/clippings/` 신규 파일 스캔 → 5대 승격 필터 적용 → 통과분만 `03_Intelligence/<주제>/`에 정제 노트로 생성(원본 링크, `[[상호참조]]` 포함) → log.md 기록.
- **`/query`**: 질문을 받으면 index.md → 관련 wiki 노트만 선별 로드(토큰 절약) → 답변에 출처 노트 링크 필수. 출처 없으면 "wiki에 근거 없음"이라고 답하게 강제.
- **`/lint`**: 주 1회. 중복 정보, 출처 없는 결정, 검증되지 않은 추측, 오래된 규칙, 깨진 `[[링크]]` 점검 리포트 → 수정은 사용자 승인 후.

### 6-3. NotebookLM-py — 토큰 절약 사서

대용량 논문 뭉치·유튜브 스크립트의 1차 정제를 Gemini(무료 대용량 컨텍스트)에 위임해 Claude 토큰을 아낀다.

```bash
git clone https://github.com/teng-lin/notebooklm-py.git ~/ai-os/tools/notebooklm-py
cd ~/ai-os/tools/notebooklm-py
pip3 install -e .        # README의 인증 절차(Google 계정) 수행
```

운영 패턴:
1. Zotero에 모은 DPR/ISP 논문 PDF 묶음을 NotebookLM 노트북에 업로드.
2. notebooklm-py로 "각 논문의 기여·한계·우리 연구와의 차이를 md로 추출" 실행.
3. 산출 md를 `00_raw/notebooklm/`에 저장 → `/ingest`로 wiki 승격.
4. 발표자료가 필요하면 NotebookLM의 슬라이드/오디오 기능 활용 (활용성 좋음).

### 6-4. 학습 루틴 자동화 (cron + Claude headless)

`~/ai-os/scripts/daily-briefing.sh`:
```bash
#!/bin/bash
cd "$HOME/ai-os/vault"
claude -p "오늘 날짜의 02_Daily 일지를 생성하고, 모든 PROJECT.md의 Now 항목을 요약하고, 00_raw/clippings의 미처리 파일 수를 보고해. 결과는 02_Daily/$(date +%F).md에 저장." \
  --allowedTools "Read,Write,Edit" >> "$HOME/ai-os/scripts/cron.log" 2>&1
```

```bash
chmod +x ~/ai-os/scripts/daily-briefing.sh
crontab -e    # 추가: 매일 08:30 실행
# 30 8 * * * $HOME/ai-os/scripts/daily-briefing.sh
```

이것이 자료의 '실수 2(실시간 컨텍스트 미갱신)'에 대한 해법 — 헤드리스 모드 스케줄링이다. (시스템이 안정화되면 Phase 4.6-2의 /loop로 대체·통일 가능.)

> 학습 파이프라인 보강: 연구 중 개념 학습은 Phase 4.5-9의 보리스식 `/learn`(간격반복)·Explanatory 스타일·ASCII/HTML 설명 기법을 함께 쓴다. 수집→정제→승격(이 Phase)과 능동학습(/learn)이 한 wiki에서 만난다.

---

## Phase 6.5. 정보 식단(Information Diet) 전략 — 무엇을 수집할 것인가 (상시)

Phase 6이 "어떻게 수집·정제하는가"였다면, 이 단계는 **"무엇을 입력할 것인가"**를 설계한다. 수집 파이프라인이 아무리 좋아도 입력 소스가 부실하면 wiki는 빈약해진다. 핵심 원칙: **형민님의 성장에 가장 직접적인 것은 AI 인플루언서가 아니라 FPGA/임베디드 도메인 전문가다.** AI 도구 활용법은 빠르게 배우고 끝나지만, RTL 설계 관점은 경력 전체를 떠받친다.

### 6.5-1. 학습 3축 모델

| 축 | 질문 | 대표 소스 | 비중 |
|----|------|----------|------|
| **도메인 전문성** | FPGA/임베디드를 어떻게 잘하는가 | Tier S/A 전문가 (아래) | **60%** |
| **도구 활용** | AI 에이전트를 어떻게 쓰는가 | Boris Cherny, Anthropic Engineering, Codex GitHub, Matt Pocock | 25% |
| **방향성** | 무엇을 만들어야 하는가, 산업이 어디로 가는가 | Karpathy, Dwarkesh Patel, Jim Keller | 15% |

> 함정 경고: AI 도구 콘텐츠(Web/SaaS 중심 크리에이터 등)는 자극적이고 소비하기 쉬워 비중이 저절로 커진다. "재미용 계정"(밈 등)은 정보 식단에서 제외 — 보더라도 수집 파이프라인에 넣지 않는다.

### 6.5-2. 도메인 전문가 큐레이션 (Zotero/RSS 구독 대상)

**Tier S — 무조건 추적 (FPGA/RTL)**

| 인물 | 핵심 자산 | 형민님 연구와의 접점 |
|------|----------|---------------------|
| **Dan Gisselquist (ZipCPU)** | zipcpu.com 블로그 — FPGA 설계, Formal Verification, AXI, 디버깅 | AXI 버스 이해는 DPR의 ICAP/DPU 인터페이스에 직결. Formal은 Checker 검증의 다음 단계 |
| **Tom Verbeure** | tomverbeure.github.io — FPGA 아키텍처, **ISP**, AI 가속기, 영상처리 | **연구 주제가 직접 겹침.** 최우선 정독 대상 |
| **Cliff Cummings** | Sunburst Design 논문들 — SystemVerilog, **CDC**, Reset 설계, FSM | standards.md의 리셋/CDC 규칙을 그의 논문 기준으로 보강할 것 |
| Matt Venn | 오픈소스 FPGA 툴체인, Tiny Tapeout | 오픈소스 검증 체인(Phase 5)과 철학 동일 |

**Tier A — 검증/임베디드/AI 하드웨어**

- 검증: **Ben Cohen**(SVA·Assertion), **Stuart Sutherland**(SystemVerilog 언어) — Phase 5 검증 루프를 SVA로 고도화할 때의 교과서
- 임베디드: **Miro Samek**(상태머신·RTOS), **Jacob Beningo**(STM32·FreeRTOS), Phillip Johnston(펌웨어 아키텍처)
- AI 하드웨어/방향: **Jim Keller**(컴퓨터 아키텍처·AI칩), Karpathy, Yann LeCun, Greg Kroah-Hartman(리눅스 커널)

### 6.5-3. 파이프라인 결합 — 구독을 시스템으로

1. **수집 자동화**: ZipCPU·Tom Verbeure 블로그는 RSS → Zotero(또는 웹클리퍼)로. Cummings/Cohen/Sutherland의 논문 PDF는 Zotero에 일괄 수집 → NotebookLM 1차 정제 → `/ingest`.
2. **Routines 모니터링**(4.6-3 갱신): 외부 모니터링 루프의 대상을 "r/FPGA·AMD 블로그"에서 **"r/FPGA, AMD 블로그, zipcpu.com, tomverbeure.github.io, Anthropic Engineering"**으로 확장.
3. **학습 순서** (6개월 로드맵): 1단계 Gisselquist+Verbeure+Cummings(지금) → 2단계 Cohen+Sutherland(검증 고도화기) → 3단계 Keller+Karpathy(AI 가속기 설계 진입기). "이 중 ZipCPU와 Verbeure를 6개월 정독"이 단기 성장 기대값이 가장 크다.
4. **Karpathy 강의 트랙**: Neural Networks: Zero to Hero(micrograd → makemore → GPT → tokenizer)를 `04_Projects/learning/`에 실습 프로젝트로 등록 — TinyML/NPU 연구의 기초 체력. 그에게서 가져올 핵심은 코드가 아니라 **문제 분해 방식**(복잡한 문제 → 단순화 → 본질 추출 → 자동화)이다.

### 6.5-4. 하드웨어 도메인의 'Vibe Coding' 보정 공식

Karpathy의 vibe coding(자연어 대화로 소프트웨어 제작)은 웹에서는 결과를 즉시 실행해 확인할 수 있지만, RTL은 타이밍·전력·합성 문제가 있어 그대로 적용하면 안 된다. 우리 시스템의 공식:

```
Vibe Coding (자연어 → RTL 초안)
  ↓ Architecture Review   (인간 + rtl-reviewer 서브에이전트)
  ↓ Verification          (cocotb bit-exact + lint — Phase 5 게이트)
  ↓ Hardware Validation   (Vivado 합성/타이밍 → 보드 검증)
```

이미 Phase 5가 이 구조다 — vibe coding의 속도를 취하되, 하드웨어 신뢰성 관문은 양보하지 않는다.

### 6.5-5. 영상(YouTube) 소스 트리아지 — 25% 버킷의 내부 순위

추가로 검토한 8개 채널은 전부 학습 3축 중 **도구 활용/생산성(25%)** 또는 그 바깥에 위치한다. 도메인 전문성(60%)을 채워주지는 않는다는 점을 먼저 분명히 한다. 형민님 목표 기준으로 정직하게 티어링하면:

| 티어 | 채널 | 평가 (FPGA/임베디드 연구자 기준) |
|------|------|----------------------------------|
| **B (실무 즉용)** | **Jeff Su** | 생산성/워크플로우. Obsidian 운영·노트 시스템에 바로 쓸 기법. 영상이 짧아 time-box 쉬움 |
| **B** | **Tina Huang** | 학습 시스템·프롬프트·데이터과학 커리어. "어떻게 공부하는가"의 메타 기술로 가치 |
| **C (선택적)** | Liam Ottley / Nate Herk | AI 에이전트·자동화 구축. 다만 n8n/Make 류 **no-code** 중심 — 형민님은 이미 Claude Code/Codex/Hermes의 **코드 기반** 오케스트레이션을 하므로 개념만 참고, 깊이 들어가면 도메인과 멀어짐 |
| **C** | Silicon Valley Girl | 업계 뉴스·커리어. 가벼운 트렌드 인지용. 방향성 축에선 Dwarkesh Patel이 상위 호환 |
| **D (적합성 낮음·주의)** | Nick Saraev | AI 사업 자동화·수익화(agency/make-money 성격). 연구개발보다 사업화. 시간 흡수 위험 |
| **D** | Chase H. AI | 최신 도구·프롬프트. **새 도구 쫓기(novelty churn)** 위험 — 도구는 가장 빠르게 휘발하는 정보 |
| **D** | Itssssss_Jack | AI 영상 제작. 연구와 무관. 단, 발표 영상/포스터 시각화 시점에만 한정 참고 |

> 판단: B 2개만 가벼운 정기 시청 대상으로, C는 특정 필요(에이전트 자동화 아이디어, 트렌드)가 생겼을 때 검색해서 보는 "pull" 방식으로, D는 정보 식단에서 제외(또는 일회성)한다. 구독해서 알림으로 끌려다니지("push") 않는 것이 핵심.

### 6.5-6. 영상 소비 규율 — 시간 흡수 방지 장치

영상은 텍스트보다 정보 밀도가 낮고 소비 시간이 길어 가장 새기 쉬운 누수다. 다음 파이프라인으로만 시스템에 들인다:

```
영상 발견 → (정기시청은 B티어만, 나머지는 필요시 pull)
  → 자막/transcript 추출 → NotebookLM 1차 정제(요점만)
  → 5대 승격 필터 통과한 '실행 가능한 기법'만 wiki(03_Intelligence)로
  → 통과 못 한 일반론·동기부여성 내용은 캡처하지 않음 (버린다)
```

- **Time-box**: 영상 학습은 주 1편 상한. 그 이상은 도메인 정독 슬롯(6.5-3, ZipCPU/Verbeure 주 2시간)을 침범한 것으로 간주.
- **승격 필터의 엄격 적용**: 영상 팁 대부분은 "반복 재사용·의사결정 근거·공통 규칙" 어디에도 해당 안 됨 → wiki 진입 불가가 정상. wiki에 영상 출처 노트가 쌓이기 시작하면 식단이 무너지고 있다는 신호.
- **Routines 제외**: 영상 채널은 자동 모니터링(4.6-3) 대상에 넣지 않는다. 도메인 블로그(zipcpu 등)와 달리 신호 대비 잡음이 크다.

---

## Phase 7. Graphify — 지식 그래프 시각화 (Day 6)

1. [graphify.net](https://graphify.net) 접속 → Linux용 CLI 설치 안내를 따른다 (설치 시 graphify 명령어·스킬 습득을 권유받으면 수락).
2. Claude Code 세션에서:
```
/graphify wiki        # 03_Intelligence(wiki) 폴더를 graphify 형식으로 인덱싱
```
3. 생성된 `graph.html`을 브라우저(또는 Phase 8 대시보드의 워크스페이스 탭)에서 열면, 내 아이디어 노트 ↔ Zotero 논문 ↔ RTL 모듈 노트가 어떻게 연결되는지 3D로 보인다.
4. **활용 기준**: 고립된 노드(링크 0개)가 많으면 `/lint` 대상. 링크 구조가 촘촘할수록 `/query`의 RAG 정확도가 올라간다.
5. 주 1회 `/graphify wiki` 재실행으로 그래프를 최신화한다.

---

## Phase 8. Hermes Agent OS 대시보드 (Day 7~8)

모든 에이전트 세션·프로젝트 현황·렌더링 결과를 한 화면에서 통제하는 최종 인터페이스.

### 8-1. 설치

```bash
git clone https://github.com/NousResearch/hermes-agent.git ~/ai-os/tools/hermes-agent
cd ~/ai-os/tools/hermes-agent
# README 기준 설치 (Node/Python 의존성). 공식 문서: hermes-agent.nousresearch.com
npm install && npm run build   # 저장소 안내에 따라 조정
```

### 8-2. 구성

1. **사이드바 에이전트 등록**: Claude Code, Codex, Hermes 기본 모델(무료 대용량 컨텍스트 모델 — 가벼운 리서치/요약용)을 각각 프로필로 등록. 용도별 세션을 상시 띄워둔다:
   - `#research` (Claude, vault 루트) — 지식 관리, /query, /ingest
   - `#fpga-main` (Claude, fpga-adaptive-isp) — /rtl-* 루프
   - `#codex-impl` (Codex, fpga-adaptive-isp) — 구현 전담
   - `#librarian` (Hermes 무료 모델) — 대용량 문서 1차 요약 (토큰 0원)
2. **Obsidian Memory Layer 연결**: Hermes 설정에서 메모리 경로를 `~/ai-os/vault`로 지정 → 모든 에이전트가 MY.md/연구 맥락을 세션마다 자동 공유. 배경 설명 반복 입력이 사라진다.
3. **워크스페이스 탭 활용**: `graph.html`, 합성 리포트(HTML 대시보드), 설계 설명 HTML(Phase 3-5), 히스토그램 SVG, 시뮬레이션 파형 캡처를 대시보드 안에서 인라인 렌더링 → 마음에 안 들면 그 자리에서 스크린샷 피드백 → 초고속 수정 루프.
4. **영구 세션**: 재부팅해도 에이전트별 대화 이력이 유지되므로, 프로젝트별 세션을 "상주 팀원"처럼 운영한다.
5. **병렬 운용 원칙**(보리스 비법 #1·#2): 동시 RTL 작업은 반드시 git worktree로 격리(4.5-6). 합성 대기 같은 긴 작업은 웹 세션으로 `&` 핸드오프하거나, 폰에서 시작한 세션을 `--teleport`로 이어받는다 — 대시보드 밖에서도 워크플로우가 끊기지 않게.

### 8-3. 보조 대시보드: Obsidian `Dashboard.md`

Hermes가 무거울 때를 대비한 경량 현황판. Dataview 쿼리로 구성:

```markdown
# 🎛️ AI-OS Dashboard
## Active Projects
\```dataview
TABLE status, file.mtime AS updated FROM "04_Projects" WHERE file.name = "PROJECT" SORT file.mtime DESC
\```
## Today
![[02_Daily/{{date}}]]
## Unprocessed Raw
\```dataview
LIST FROM "00_raw/clippings" WHERE !processed
\```
```

### 8-4. MCP 연결 (선택 고급화)

Claude Code에 filesystem·git MCP 서버를 등록하면(`claude mcp add ...`) 대시보드에서 뉴스 크롤링·git 상태 확인 같은 작업을 API 추가 비용 없이 스케줄링할 수 있다. 처음엔 filesystem/git 2개만 — 커넥터 과다는 컨텍스트 오염원이다.

---

## Phase 9. Windows 연동 (Day 8)

Windows 역할: **열람·문서 제출·HWP/Office 작업·NotebookLM 웹 UI**. 에이전트 실행은 전부 Linux.

1. **Syncthing 설치** (양쪽 모두):
```bash
# Linux
sudo apt install syncthing
systemctl --user enable --now syncthing   # http://localhost:8384
```
   Windows는 syncthing.net 설치본. 양쪽에서 `~/ai-os/vault` ↔ `D:\ai-os\vault` 폴더 공유 등록.
2. **Windows Obsidian**: 동기화된 vault를 열어 열람/가벼운 편집. (충돌 방지: 동시 편집은 피하고, Linux를 마스터로 취급.)
3. **Windows Zotero**(선택): Zotero 계정 동기화를 켜면 라이브러리가 양쪽에서 일치. Better BibTeX 자동 내보내기는 **Linux 쪽에서만** 설정(이중 쓰기 방지).
4. `.stignore`에 `.obsidian/workspace*`, `.trash/` 추가 — 워크스페이스 상태 파일 충돌 방지.

---

## Phase 10. 일상 운영 루틴과 유지보수

시스템은 꾸준히 써야 복리로 성장한다 ('실수 6'). 처음 2주는 어색해도 **모든 작업의 기본 도구를 이 시스템으로** 고정한다.

### 일일 루틴 (15분 + 상시)
| 시점 | 행동 |
|------|------|
| 08:30 | (자동) cron 브리핑 — 일지 생성, PROJECT.md 요약 |
| 작업 중 | Hermes 대시보드에서 세션별 작업. 논문/자료 발견 즉시 Zotero/웹클리퍼로 수집 |
| 작업 후 | "이번 작업 옵시디언에 저장해줘" → /save (필터 통과분만 wiki) |
| 마감 | PROJECT.md Now/Next 갱신 확인 (에이전트가 했는지 검수) |
| 상시 | **Claude가 실수하면 그 즉시 "방금 실수를 CLAUDE.md 규칙으로 추가해줘"** — 살아있는 CLAUDE.md (보리스 비법 #4, 복리 엔지니어링) |

### 주간 루틴 (목요일 기준, 30분)
1. `/lint` 실행 → 중복·노후 정보 청소 ('실수 5' 방지)
1b. 진행 중 연구 가정에 `assumption-redteam` 1회 — 이번 주 가장 싼 검증 1건 도출 (Phase 5.5-2)
2. `/graphify wiki` 재실행 → 고립 노드 점검
3. NotebookLM에 이번 주 수집 논문 일괄 투입 → `/ingest`
4. vault git 커밋 + 외부 백업 확인
5. **가동 중인 /loop·Routines 목록 감사** — 목적이 끝난 루프는 즉시 중지 (4.6-6)
6. Tier S 정독 슬롯(주 2시간 고정): ZipCPU 또는 Verbeure 글 1편 정독 → 핵심을 wiki로 /save (Phase 6.5-3 로드맵 순서대로)

### 월간 루틴
- CLAUDE.md 300줄 초과 여부 점검, sub-CLAUDE.md로 분리
- 스킬 회고: /rtl-verify의 trackback 성공률이 낮으면 골든 모델/TB 보강
- `npm update -g @anthropic-ai/claude-code @openai/codex`

### 절대 규칙 (자료의 6대 실수 요약 내재화)
1. raw 무차별 덤프 금지 — 핵심 컨텍스트 5~6개를 정교하게
2. 컨텍스트는 살아있게 — cron 자동 갱신
3. 폴더 구조는 한 번 정하면 유지
4. CLAUDE.md ≤ 300줄 + 라우팅 테이블
5. 주간 audit (lint)
6. 일관된 사용 — 기본 도구로 고정

---

## 부록 A. 구축 일정 요약

| Day | Phase | 산출물 |
|-----|-------|--------|
| 1 | 1~2 | Ubuntu 검증, 디렉터리 골격, RTL 툴체인, Obsidian+Zotero |
| 2 | 2~3 | 핵심 컨텍스트 5종, CLAUDE.md/AGENTS.md/PROJECT.md, 프롬프트 작성 표준(3-4) |
| 2~3 | 4~4.5 | Claude Code, Codex, second-brain 스킬, agent-os + 보리스식 운영체계(커맨드 git화, 훅, 권한, worktree) |
| 4주차+ | 4.6 | (검증 게이트 안정화 후) /loop 야간 회귀, Routines 문헌 모니터링, 동적 워크플로우 도입 |
| 3~5 | 5 | Makefile, cocotb 골든모델 게이트, /rtl-* 스킬 4종, 첫 닫힌 루프 가동 |
| 5 | 5.5 | hm-skills 마켓플레이스 구조화, 연구용 PM 스킬 4종 이식, /research-check |
| 5 | 5-6 | Vivado git 위생(.gitignore·rebuild.tcl), /vivado-export, batch 모드 규칙 |
| 5~6 | 6 | 웹클리퍼, /ingest /query /lint, notebooklm-py, cron 브리핑 |
| 6 | 6.5 | 정보 식단 구축: Tier S RSS/Zotero 구독, 학습 로드맵 등록 |
| 6 | 7 | Graphify 3D 그래프 |
| 7~8 | 8~9 | Hermes 대시보드, Windows Syncthing |
| 상시 | 10 | 일/주/월 루틴 정착 |

## 부록 B. 트러블슈팅 메모

- **Vivado batch가 라이브러리 에러로 죽음** → `sudo apt install libtinfo5 libncurses5` 확인, `LC_ALL=en_US.UTF-8` 설정.
- **cocotb가 iverilog를 못 찾음** → `make SIM=icarus` 명시 또는 Makefile에 `SIM ?= icarus`.
- **Claude가 엉뚱한 폴더에 저장** → CLAUDE.md 라우팅 테이블 문구를 더 명령형으로("WRITE는 ~에만") 강화하고, 위반 사례를 Core Rules에 추가.
- **에이전트가 미검증 결과를 단정** → standards.md의 검증 게이트 문구를 스킬 SKILL.md 안에도 복제(이중 방어).
- **Syncthing 충돌 파일(.sync-conflict)** → Linux 버전을 정본으로 채택 후 삭제. 동시 편집 습관 점검.
- **Hermes 빌드 실패** → Node 버전(20 LTS) 확인, 저장소 issues 검색. 대시보드 없이도 Phase 1~7만으로 시스템은 완전 동작한다 — Hermes는 인터페이스 계층일 뿐.

## 부록 C. 참고 소스 맵 (자료 원문 기준)

> 전체 소스의 기능·역할별 정리와 향후 확장 매핑은 별도 문서 **`AI_OS_소스_카탈로그.md`** 참고. 아래는 마스터플랜에 직접 반영된 소스 요약.


- 세컨드 브레인 프레임워크: eugeniughelbur/obsidian-second-brain
- 프로젝트 표준: buildermethods/agent-os
- 대시보드: NousResearch/hermes-agent (hermes-agent.nousresearch.com)
- 지식그래프: graphify.net (safishamsi/graphify)
- 사서: teng-lin/notebooklm-py, NotebookLM
- 서지: zotero + retorquere/zotero-better-bibtex
- 설계 철학: Karpathy LLM wiki gist, Ben AI 6대 실수, r/FPGA 에이전트 루프 논의
- Claude Code 운영법: Boris Cherny 13대 비법 (x.com/bcherny, Phase 4.5), Claude Code 공식 문서(slash-commands, sub-agents, hooks-guide, permissions)
- 스킬 패키징/사고도구: phuryn/pm-skills (Paweł Huryn) — marketplace+plugin 아키텍처, skills=명사/commands=동사, strategy-red-team·create-prd·prioritization-frameworks·intended-vs-implemented 이식 (Phase 5.5)
- 영상 소스 트리아지: YouTube 채널 8선 검토분(2026.6) — Jeff Su/Tina Huang(B), Liam Ottley·Nate Herk·Silicon Valley Girl(C), Nick Saraev·Chase H. AI·Itssssss_Jack(D), 소비 규율 (Phase 6.5-5~6)
- 정보 식단/전문가 큐레이션: ChatGPT 대화 검토분(2026.6) — FPGA/임베디드 전문가 Tier 분류, Karpathy Software 3.0/vibe coding/agentic engineering, 학습 3축 모델 (Phase 6.5)
- FPGA 현업 워크플로우: r/FPGA 워크플로우·불만·로드맵 스레드(2026.6 검토), AMD ug892 design-flows, 커뮤니티 git 저장소(jhallen/vivado_setup·zackheil/base-soc 등)로 교차검증 — Vivado git 위생·batch 모드·rebuild.tcl·빠른 루프 우선 (Phase 5-6)
- 프롬프트 저작 표준: Anthropic 프롬프팅 워크숍 3세션(Prompting 101 5.12, Prompt Engineering 6.13, Building with Claude 6.12) — 5대 요소·XML 구조화·반복 개선 (Phase 3-4)
- 보리스 추가 비법·마인드: Boris Cherny X 2026.2.1 스레드(병렬 별칭·적대적 프롬프팅·학습 모드·서브에이전트·터미널) + 1월 스레드 마인드셋 (Phase 4.5-7~10)
- 루프 엔지니어링: Boris Cherny 2026.5 Sequoia 인터뷰 ("내 일은 루프를 쓰는 것", /loop·Routines·dynamic workflows, Phase 4.6) — @AnatoliKopadze 게시물 계열의 원출처
- FPGA 에이전트 참고: Fabrinetes(도커 환경), FPGA-Agent, verilog-generator, AMD agentic AI 블로그
