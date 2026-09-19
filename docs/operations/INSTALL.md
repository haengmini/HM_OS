# HM OS 설치 및 운영

## 요구사항

- Node.js 20 이상(검증 환경: Node 26.5.1)
- npm
- 현재 Linux 사용자 권한으로 실행 가능한 `node-pty` 빌드 환경
- 사용자 공간 Tailscale 바이너리(`/opt/data/bin/tailscale`, `/opt/data/bin/tailscaled`)
- tailnet 소유자 계정

## 최초 설치

```bash
git clone git@github.com:haengmini/HM_OS.git /opt/data/projects/HM_OS
cd /opt/data/projects/HM_OS
npm install
npm run lint
npm run typecheck
npm test
npm run build
cp config/hm-os.env.example config/hm-os.env
chmod 600 config/hm-os.env
```

`config/hm-os.env`에서 owner login, MagicDNS hostname, 파일 루트, 터미널 시작 경로를
확인한다. 이 파일은 Git에 포함되지 않는다.

## PM2로 실행

현재 컨테이너는 systemd가 없고 PID 1이 s6이므로, 사용자 공간 PM2를 검증된 supervisor로
사용한다.

```bash
cd /opt/data/projects/HM_OS
mkdir -p /opt/data/logs/hm-os
npx pm2 start ecosystem.config.cjs
npx pm2 save
npm run healthcheck
```

PM2는 프로세스 재시작을 담당하지만 이 컨테이너 자체가 재생성되면 `npx pm2 resurrect`가
필요하다. 호스트/컨테이너 관리자가 재시작 후 이 명령을 호출하도록 설정하기 전까지는
**컨테이너 재생성까지 보장되는 영구 서비스가 아니다.**

## Tailscale Serve

Tailscale daemon이 연결된 뒤:

```bash
bash scripts/configure-tailscale-serve.sh
```

자세한 내용은 `TAILSCALE.md`를 참조한다. Funnel은 사용하지 않는다.

## Windows PWA 설치

1. Windows가 같은 tailnet에 로그인되어 있는지 확인한다.
2. Edge 또는 Chrome에서 `https://hm-os-server.taila8b4a0.ts.net`에 접속한다.
3. Tailscale 신원 검증을 통과한 후 최초 HM OS PIN을 설정한다.
4. 주소창의 앱 설치 아이콘 또는 브라우저 메뉴의 **앱 설치**를 선택한다.
5. 설치한 HM OS를 시작 메뉴/작업 표시줄에서 실행한다.

앱 셸만 오프라인 캐시된다. 상태·터미널·파일 기능은 실제 서버 연결이 필요하다.

## 업데이트

```bash
cd /opt/data/projects/HM_OS
git fetch origin
git checkout <approved-release-tag>
npm ci
npm run build
npx pm2 restart hm-os-api --update-env
npm run healthcheck
```

새 서비스워커가 준비되면 화면 상단의 **새 버전이 준비되었습니다 → 새로고침** 배너로
교체한다.
