# AI Native OS Reference Zip

## graphify - obsidian

- Youtube : https://www.youtube.com/watch?v=cNlvrU-KcRg&t=1595s
- 프롬프트 모음 : https://share.note.sx/exsfp96r#buivPS10IM6QpMWyS3ZI9LBXHGpqW/Xtl3mKXVnt+YE

1. 옵시디언 볼트 생성 후 접속
2. 나의 핵심 맥락.md 생성 (1. 나는 누구인가, 2. 왜 기록하는가 3. 어떤 아웃풋을 원하는가)
3. 볼트 폴더 에서 클로드 실행 -> AI 세컨드 브레인.md 설정
4. CLAUDE.md 생성 -> 카파시 마인드 탑재
5. 옵시디언 / 웹 클리퍼 : 웹에서 검색후 저장하는 확장프로그램. 우리의 환경에 맞는 템플릿 생성 필요. 
	1) 옵시디언 웹클리퍼 옵션 - 기본 템플릿 - 내보내기 - json 파일을 wiki로 가져옴. 
	2) 우리 환경에 맞도록 수정 with claude
	3) 웹클리퍼 옵션 - 템플릿 편집 - 들여오기 - 클로드가 생성한 템플릿 모두 가져옴.
	4) 웹에서 검색후 옵시디언으로 넣으면, 나의 관점에 대해 질문하도록 하여 나의 답변을 통해 목적성을 명확히 함.
	5) 스킬을 통한 자동화. -> /ingest 스킬 생성. (2~3번의 작업 후 스킬 생성 해야 완성도가 높음.)
	6) query(=RAG), lint(최신화, 업데이트, 정리) 스킬 생성.
6. Graphify
	1) graphify.net 접속 install (graphify 명령어, 스킬 습득 권유)
	2) /graphify wiki : wiki 폴더를 graphify 형식으로 먹이기
	3) graph.html을 보면 시각 자료 제공

---
https://www.youtube.com/watch?v=ulhEyDIxj6Q

업그레이드
zotero + notebookLM + LLM wiki

- 유튜브 채널 참조 : wanderloots

My notes + LLM wiki + 
옵시디언 vault에는 md 노트만 두는 것을 추천.
원본은 외부에 둔다.

- zotero : 원본을 그대로 보관, 긁어오기. reference zip (논문 스크립)
LLM wiki : 컴파일. 정재된 색인. AI가 빨리 훑는 view.
NotebookLM : 소스기받으로 묻기. raw 묶음에 콕 집어 묻고, citation까지 짚어주는 사서.

**LLM wiki 사용시 토큰 소모량 크니 주의.**
세상의 지식 - raw - wiki - ai 대답

1. zotero
zotero connector 설치.
유튜브같은 영상 자료를 가져올 때 메타데이터도 함께 가져오도록 추천.
zotero mcp (git)

2. NotebookLM
NotebookLM-py 클로드 코드 이용해서 설치.
https://github.com/teng-lin/notebooklm-py.git
연결해서 제미나이에게 시켜서 하기 때문에 클로드 토큰을 절약함.
zotero, obsidian --> NotebookLM
NotbookLM ppt 제작 활용성 좋음.


LLM wiki에 CLAUDE.md, AGENTS.md + MY.md(사용자인 '나'에 대한 정보)

---

## Chase AI (Agent OS)
https://www.youtube.com/watch?v=Bgxsx8slDEA&t=322s


