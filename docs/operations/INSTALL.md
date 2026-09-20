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
필요하다. 현재 운영 환경에는 Hermes scheduler의 `hm-os-runtime-watchdog`이 1분마다
`scripts/ensure-hm-os-running.sh`를 실행하도록 등록되어 있어, PM2 daemon/프로세스,
userspace Tailscale daemon, Serve 설정을 자동 복구한다. 정상 상태에서는 출력·알림이 없고
복구 실패만 사용자에게 전달한다.

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
## Hermes 대화 연동 (선택)

`config/hm-os.env`에 다음 두 값을 설정하면 픽셀 오피스 안의 Hermes NPC와
실제 대화가 가능하다. 값이 없으면 대화 패널은 503으로 안내만 하고 나머지
기능(콜로니 맵, 터미널, 파일)은 정상 동작한다.

```
HM_OS_HERMES_API_URL=http://127.0.0.1:8642
HM_OS_HERMES_API_KEY=<hermes .env의 API_SERVER_KEY 값>
```

이 값은 HM OS 백엔드 프로세스에만 로드되며 브라우저로 전달되지 않는다.
