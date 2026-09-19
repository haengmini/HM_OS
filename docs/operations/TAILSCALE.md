# Tailscale 비공개 배포

## 보안 경계

- HM OS API는 `127.0.0.1:8767`에만 바인딩한다.
- Tailscale Serve만 HTTPS 진입점이다.
- Funnel은 활성화하지 않는다.
- 백엔드는 `Host=hm-os-server.taila8b4a0.ts.net`과
  `Tailscale-User-Login=ihyeongmin00@gmail.com`을 모두 재검증한다.
- 로컬 호스트의 다른 프로세스는 헤더를 위조할 수 있으므로 HM OS는 다중 사용자 서버가 아닌
  소유자 전용 서버라는 운영 가정을 유지한다.

## 사용자 공간 daemon

현재 환경에는 systemd와 `/dev/net/tun`이 없으므로 userspace networking 모드를 사용한다.

```bash
bash scripts/start-tailscaled.sh
```

실제 운영에서는 PM2가 이 스크립트를 관리한다. 상태 파일은
`/opt/data/home/.local/share/tailscale/tailscaled.state`, 소켓은
`/opt/data/home/.local/run/tailscale/tailscaled.sock`이다.

## 최초 인증

```bash
/opt/data/bin/tailscale \
  --socket=/opt/data/home/.local/run/tailscale/tailscaled.sock \
  up --hostname=hm-os-server
```

인증 링크가 출력되면 소유자가 직접 브라우저에서 승인한다. 인증 링크/키를 문서나 Git에
저장하지 않는다.

## Serve 구성

```bash
bash scripts/configure-tailscale-serve.sh
```

검증:

```bash
/opt/data/bin/tailscale --socket=/opt/data/home/.local/run/tailscale/tailscaled.sock status
/opt/data/bin/tailscale --socket=/opt/data/home/.local/run/tailscale/tailscaled.sock serve status
curl -I https://hm-os-server.taila8b4a0.ts.net
```

`serve status`는 반드시 **tailnet only** HTTPS → `http://127.0.0.1:8767` 매핑이어야 한다.
`tailscale funnel`은 실행하지 않는다.

## 문제 해결

- `failed to connect to local tailscaled`: PM2에서 `hm-os-tailscaled`가 online인지 확인한다.
- `NeedsLogin`: 위 최초 인증 명령을 실행하고 소유자가 링크를 승인한다.
- HTTP 403 `invalid_host`: `HM_OS_TAILNET_HOSTNAME`과 실제 MagicDNS 주소를 비교한다.
- HTTP 403 `missing_identity`: Serve를 우회한 요청이거나 tailnet 인증이 없는 기기다.
- PWA는 열리지만 API가 실패: 서비스워커가 API를 캐시하지 않으므로 서버/Serve 상태를 점검한다.
