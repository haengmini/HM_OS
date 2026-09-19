# 백업·복구·롤백

## 백업 대상

| 경로 | 내용 | 비고 |
|---|---|---|
| `/opt/data/projects/HM_OS` | 코드와 Git 메타데이터 | GitHub private repo가 원격 백업 |
| `/opt/data/hm-os-data` | PIN 해시, 감사 로그 | 민감 데이터; mode 0700/0600 유지 |
| `/opt/data/home/.local/share/tailscale/tailscaled.state` | Tailscale 노드 인증 상태 | 절대 Git에 포함하지 않음 |
| `/opt/data/second-brain` | 지식 정본 | HM OS는 읽기 모델만 제공 |
| `/opt/data/kanban` | 작업 정본 | HM OS는 읽기 모델만 제공 |

## 로컬 백업

```bash
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DEST="/opt/data/backups/hm-os/$STAMP"
mkdir -p "$DEST"
cp -a /opt/data/hm-os-data "$DEST/"
cp -a /opt/data/home/.local/share/tailscale/tailscaled.state "$DEST/"
chmod -R go-rwx "$DEST"
```

Google Drive나 외부 저장소로 자동 업로드하지 않는다. 외부 업로드는 이형민의 별도 승인이
있을 때만 수행한다.

## 복구

```bash
npx pm2 stop hm-os-api hm-os-tailscaled
cp -a <backup>/hm-os-data /opt/data/
cp -a <backup>/tailscaled.state /opt/data/home/.local/share/tailscale/
chmod 700 /opt/data/hm-os-data
chmod 600 /opt/data/home/.local/share/tailscale/tailscaled.state
npx pm2 start ecosystem.config.cjs
npm run healthcheck
```

서버 재시작으로 메모리 세션은 의도적으로 폐기된다. 사용자는 PIN으로 다시 로그인한다.

## 코드 롤백

```bash
cd /opt/data/projects/HM_OS
git fetch --tags origin
git checkout <previous-approved-tag>
npm ci
npm run build
npx pm2 restart hm-os-api --update-env
npm run healthcheck
```

롤백 시 PIN/감사 로그/Second Brain/Kanban 원본은 건드리지 않는다. 데이터 형식 변경을 수반하는
릴리스라면 릴리스 노트의 별도 마이그레이션 지침을 따른다.