dashboard : 시각적 설정
Memory (Second brain) : LLMwiki obsidian (raw(임시저장), wiki(중간 매개체, 시스템에 맞춰 정리), output(slide, query-result) + graphify
Architecture : skill, agents,,,

Chase AI (graphify)
graphify + obsidian + claude


---

## claude + codex
youtube : https://www.youtube.com/watch?v=xCFbMXk5ul4&t=1366s

claude : brain, decision
codex : coding, maker

claude agents에서 하나의 세션 지우는 방법 : Ctrl + X 두번 입력 시 삭제.

PROJECT.md : 현황판
AGENTS.md + CLAUDE.md : 역할 계약서
business-context + DSIGN.md : 판단 기준.

-> 클로드 에이전트를 서로 다른 세션으로 관리하기 때문에 약간의 다른 차이.

---

## loop engineer
youtube : https://www.youtube.com/watch?v=gi0Lx6c84VE

add new issues (human, triage) -> act on issues -> pr changes

/grill-with-docs 스킬 


스킬을 포함시킨 자동화를 생성해서 사용.

ready-to-spec, ready-to-agent, ready-to-impleament 

github.com/warpdotdev/oz-for-oss
https://github.com/warpdotdev/common-skills
https://oz.dev


----

## dashboard
AI-Accelerator : https://benai.co/accelerator?utm_campaign=stop-using-claude-obsidian-without-an-agentic-os&utm_content=accelerator&utm_medium=video&utm_source=youtube
Youtube : https://www.youtube.com/watch?v=1x32W8zAtrg

personalized dashboard (=개인 대시보드 홈페이지)
각종 mcp를 사용해서 대시보드 창에서 모든 부분에 접속.
api를 사용하는 방식보다 비용 절감

Interface layer | Desktop App, Custom dashboard(***)
LLM Layer | claude, gpt, gemini
Memory | obsidian, graphify, 2nd brain (Ben AI youtube)
Connector | skills, scheduled tasks, routines, loops etc
Connectors | mcp, cli (News, youtube, git, ...)


Obsidian dashboard 추천하지만 고려,,
1. interface
2. 사용하면서 action 추가

1. set up mcp
2. live artifact 생성
3. 사용 후 개선

install obsidian plugins
prompt claude / ai (build dashboard)
actions (run claude in headless mode)

---

## ai os 구축을 위한 5가지 기술


https://www.youtube.com/watch?v=zElKhlFkqU4&t=671s

템플릿, 기술 지원
https://c.benai.co/htbu-accelerator

ai business os setup 
https://c.benai.co/htbu-cowork

mcp, plugin, skill
https://www.youtube.com/watch?v=je95KXv1QlA
https://c.benai.co/t1psa-free


https://www.youtube.com/watch?v=IShdbDP4Jgg



---

실수 1 : 올바른 컨텍스트를 제공하지 않음.
실수: AI에게 무작정 가공되지 않은 원시 데이터(Raw Data)를 무차별적으로 업로드(데이터 덤프)하여 폴더 구조를 매우 어지럽게 만듭니다. 그래프 뷰는 화려해 보일지 몰라도 정작 AI가 유용한 답변을 내기 어렵게 만듭니다.
해결책: 80/20 법칙에 따라 가장 중요한 핵심 문서 5~6개만 제대로 구축하는 것이 효과적입니다. 나에 대한 소개(me.md), 비즈니스 개요(business.md), 타겟 고객 프로필(ICP.md), 브랜드 톤앤매너(brand.md) 등의 필수 파일부터 정교하게 작성해야 합니다.

실수 2 : 실시간 컨텍스트를 업데이트하지 않음
실수: 한 번 세팅해 둔 정보만 유지하여, 변화하는 업무 환경이나 최신 뉴스, 회의 내용 등의 실시간 컨텍스트가 누락되어 결과물이 점점 무가치해지거나 반복적으로 변합니다.
해결책: 매일 진행되는 미팅 녹취록, 이메일, 슬랙 내용이나 외부의 최신 AI 트렌드 및 경쟁사 정보 등을 주기적으로 업데이트해야 합니다. 클로드 데스크톱 앱의 스케줄러 기능 등을 활용해 일 단위 혹은 몇 시간 단위로 자동 업데이트 작업을 설정하는 것이 좋습니다.

실수 3 : 고정된 폴더 구조가 없음
실수: 하위 폴더가 아예 없이 파일 하나에 모든 걸 몰아넣거나, 반대로 쓰지도 않는 빈 폴더를 너무 많이 만들어 구조를 지나치게 복잡하게 만듭니다. 이는 AI가 엉뚱한 곳에서 파일을 찾거나 저장하게 만드는 라우팅 오류를 유발하고 토큰 소모를 늘립니다.
해결책: 폴더 구조는 심플하게 시작하여 하나를 정하면 꾸준히 유지해야 합니다. 대표적인 80/20 폴더 구조로는 핵심 컨텍스트(Context), 일일 로그(Daily), 지식 및 연구 데이터(Intelligence), 개별 프로젝트(Projects), 재사용 템플릿(Resources) 등이 있습니다.

실수 4 : CLAUDE.md 파일을 최적화하지 않음
실수: AI 운영체제의 지도 역할을 하는 핵심 파일인 claude.md를 무작정 AI에게 알아서 쓰라고 맡겨서 규격에 맞지 않게 방대해지거나, 라우팅 규칙이 꼬여 토큰 낭비와 느린 답변을 초래합니다.
해결책: claude.md 파일은 300줄 이하로 간결하게 유지하고, 어떤 정보가 어디에 저장되어 있는지 알려주는 라우팅 테이블을 반드시 포함해야 합니다. 또한, 각 하위 폴더별로 인덱스 파일(sub-claude.md)을 두어 관리 효율을 높여야 합니다.

실수 5 : 컨텍스트 폴더 및 구조를 정기적으로 관리 하지 않음.
실수: 시스템을 오래 사용할수록 중복 파일, 상충되는 정보, 오래된 데이터, 깨진 링크 등이 쌓여 시스템 내부가 어지러워지고 성능이 저하됩니다.
해결책: 주 단위 혹은 격주 단위로 세컨드 브레인(Second Brain) 인프라를 직접 혹은 자동화 스킬을 통해 오딧(Audit)하고 청소해 주어야 합니다. 팀 단위로 운영할 경우, 이 시스템을 유지 관리할 명확한 담당자 한 명을 지정하는 것이 필수적입니다.

실수 6 : 지속적이고 일관되게 사용하지 않음
실수: 시스템을 구축만 해두고 기존 업무 방식으로 돌아가서 꾸준히 활용하지 않는 것입니다. 컨텍스트가 쌓이지 않으면 AI OS는 아무런 이점을 제공하지 못합니다.
해결책: AI를 다루는 역량과 축적된 데이터는 함께 결합되어 복리로 성장합니다. 처음에는 조금 더 느리고 어색하게 느껴지더라도 대부분의 업무에서 클로드를 기본(Default) 도구로 사용하는 습관을 지녀야 합니다.

---

### eugeniughelbur / obsidian-second-brain
https://github.com/eugeniughelbur/obsidian-second-brain.git

이 리포지토리를 사용해 나만의 AI 우선 세컨드 브레인을 구축하는 세팅 방법은 **어떤 AI CLI 플랫폼을 사용하는가**와 필수 API 키(선택 사항)를 준비했는가에 따라 크게 두 단계로 나뉩니다.

가장 대중적이고 추천되는 **Claude Code** 기준으로 세팅하는 방법과 기타 플랫폼(Codex, Gemini 등)을 위한 빌드 방법을 정리해 드립니다.

---

## 🛠️ 1단계: 핵심 프레임워크 설치

### 옵션 A: Claude Code (가장 추천하는 기본 방식)

터미널에서 아래의 **원라인 스크립트**를 실행하면 자동으로 리포지토리를 클론하고 슬래시 명령어들을 연동합니다.

```bash
curl -fsSL https://raw.githubusercontent.com/eugeniughelbur/obsidian-second-brain/main/scripts/quick-install.sh | bash

```

*또는 직접 수동으로 설치하고 싶다면 다음 명령어를 순서대로 입력하세요:*

```bash
# 1. 원하는 경로에 리포지토리 클론 (~/.claude/skills/ 폴더 추천)
git clone https://github.com/eugeniughelbur/obsidian-second-brain ~/.claude/skills/obsidian-second-brain

# 2. 셋업 스크립트 실행 (자신의 실제 옵시디언 볼트 경로를 입력하세요)
bash ~/.claude/skills/obsidian-second-brain/scripts/setup.sh "/path/to/your/obsidian/vault"

```

### 옵션 B: Codex CLI / Gemini CLI / OpenCode 환경일 때

만약 Claude Code가 아닌 다른 CLI 플랫폼을 쓰신다면 프로젝트를 빌드하여 볼트에 직접 심어주어야 합니다.

```bash
# 1. 리포지토리 클론 및 이동
git clone https://github.com/eugeniughelbur/obsidian-second-brain
cd obsidian-second-brain

# 2. 플랫폼에 맞게 빌드 (예: codex-cli, gemini-cli, opencode 중 택1)
bash scripts/build.sh --platform codex-cli

# 3. 빌드된 결과물을 자신의 옵시디언 볼트 루트 폴더로 복사
cp -R dist/codex-cli/. /path/to/your/vault/

```

---

## 🔑 2단계: 리서치 툴킷 API 키 설정 (선택 사항)

웹 리서치, X(트위터) 트렌드 분석, 유튜브 스크립트 추출 명령어들을 제대로 사용하려면 API 키 세팅이 필요합니다.
*(※ API 키가 없어도 기본 메모 저장 및 요약, 가이드라인 생성 기능과 Perplexity 키 없이 작동하는 무료 웹 리서치 모드는 정상 작동합니다.)*

자동 설치 스크립트 도중 리서치 프롬프트에 `y`를 입력했거나, 아래와 같이 수동으로 환경 변수 파일을 만들어 관리할 수 있습니다.

```bash
# 1. 설정 폴더 생성 및 환경변수 샘플 파일 복사
mkdir -p ~/.config/obsidian-second-brain
cp .env.example ~/.config/obsidian-second-brain/.env

# 2. 권한 보안 설정 후 파일 편집
chmod 600 ~/.config/obsidian-second-brain/.env
nano ~/.config/obsidian-second-brain/.env  # 또는 원하는 에디터로 열기

```

`.env` 파일 내부에 보유하고 있는 서비스의 API 키를 입력합니다:

* `XAI_API_KEY`: X(트위터) 실시간 정보 및 분석용 ([console.x.ai](https://console.x.ai))
* `PERPLEXITY_API_KEY`: 출처가 명시된 딥 웹 리서치용 ([perplexity.ai](https://perplexity.ai/settings/api))
* `GEMINI_API_KEY`: 볼트 기반의 파일 검색 내장형 노트북 LM 기능용 ([aistudio.google.com](https://aistudio.google.com/apikey))

---

## 🚀 3단계: 초기화 및 실행

모든 파일 설치와 경로 설정이 끝났다면, **자신의 옵시디언 볼트(Vault) 폴더로 이동한 뒤 CLI를 실행**하고 아래 명령어를 입력하여 세컨드 브레인을 초기화합니다.

```bash
# 옵시디언 볼트 폴더로 이동 후 AI CLI 작동
cd /path/to/your/vault

# 세컨드 브레인 필수 인덱스 및 운영 매뉴얼(_CLAUDE.md) 생성
/obsidian-init

```

초기화가 완료되면 `_CLAUDE.md`, `index.md`, `log.md` 등의 기본 파일이 볼트에 생성되며 AI가 내 세컨드 브레인의 상태를 인지하기 시작합니다. 이제 대화 중에 자유롭게 `/obsidian-save`나 `/obsidian-daily` 같은 명령어를 사용하시면 됩니다!

---

buildermethods / agent-os
https://github.com/buildermethods/agent-os.git

화면에 띄워두신 [buildermethods/agent-os](https://github.com/buildermethods/agent-os)는 시스템 전반에 무거운 라이브러리를 설치하는 방식이 아니라, 내 컴퓨터 환경에 스크립트 실행 파일을 등록해 사용하는 **경량 CLI 도구**입니다.

공식 문서([buildermethods.com/agent-os](https://buildermethods.com/agent-os))에서 안내하는 기본 세팅 및 프로젝트 적용 단계는 다음과 같습니다.

---

## 🛠️ 1단계: 설치 및 환경 변수 등록

Agent OS는 Shell 스크립트 기반이므로, 터미널에서 리포지토리를 클론한 뒤 전역(Global) 명령어로 사용할 수 있도록 `PATH`에 추가해 주어야 합니다.

```bash
# 1. 원하는 적절한 경로에 리포지토리 클론
git clone https://github.com/buildermethods/agent-os.git ~/agent-os

# 2. 내 셸 설정 파일(예: .zshrc 또는 .bashrc)을 열고 PATH 추가
# 사용하는 셸에 따라 파일을 열어 아래 줄을 추가합니다.
export PATH="$HOME/agent-os/scripts:$PATH"

# 3. 설정 반영하기
source ~/.zshrc  # 또는 source ~/.bashrc

```

*설치가 잘 되었는지 확인하려면 터미널에 `agent-os`를 입력해 봅니다.*

---

## 🚀 2단계: 내 프로젝트에 초기화하기 (`init`)

Agent OS를 적용하고 싶은 **실제 개발 프로젝트 폴더**로 이동한 뒤 초기화 명령을 실행합니다.

```bash
# 내 개발 프로젝트 폴더로 이동
cd /path/to/your/project

# Agent OS 초기화
agent-os init

```

* 실행하고 나면 프로젝트 루트에 `.agent-os/`라는 숨김 폴더와 구성 파일들이 생성됩니다. 이 폴더 안에 프로젝트만의 규칙(Standards)과 개발 계획(Specs)이 저장됩니다.

---

## 🔍 3단계: 기본 스키마 및 규칙 생성하기

AI 에이전트가 내 코딩 스타일을 학습할 수 있도록 프로젝트를 분석하는 단계입니다.

```bash
# 현재 코드베이스의 컨벤션과 패턴을 자동 분석하여 표준 문서 생성
agent-os discover-standards

```

* 이 명령을 실행하면 AI가 기존 코드를 스캔하여 탭/스페이스 규칙, 디렉터리 구조, 자주 쓰는 라이브러리 사용 패턴 등을 파악하고 고유의 표준(Standards) 가이드라인을 빌드합니다.

---

## 💻 4단계: AI 에이전트와 함께 개발 시작하기

세팅이 완료되면 Claude Code, Cursor 등의 AI 도구를 켤 때 Agent OS가 백그라운드에서 프로젝트 규칙을 영리하게 주입(Inject)해 줍니다. 새로운 기능을 개발할 때는 아래 명령어로 사전에 꼼꼼한 기획 스펙을 먼저 작성해 빌드 오류를 줄일 수 있습니다.

```bash
# 구현할 기능의 Spec(설계도)을 먼저 짜고 에이전트에게 전달하기
agent-os shape-spec

```

---

claude + notebookLM + obsidian + zotero

현재 띄워두신 화면의 영상 [[클로드 코드 + 노트북LM + 옵시디언 = 신의 모드](https://www.youtube.com/watch?v=kU3qYQ7ACMA)]에서 핵심적으로 다루는 **Claude Code + NotebookLM + Obsidian** 결합은, 방대한 자료 수집부터 시각화, 그리고 AI 기반의 지식 생산까지 한 번에 해결하는 최고의 연구 및 업무 자동화 워크플로우(Workflow)입니다.

세 가지 툴을 유기적으로 연결하여 강력한 **'제2의 두뇌(Second Brain)'** 에이전트를 구축하는 세팅 및 결합 방법을 단계별로 정리해 드립니다.

---

## 💡 3대 툴의 핵심 역할 분담

* **NotebookLM (자료 수집 및 1차 가공):** 수십 편의 논문, PDF, 웹 링크를 집어넣고 핵심 요약문이나 소스 데이터를 추출하는 '기억 창고' 역할을 합니다.
* **Obsidian (지식 보관 및 시각화):** 마크다운(`.md`) 파일 기반으로 노트를 저장하고, 이 노트들이 어떻게 연결되는지 그래프 뷰로 시각화하는 '통합 컨트롤 타워'입니다.
* **Claude Code (CLI 기반 메인 브레인):** 옵시디언 폴더에 직접 접근하여 노트를 읽고, 수정하고, 노트북LM의 자료를 바탕으로 새로운 지식을 생산해 내는 '행동 대장'입니다.

---

## 🛠️ Claude Code + NotebookLM + Obsidian 결합 세팅 단계

### [1단계] 옵시디언(Obsidian) 환경 준비

1. 컴퓨터에 옵시디언 앱을 설치하고, 앞으로 모든 연구 자료와 노트가 저장될 **보관함(Vault) 폴더**를 생성합니다.
2. 폴더 내부에 구조를 잡습니다. (예: `/수집된자료`, `/최종노트`, `/프로젝트` 등)

### [2단계] NotebookLM 데이터 마이그레이션 자동화

노트북LM에 수집된 수많은 소스 데이터와 요약본을 옵시디언으로 가져와야 Claude Code가 읽을 수 있습니다. 영상에서 추천하는 효율적인 방법은 파이썬 스크립트(`notebooklm-py`) 등을 활용하는 것입니다.

1. 노트북LM에 연구할 논문이나 자료들을 업로드합니다.
2. 터미널(CLI)을 열고 옵시디언 보관함 폴더로 이동한 뒤, 노트북LM API나 스크립트를 이용해 노트북LM의 메모 및 요약 데이터들을 마크다운(`.md`) 파일 형태로 다운로드하여 옵시디언의 `/수집된자료` 폴더에 저장합니다.

### [3단계] 옵시디언 폴더에서 Claude Code 실행하기

이제 메인 브레인인 Claude Code를 내 옵시디언 보관함에 연결할 차례입니다.

1. 터미널(리눅스, 맥, 윈도우 터미널 등)을 엽니다.
2. 다운로드한 노트북LM 노트들과 내 지식들이 모여있는 **옵시디언 보관함(Vault) 디렉토리로 이동**합니다.
```bash
cd /path/to/your/obsidian-vault

```


3. 해당 경로에서 Claude Code를 실행합니다.
```bash
claude

```



### [4단계] 신의 모드(God Mode) 실전 활용하기

이제 Claude Code는 내 옵시디언 폴더 전체의 맥락과 노트북LM에서 가공되어 들어온 지식 데이터를 전부 손에 쥔 상태가 됩니다. 터미널 창(Claude Code)에 다음과 같은 복합적인 명령을 내려 시스템을 가동합니다.

* **지식의 융합 및 생산:** > *" `/수집된자료` 폴더에 있는 노트북LM 요약 노트를 전부 읽고, 내가 기존에 작성했던 개인 아이디어 노트들과 연계해서 새로운 '2026년 마케팅 전략 초안.md' 파일을 `/최종노트` 폴더에 생성해 줘. "*
* **지식 관리 및 자동 정렬:** > *" 내 전체 옵시디언 Vault를 검토해서 서로 주제가 비슷하지만 연결되지 않은 마크다운 노트들을 찾아내고, 문서 하단에 상호 참조 링크(`[[노트이름]]`)를 자동으로 삽입해 줘. "*

---

## 🚀 이 결합이 주는 압도적인 장점

기존에는 AI에게 일일이 배경지식을 복사·붙여넣기 해야 했지만, 이 시스템을 구축하면 **노트북LM이 정제한 지식**이 **옵시디언**에 저장되고, **Claude Code**가 이를 실시간으로 복합 분석하면서 노트를 스스로 확장해 나갑니다.

작업이 완료된 후 옵시디언의 그래프 뷰(Graph View)를 켜면, AI가 내 지식들을 유기적으로 연결해 주어 지식의 은하수가 확장되는 모습을 시각적으로 확인하실 수 있습니다.

---

이미 **Claude Code + NotebookLM + Obsidian**으로 수집·생산·시각화의 삼각 편대를 구축하셨다면, 여기에 Zotero(조테로)를 결합하는 것은 완벽한 '학술 및 전문 연구용 에이전트(Academic Research Agent)'의 최종장을 완성하는 것입니다.

Zotero를 결합하여 외부 논문 출처와 메타데이터까지 제2의 두뇌에 완벽하게 종속시키는 설정 및 자동화 워크플로우를 안내해 드립니다.

---

## 💡 Zotero 결합 시 전체 시스템의 흐름

```
[Zotero] (논문 원본 & 메타데이터 수집) 
   │
   ▼ (자동 마이그레이션)
[Obsidian] <───> [Claude Code] (지식의 융합, 분석 및 자동 링크 연결)
   ▲
   │ (정제된 요약본 피드)
[NotebookLM] (방대한 논문 분석 및 1차 가공)

```

---

## 🛠️ Zotero + NotebookLM + Obsidian + Claude 설정 및 결합 방법

### 1단계: Zotero 데이터 가공을 위한 필수 플러그인 설치

Zotero에 저장된 논문 데이터(`.bib`)를 옵시디언이 실시간으로 읽을 수 있도록 다리를 놓아주어야 합니다.

1. Zotero 데스크톱 앱에 **Better BibTeX** 플러그인을 설치합니다.
2. Zotero 설정에서 내 논문 라이브러리가 옵시디언 보관함(Vault) 내부의 특정 폴더(예: `/zotero-refs`)에 `references.bib` 파일로 **자동 내보내기(Auto-export)** 되도록 세팅합니다.
3. 옵시디언 앱을 켜고 **Zotero Integration** 또는 **Citations** 커뮤니티 플러그인을 설치한 뒤, 위에서 생성된 `.bib` 파일 경로를 지정합니다.

### 2단계: NotebookLM과의 하이브리드 수집 루틴 세팅

* **Raw 데이터 스토어:** Zotero에 논문 원본 PDF와 서지 정보를 수집합니다.
* **컨텍스트 정제:** 수집된 논문 중 깊은 분석이 필요한 핵심 논문 PDF들을 **NotebookLM**에 업로드하여 대화형 소스 및 스터디 가이드를 추출합니다.
* **옵시디언 동기화:** NotebookLM이 뽑아준 핵심 요약본과 Zotero의 인용 키(Citation Key)를 매칭하여 옵시디언의 `/수집된자료` 폴더에 마크다운 파일로 저장합니다.

### 3단계: Claude Code를 통한 학술 에이전트 가동

이제 터미널을 열고 Zotero 데이터까지 연결된 옵시디언 보관함 폴더로 이동하여 Claude Code를 실행합니다.

```bash
cd /path/to/your/obsidian-vault
claude

```

이제 Claude Code는 Zotero가 만들어준 학술적 출처(Citation) 정보와 NotebookLM의 고도화된 요약본, 그리고 내 개인 노트들을 전부 결합할 수 있는 상태가 됩니다. 터미널 창에 아래와 같이 강력한 학술 연구 명령을 내립니다.

* **참고문헌 기반 논문 초안 작성:**
> *" `/zotero-refs`에 있는 서지 데이터와 `/수집된자료` 내의 NotebookLM 요약본들을 연계해서, '인공지능 에이전트의 미래'에 대한 소논문 초안을 작성해 줘. 이때 문장 뒤에 Zotero 양식에 맞는 인용 키(예: `@kim2026agent`)를 자동으로 삽입해 줘. "*


* **지식 그래프의 학술적 연결성 강화:**
> *" 내 옵시디언 Vault 전체를 스캔해서 내가 쓴 개인 아이디어 노트들이 Zotero에서 가져온 어떤 논문 자산과 연관성이 높은지 분석하고, 옵시디언 3D 그래프 뷰에서 유기적으로 엮이도록 상호 참조 링크를 자동으로 생성해 줄래? "*



---

## 🚀 Zotero까지 더해졌을 때의 압도적인 장점

1. **완벽한 학술적 신뢰성:** AI가 허위 사실을 지어내는 환각(Hallucination) 현상을 완전히 방지할 수 있습니다. Claude Code가 글을 쓸 때 무조건 Zotero에 등록된 실제 논문 데이터(DOI, 저자, 연도)만을 기반으로 근거를 제시하기 때문입니다.
2. **원스톱 논문 작성 환경:** 이 시스템 안에서 Claude Code와 대화하며 마크다운으로 논문 초안을 쓰면, 인용 부호가 완벽하게 유지됩니다. 이후 옵시디언에서 MS Word나 한글(HWP)로 내보내기만 하면 학회 제출용 논문이 그대로 완성됩니다.

자료 수집(Zotero) $\rightarrow$ 소스 정제(NotebookLM) $\rightarrow$ 시각화 관리(Obsidian) $\rightarrow$ 최종 생산 및 자동화(Claude Code)로 이어지는 완벽한 **지식 에이전트 시스템**을 경험해 보세요!

---

Hermes agent 활용 dashboard 생성 (Local linux)
https://hermes-agent.nousresearch.com/
https://github.com/NousResearch/hermes-agent.git

https://www.youtube.com/watch?v=gTRvXL37iWs

현재 띄워두신 화면의 영상 [[Hermes Agent 운영 체제는 미쳤습니다!](https://www.youtube.com/watch?v=gTRvXL37iWs)]과 웹 페이지에서 소개하는 Hermes Agent OS(헤르메스 에이전트 운영체제)의 핵심 특징과 활용 방법을 정리해 드립니다.

화면 속 장표(**The old way vs the new way**)에 명확하게 대조되어 있듯이, 이 시스템은 2026년 현재 여러 개의 브라우저 탭과 터미널을 번거롭게 오가며 AI를 사용하던 기존 방식(~ $300/mo, 8개 탭 오픈)을 단 하나의 통합 대시보드($0/mo, 1개 대시보드)로 혁신하는 데 초점을 맞추고 있습니다.

---

## 🌟 1. 주요 특징 (Features)

* **올인원 통합 사이드바 (One Sidebar):** Hermes, Claude, OpenClaw, Codex, Antigravity, 심지어 무료 버전의 Claude Code까지 모든 에이전트와 도구를 하나의 사이드바 인터페이스 안에서 통합 제어합니다.
* **불변의 메모리 레이어 (Obsidian Memory Layer):** 모든 에이전트가 내 비즈니스, 클라이언트 정보, 나만의 글쓰기 스타일(Voice)을 매 세션마다 상시 공유하고 기억합니다. 매번 프롬프트로 배경 상황을 구구절절 재설명할 필요가 없습니다.
* **워크스페이스 탭 렌더링:** 에이전트가 생성하는 모든 결과물(HTML 빌드 결과, 비디오, 오디오, PDF 등)을 외부 프로그램으로 나가지 않고 워크스페이스 안에서 인라인(Inline)으로 즉시 확인하고 실행할 수 있습니다.
* **영구적 대화 이력 보존:** 새로고침이나 재부팅을 하더라도 에이전트별 대화 이력이 휘발되지 않고 완벽하게 유지됩니다.
* **월 구독료 0원 ($0/mo):** Owl Alpha와 같은 무료 1M(백만) 컨텍스트 모델 등을 활용하여, 매달 ChatGPT나 Claude 등에 지출되던 수십~수백 달러의 구독료를 혁신적으로 아낄 수 있습니다.

---

## 🚀 2. 실전 활용 방법 (Use Cases)

이 시스템을 내 옵시디언(Obsidian) 지식 베이스 및 터미널 환경과 결합하면 다음과 같이 활용할 수 있습니다.

### ① 다중 에이전트 팀 자율 구동 (Multi-Agent Workflows)

* 사이드바에서 여러 개의 에이전트 프로필을 동시에 켜고 작업을 분담시킵니다.
* 예를 들어, 하나의 목표를 던지면 `Researcher` 에이전트가 자료를 조사하고, `Writer` 에이전트가 초안을 잡는 칸반 워크플로우를 한 화면에서 모니터링하며 제어합니다.

### ② 실시간 인라인 결과물 검수

* 프론트엔드 웹사이트나 앱 코딩을 에이전트에게 시킨 후, 툴을 바꿀 필요 없이 워크스페이스 탭에서 렌더링된 화면을 즉시 확인합니다.
* 마음에 들지 않으면 그 자리에서 바로 스크린샷을 찍어 에이전트에게 피드백을 전달하는 초고속 수정 루프를 돌릴 수 있습니다.

### ③ 전사적 '세컨드 브레인' 및 리서치 자동화

* 옵시디언 메모리 레이어 덕분에 내 컴퓨터에 쌓인 방대한 연구 자료, 제품 요구사항(PRD), 경쟁사 동향 파일의 맥락을 에이전트가 통째로 인지하고 있습니다.
* 주 단위로 경쟁사 데이터를 크롤링해 내 지식 그래프를 알아서 업데이트하게 하거나, 축적된 데이터를 기반으로 매끄러운 보고서를 자동 생산하게 만듭니다.

---

## 💡 한 줄 요약

**Hermes Agent OS**는 파편화되어 있던 AI 도구들을 **옵시디언 메모리 기반의 단일 대시보드로 통합**하여, 토큰 비용과 컨텍스트의 한계를 깨부수고 진정한 '자율형 AI 팀'을 운영할 수 있도록 돕는 최신 에이전트 환경입니다.

---

matt pocock ai skills 
https://github.com/mattpocock/skills.git
https://www.youtube.com/@mattpocockuk

---

Agentic AI develop embedded systems

https://youtu.be/-G4H2DmhR28?si=pwpv2cKuzNODANaV


FPGA 개발 환경 도커 이미지
yoav-karmon / Fabrinetes
https://github.com/yoav-karmon/Fabrinetes.git

SECDA-DSE : LLMs accelerate FPGA design
https://www.startuphub.ai/ai-news/ai-research/2026/llms-accelerate-fpga-design

r/FPGA ai agent 활용
공유해주신 [r/FPGA 게시글](https://www.reddit.com/r/FPGA/comments/1qxtowl/ai_for_algorithm_pipelining_optimization/)의 질문(원글)과 댓글의 핵심 내용을 요약해 드립니다.

---

## 1. 원글 작성자의 질문 및 제안

**작성자(`greenhorn2025`)의 상황과 고민:**

* **상황:** 리소스 사용량이 증가하면서, 다른 사람이 작성한 알고리즘 블록에서 타이밍 에러(Timing Fail)가 발생하고 있음.
* **문제점:** 해당 코드가 DSP 블록, Pre-adder, Post-multiplier ALU 등을 효율적으로 쓰지 못하고 있고, 기본적인 Adder 파이프라이닝도 되어 있지 않아 넓은 비트의 신호들이 한 사이클에 처리되면서 타이밍 문제를 일으킴.
* **제안 (아이디어):** 현재 기능 수정을 하느라 바쁜 상태라, **코딩 에러먼트(Coding Agent)를 도입해 이 알고리즘을 최적화**해보고 싶음.
* **구상 중인 에이전트 루프:** 1. DSP 블록의 특징과 활용법을 담은 커스텀 지침(Prompt)을 에이전트에 제공.
2. 에이전트가 코드를 수정하면, 기존 원본 **Matlab 모델과 비교 시뮬레이션**을 돌려 기능이 변하지 않았는지(Bit-exact) 자율 검증.
3. Vivado 같은 툴로 **합성(Synthesis)을 구동해 DSP 관련 경고나 타이밍을 체크**하고, 에이전트가 이를 피드백 받아 레지스터 스테이지를 추가하는 등 반복(Iteration) 수행.
* **질문:** "최신 AI 도구로 이와 비슷한 시도를 해본 사람이 있는지, 경험담이 궁금하다."

---

## 2. 댓글의 주요 내용 및 반응

게시글 유저들의 의견은 **"제어된 환경(Step-by-step)이라면 좋은 시도다"라는 긍정론**과 **"하드웨어 특성상 시간 낭비가 될 것"이라는 회의론**으로 갈렸습니다.

### 💡 긍정 및 구체적 방법론 제안

* **`Otherwise_Wave9374`:** 제약 조건(사이클 버짓, DSP 매핑 힌트 등)을 확실히 줄 수 있다면 매우 흥미로운 유스케이스임. 에이전트에게 한 번에 통째로 고치게 하지 말고, "한 번에 하나의 파피프라인 스테이지씩만 수정(작은 Diff 생성)"하게 한 뒤 Matlab 골든 모델과 비트 단위로 일치하는지 자동 비교하는 '리팩토링 어시스턴트' 형태로 제어해야 한다고 조언함.
* **`Shizuka-8435`:** 아주 좋은 유스케이스지만 통제(Controlled)가 필수임. AI를 **'주니어 RTL 엔지니어'처럼 취급**해야 하며, 무턱대고 "최적화해줘"라고 하면 기능이 망가짐. 이 유저는 단계별 계획을 짜고 검증할 수 있는 Traycer 같은 도구를 선호한다고 언급함.

### ⚠️ 회의론 및 한계 지적

* **`MitjaKobal`:** AI가 시뮬레이션에서는 돌아가는 코드를 짜더라도, **합성 단계에서 에러(예: 메모리 배열 리셋 문제)를 내는 경우**를 많이 봄. 데이터 패스의 예외 상황(Edge 케이스, 포화 연산 등)과 컨트롤 패스(Valid/Ready 핸드셰이크)를 완벽히 검증할 수 있는 초고성능 검증 코드가 없다면 AI가 잡아내기 힘든 버그를 심어놓을 것이라 경고함. 또한 코드 가독성이 떨어져 Matlab 모델과의 1:1 매핑이 깨질 위험이 있음.
* **`PiasaChimera`:** Claude 등을 써봤는데 상위 아키텍처 토론은 훌륭하게 해내지만, **하위 레벨 코딩(Low-level coding)으로 들어가면 자꾸 틀린 코드를 짜내거나 포기**하고 느린 방식을 택하는 등 "열정만 앞서는 인턴" 같은 모습을 보였다고 함.
* **`TapEarlyTapOften`:** LLM은 하드웨어적 '추론(Reasoning)' 능력이 없기 때문에 이 작업을 자동화하는 환경을 구축하는 것 자체가 **엄청난 시간과 돈 낭비**가 될 것이라고 강하게 비판함. (이에 대해 원글 작성자는 "이미 동작하는 Matlab 모델과 타깃이 확실해서 AI가 잘하는 반복 작업 영역"이라며 반론을 펼침)

---

### 📌 요약

r/FPGA 유저들의 중론은 "AI에게 통째로 맡기면 무조건 실패하지만, 인간 엔지니어가 가이드라인을 쥐고 'Matlab 검증 ➡️ 한 단계씩 파이프라인 수정 ➡️ 합성 리포트 체크'라는 촘촘한 에이전트 루프(Loop)를 설계해 통제한다면 충분히 승산이 있는 연구/시도"라는 흐름으로 요약할 수 있습니다.

---

공유해주신 [r/FPGA 게시글](https://www.reddit.com/r/FPGA/comments/1sfzaat/using_ai_agents/)의 본문 질문과 댓글의 주요 논쟁 및 핵심 내용을 요약해 드립니다.

---

## 1. 게시글 본문 내용 (질문 및 제안)

작성자(`shiprest`)는 단순한 챗봇 대화로 RTL 코드나 테스트벤치를 생성하는 수준을 넘어, FPGA 합성(Synthesis) 흐름에서 발생하는 문제들을 자율적으로 해결하는 'AI 에이전트'를 구축하거나 사용해 본 경험이 있는지 질문했습니다.

* **구체적인 유스케이스 예시:** 에이전트가 합성 에러(Synthesis Error)의 근본 원인을 스스로 찾아내고, 코드를 수정한 뒤, 인간의 개입 없이 자율적으로 합성을 재구동하여 에러가 없는 컴파일 결과를 만들어내는 프로세스.
* **질문 요지:** "실제 이를 위해 어떤 툴을 사용하고 있으며, 어떤 하드웨어 이슈들을 해결하고 있는가?"

---

## 2. 댓글의 주요 내용 및 반응

댓글 창에서는 '에이전트'의 정확한 정의에 대한 정립부터 시작하여, 실제 비즈니스 환경에서의 유용성에 대해 뜨거운 토론이 벌어졌습니다.

### 🤖 '에이전트(Agent)'의 정의에 대한 정리

* **`Seldom_Popup`:** 많은 사람이 에이전트의 개념을 오해하고 있다고 지적했습니다. 단순히 질문하고 답변을 받는 프롬프트 형태는 에이전트가 아니며, 무료 티어에서는 불가능하다고 설명합니다.
* **진정한 FPGA 에이전트 루프:** AI가 RTL 코드, 테스트벤치, TCL 스크립트를 스스로 작성 ➡️ Vitis/Vivado 환경을 자율적으로 로드하여 실행 ➡️ 터미널 출력(로그)을 한 단계씩 분석하며 실패 원인 파악 ➡️ 토큰을 다 쓸 때까지 테스트벤치와 DUT(Design Under Test)의 버그를 스스로 수정하며 자동 비행(Autopilot)하는 것이 진정한 에이전트라고 정의했습니다.

### 💡 긍정적인 실사용 경험 및 성능 체감

* **`affabledrunk`:** 거창한 멀티 에이전트 오케스트레이터 없이도 **Claude Code**를 활용해 RTL 작성, 빌드, 시뮬레이션 회귀 테스트(Regression), 하드웨어 테스트까지 완벽한 자율 루프(Full Autonomous Loop)를 구축해 실무에서 매우 유용하게 쓰고 있다고 밝혔습니다.
* **`Lowmax2`:** 회사의 보안 정책 때문에 아직 업무에 에이전트를 전면 도입하진 못했지만, Copilot에 데이터시트, Verilog 코드, ILA(In-Circuit Logic Analyzer) 스크린샷을 제공하는 것만으로 코드를 수정해 문제를 완벽히 해결한 경험이 있다고 했습니다. 향후 에이전트가 허용되면 엔지니어가 직접 코드를 짜는 일이 크게 줄어들 것이라 전망했습니다.
* **`adamt99` (FPGA 전문가):** AI 에이전트는 FPGA, C, Python 개발 전반에 매우 유용하며 앞으로 생태계에 더 깊이 통합될 것이라 언급했습니다. 또한, AMD가 곧 개최할 행사(FPGA Horizons US)에서 **AI 기능이 탑재된 Vivado의 프리뷰**를 공개할 예정인데, 이는 거의 "게임 체인저" 수준이라는 소식을 공유했습니다.

### ⚠️ FPGA 개발 환경에서 에이전트가 가지는 강점

* **`Seldom_Popup` & `Lowmax2`:** 소프트웨어 개발은 복잡한 클래스와 구조체가 여러 스레드를 오가며 컨텍스트를 오염시키지만, **FPGA/ASIC은 모듈 바운더리(Boundary)가 매우 명확하고 깔끔하다는 특징**이 있습니다. 따라서 특정 에러가 난 모듈만 에이전트의 컨텍스트 메모리에 집어넣고 집중 분석하게 만들기가 소프트웨어보다 훨씬 쉬우며, AI가 스스로 Python 스크립트를 짜서 ILA 데이터를 분석하게 만드는 등 응용 가능성이 무궁무진하다고 강조했습니다.

### ❌ 회의론 및 반대 의견

* **`tux2603`:** 모듈이나 엔티티 전체를 AI에게 맡기는 것은 여전히 신뢰할 수 없으며, 가벼운 자동 완성이나 프로그래밍 시작 전 브레인스토밍 도구로만 제한해야 한다고 주장했습니다. 가산기(Adder)보다 복잡한 설계에서는 결국 무너질 것이라는 시각입니다.
* **`TheTurtleCub`:** 인간의 상호작용 없이 AI가 스스로 알아서 문제를 해결하도록 내버려 두는 방식을 실제 진지한 비즈니스/연구 프로젝트에 적용하려는 것은 너무나 나이브(Naive)한 생각이라고 비판했습니다.

---

### 📌 요약 (https://www.reddit.com/r/FPGA/comments/1sfzaat/using_ai_agents/)

이 스레드의 핵심은 "FPGA는 하드웨어 특성상 모듈 구분이 명확하여 소프트웨어보다 오히려 에이전틱 AI(예: Claude Code 등)를 파이프라인에 깊숙이 통합하기 유리하다"는 현업자들의 실전 경험담과, "그럼에도 불구하고 완전 자율에 맡기기엔 검증의 리스크가 존재한다"는 신중론이 대립하고 있는 모습으로 요약할 수 있습니다.

---

FPGA developer community
https://devcommunity.amd.com/
https://www.youtube.com/watch?v=nzwM_S78jXs
https://www.amd.com/en/blogs/2026/how-agentic-ai-is-reshaping-chip-design.html
https://www.fpgadeveloper.com/
https://www.fpgahorizons.com/us-east-26/us-east-26-agenda/
https://www.reddit.com/r/FPGA/
https://www.linkedin.com/pulse/accelerating-rtl-design-agentic-ai-multi-agent-llm-driven-y80uc/
Core Components of the Agentic Architecture
Here’s how the system works:

Prompt Enhancer Agent: Refines the user’s natural language input into a technically complete and unambiguous specification.
RTL Generator Agent: Uses an LLM (like DeepSeek-Coder or Llama3) to generate RTL code based on the enhanced prompt.
Verilator Lint Agent: Performs static linting using Verilator to catch syntax and style issues.
Testbench Generator Agent: Extracts module headers and generates a full testbench using the same or another LLM.
Simulator Agent: Compiles the RTL and test bench using Icarus Verilog and executes the test bench to verify functionality.
Trackback Mechanism: If the simulation fails, the system tracks which file (RTL or TB) causes the issue and invokes the corresponding agent to regenerate the output.


---

공유해주신 방대한 자료들은 'AI 에이전트를 단순한 챗봇이 아니라 내 로컬 환경(Obsidian, CLI)과 결합하여 자율적으로 구동되는 나만의 운영체제(Agent OS)로 진화시키는 과정'을 정확히 관통하고 있습니다. 특히 하드웨어(FPGA/RTL) 디자인처럼 모듈 경계가 명확한 도메인일수록 이 에이전틱 워크플로우는 압도적인 성능을 발휘합니다.

제시해주신 소스(Ben AI, Builder Methods, 깃허브 오픈소스, AMD 테크 블로그 등)의 정수를 모아, **자료 수집부터 자율 에이전트 루프 구축, 그리고 최종 시각적 대시보드 완성까지의 마스터플랜**을 6단계로 정리해 드립니다.

---

## 🛠️ 1단계: 컨텍스트 메모리 인프라 구축 (Obsidian + Zotero)

에이전트가 멍청해지거나 환각(Hallucination)을 일으키는 가장 큰 이유는 가공되지 않은 Raw 데이터를 무차별 덤프하기 때문입니다(실수 1). AI가 즉시 참조할 수 있는 깨끗한 두뇌(세컨드 브레인) 구조를 먼저 잡아야 합니다.

### 1. 80/20 규칙 기반 폴더 구조 세팅

옵시디언 볼트(Vault)를 생성하고 고정된 5대 핵심 폴더 구조를 만듭니다 (실수 3).

* 📁 `01_Context/`: 나에 대한 정보(`me.md`), 비즈니스/연구 맥락, 핵심 지침서 탑재.
* 📁 `02_Daily/`: 매일 아침 자동 생성되는 로그, 미팅 기록, 개발 일지.
* 📁 `03_Intelligence/`: 정제된 기술 문서, 인덱스된 학술 자료 (AI용 속성 View).
* 📁 `04_Projects/`: 개별 프로젝트 전용 폴더 (현재 진행 상황판 관리).
* 📁 `05_Resources/`: 재사용 가능한 코드 템플릿, 데이터시트 등.

### 2. Zotero 학술/기술 소스 연동

* **Better BibTeX 플러그인**을 Zotero에 설치하여 수집된 FPGA 데이터시트나 논문 메타데이터를 옵시디언 볼트 내부(`03_Intelligence/references.bib`)로 **자동 내보내기(Auto-export)** 설정합니다.
* 옵시디언의 **Zotero Integration 플러그인**을 통해 논문 인용 키(`@저자연도`)와 연동되도록 다리를 놓습니다.

---

## 🤖 2단계: 메인 시스템 설계서 구성 (CLAUDE.md & AGENTS.md)

에이전트가 내 볼트에 접속했을 때 길을 잃지 않도록 내비게이션 파일(지도)과 계약서를 작성해야 합니다 (실수 4).

### 1. `CLAUDE.md` (300줄 이하 유지)

볼트 루트에 생성하며, 에이전트에게 내 시스템의 폴더 구조와 라우팅 규칙을 알려줍니다.

```markdown
# System Context & Routing Table
- 📁 01_Context: Read for user persona (`me.md`), architecture standards.
- 📁 03_Intelligence: Active knowledge base. DO NOT dump raw text here.
- 📁 04_Projects: Active boards. Update `PROJECT.md` after every action.

## Core Rules
1. Never execute a task without checking `PROJECT.md` status.
2. Keep sub-claudes updated in each subdirectory for lower token usage.

```

### 2. `AGENTS.md` (역할 분담 계약서)

멀티 에이전트 협업을 위해 각 에이전트의 페르소나와 R&R(역할과 책임)을 정의합니다.

* **Prompt Enhancer Agent:** 자연어 요구사항을 기술 명세(Spec)로 변환.
* **RTL Generator Agent:** 명세를 기반으로 깨끗한 Verilog/VHDL 코드 생성.
* **Simulation/Lint Agent:** Verilator 및 Icarus Verilog를 통한 자율 검증 및 Trackback(에러 역추적).

---

## ⚙️ 3단계: 로컬 에이전트 엔진 설치 (Claude Code & Agent OS)

내 터미널 환경에서 자율 비행(Autopilot) 루프를 돌릴 수 있도록 경량 CLI 프레임워크를 심어줍니다.

### 1. `eugeniughelbur/obsidian-second-brain` 설치

옵시디언 볼트 폴더로 이동한 뒤 원라인 스크립트로 에이전트 스킬셋을 주입합니다.

```bash
curl -fsSL https://raw.githubusercontent.com/eugeniughelbur/obsidian-second-brain/main/scripts/quick-install.sh | bash

```

볼트 루트에서 `/obsidian-init`을 실행하여 에이전트 연동용 기본 인덱스 파일들을 활성화합니다.

### 2. `buildermethods/agent-os` 설치 및 전역 등록

프로젝트 표준 컨벤션을 AI에게 학습시키기 위해 가벼운 셸 기반 도구를 PATH에 추가합니다.

```bash
git clone https://github.com/buildermethods/agent-os.git ~/agent-os
export PATH="$HOME/agent-os/scripts:$PATH" # .zshrc 나 .bashrc에 추가

```

내 개발/연구 프로젝트 폴더로 이동하여 초기화하고 표준을 분석합니다.

```bash
cd /path/to/your/fpga-project
agent-os init
agent-os discover-standards # 기존 코드의 타이밍, 탭, 패턴 분석 가이드라인 자동 생성

```

---

## 🔄 4단계: 실시간 닫힌 루프(Closed-Loop) 구축 (자동화 스킬 생성)

인간의 개입 없이 [코드 생성 ➡️ 린트/합성 ➡️ 에러 분석 ➡️ 재수정]을 반복하는 핵심 엔진을 구현합니다. 레딧(r/FPGA) 현업자들이 '최고의 유스케이스'로 꼽은 방식입니다.

1. **`/shape-spec` 단계:** 인간이 요구사항을 던지면 `Prompt Enhancer`가 구체적인 사이클 버짓(Cycle Budget)과 DSP 매핑 힌트가 포함된 `DESIGN.md`를 생성합니다.
2. **`Act on issues` 단계:** `RTL Generator`가 1단계에서 분석된 코딩 표준에 맞춰 RTL 코드를 생성합니다.
3. **`Trackback Mechanism` 스킬 가동 (가장 중요):**
* 에이전트가 로컬에 설치된 **Verilator(Lint)** 또는 Icarus Verilog(Simulator)를 CLI로 직접 구동하도록 스킬을 부여합니다.
* 시뮬레이션 로그에서 `Error` 또는 `Timing Fail` 문구가 감지되면, 에이전트가 해당 줄(Line)과 원인을 역추적하여 스스로 작은 변경점(Diff)을 만들고 코드를 수정하는 루프를 돕니다.



---

## 📊 5단계: 실시간 지식 분석 및 시각화 (Graphify & NotebookLM)

방대해진 연구 지식과 에이전트가 생산한 코드 간의 관계를 시각적으로 검수하고, 외부 소스를 똑똑하게 요약합니다.

### 1. Graphify를 통한 3D 지식 그래프 빌드

* [graphify.net](https://graphify.net)에 접속하여 CLI 도구를 설치합니다.
* 터미널에서 내 옵시디언 지식 폴더를 학습시킵니다.
```bash
/graphify wiki

```



```
*   생성된 `graph.html`을 통해 내 아이디어 노트, Zotero 논문 서지 정보, 에이전트가 수정한 RTL 모듈들이 어떻게 유기적으로 엮여 있는지 시각적 은하수로 확인합니다. (이 링크 구조가 촘촘할수록 LLM의 RAG 효율이 극대화됩니다.)

### 2. NotebookLM-py를 통한 토큰 절약 및 소출처 검증
*   클로드의 컨텍스트 토큰 소모를 줄이기 위해, 무료 대용량 컨텍스트가 가능한 Gemini 기반의 로컬 헬퍼 스크립트를 연결합니다.
    ```bash
    git clone https://github.com/teng-lin/notebooklm-py.git

```

* Zotero에서 긁어온 원본 PDF나 유튜브 스크립트 뭉치를 이 엔진에 피드하여, 1차 정제된 핵심 컴파일본만 옵시디언으로 넘겨주는 사서(Librarian) 역할을 맡깁니다.

---

## 🎛️ 6단계: 최종 에이전트 OS 대시보드 구축 (Hermes Agent OS & MCP)

수많은 에이전트의 세션 상태, 프로젝트 현황판(`PROJECT.md`), 실시간 렌더링 화면을 한곳에서 통제하는 **나만의 개인 대시보드 홈페이지**를 완성합니다.

### 1. Hermes Agent OS 기반 사이드바 통합

* 로컬 리눅스/맥 환경에 Hermes Agent 인터페이스를 구축하여, 화면 왼쪽에 `Claude Code`, `OpenClaw`, `Codex` 등 각기 다른 세션을 사이드바 형태로 나열합니다. (필요 없는 세션은 `Ctrl + X` 두 번으로 즉시 정리 가능합니다.)

### 2. MCP(Model Context Protocol) 및 Live Artifacts 세팅

* **MCP 설정:** 대시보드 창에 Git, 뉴스 크롤러, 로컬 파일 시스템 제어 권한을 가진 MCP 서버들을 연결하여, API 비용을 최소화하면서 실시간 정보를 에이전트가 긁어오도록 스케줄러를 세팅합니다 (실수 2 해결).
* **Live Artifact 렌더링:** 에이전트가 수정한 파이프라인 구조나 타임라인 일지, 혹은 시각화 코드가 완료되면 외부 브라우저를 켤 필요 없이 대시보드 내부의 워크스페이스 탭(Workspace Tab)에서 결과물(HTML/Markdown)을 인라인으로 즉시 검수합니다.

---

## 🎯 실행을 위한 한 줄 요약 안내

> **먼저 옵시디언 볼트에 5대 폴더 구조를 만들고 `CLAUDE.md` 지도를 작성하세요.** 그 다음 터미널에서 `Claude Code`와 `agent-os` CLI를 실행하여 에이전트에게 검증 권한(Verilator/Simulator 셸 명령어 실행 권한)을 부여하면, 스스로 컴파일 에러를 고치고 대시보드에 현황을 기록하는 완벽한 **자율형 AI OS**가 가동되기 시작합니다.


---

## Source

### obsidian
https://github.com/obsidianmd
https://obsidian.md/ko/
https://github.com/kepano/obsidian-skills.git
https://github.com/YishenTu/claudian.git
https://github.com/jackyzha0/quartz.git

### graphify
https://graphify.net/
https://github.com/safishamsi/graphify.git
https://github.com/lucasrosati/claude-code-memory-setup.git
https://github.com/kbastani/graphify.git
https://github.com/warioddly/graphify.git

### zotero
https://www.zotero.org/
https://github.com/zotero/zotero.git
https://github.com/retorquere/zotero-better-bibtex.git

### NotebookLM
https://notebooklm.google.com/
https://github.com/PleasePrompto/notebooklm-skill.git
https://github.com/souzatharsis/podcastfy.git
https://github.com/jacob-bd/notebooklm-mcp-cli.git

###  LLM wiki
https://sparkly-room-cb6.notion.site/Wiki-36f003c7f7be800cbc13cdb669136e01
https://github.com/lucasastorian/llmwiki.git
https://github.com/nashsu/llm_wiki.git
https://github.com/SamurAIGPT/llm-wiki-agent.git

### 옵시디언 위키 템플릿
AI-Agent-Wiki-Template-v1.0.0.zip

적용 프롬프트 예시 :
''' 첨부한 옵시디언 AI 업무 위키 템플릿의 폴더 구조와 CLAUDE.md, AGENTS.md, index.md, log.md를 읽고 현재 규칙을 파악해 줘.

그 다음 Karpathy LLM wiki gist를 읽고 핵심 설계를 학습해 줘. 템플릿 구조와 카파시 원칙을 비교해서 현재 폴더를 내 업무에 맞는 옵시디언 기반 AI 에이전트 업무 위키로 세팅해 줘.

나는 직접 폴더와 규칙 파일을 만들고 싶지 않으니, 네가 필요한 수정과 보강을 하고 각 파일의 용도를 설명해 줘. 목표는 개인 메모장이 아니라 회사 실무에서 여러 AI 에이전트가 같은 업무 맥락을 공유하는 비즈니스 프로세스야.

raw, wiki, conversations, index.md, log.md, Claude Code용 CLAUDE.md, Codex용 AGENTS.md가 올바르게 구성되어 있는지 점검하고 보강해 줘.

그리고 save, reference, ingest, lint를 자연어 명령으로 사용할 수 있게 규칙을 작성해 줘.

추가로이 위키는 한글 영문 하이브리드 세팅으로 구성해줘

사람이 읽고 편집해야 하는 가이드라인은 한국어로 작성해줘. 예를 들어 채널의 톤앤매너, 금지 표현, 지침, 기획 기준, 리뷰 기준은 한국어로 정리해줘.

반면 에이전트가 실행 명령으로 인식하는 키워드는 영어로 고정해줘. 예를 들어 save, ingest, query, reference, lint 같은 명령어는 영어 키워드로 유지하고, 각 명령어가 어떤 상황에서 어떤 파일을 읽고 쓰는지 규칙을 명확히 작성해 줘.

목표는 사람이 읽기 쉬운 위키이면서도, 에이전트가 세션마다 일관되게 실행할 수 있는 업무 시스템을 만드는 거야.

그리고 '이번 작업 내용 옵시디언에 저장해줘', '옵시디언 참조' 명령어를 등록해서 매 세션마다 내가 명령을 입력하면 저장과 참조를 해서 맥락을 유지할 수 있도록 해.

저장 규칙에는 반드시 맥락 오염을 방지하는 안전 장치를 포함해줘

raw 영역과 wiki 영역을 명확히 분리해 줘.
raw는 원본 자료, 회의록, 대화 로그, 외부 분석처럼 변경이 안 되는 불변 자료를 저장하는 곳이야. 위키는 raw를 바탕으로 정리된 실행 규칙, 의사 결정, 프로젝트 맥락, 반복 재사용 가능한 지식만 저장하는 곳이야.

에이전트가 save 명령으로 옵시디언 위키용 저장하기 전에는 반드시 아래 다섯 가지 필터를 통과하도록 규칙을 작성해 줘.

이 정보가 향후에 반복해서 재사용할 데이터인가?

다른 에이전트나 동료가 프로젝트를 이어받기 위해 반드시 읽어야 하는가?

의사 결정의 근거와 결정 권자를 나중에 추적할 필요가 있는가?

실패한 방식이라 다시 시도하면 안 되는 리스크 정보인가?

팀 전체를 맞추어야 하는 공통의 규칙이나 디자인 가이드인가?

이 다섯 가지 조건 중 하나라도 만족하지 않는 1회성 답변, 사소한 중간 산출물, 검증되지 않는 초안은 위키에 저장하지 않도록 해줘. 필요하다면 raw나 conversation에만 남기고 위키에는 승격하지 않도록 구조를 설계해줘.

또한 lint 명령에는 위키 안에 검증되지 않은 추측, 중복 정보, 출처 없는 결정, 오래된 규칙이 섞여 있는지 점검하는 규칙을 포함해 줘.
'''

### andrej-karpathy
https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
https://github.com/multica-ai/andrej-karpathy-skills.git

### codex
https://developers.openai.com/codex/app/features
https://github.com/openai/codex.git
https://github.com/openai/codex/discussions

### claude
https://github.com/anthropics/claude-code.git

### ai-context
https://github.com/TimCrooker/ai-context-kit.git

### second brain
https://github.com/eugeniughelbur/obsidian-second-brain.git
https://github.com/KasperZutterman/Second-Brain.git
https://github.com/khoj-ai/khoj.git
https://github.com/AgriciDaniel/claude-obsidian.git
https://github.com/agenticnotetaking/arscontexta.git
https://github.com/gnekt/My-Brain-Is-Full-Crew.git

### agent os
https://github.com/buildermethods/agent-os.git
https://github.com/craft-ai-agents/craft-agents-oss.git
https://github.com/rivet-dev/agent-os.git
https://github.com/Q00/ouroboros.git
https://github.com/nearai/ironclaw.git

### loop
https://github.com/earendil-works/pi.git
https://github.com/snarktank/ralph.git
https://github.com/strongloop/loopback.git
https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep.git
https://github.com/frankbria/ralph-claude-code.git

### hermes agent
https://github.com/NousResearch/hermes-agent.git
https://github.com/garrytan/gbrain.git
https://github.com/fathah/hermes-desktop.git
https://github.com/nesquena/hermes-webui.git
https://github.com/outsourc-e/hermes-workspace.git
https://github.com/NousResearch/hermes-agent-self-evolution.git
https://github.com/farion1231/cc-switch.git
https://github.com/thedotmack/claude-mem.git
https://github.com/colbymchenry/codegraph.git
https://github.com/iOfficeAI/AionUi.git

### agent
https://github.com/obra/superpowers.git
https://github.com/affaan-m/ECC.git
https://github.com/anthropics/skills.git
https://github.com/langflow-ai/langflow.git
https://github.com/langchain-ai/langchain.git
https://github.com/msitarzewski/agency-agents.git
https://github.com/browser-use/browser-use.git
https://github.com/VoltAgent/awesome-design-md.git
https://github.com/karpathy/autoresearch.git
https://github.com/TauricResearch/TradingAgents.git
https://github.com/infiniflow/ragflow.git
https://github.com/dair-ai/Prompt-Engineering-Guide.git
https://github.com/paperclipai/paperclip.git
https://github.com/Eriemon/verilog-generator.git
https://github.com/ai-hpc/ai-hardware-engineer-roadmap.git
https://github.com/Shinei-Nouzen-Arch/FPGA-Agent.git
https://github.com/FPGA-MAFIA/fpga_mafia.git
https://github.com/Eriemon/hls-generator.git
https://github.com/adeleempurpled290/FPGA-Agent-skills.git

### Community
https://www.agentixlabs.com/blog/
https://www.reddit.com/r/ClaudeAI/
https://www.reddit.com/r/FPGA/
https://www.reddit.com/r/codex/
https://www.reddit.com/r/hermesagent/
https://www.reddit.com/r/artificial/
https://www.reddit.com/r/hardware/
https://www.reddit.com/r/Amd/
https://www.reddit.com/r/linux/
https://www.reddit.com/r/ObsidianMD/
https://www.reddit.com/r/ClaudeCode/
https://www.reddit.com/r/GithubCopilot/
http://reddit.com/r/AI_Agents/
